const formatPrefix = ( str: string ): string =>
    str
        .trim()
        .replace( /\s+/g, '' )
        .substring( 0, 4 )
        .toUpperCase()
        .padEnd( 4, 'X' );


export function generateProductSku(
    categoryName    : string,
    subcategoryName : string,
    productName     : string
): string {
	const catPrefix     = formatPrefix( categoryName );
	const subCatPrefix  = formatPrefix( subcategoryName );
	const prodPrefix    = formatPrefix( productName );
	const randomSuffix  = Math.random().toString( 36 ).substring( 2, 5 ).toUpperCase();

	return `${catPrefix}-${subCatPrefix}-${prodPrefix}-${randomSuffix}`;
}
