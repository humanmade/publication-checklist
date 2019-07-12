import _get from 'lodash/get';

import { compose, withSafeTimeout } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

import ChecklistPanel from '../components/ChecklistPanel';

export const mapSelectToProps = ( select ) => {
	const {
		getCurrentPost,
		isCurrentPostPublished,
		isPublishSidebarEnabled,
	} = select( 'core/editor' );

	return {
		items: _get( getCurrentPost(), 'prepublish_checks' ),
		shouldRenderInPublishSidebar: isPublishSidebarEnabled() && ! isCurrentPostPublished(),
	};
};

export default compose( [
	withSafeTimeout,
	withSelect( mapSelectToProps ),
] )( ChecklistPanel );
