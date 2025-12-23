import { Injectable, UnauthorizedException } from '@nestjs/common';



import { CryptoService } from '../providers/crypto/crypto.service';
import { StripeService } from '../providers/stripe/stripe.service';
import { YoomoneyService } from '../providers/yoomoney/yoomoney.service';



import { CryptoWebhookDto, YookassaWebhookDto } from './dto';





























































@Injectable()
export class WebhookService {
    public constructor(
        private readonly yoomoneyService: YoomoneyService,
        private readonly stripeService: StripeService,
        private readonly cryptoService: CryptoService
    ) {}

    public async handleYookassa(dto: YookassaWebhookDto, ip: string) {
        this.yoomoneyService.verifyWebhook(ip)

        console.log('YOOKASSA WEBHOOK: ', JSON.stringify(dto))
    }

    public async handleStripe(rawBody: Buffer, sig: string) {
        const event = await this.stripeService.parseEvent(rawBody, sig)
    }

    public async handleCrypto(rawBody: Buffer, sig: string) {
        this.cryptoService.verifyWebhook(rawBody, sig)

        const body: CryptoWebhookDto = JSON.parse(rawBody.toString())

        if (!this.cryptoService.isFreshRequest(body))
            throw new UnauthorizedException('Request too old')
    }
}
