import { Body, Controller, Headers, HttpCode, HttpStatus, Ip, Post, type RawBodyRequest, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express';



import { YookassaWebhookDto } from './dto';
import { WebhookService } from './webhook.service';







































@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
    public constructor(private readonly webhookService: WebhookService) {}

    @ApiOperation({
        summary: 'Handle Yookassa webhook',
        description:
            'Processes incoming Yookassa payment notifications and updates payment status accordingly.'
    })
    @Post('yookassa')
    @HttpCode(HttpStatus.OK)
    public async handleYookassa(
        @Body() dto: YookassaWebhookDto,
        @Ip() ip: string
    ) {
        return await this.webhookService.handleYookassa(dto, ip)
    }

    @ApiOperation({
        summary: 'Handle Stripe webhook',
        description:
            'Handles incoming Stripe payment events using the signature for verification.'
    })
    @Post('stripe')
    @HttpCode(HttpStatus.OK)
    public async handleStripe(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') sig: string
    ) {
        if (!sig) throw new UnauthorizedException('Missing signature')

        return await this.webhookService.handleStripe(req.rawBody!, sig)
    }

    @ApiOperation({
        summary: 'Handle Crypto Pay webhook',
        description:
            'Processes crypto payment notifications, verifying the request signature and freshness.'
    })
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
