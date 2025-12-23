import { Type } from 'class-transformer'
import {
    IsBoolean,
    IsEnum,
    IsNumberString,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator'
import { PaymentMethodsEnum, PaymentStatusEnum } from 'nestjs-yookassa'

export class CardProduct {
    @IsString()
    code: string
}

export class Card {
    @IsString()
    first6: string

    @IsString()
    last4: string

    @IsString()
    expiry_year: string

    @IsString()
    expiry_month: string

    @IsString()
    card_type: string

    @IsOptional()
    @ValidateNested()
    @Type(() => CardProduct)
    card_product?: CardProduct

    @IsString()
    @IsOptional()
    issuer_country?: string
}

export class PaymentMethod {
    @IsEnum(PaymentMethodsEnum)
    type: PaymentMethodsEnum

    @IsString()
    id: string

    @IsBoolean()
    saved: boolean

    @IsString()
    status: string

    @IsString()
    title: string

    @IsOptional()
    @ValidateNested()
    @Type(() => Card)
    card?: Card
}

export class Amount {
    @IsNumberString()
    value: string

    @IsString()
    currency: string
}

export class Recipient {
    @IsString()
    account_id: string

    @IsString()
    gateway_id: string
}

export class ThreeDSecure {
    @IsBoolean()
    applied: boolean

    @IsBoolean()
    method_completed: boolean

    @IsBoolean()
    challenge_completed: boolean
}

export class AuthorizationDetails {
    @IsOptional()
    @IsString()
    rrn?: string

    @IsOptional()
    @IsString()
    auth_code?: string

    @IsOptional()
    @ValidateNested()
    @Type(() => ThreeDSecure)
    three_d_secure?: ThreeDSecure
}

export class PaymentObject {
    @IsString()
    id: string

    @IsEnum(PaymentStatusEnum)
    status: PaymentStatusEnum

    @ValidateNested()
    @Type(() => Amount)
    amount: Amount

    @IsOptional()
    @ValidateNested()
    @Type(() => Amount)
    income_amount?: Amount

    @IsOptional()
    @ValidateNested()
    @Type(() => Amount)
    refunded_amount?: Amount

    @IsString()
    description: string

    @ValidateNested()
    @Type(() => Recipient)
    recipient: Recipient

    @ValidateNested()
    @Type(() => PaymentMethod)
    payment_method: PaymentMethod

    @IsOptional()
    @IsString()
    captured_at?: string

    @IsString()
    created_at: string

    @IsOptional()
    @IsString()
    expires_at?: string

    @IsBoolean()
    test: boolean

    @IsBoolean()
    paid: boolean

    @IsBoolean()
    refundable: boolean

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>

    @IsOptional()
    @ValidateNested()
    @Type(() => AuthorizationDetails)
    authorization_details?: AuthorizationDetails
}

export class YookassaWebhookDto {
    @IsString()
    type: string

    @IsString()
    event: string

    @ValidateNested()
    @Type(() => PaymentObject)
    object: PaymentObject
}
