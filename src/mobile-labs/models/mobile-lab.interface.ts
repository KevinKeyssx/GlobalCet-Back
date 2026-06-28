import { AttachmentType } from '@prisma/client';


export interface IMobileLabFile {
	id             : string;
	url            : string;
	alt            : string | null;
	isMain         : boolean;
	order          : number | null;
	attachmentType : AttachmentType;
}


export interface IMobileLabProduct {
	id        : string;
	quantity  : number;
	productId : string;
	product?  : {
		id   : string;
		name : string;
		sku  : string;
	};
}


export interface IMobileLabKit {
	id       : string;
	quantity : number;
	kitId    : string;
	kit?     : {
		id   : string;
		sku  : string;
		name : string;
	};
}


export interface IMobileLab {
	id          : string;
	sku         : string;
	name        : string;
	description : string | null;
	dimensions  : string | null;
	active      : boolean;
	categoryId  : string;
	category?   : {
		id   : string;
		name : string;
	};
	files       : IMobileLabFile[];
	products?   : IMobileLabProduct[];
	kits?       : IMobileLabKit[];
	createdAt   : Date;
	updatedAt   : Date;
}


export interface IMobileLabExport {
	sku        : string;
	name       : string;
	dimensions : string | null;
	active     : boolean;
	category   : string;
	createdAt  : Date;
	updatedAt  : Date;
}

