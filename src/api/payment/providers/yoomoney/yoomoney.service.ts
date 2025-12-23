import { Injectable, UnauthorizedException } from '@nestjs/common';
import { type Plan, type Transaction } from '@prisma/client';
import CIDR from 'ip-cidr';
import { ConfirmationEnum, CurrencyEnum, PaymentMethodsEnum, YookassaService } from 'nestjs-yookassa';










@Injectable()
export class YoomoneyService {
    private readonly ALLOWED_IPS: string[]

    public constructor(private readonly yookassaService: YookassaService) {
        this.ALLOWED_IPS = [
            '185.71.76.0/27',
            '185.71.77.0/27',
            '77.75.153.0/25',
            '77.75.156.11',
            '77.75.156.35',
            '77.75.154.128/25',
            '2a02:5180::/32'
        ]
    }

    public async create(plan: Plan, transaction: Transaction) {
        return this.yookassaService.payments.create({
            amount: {
                value: transaction.amount,
                currency: CurrencyEnum.RUB
            },
            description: `Оплата подписки на тарифный план "${plan.title}"`,
            payment_method_data: {
                type: PaymentMethodsEnum.BANK_CARD
            },
            confirmation: {
                type: ConfirmationEnum.REDIRECT,
                return_url: 'http://localhost:3000/'
            },
            save_payment_method: true
        })
    }

    public verifyWebhook(ip: string) {
        for (const range of this.ALLOWED_IPS) {
            if (range.includes('/')) {
                const cidr = new CIDR(range)

                if (cidr.contains(ip)) return
            } else if (ip === range) return
        }

        throw new UnauthorizedException(`Invalid IP: ${ip}`)
    }
}
