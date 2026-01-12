import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentProvider, TransactionStatus, User } from '@prisma/client';



import { PrismaService } from '../../infra/prisma/prisma.service';
import { StripeService } from '../payment/providers/stripe/stripe.service';



import { UpdateAutoRenewalRequest } from './dto';











































@Injectable()
export class UsersService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly stripeService: StripeService
    ) {}

    public async getMe(id: string) {
        return this.prismaService.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                email: true,
                subscription: {
                    select: {
                        status: true,
                        startDate: true,
                        endDate: true,
                        plan: {
                            select: {
                                id: true,
                                title: true,
                                monthlyPrice: true,
                                yearlyPrice: true
                            }
                        }
                    }
                }
            }
        })
    }

    public async updateAutoRenewal(user: User, dto: UpdateAutoRenewalRequest) {
        const { isAutoRenewal } = dto

        const subscription =
            await this.prismaService.userSubscription.findUnique({
                where: {
                    userId: user.id
                },
                include: {
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

        if (!subscription) throw new NotFoundException('Подписка не найдена')

        const lastTransaction = subscription.transactions[0]

        if (!lastTransaction)
            throw new NotFoundException(
                'У пользователя нет успешных транзакций'
            )

        if (
            lastTransaction.provider === PaymentProvider.STRIPE &&
            subscription.stripeSubscriptionId
        ) {
            await this.stripeService.updateAutoRenewal(
                subscription.stripeSubscriptionId,
                isAutoRenewal
            )
        }

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                isAutoRenewal
            }
        })

        return { isAutoRenewal }
    }
}