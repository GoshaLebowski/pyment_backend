import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';



import { Authorized, Protected } from '../../common/decorators';



import { InitPaymentRequest, InitPaymentResponse, PaymentDetailsResponse, PaymentHistoryResponse } from './dto';
import { PaymentService } from './payment.service';












































@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
    public constructor(private readonly paymentService: PaymentService) {}

    @ApiOperation({
        summary: 'Get payment history',
        description: 'Returns the list of all user transactions'
    })
    @ApiOkResponse({
        type: [PaymentHistoryResponse]
    })
    @Protected()
    @Get('/history')
    public async getHistory(@Authorized() user: User) {
        return await this.paymentService.getHistory(user)
    }

    @ApiOperation({
        summary: 'Get payment by ID',
        description: 'Returns detailed information about a specific transaction'
    })
    @ApiOkResponse({
        type: PaymentDetailsResponse
    })
    @Get(':id')
    public async getById(@Param('id') id: string) {
        return await this.paymentService.getById(id)
    }

    @ApiOperation({
        summary: 'Initiate a new payment',
        description:
            'Initializes a payment using the selected provider and billing period'
    })
    @ApiOkResponse({
        type: InitPaymentResponse
    })
    @Protected()
    @Post('init')
    public async init(
        @Body() dto: InitPaymentRequest,
        @Authorized() user: User
    ) {
        return await this.paymentService.init(dto, user)
    }
}
