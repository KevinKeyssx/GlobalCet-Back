import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsEmail,
    IsOptional,
    IsEnum,
} from 'class-validator';

import { Role } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({
        description: 'Name of the user',
        example: 'John Doe',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Unique email address of the user',
        example: 'johndoe@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({
        description: 'Phone number of the user',
        example: '+1234567890',
    })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Role of the user',
        enum: Role,
        example: Role.CLIENT,
        default: Role.CLIENT,
    })
    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}
