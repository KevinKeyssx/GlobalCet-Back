import { QuoteStatus } from '@prisma/client';

import { getHeaderComponent }       from '@common/utils/templates/components/header';
import { getFooterComponent }       from '@common/utils/templates/components/footer';
import { getItemsTableComponent }   from '@common/utils/templates/components/items-table';
import { IQuoteItem }               from '@quotes/interfaces/quote-item.interface';


export interface QuoteStatusConfig {
	label   : string;
	color   : string;
	message : string;
	subject : string;
}


export function getQuoteStatusConfig( status : QuoteStatus, quoteNumber : string ) : QuoteStatusConfig {
	switch ( status ) {
		case QuoteStatus.PENDING:
			return {
				label   : 'Pendiente',
				color   : '#eab308',
				subject : `Cotización ${ quoteNumber } - Estado: Pendiente`,
				message : 'Tu cotización ha sido devuelta al estado **Pendiente**. Nuestro equipo técnico o administrativo está revisando la información complementaria necesaria para procesar tu solicitud.',
			};
		case QuoteStatus.IN_REVIEW:
			return {
				label   : 'En Revisión',
				color   : '#f97316',
				subject : `Cotización ${ quoteNumber } - En Revisión`,
				message : 'Queremos informarte que tu cotización está siendo analizada minuciosamente por nuestros especialistas en laboratorio y logística (**En Revisión**). Validaremos stock y especificaciones técnicas a la brevedad.',
			};
		case QuoteStatus.SENT_TO_CLIENT:
			return {
				label   : 'Enviada al Cliente',
				color   : '#3b82f6',
				subject : `Cotización ${ quoteNumber } - Lista para tu Evaluación`,
				message : 'Tu cotización ha sido emitida formalmente y se encuentra **Enviada al Cliente**. Te invitamos a revisar la propuesta adjunta en tu portal de cliente y/o responder a este correo para proceder con la aceptación.',
			};
		case QuoteStatus.ACCEPTED:
			return {
				label   : 'Aceptada',
				color   : '#10b981',
				subject : `Cotización ${ quoteNumber } - Confirmación de Aceptación`,
				message : '¡Excelente noticia! Tu cotización ha sido marcada como **Aceptada**. Hemos iniciado la reserva de inventario e ingresado el pedido a nuestra línea de despacho y facturación.',
			};
		case QuoteStatus.REJECTED:
			return {
				label   : 'Rechazada',
				color   : '#ef4444',
				subject : `Cotización ${ quoteNumber } - Actualización`,
				message : 'Te informamos que la cotización ha sido marcada como **Rechazada**. Si requieres alguna modificación en la configuración de los productos o en las condiciones comerciales, no dudes en ponerte en contacto con nosotros.',
			};
		case QuoteStatus.COMPLETED:
			return {
				label   : 'Completada',
				color   : '#059669',
				subject : `Cotización ${ quoteNumber } - Proceso Completado con Éxito`,
				message : 'Tu cotización ha sido finalizada con éxito (**Completada**). Agradecemos profundamente tu confianza en GlobalCet para el equipamiento de tus proyectos de Ciencia, Educación y Tecnología.',
			};
		case QuoteStatus.CANCELLED:
			return {
				label   : 'Cancelada',
				color   : '#dc2626',
				subject : `Cotización ${ quoteNumber } - Cancelada`,
				message : 'Te notificamos que la cotización ha sido formalmente **Cancelada** en nuestro sistema. Si esto es un error o deseas reactivar la solicitud, por favor comunícate de inmediato con un ejecutivo de GlobalCet.',
			};
		default:
			return {
				label   : 'Actualizada',
				color   : '#6b7280',
				subject : `Cotización ${ quoteNumber } - Actualizada`,
				message : 'Tu cotización ha sido actualizada a un nuevo estado.',
			};
	}
}


export interface QuoteStatusTemplateData {
	quoteNumber : string;
	status      : QuoteStatus;
	contactName : string;
	companyName : string;
	items       : IQuoteItem[];
}


export function getQuoteStatusUpdateTemplate( data : QuoteStatusTemplateData ) : string {
	const { quoteNumber, status, contactName, companyName, items } = data;
	const config = getQuoteStatusConfig( status, quoteNumber );

	const contentHtml = `
		<h2 class="title">¡Hola ${ contactName } | ${ companyName }!</h2>
		<p class="text">
			Te informamos que ha habido una actualización en el estado de tu cotización en nuestro sistema.
		</p>

		<div class="info-card">
			<table class="info-table">
				<tr>
					<td class="info-label">Número de Cotización</td>
					<td class="info-value" style="font-family: 'Outfit', sans-serif; font-size: 16px; color: #0d1f15; font-weight: bold;">${ quoteNumber }</td>
				</tr>
				<tr>
					<td class="info-label">Nuevo Estado</td>
					<td class="info-value">
						<span style="
							display: inline-block;
							padding: 4px 10px;
							font-size: 12px;
							font-weight: bold;
							color: white;
							background-color: ${ config.color };
							border-radius: 9999px;
							text-transform: uppercase;
							letter-spacing: 0.05em;
						">${ config.label }</span>
					</td>
				</tr>
			</table>
		</div>

		<div style="margin: 24px 0; padding: 16px; background-color: #f9fafb; border-left: 4px solid ${ config.color }; border-radius: 4px;">
			<p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
				${ config.message }
			</p>
		</div>

		<h3 style="font-family: 'Outfit', sans-serif; font-size: 16px; color: #0d1f15; margin-top: 32px; margin-bottom: 12px;">Detalle de ítems cotizados:</h3>
		${ getItemsTableComponent( items ) }
	`;

	return `${ getHeaderComponent( 'Actualización de Cotización' ) }${ contentHtml }${ getFooterComponent() }`;
}
