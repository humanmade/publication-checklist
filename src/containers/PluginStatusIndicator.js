import { Check, Error } from '../icons';
import { useEffect } from '@wordpress/element';
import { dispatch, useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';

const PluginStatusIndicator = () => {
	const isIncomplete = useSelect( ( select ) => {
		const currentPost = select( 'core/editor' ).getCurrentPost();
		const restResults = currentPost?.prepublish_checks;
		return Object.values(
			select( STORE_NAME ).getMergedResults( restResults )
		).some( ( { status } ) => status === 'incomplete' );
	} );

	const shouldBlockPublish = Boolean(
		window.altisPublicationChecklist.block_publish
	);

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
