import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { Pool }         from 'pg';
import { PrismaPg }     from '@prisma/adapter-pg';

import { ENVS } from '@config/envs';


@Injectable( )
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

	constructor( ) {
		const pool    = new Pool({ connectionString : ENVS.DATABASE_URL });
		const adapter = new PrismaPg( pool );

		super({ adapter });
	}


	async onModuleInit( ) {
		await this.$connect( );
	}


	async onModuleDestroy( ) {
		await this.$disconnect( );
	}

}
