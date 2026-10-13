import { Check, Error } from '../icons';
import { useEffect } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
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

	// The editor renders this icon in more than one slot, so a shared lock name would
	// let the first unmount release the survivor's lock.
	const lockName = useInstanceId(
		PluginStatusIndicator,
		'publication-checklist'
	);

	useEffect( () => {
		if ( ! shouldBlockPublish ) {
			return;
		}
		const { lockPostSaving, unlockPostSaving } = dispatch( 'core/editor' );
		if ( isIncomplete ) {
			lockPostSaving( lockName );
		} else {
			unlockPostSaving( lockName );
		}

		return () => unlockPostSaving( lockName );
	}, [ shouldBlockPublish, isIncomplete, lockName ] );

	return isIncomplete ? <Error /> : <Check />;
};

export default PluginStatusIndicator;
