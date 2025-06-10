import { Check, Error } from '../icons';
import { useEffect } from '@wordpress/element';
import { dispatch, useSelect } from '@wordpress/data';

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

	const shouldBlockPublish = Boolean( window.altisPublicationChecklist.block_publish );

	useEffect( () => {
		if ( ! shouldBlockPublish ) {
			return;
		}
		const { lockPostSaving, unlockPostSaving } = dispatch( 'core/editor' );
		if ( isIncomplete ) {
			lockPostSaving( 'publication-checklist' );
		} else {
			unlockPostSaving( 'publication-checklist' );
		}
	}, [ shouldBlockPublish, isIncomplete ] );

	return isIncomplete ? <Error /> : <Check />;
};

export default PluginStatusIndicator;
