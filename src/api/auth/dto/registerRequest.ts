import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterRequest {
    @ApiProperty({
        example: 'Test',
        description: 'Name of the user'
    })
    @IsString()
    name: string

    @ApiProperty({
        example: 'test@test.com',
        description: 'Email address of the user'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({
        example: '123456',
        description: 'Password for the account'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string
}
