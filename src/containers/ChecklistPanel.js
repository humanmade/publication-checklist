import _get from 'lodash/get';

import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

import ChecklistPanel from '../components/ChecklistPanel';
import { STORE_NAME } from '../store';

export const mapSelectToProps = ( select ) => {
	const {
		getCurrentPost,
		isCurrentPostPublished,
		isPublishSidebarEnabled,
	} = select( 'core/editor' );
	const { getMergedResults } = select( STORE_NAME );

	const currentPost = getCurrentPost();
	const restResults = _get( currentPost, 'prepublish_checks' );

	return {
		items: getMergedResults( restResults ),
		shouldRenderInPublishSidebar:
			isPublishSidebarEnabled() && ! isCurrentPostPublished(),
	};
};

export default compose( [ withSelect( mapSelectToProps ) ] )( ChecklistPanel );
