import { Prisma } from '@prisma/client';


export function getMobileLabSelect(
	includeFiles	: boolean,
	includeProducts	: boolean,
	includeKits		: boolean
): Prisma.MobileLabSelect {
	return {
		id		        : true,
		sku		        : true,
		name	        : true,
		description     : true,
		dimensions      : true,
		active	        : true,
		categoryId      : true,
		createdAt       : true,
		updatedAt       : true,
        currentPrice    : true,
        currentStock    : true,
        minStock        : true,
        maxStock        : true,
		files		: {
			where	: includeFiles ? {} : { isMain : true },
			select	: {
				id				: true,
				url				: true,
				alt				: true,
				isMain			: true,
				order			: true,
				attachmentType	: true
			},
			orderBy	: { order : 'asc' }
		},
		...( includeProducts && {
			products : {
				select : {
					id			: true,
					quantity	: true,
					productId	: true,
					product		: {
						select : {
							id		: true,
							name	: true,
							sku		: true
						}
					}
				}
			}
		} ),
		...( includeKits && {
			kits : {
				select : {
					id			: true,
					quantity	: true,
					kitId		: true,
					kit			: {
						select : {
							id		: true,
							name	: true,
							sku		: true
						}
					}
				}
			}
		} ),
		category	: {
			select : {
				id		: true,
				name	: true
			}
		}
	};
}
