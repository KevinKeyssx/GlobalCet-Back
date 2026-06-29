import { getHeaderComponent }       from './components/header';
import { getFooterComponent }       from './components/footer';
import { getItemsTableComponent }   from './components/items-table';
import { IQuoteItem }               from '@quotes/interfaces/quote-item.interface';


interface AdminQuoteTemplateData {
	quoteNumber : string;
	clientData  : {
		companyName : string;
		rut         : string;
		address     : string;
		email       : string;
		contactName : string;
		phoneNumber : string;
	};
	items       : IQuoteItem[];
}


export function getAdminQuoteTemplate( data : AdminQuoteTemplateData ) : string {
	const { quoteNumber, clientData, items } = data;

	const contentHtml = `
		<h2 class="title">Nueva Solicitud Recibida</h2>
		<p class="text">
			Se ha registrado una nueva cotización en la plataforma. A continuación se presentan los detalles del cliente y los ítems requeridos.
		</p>

		<div style="margin-bottom: 24px;">
			<span style="font-size: 14px; color: #64748b; font-family: 'Lato', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Código de Cotización:</span>
			<span style="font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: #059669; margin-left: 8px;">${ quoteNumber }</span>
		</div>

		<h3 style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 32px; margin-bottom: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
			Datos del Cliente
		</h3>

		<div class="info-card">
			<table class="info-table">
				<tr>
					<td class="info-label">Razón Social</td>
					<td class="info-value">${ clientData.companyName }</td>
				</tr>
				<tr>
					<td class="info-label">RUT</td>
					<td class="info-value">${ clientData.rut }</td>
				</tr>
				<tr>
					<td class="info-label">Dirección</td>
					<td class="info-value">${ clientData.address }</td>
				</tr>
				<tr>
					<td class="info-label">Correo</td>
					<td class="info-value"><a href="mailto:${ clientData.email }" style="color: #059669; text-decoration: none;">${ clientData.email }</a></td>
				</tr>
				<tr>
					<td class="info-label">Contacto / Nombre</td>
					<td class="info-value">${ clientData.contactName }</td>
				</tr>
				<tr>
					<td class="info-label">Teléfono</td>
					<td class="info-value">${ clientData.phoneNumber }</td>
				</tr>
			</table>
		</div>

		${ getItemsTableComponent( items ) }
	`;

	return `${ getHeaderComponent( 'Notificación de Cotización' ) }${ contentHtml }${ getFooterComponent() }`;
}
