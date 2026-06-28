
export interface IProduct {
	id              : string;
	sku             : string;
	name            : string;
	description     : string | null;
	material        : any;
    materialId?      : string;
	technical_specs : any;
	active          : boolean;
	createdAt       : Date;
	updatedAt       : Date;
	files           : IProductImage[];
	inKits?         : IInKit[];
	inMobileLabs?   : IInMobileLab[];
}


export interface IProductImage {
	id     : string;
	url    : string;
	alt    : string | null;
	isMain : boolean;
	order  : number;
}


export interface IInKit {
	id       : string;
	quantity : number;
	kit      : {
		id          : string;
		sku         : string;
		name        : string;
		description : string | null;
	};
}


export interface IInMobileLab {
	id        : string;
	quantity  : number;
	mobileLab : {
		id          : string;
		sku         : string;
		name        : string;
		description : string | null;
		dimensions  : string | null;
	};
}


export interface IProductExport {
	sku             : string;
	name            : string;
	material        : string;
	technical_specs : string;
	active          : boolean;
	createdAt       : Date;
	updatedAt       : Date;
}

