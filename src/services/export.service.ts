import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';


export interface IColumnConfig {
	header : string;
	key    : string;
	width? : number;
}

@Injectable( )
export class ExportService {

	async exportToExcelStream<T extends Record<string, any>>(
		res          : Response,
		filename     : string,
		columns      : IColumnConfig[],
		dataProvider : ( skip: number, take: number ) => Promise<T[]>,
	): Promise<void> {
		res.setHeader( 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' );
		res.setHeader( 'Content-Disposition', `attachment; filename="${ filename }.xlsx"` );

		const options = {
			stream           : res,
			useStyles        : true,
			useSharedStrings : true,
		};

		const workbook  = new ExcelJS.stream.xlsx.WorkbookWriter( options );
		const worksheet = workbook.addWorksheet( 'Reporte' );

		worksheet.columns = columns.map( ( col ) => ( {
			header : col.header,
			key    : col.key,
			width  : col.width || 20,
		} ) );

		let skip    = 0;
		const take  = 500;
		let hasMore = true;

		while ( hasMore ) {
			const chunk = await dataProvider( skip, take );

			if ( chunk.length === 0 ) {
				hasMore = false;
				break;
			}

			for ( const row of chunk ) {
				worksheet.addRow( row ).commit( );
			}

			skip += take;

			if ( chunk.length < take ) {
				hasMore = false;
			}
		}

		worksheet.commit( );
		await workbook.commit( );
	}


	async exportToPdfStream<T extends Record<string, any>>(
		res          : Response,
		filename     : string,
		title        : string,
		columns      : IColumnConfig[],
		dataProvider : ( skip: number, take: number ) => Promise<T[]>,
	): Promise<void> {
		res.setHeader( 'Content-Type', 'application/pdf' );
		res.setHeader( 'Content-Disposition', `attachment; filename="${ filename }.pdf"` );

		const doc = new PDFDocument( {
			margin : 30,
			size   : 'LETTER',
		} );

		doc.pipe( res );

		// Título del documento
		doc.fontSize( 18 ).text( title, { align : 'center' } );
		doc.moveDown( 1 );
		doc.fontSize( 10 ).text( `Fecha de Generación: ${ new Date( ).toLocaleString( ) }`, { align : 'right' } );
		doc.moveDown( 2 );

		const startX    = 30;
		let currentY    = doc.y;
		const colWidth  = 550 / columns.length;

		// Cabecera de la tabla
		doc.fontSize( 10 ).font( 'Helvetica-Bold' );
		columns.forEach( ( col, i ) => {
			doc.text( col.header, startX + ( i * colWidth ), currentY, {
				width : colWidth - 5,
				align : 'left',
			} );
		} );

		doc.moveDown( 0.5 );
		doc.strokeColor( '#cccccc' ).lineWidth( 1 ).moveTo( startX, doc.y ).lineTo( 580, doc.y ).stroke( );
		doc.moveDown( 0.5 );

		let skip    = 0;
		const take  = 500;
		let hasMore = true;

		doc.font( 'Helvetica' ).fontSize( 8 );

		while ( hasMore ) {
			const chunk = await dataProvider( skip, take );

			if ( chunk.length === 0 ) {
				hasMore = false;
				break;
			}

			for ( const row of chunk ) {
				// Control de salto de página
				if ( doc.y > 720 ) {
					doc.addPage( );
					currentY = 40;
					doc.y = currentY;

					// Cabecera en la nueva página
					doc.fontSize( 10 ).font( 'Helvetica-Bold' );
					columns.forEach( ( col, i ) => {
						doc.text( col.header, startX + ( i * colWidth ), currentY, {
							width : colWidth - 5,
							align : 'left',
						} );
					} );

					doc.moveDown( 0.5 );
					doc.strokeColor( '#cccccc' ).lineWidth( 1 ).moveTo( startX, doc.y ).lineTo( 580, doc.y ).stroke( );
					doc.moveDown( 0.5 );
					doc.font( 'Helvetica' ).fontSize( 8 );
				}

				currentY = doc.y;
				columns.forEach( ( col, i ) => {
					const val = row[ col.key ];
					let value = '';

					if ( val !== null && val !== undefined ) {
						if ( typeof val === 'boolean' ) {
							value = val ? 'Sí' : 'No';
						} else if ( val instanceof Date ) {
							value = val.toLocaleDateString( );
						} else {
							value = String( val );
						}
					}

					doc.text( value, startX + ( i * colWidth ), currentY, {
						width : colWidth - 5,
						align : 'left',
					} );
				} );

				doc.moveDown( 0.8 );
			}

			skip += take;

			if ( chunk.length < take ) {
				hasMore = false;
			}
		}

		doc.end( );
	}

}
