import { AttachmentType } from '@prisma/client';


export const getFileNameWithExtension = ( secureUrl: string ): string => {
	return secureUrl.split( '/' ).pop() || secureUrl;
};


export const matchFileByName = ( serverUrlOrName: string, clientName: string ): boolean => {
	if ( !clientName ) return false;

	const serverNameLower = decodeURIComponent( serverUrlOrName.toLowerCase() );
	const clientNameLower = clientName.toLowerCase();
	const serverBase      = serverNameLower.substring( 0, serverNameLower.lastIndexOf( '.' ) ) || serverNameLower;
	const clientBase      = clientNameLower.substring( 0, clientNameLower.lastIndexOf( '.' ) ) || clientNameLower;

	return serverBase.includes( clientBase ) || clientBase.includes( serverBase );
};


export const mapResourceTypeToAttachmentType = ( resourceType: string, secureUrl: string ) : AttachmentType => {
	const filename = secureUrl.toLowerCase();

	if (
		filename.endsWith( '.pdf' ) ||
		filename.endsWith( '.doc' ) ||
		filename.endsWith( '.docx' ) ||
		filename.endsWith( '.xls' ) ||
		filename.endsWith( '.xlsx' ) ||
		filename.endsWith( '.txt' ) ||
		filename.endsWith( '.csv' ) ||
		filename.endsWith( '.ppt' ) ||
		filename.endsWith( '.pptx' )
	) {
		return 'DOCUMENTS';
	}

	if ( resourceType === 'image' ) {
		return 'IMAGE';
	}

	if ( resourceType === 'video' ) {
		return 'VIDEOS';
	}

	return 'OTHERS';
};

