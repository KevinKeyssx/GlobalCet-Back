
export interface IProduct {
	id              : string;
	sku             : string;
	name            : string;
	description     : string | null;
	material        : string | null;
	technical_specs : any;
	active          : boolean;
	createdAt       : Date;
	updatedAt       : Date;
	images          : IProductImage[];
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
