import _get from 'lodash/get';

import { Check, Error } from '../icons';

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

	return isIncomplete ? <Error /> : <Check />;
};

export default PluginStatusIndicator;
