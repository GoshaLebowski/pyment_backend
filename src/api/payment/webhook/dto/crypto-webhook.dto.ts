import { Type } from 'class-transformer'
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator'

import {
    AcceptedCryptoAsset,
    Currency,
    InvoiceStatus
} from '../../providers/crypto/interfaces'

export enum UpdateType {
    INVOICE_PAID = 'invoice_paid'
}

export class CryptoPayload {
    @IsNumber()
    invoice_id: number

    @IsString()
    hash: string

    @IsEnum(Currency)
    currency_type: Currency

    @IsString()
    fiat: string

    @IsNumberString()
    amount: string

    @IsString()
    paid_asset: string

    @IsNumberString()
    paid_amount: string

    @IsArray()
    @IsEnum(AcceptedCryptoAsset, { each: true })
    accepted_assets: AcceptedCryptoAsset[]

    @IsString()
    fee_asset: string

    @IsNumberString()
    fee_amount: string

    @IsNumberString()
    fee: string

    @IsNumberString()
    fee_in_usd: string

    @IsString()
    pay_url: string

    @IsString()
    bot_invoice_url: string

    @IsString()
    mini_app_invoice_url: string

    @IsString()
    web_app_invoice_url: string

    @IsString()
    description: string

    @IsEnum(InvoiceStatus)
    status: InvoiceStatus

    @IsString()
    created_at: string

    @IsBoolean()
    allow_comments: boolean

    @IsBoolean()
    allow_anonymous: boolean

    @IsNumberString()
    paid_usd_rate: string

    @IsNumberString()
    usd_rate: string

    @IsOptional()
    @IsString()
    paid_at?: string

    @IsBoolean()
    paid_anonymously: boolean

    @IsOptional()
    @IsString()
    hidden_message?: string

    @IsOptional()
    @IsString()
    payload?: string

    @IsOptional()
    @IsString()
    paid_btn_name?: string

    @IsOptional()
    @IsString()
    paid_btn_url?: string
}

export class CryptoWebhookDto {
    @IsNumberString()
    update_id: string | number

    @IsEnum(UpdateType)
    update_type: UpdateType

    @IsString()
    request_date: string

    @ValidateNested()
    @Type(() => CryptoPayload)
    payload: CryptoPayload
}
