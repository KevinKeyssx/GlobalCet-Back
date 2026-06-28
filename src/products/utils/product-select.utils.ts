import { Prisma } from '@prisma/client';


export function getProductSelect(
	includeFiles		: boolean = false,
	includeKits			: boolean = false,
	includeMobileLabs	: boolean = false
): Prisma.ProductSelect {
	return {
		id				: true,
		sku				: true,
		name			: true,
		description		: true,
		material		: true,
		technical_specs	: true,
		active			: true,
		createdAt		: true,
		updatedAt		: true,
        currentPrice    : true,
        currentStock    : true,
        minStock        : true,
        maxStock        : true,
		subcategory		: {
			select : {
				id		: true,
				name	: true
			}
		},
		files			: {
			where	: includeFiles ? {} : { isMain : true },
			select	: {
				id				: true,
				url				: true,
				alt				: true,
				isMain			: true,
				order			: true,
				attachmentType	: true
			}
		},
		...( includeKits && {
			inKits : {
				select : {
					id			: true,
					quantity	: true,
					kit			: {
						select : {
							id			: true,
							sku			: true,
							name		: true,
							description	: true
						}
					}
				}
			}
		} ),
		...( includeMobileLabs && {
			inMobileLabs : {
				select : {
					id			: true,
					quantity	: true,
					mobileLab	: {
						select : {
							id			: true,
							sku			: true,
							name		: true,
							description	: true,
							dimensions	: true
						}
					}
				}
			}
		} )
	};
}
