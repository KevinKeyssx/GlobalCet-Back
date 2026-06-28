import { ApiProperty } from '@nestjs/swagger';

import {
	IsEmail,
	IsNotEmpty,
	IsString,
} from 'class-validator';


export class ClientDataDto {

	@ApiProperty( {
		description : 'Razón social del cliente o empresa',
		example     : 'Empresa GlobalCet S.A.',
	} )
	@IsString()
	@IsNotEmpty()
	companyName : string;


	@ApiProperty( {
		description : 'RUT del cliente o empresa',
		example     : '77.777.777-7',
	} )
	@IsString()
	@IsNotEmpty()
	rut : string;


	@ApiProperty( {
		description : 'Dirección del cliente o empresa',
		example     : 'Av. Providencia 1234, Oficina 501',
	} )
	@IsString()
	@IsNotEmpty()
	address : string;


	@ApiProperty( {
		description : 'Correo electrónico de contacto',
		example     : 'contacto@globalcet.cl',
	} )
	@IsEmail()
	@IsNotEmpty()
	email : string;


	@ApiProperty( {
		description : 'Nombre de la persona de contacto',
		example     : 'Juan Pérez',
	} )
	@IsString()
	@IsNotEmpty()
	contactName : string;

}