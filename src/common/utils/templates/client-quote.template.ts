import { getHeaderComponent }       from './components/header';
import { getFooterComponent }       from './components/footer';
import { getItemsTableComponent }   from './components/items-table';
import { IQuoteItem }               from '@quotes/interfaces/quote-item.interface';


export interface ClientQuoteTemplateData {
	quoteNumber     : string;
	statusSpanish   : string;
	estimatedTime   : string;
	items           : IQuoteItem[];
    contactName     : string;
    companyName     : string;
}


export function getClientQuoteTemplate( data : ClientQuoteTemplateData ) : string {
	const { quoteNumber, statusSpanish, estimatedTime, items, contactName, companyName } = data;

	const contentHtml = `
		<h2 class="title">¡Hola ${ contactName } | ${ companyName }!</h2>
		<p class="text">
			Agradecemos tu interés en nuestros productos de Ciencia, Educación y Tecnología. Hemos recibido tu solicitud de cotización correctamente. Nuestro equipo ya se encuentra trabajando para usted.
		</p>

		<div class="info-card">
			<table class="info-table">
				<tr>
					<td class="info-label">Número de Cotización</td>
					<td class="info-value" style="font-family: 'Outfit', sans-serif; font-size: 16px; color: #059669;">${ quoteNumber }</td>
				</tr>
				<tr>
					<td class="info-label">Estado</td>
					<td class="info-value">
						<span class="badge-pending">${ statusSpanish }</span>
					</td>
				</tr>
				<tr>
					<td class="info-label">Tiempo Estimado de Respuesta</td>
					<td class="info-value" style="color: #0d1f15;">${ estimatedTime }</td>
				</tr>
			</table>
		</div>

		${ getItemsTableComponent( items ) }
	`;

	return `${ getHeaderComponent( 'Cotización Recibida' ) }${ contentHtml }${ getFooterComponent() }`;
}
