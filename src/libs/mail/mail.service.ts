import { type ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Transaction, User } from '@prisma/client';
import { render } from '@react-email/components';
import { Queue } from 'bullmq';



import { PaymentFailedTemplate, PaymentSuccessTemplate, SubscriptionExpiredTemplate } from './templates'
import { ConfigService } from '@nestjs/config'








































































@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name)

    private readonly APP_URL: string

    public constructor(
        private readonly mailerService: MailerService,
        @InjectQueue('mail') private readonly queue: Queue,
        private readonly configService: ConfigService,
    ) {
        this.APP_URL = this.configService.getOrThrow<string>('APP_URL')
    }

    public async sendPaymentSuccessEmail(user: User, transaction: Transaction) {
        const html = await render(PaymentSuccessTemplate({ transaction }))

        await this.queue.add(
            'send-email',
            {
                email: user.email,
                subject: 'Платеж успешно обработан',
                html
            },
            { removeOnComplete: true }
        )
    }

    public async sendPaymentFailedEmail(user: User, transaction: Transaction) {
        const html = await render(PaymentFailedTemplate({ transaction }))

        await this.queue.add(
            'send-email',
            {
                email: user.email,
                subject: 'Проблема с обработкой платежа',
                html
            },
            { removeOnComplete: true }
        )
    }

    public async sendSubscriptionExpiredEmail(user: User) {
        const accountUrl = `${this.APP_URL}/dashboard`

        const html = await render(SubscriptionExpiredTemplate({ accountUrl }))

        await this.queue.add(
            'send-email',
            {
                email: user.email,
                subject: 'Ваша подписка истекла',
                html
            },
            { removeOnComplete: true }
        )
    }

    public async sendMail(options: ISendMailOptions) {
        try {
            await this.mailerService.sendMail(options)
        } catch (error) {
            this.logger.error(`Failed to sending email: `, error)
            throw error
        }
    }
}
