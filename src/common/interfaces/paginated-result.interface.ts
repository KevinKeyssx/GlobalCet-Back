export interface PaginatedResult<T> {
	data : T[];
	meta : {
		total      : number;
		page       : number;
		size       : number;
		totalPages : number;
	};
}
