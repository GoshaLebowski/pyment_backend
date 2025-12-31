import { type ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import type { Transaction, User } from '@prisma/client'

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name)

    public constructor(private readonly mailerService: MailerService) {}

    public async sendPaymentSuccessEmail(
        user: User,
        transaction: Transaction
    ) {

    }

    private async sendMail(options: ISendMailOptions) {
        try {
            await this.mailerService.sendMail(options)
        } catch (error) {
            this.logger.error(`Failed to sending email: `, error)
            throw error
        }
    }
}
