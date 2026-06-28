export type ItemType = 'product' | 'kit' | 'mobileLab';

export interface IQuoteStockResponse {
    id             : string;
	name           : string;
	sku            : string;
	currentStock   : number;
	minStock       : number;
	maxStock       : number;
	projectedStock : number;
	type           : ItemType;
}
