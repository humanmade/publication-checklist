import _get from 'lodash/get';

import { Icon, check, error } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';

const PluginStatusIndicator = () => {

	const items = useSelect( select => _get(
		select( 'core/editor' ).getCurrentPost(),
		'prepublish_checks'
	) );

	const { lockPostSaving, unlockPostSaving } = useDispatch( 'core/editor' );

	const isIncomplete = Object.values( items )
		.map( ( { status } ) => status )
		.includes( 'incomplete' );

	const shouldBlockPublish = Boolean( window.altisPublicationChecklist.block_publish );

	if ( shouldBlockPublish ) {
		if ( isIncomplete ) {
			lockPostSaving( 'publication-checklist' );
		} else {
			unlockPostSaving( 'publication-checklist' );
		}
	}

	return isIncomplete ?
		<Icon icon={ error } color="red" /> :
		<Icon icon={ check } />;
};

export default PluginStatusIndicator;
