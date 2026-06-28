import { AttachmentType } from '@prisma/client';


export interface IKitFile {
	id             : string;
	url            : string;
	alt            : string | null;
	isMain         : boolean;
	order          : number | null;
	attachmentType : AttachmentType | null;
	kitId          : string;
	createdAt      : Date;
	updatedAt      : Date;
}


export interface IKitProduct {
	id        : string;
	quantity  : number;
	productId : string;
	product?  : any;
	kitId     : string;
}


export interface IKit {
	id          : string;
	sku         : string;
	name        : string;
	description : string | null;
	active      : boolean;
	categoryId  : string;
	createdAt   : Date;
	updatedAt   : Date;
	files       : IKitFile[];
	products?   : IKitProduct[];
	category?   : any;
}


export interface IKitExport {
	sku       : string;
	name      : string;
	active    : boolean;
	category  : string;
	createdAt : Date;
	updatedAt : Date;
}

