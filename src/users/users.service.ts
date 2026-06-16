import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';

import { PrismaException } from '@prisma/prisma-catch';
import { PrismaService } from '@prisma/prisma.service';
import { User, Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async validateOperator(
        operatorId?: string,
        allowedRoles: Role[] = [],
    ): Promise<User> {
        if (!operatorId) {
            throw new BadRequestException(
                'El header x-user-id es requerido para realizar esta acción',
            );
        }

        try {
            const operator = await this.prisma.user.findUnique({
                where: { id: operatorId },
            });

            if (!operator) {
                throw new UnauthorizedException('Operador no encontrado');
            }

            if (!operator.active) {
                throw new ForbiddenException('El operador no está activo');
            }

            if (!allowedRoles.includes(operator.role)) {
                throw new ForbiddenException(
                'No tienes permisos para realizar esta acción',
                );
            }

            return operator;
        } catch (error) {
            if (
                error instanceof UnauthorizedException
                || error instanceof ForbiddenException
                || error instanceof BadRequestException
            ) {
                throw error;
        }

            throw PrismaException.catch(error);
        }
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            return await this.prisma.user.create({
                data: createUserDto,
            });
        } catch (error) {
            throw PrismaException.catch(error);
        }
    }

    async findAll(): Promise<User[]> {
        try {
            return await this.prisma.user.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } catch (error) {
            throw PrismaException.catch(error);
        }
    }

    async findOne(id: string): Promise<User> {
        try {
            return await this.prisma.user.findUniqueOrThrow({
                where: { id },
            });
        } catch (error) {
            throw PrismaException.catch(error);
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            const { email, ...updateData } = updateUserDto as any;

            return await this.prisma.user.update({
                where: { id },
                data: updateData,
            });
        } catch (error) {
            throw PrismaException.catch(error);
        }
    }

    async remove(id: string): Promise<User> {
        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        } catch (error) {
            throw PrismaException.catch(error);
        }
    }
}
