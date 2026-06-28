import { IQuoteItem } from '@quotes/interfaces/quote-item.interface';


export function getItemsTableComponent( items : IQuoteItem[] ) : string {
	const itemsRows = items.map( ( item ) => `
		<tr>
			<td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-family: 'Lato', sans-serif;">
				<div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">${ item.name }</div>
				<div style="font-size: 12px; color: #64748b; font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.05em;">
					${ item.type === 'product' ? 'Producto' : item.type === 'kit' ? 'Kit' : 'Laboratorio Móvil' }
				</div>
			</td>
			<td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 16px; font-family: 'Outfit', sans-serif; text-align: center; font-weight: 800;">
				${ item.quantity }
			</td>
		</tr>
	` ).join( '' );

	return `
		<h3 style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 32px; margin-bottom: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
			Detalle del Requerimiento
		</h3>

		<table class="items-table">
			<thead>
				<tr>
					<th style="width: 75%;">Ítem</th>
					<th style="width: 25%; text-align: center;">Cantidad</th>
				</tr>
			</thead>
			<tbody>
				${ itemsRows }
			</tbody>
		</table>
	`;
}
