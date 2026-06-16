import { Prisma } from '@prisma/client';


export function getKitSelect(
	includeFiles	: boolean,
	includeProducts	: boolean
): Prisma.KitSelect {
	return {
		id			: true,
		sku			: true,
		name		: true,
		description	: true,
		active		: true,
		categoryId	: true,
		createdAt	: true,
		updatedAt	: true,
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
		category	: {
			select : {
				id		: true,
				name	: true
			}
		}
	};
}
