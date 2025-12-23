import { Body, Controller, Headers, HttpCode, HttpStatus, Ip, Post, type RawBodyRequest, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';



import { YookassaWebhookDto } from './dto';
import { WebhookService } from './webhook.service';





































@Controller('webhook')
export class WebhookController {
    public constructor(private readonly webhookService: WebhookService) {}

    @Post('yookassa')
    @HttpCode(HttpStatus.OK)
    public async handleYookassa(
        @Body() dto: YookassaWebhookDto,
        @Ip() ip: string
    ) {
        return await this.webhookService.handleYookassa(dto, ip)
    }

    @Post('stripe')
    @HttpCode(HttpStatus.OK)
    public async handleStripe(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') sig: string
    ) {
        if (!sig) throw new UnauthorizedException('Missing signature')

        return await this.webhookService.handleStripe(req.rawBody!, sig)
    }

    @Post('crypto')
    @HttpCode(HttpStatus.OK)
    public async handleCrypto(
        @Req() req: RawBodyRequest<Request>,
        @Headers('crypto-pay-api-signature') sig: string
    ) {
        if (!sig) throw new UnauthorizedException('Missing signature')

        return await this.webhookService.handleCrypto(req.rawBody!, sig)
    }
}
