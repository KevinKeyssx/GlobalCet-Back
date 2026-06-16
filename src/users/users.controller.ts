import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Headers,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiHeader } from '@nestjs/swagger';

import { User, Role } from '@prisma/client';
import { SecretGuard } from '@common/guards/secret.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@UseGuards(SecretGuard)
@Controller('users')
@ApiHeader({
    name: 'x-secret',
    description: 'Secret key to authenticate requests',
    required: true,
})
@ApiHeader({
    name: 'x-user-id',
    description: 'User ID of the operator performing the action',
    required: true,
})
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiBody({ type: CreateUserDto })
    async create(
        @Headers('x-user-id') operatorId: string,
        @Body() createUserDto: CreateUserDto,
    ): Promise<User> {
        await this.usersService.validateOperator(operatorId, [Role.ADMIN]);
        return this.usersService.create(createUserDto);
    }

    @Get()
    async findAll(@Headers('x-user-id') operatorId: string): Promise<User[]> {
        await this.usersService.validateOperator(operatorId, [
        Role.ADMIN,
        Role.SUB_ADMIN,
        Role.CLIENT,
        Role.VIEWER,
        ]);
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(
        @Headers('x-user-id') operatorId: string,
        @Param('id') id: string,
    ): Promise<User> {
        await this.usersService.validateOperator(operatorId, [
        Role.ADMIN,
        Role.SUB_ADMIN,
        Role.CLIENT,
        Role.VIEWER,
        ]);
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @ApiBody({ type: UpdateUserDto })
    async update(
        @Headers('x-user-id') operatorId: string,
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        await this.usersService.validateOperator(operatorId, [
        Role.ADMIN,
        Role.SUB_ADMIN,
        ]);
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    async remove(
        @Headers('x-user-id') operatorId: string,
        @Param('id') id: string,
    ): Promise<User> {
        await this.usersService.validateOperator(operatorId, [Role.ADMIN]);
        return this.usersService.remove(id);
    }
}
