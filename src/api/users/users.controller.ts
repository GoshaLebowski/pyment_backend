import { Body, Controller, Get, Patch } from '@nestjs/common';
import { User } from '@prisma/client';



import { Authorized, Protected } from '../../common/decorators';



import { UpdateAutoRenewalRequest } from './dto';
import { UsersService } from './users.service';











































@Controller('users')
export class UsersController {
    public constructor(private readonly usersService: UsersService) {}

    @Protected()
    @Get('@me')
    public async getMe(@Authorized() user: User) {
        return user
    }

    @Protected()
    @Patch('@me/auto-renewal')
    public async updateAutoRenewal(
        @Authorized() user: User,
        @Body() dto: UpdateAutoRenewalRequest
    ) {
        return await this.usersService.updateAutoRenewal(user, dto)
    }
}
