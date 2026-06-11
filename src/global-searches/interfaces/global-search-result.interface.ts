export interface IGlobalFile {
	id             : string;
	url            : string;
	alt            : string | null;
	isMain         : boolean;
	order          : number | null;
	attachmentType : string | null;
}


export interface IGlobalProduct {
	id          : string;
	sku         : string;
	name        : string;
	description : string | null;
	active      : boolean;
	createdAt   : Date;
	updatedAt   : Date;
	files       : IGlobalFile[];
	subcategory : {
		id       : string;
		name     : string;
		category : {
			id   : string;
			name : string;
		};
	};
	material : {
		id   : string;
		name : string;
		slug : string;
	} | null;
}


export interface IGlobalKit {
	id          : string;
	sku         : string;
	name        : string;
	description : string | null;
	active      : boolean;
	createdAt   : Date;
	updatedAt   : Date;
	files       : IGlobalFile[];
	category    : {
		id   : string;
		name : string;
	};
}


export interface IGlobalMobileLab {
	id          : string;
	sku         : string;
	name        : string;
	description : string | null;
	dimensions  : string | null;
	active      : boolean;
	createdAt   : Date;
	updatedAt   : Date;
	files       : IGlobalFile[];
	category    : {
		id   : string;
		name : string;
	};
}


export interface IGlobalSearchMeta {
	totalProducts   : number;
	totalKits       : number;
	totalMobileLabs : number;
	isSuggestion    : boolean;
}


export interface IGlobalSearchResponse {
	products     : IGlobalProduct[];
	kits         : IGlobalKit[];
	mobileLabs   : IGlobalMobileLab[];
	meta         : IGlobalSearchMeta;
	suggestions? : {
		products   : IGlobalProduct[];
		kits       : IGlobalKit[];
		mobileLabs : IGlobalMobileLab[];
	};
}


export interface IStatusTotal {
	active   : number;
	inactive : number;
}


export interface IBaseTotals {
	catalog    : IStatusTotal;
	categories : IStatusTotal;
}


export interface IProductTotals extends IBaseTotals {
	subCategories : IStatusTotal;
	materials     : IStatusTotal;
}


export interface IGlobalSearchTotalsResponse {
	products   : IProductTotals;
	kits       : IBaseTotals;
	mobileLabs : IBaseTotals;
}


