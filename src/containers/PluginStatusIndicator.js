import { Check, Error } from '../icons';

import { useDispatch, useSelect } from '@wordpress/data';

const PluginStatusIndicator = () => {

	const isIncomplete = useSelect( select => {
		const currentPost = select( 'core/editor' ).getCurrentPost();
		if ( currentPost && currentPost.prepublish_checks ) {
			return Object.values( currentPost.prepublish_checks )
				.map( ( { status } ) => status )
				.includes( 'incomplete' );
		}
		return false;
	} );

	const { lockPostSaving, unlockPostSaving } = useDispatch( 'core/editor' );

	const shouldBlockPublish = Boolean( window.altisPublicationChecklist.block_publish );

	if ( shouldBlockPublish ) {
		if ( isIncomplete ) {
			lockPostSaving( 'publication-checklist' );
		} else {
			unlockPostSaving( 'publication-checklist' );
		}
	}

	return isIncomplete ? <Error /> : <Check />;
};

export default PluginStatusIndicator;
