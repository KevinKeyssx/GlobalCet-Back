import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Material } from '@prisma/client';

import { PrismaException } from '@prisma/prisma-catch';
import { PrismaService } from '@prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialPaginationFilterDto } from './dto/pagination-filter.dto';
import { PaginatedResult } from '@common/interfaces/paginated-result.interface';
import { SubCategoryOrderField } from '@common/dto/pagination.dto';



@Injectable()
export class MaterialsService {

	constructor(
		private readonly prisma: PrismaService,
	) {}


	#slugify( text: string ): string {
		return text
			.toString()
			.normalize( 'NFD' )
			.replace( /[\u0300-\u036f]/g, '' )
			.toLowerCase()
			.trim()
			.replace( /\s+/g, '-' )
			.replace( /[^\w\-]+/g, '' )
			.replace( /\-\-+/g, '-' )
			.replace( /^-+/, '' )
			.replace( /-+$/, '' );
	}


	async create( createMaterialDto: CreateMaterialDto ): Promise<Material> {
		const slugToUse = createMaterialDto.slug
			? this.#slugify( createMaterialDto.slug )
			: this.#slugify( createMaterialDto.name );

		try {
			const nameExists = await this.prisma.material.findUnique({
				where	: { name : createMaterialDto.name },
			});

			if ( nameExists ) {
				throw new ConflictException( `El material con el nombre '${ createMaterialDto.name }' ya existe.` );
			}

			const slugExists = await this.prisma.material.findUnique({
				where	: { slug : slugToUse },
			});

			if ( slugExists ) {
				throw new ConflictException( `El material con el slug '${ slugToUse }' ya existe.` );
			}

			return await this.prisma.material.create({
				data	: {
					name			: createMaterialDto.name,
					slug			: slugToUse,
					description		: createMaterialDto.description,
					autoclavable	: createMaterialDto.autoclavable,
					maxTemperature	: createMaterialDto.maxTemperature,
					chemicalResistance	: createMaterialDto.chemicalResistance ?? Prisma.JsonNull,
					active			: createMaterialDto.active,
				},
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAll( ): Promise<any[]> {
		try {
			return await this.prisma.material.findMany({
                select : {
                    id                  : true,
                    name                : true,
                    slug                : true,
                    autoclavable        : true,
                    maxTemperature      : true,
                    chemicalResistance  : true,
                },
				orderBy	: {
					name	: 'asc',
				},
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findAllPaginated( filterDto: MaterialPaginationFilterDto ): Promise<PaginatedResult<Material>> {
		try {
			const {
				page = 1,
				size = 10,
				name,
				autoclavable,
				active,
				orderBy = SubCategoryOrderField.NAME,
				order = 'asc',
			} = filterDto;

			const skip = ( page - 1 ) * size;

			const where: Prisma.MaterialWhereInput = {
				...( name && { name : { contains : name, mode : 'insensitive' } } ),
				...( autoclavable !== undefined && { autoclavable } ),
				...( active !== undefined && { active } ),
			};

			const [ total, data ] = await Promise.all([
				this.prisma.material.count({ where }),
				this.prisma.material.findMany({
					where,
					skip,
					take	: size,
					orderBy	: {
						[ orderBy ] : order,
					},
				}),
			]);

			return {
				data,
				meta	: {
					total,
					page,
					size,
					totalPages	: Math.ceil( total / size ),
				},
			};
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async findOne( id: string ): Promise<Material> {
		try {
			const material = await this.prisma.material.findUnique({
				where	: { id },
			});

			if ( !material ) {
				throw new NotFoundException( `El material con ID '${ id }' no existe.` );
			}

			return material;
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async update( id: string, updateMaterialDto: UpdateMaterialDto ): Promise<Material> {
		try {
			const currentMaterial = await this.findOne( id );

			if ( updateMaterialDto.name && updateMaterialDto.name !== currentMaterial.name ) {
				const nameExists = await this.prisma.material.findUnique({
					where	: { name : updateMaterialDto.name },
				});

				if ( nameExists ) {
					throw new ConflictException( `El material con el nombre '${ updateMaterialDto.name }' ya existe.` );
				}
			}

			let slugToUse: string | undefined;

			if ( updateMaterialDto.slug ) {
				slugToUse = this.#slugify( updateMaterialDto.slug );
			} else if ( updateMaterialDto.name && updateMaterialDto.name !== currentMaterial.name ) {
				slugToUse = this.#slugify( updateMaterialDto.name );
			}

			if ( slugToUse && slugToUse !== currentMaterial.slug ) {
				const slugExists = await this.prisma.material.findUnique({
					where	: { slug : slugToUse },
				});

				if ( slugExists ) {
					throw new ConflictException( `El material con el slug '${ slugToUse }' ya existe.` );
				}
			}

			return await this.prisma.material.update({
				where	: { id },
				data	: {
					name			: updateMaterialDto.name,
					slug			: slugToUse,
					description		: updateMaterialDto.description,
					autoclavable	: updateMaterialDto.autoclavable,
					maxTemperature	: updateMaterialDto.maxTemperature,
					chemicalResistance	: updateMaterialDto.chemicalResistance,
					active			: updateMaterialDto.active,
				},
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}


	async remove( id: string ): Promise<Material> {
		try {
			await this.findOne( id );

			return await this.prisma.material.delete({
				where	: { id },
			});
		} catch ( error ) {
			throw PrismaException.catch( error );
		}
	}

}
