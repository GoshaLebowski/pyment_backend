import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client';



import { Authorized, Protected } from '../../common/decorators';



import { GetMeResponse, UpdateAutoRenewalRequest, UpdateAutoRenewalResponse } from './dto';
import { UsersService } from './users.service';













































































@ApiTags('Users')
@Controller('users')
export class UsersController {
    public constructor(private readonly usersService: UsersService) {}

    @ApiOperation({
        summary: 'Get current user profile',
        description:
            'Returns the currently authenticated user along with active subscription info'
    })
    @ApiOkResponse({
        type: GetMeResponse
    })
    @Protected()
    @Get('@me')
    public async getMe(@Authorized('id') id: string) {
        return await this.usersService.getMe(id)
    }

    @ApiOperation({
        summary: 'Toggle auto-renewal setting',
        description:
            'Enables or disables subscription auto-renewal for the authenticated user'
    })
    @ApiOkResponse({
        type: UpdateAutoRenewalResponse
    })
    @Protected()
    @Patch('@me/auto-renewal')
    public async updateAutoRenewal(
        @Authorized() user: User,
        @Body() dto: UpdateAutoRenewalRequest
    ) {
        return await this.usersService.updateAutoRenewal(user, dto)
    }
}
