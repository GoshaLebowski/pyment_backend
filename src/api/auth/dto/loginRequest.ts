import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';






















export class LoginRequest {
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
