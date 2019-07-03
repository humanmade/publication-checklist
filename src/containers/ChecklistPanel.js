import _get from 'lodash/get';

import { compose, withSafeTimeout } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';

import ChecklistPanel from '../components/ChecklistPanel';
import storeName from '../store/name';

export const mapDispatchToProps = ( dispatch ) => {
	const {
		registerItem,
		setItemStatus,
	} = dispatch( storeName );

	return {
		registerItem,
		setItemStatus,
	};
};

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
	withDispatch( mapDispatchToProps ),
] )( ChecklistPanel );
