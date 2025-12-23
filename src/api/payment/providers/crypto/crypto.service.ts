import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Plan, type Transaction } from '@prisma/client';
import { createHash, createHmac } from 'crypto';
import { firstValueFrom } from 'rxjs';



import { CRYPTOPAY_API_URL } from '../../constants';



import { CreateInvoiceRequest, CryptoResponse, Currency, FiatCurrency } from './interfaces';






















































@Injectable()
export class CryptoService {
    private readonly TOKEN: string

    public constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {
        this.TOKEN = this.configService.getOrThrow<string>('CRYPTO_PAY_TOKEN')
    }

    public async create(plan: Plan, transaction: Transaction) {
        const payload: CreateInvoiceRequest = {
            amount: transaction.amount,
            currency_type: Currency.FIAT,
            fiat: FiatCurrency.RUB,
            description: `Оплата подписки на тарифный план "${plan.title}"`,
            hidden_message: 'Спасибо за оплату! Подписка активирована',
            paid_btn_url: 'http://localhost:3000'
        }

        const response = await this.makeRequest(
            'POST',
            'createInvoice',
            payload
        )

        return response.result
    }

    public verifyWebhook(rawBody: Buffer, sig: string) {
        const secret = createHash('sha256').update(this.TOKEN).digest()

        const hmac = createHmac('sha256', secret).update(rawBody).digest('hex')

        if (hmac !== sig) throw new UnauthorizedException('Invalid signature')

        return true
    }

    public isFreshRequest(body: any, maxAgeSeconds: number = 300) {
        const requestDate = new Date(body.request_date).getTime()

        const now = Date.now()

        return now - requestDate <= maxAgeSeconds * 1000
    }

    private async makeRequest<T>(
        method: 'GET' | 'POST',
        endpoint: string,
        data?: any
    ) {
        const headers = {
            'Crypto-Pay-API-Token': this.TOKEN
        }

        const observable = this.httpService.request<CryptoResponse<T>>({
            baseURL: CRYPTOPAY_API_URL,
            url: endpoint,
            method,
            data,
            headers
        })

        const { data: response } = await firstValueFrom(observable)

        return response
    }
}
