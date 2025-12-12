import { ApiProperty } from '@nestjs/swagger'

export class PlanResponse {
    @ApiProperty({
        description: 'Unique identifier of the plan',
        example: 'ryDO077LCk3PZ-3Vm7ttz'
    })
    id: string

    @ApiProperty({
        description: 'Name of the subscription plan',
        example: 'Premium'
    })
    title: string

    @ApiProperty({
        description: 'Name of the description plan',
        example: 'Full access to all platform features'
    })
    description: string

    @ApiProperty({
        description: 'List of features included of the plan',
        example: [
            'Unlimited access to content',
            'Priority support',
            'Advanced analytics'
        ],
        isArray: true
    })
    features: string[]

    @ApiProperty({
        description: 'Monthly price',
        example: 999
    })
    monthlyPrice: number

    @ApiProperty({
        description: 'Yearly price',
        example: 9999
    })
    yearlyPrice: number

    @ApiProperty({
        description: 'Indicates whether the plan is featured or promoted',
        example: true
    })
    isFeatured: boolean
}
