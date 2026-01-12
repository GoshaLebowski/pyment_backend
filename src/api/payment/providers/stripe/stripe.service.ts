import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingPeriod, PaymentProvider, type Plan, Transaction, TransactionStatus, User } from '@prisma/client';
import Stripe from 'stripe';



import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { PaymentWebhookResult } from '../../interfaces';

























































@Injectable()
export class StripeService {
    private readonly stripe: Stripe

    private readonly WEBHOOK_SECRET: string

    private readonly APP_URL: string

    public constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService
    ) {
        this.stripe = new Stripe(
            this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
            {
                apiVersion: '2025-12-15.clover'
            }
        )

        this.WEBHOOK_SECRET = this.configService.getOrThrow<string>(
            'STRIPE_WEBHOOK_SECRET'
        )

        this.APP_URL = this.configService.getOrThrow<string>('APP_URL')
    }

    public async create(
        plan: Plan,
        transaction: Transaction,
        billingPeriod: BillingPeriod,
        user: User
    ) {
        const priceId =
            billingPeriod === BillingPeriod.MONTHLY
                ? plan.stripeMonthlyPriceId
                : plan.stripeYearlyPriceId

        if (!priceId)
            throw new BadRequestException(
                'Stripe priceId is messing for this plan'
            )

        const successUrl = `${this.APP_URL}/payment/${transaction.id}`
        const cancelUrl = `${this.APP_URL}`

        let customerId = user.stripeCustomerId

        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: user.name
            })

            customerId = customer.id

            await this.prismaService.user.update({
                where: {
                    id: user.id
                },
                data: {
                    stripeCustomerId: customerId
                }
            })
        }

        return await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                transactionId: transaction.id,
                planId: plan.id,
                userId: user.id
            }
        })
    }

    public async handleWebhook(
        event: Stripe.Event
    ): Promise<PaymentWebhookResult | null> {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = await this.stripe.checkout.sessions.retrieve(
                    event.data.object.id,
                    { expand: ['line_items'] }
                )

                const transactionId = session.metadata?.transactionId
                const planId = session.metadata?.planId
                const userId = session.metadata?.userId

                const paymentId = session.id

                if (!transactionId || !planId) return null

                const stripeSubscriptionId = session.subscription as string

                if (userId && stripeSubscriptionId) {
                    await this.prismaService.userSubscription.update({
                        where: {
                            userId
                        },
                        data: {
                            stripeSubscriptionId
                        }
                    })
                }

                if (userId) {
                    return {
                        transactionId,
                        planId,
                        paymentId,
                        status: TransactionStatus.SUCCEEDED,
                        raw: event
                    }
                }
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice

                if (invoice.billing_reason !== 'subscription_cycle') return null

                return await this.handleAutoBilling(
                    invoice.customer as string,
                    TransactionStatus.SUCCEEDED,
                    invoice.id ?? '',
                    event
                )
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice

                if (invoice.billing_reason === 'subscription_cycle') {
                    return await this.handleAutoBilling(
                        invoice.customer as string,
                        TransactionStatus.FAILED,
                        invoice.id ?? '',
                        event
                    )
                } else {
                    const transactionId = invoice.metadata?.transactionId
                    const planId = invoice.metadata?.planId
                    const paymentId = invoice.id

                    if (!transactionId || !planId || !paymentId) return null

                    return {
                        transactionId,
                        planId,
                        paymentId,
                        status: TransactionStatus.FAILED,
                        raw: event
                    }
                }
            }

            default:
                return null
        }
    }

    public async updateAutoRenewal(
        subscriptionId: string,
        isAutoRenewal: boolean
    ) {
        await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: !isAutoRenewal
        })
    }

    public async parseEvent(
        rawBody: Buffer,
        signature: string
    ): Promise<Stripe.Event> {
        try {
            return this.stripe.webhooks.constructEvent(
                rawBody,
                signature,
                this.WEBHOOK_SECRET
            )
        } catch (error) {
            throw new BadRequestException(
                `Webhook signature verification failed: ${error.message}`
            )
        }
    }

    private async handleAutoBilling(
        customerId: string,
        status: TransactionStatus,
        externalId: string,
        event: Stripe.Event
    ) {
        const user = await this.prismaService.user.findUnique({
            where: {
                stripeCustomerId: customerId
            },
            include: {
                subscription: true,
                transactions: {
                    where: {
                        status: TransactionStatus.SUCCEEDED
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        })

        if (!user || !user.subscription) return null

        const lastTransaction = user.transactions[0]

        if (!lastTransaction || !lastTransaction.subscriptionId) return null

        const subscription =
            await this.prismaService.userSubscription.findUnique({
                where: {
                    id: lastTransaction.subscriptionId
                },
                include: {
                    plan: true
                }
            })

        if (!subscription) return null

        const transaction = await this.prismaService.transaction.create({
            data: {
                amount: lastTransaction.amount,
                provider: PaymentProvider.STRIPE,
                billingPeriod: lastTransaction.billingPeriod,
                status,
                externalId,
                user: {
                    connect: {
                        id: user.id
                    }
                },
                subscription: {
                    connect: {
                        id: subscription.id
                    }
                }
            }
        })

        return {
            transactionId: transaction.id,
            planId: subscription.plan.id,
            paymentId: externalId,
            status,
            raw: event
        }
    }
}
