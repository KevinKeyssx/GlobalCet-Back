export interface IQuoteItem {
	id            : string;
	name          : string;
	priceAtMoment : number;
	quantity      : number;
	type          : 'product' | 'kit' | 'mobileLab';
}
