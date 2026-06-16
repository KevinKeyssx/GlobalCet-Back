import { Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';


export const normalizeText = (text: string): string => {
    if ( !text ) {
        return '';
    }

    return text
        .trim()
        .normalize( 'NFD' )
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};


export const searchProductIds = async (
    prisma      : PrismaService,
    queryText   : string,
    isSku       : boolean = false,
): Promise<string[]> => {
    const normalized = normalizeText( queryText );

    if ( !normalized ) {
        return [];
    }

    const words = normalized.split(/\s+/).filter( Boolean );

    if ( words.length === 0 ) {
        return [];
    }

    const wordConditions = words.map((word) => {
        const pattern = `%${word}%`;

        return Prisma.sql`(
            unaccent( p.sku ) ILIKE ${pattern}
            OR (
                ${isSku} = false AND (
                    unaccent( p.name ) ILIKE ${pattern}
                    OR unaccent( s.name ) ILIKE ${pattern}
                    OR unaccent( c.name ) ILIKE ${pattern}
                    OR unaccent( m.name ) ILIKE ${pattern}
                )
            )
        )`;
    });

    const matches = await prisma.$queryRaw<{ id: string }[]>`
        SELECT DISTINCT p.id
        FROM products p
        LEFT JOIN subcategories s ON p."subcategoryId" = s.id
        LEFT JOIN categories c ON s."categoryId" = c.id
        LEFT JOIN materials m ON p."materialId" = m.id
        WHERE ${Prisma.join(wordConditions, ' AND ')}
    `;

    return matches.map((r) => r.id);
};

export const searchKitIds = async (
    prisma      : PrismaService,
    queryText   : string,
    isSku       : boolean = false,
): Promise<string[]> => {
    const normalized = normalizeText( queryText );

    if ( !normalized ) {
        return [];
    }

    const words = normalized.split(/\s+/).filter( Boolean );

    if ( words.length === 0 ) {
        return [];
    }

    const wordConditions = words.map((word) => {
        const pattern = `%${word}%`;

        return Prisma.sql`(
                unaccent( k.sku ) ILIKE ${pattern}
                OR (
                    ${isSku} = false AND (
                        unaccent( k.name ) ILIKE ${pattern}
                        OR unaccent( c.name ) ILIKE ${pattern}
                    )
                )
            )`;
    });

    const matches = await prisma.$queryRaw<{ id: string }[]>`
        SELECT DISTINCT k.id
        FROM kits k
        LEFT JOIN kit_categories c ON k."categoryId" = c.id
        WHERE ${Prisma.join(wordConditions, ' AND ')}
    `;

    return matches.map((r) => r.id);
};


export const searchMobileLabIds = async (
    prisma      : PrismaService,
    queryText   : string,
    isSku       : boolean = false,
): Promise<string[]> => {
    const normalized = normalizeText( queryText );

    if ( !normalized ) {
        return [];
    }

    const words = normalized.split(/\s+/).filter( Boolean );

    if ( words.length === 0 ) {
        return [];
    }

    const wordConditions = words.map((word) => {
        const pattern = `%${word}%`;

        return Prisma.sql`(
                unaccent( ml.sku ) ILIKE ${pattern}
                OR (
                    ${isSku} = false AND (
                        unaccent( ml.name ) ILIKE ${pattern}
                        OR unaccent( c.name ) ILIKE ${pattern}
                    )
                )
            )`;
    });

    const matches = await prisma.$queryRaw<{ id: string }[]>`
        SELECT DISTINCT ml.id
        FROM mobile_labs ml
        LEFT JOIN lab_categories c ON ml."categoryId" = c.id
        WHERE ${Prisma.join(wordConditions, ' AND ')}
    `;

    return matches.map((r) => r.id);
};
