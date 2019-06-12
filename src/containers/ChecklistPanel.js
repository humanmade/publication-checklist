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
	const { getItems } = select( storeName );

	const {
		isCurrentPostPublished,
		isPublishSidebarEnabled,
	} = select( 'core/editor' );

	return {
		items: getItems(),
		shouldRenderInPublishSidebar: isPublishSidebarEnabled() && ! isCurrentPostPublished(),
	};
};

export default compose( [
	withSafeTimeout,
	withSelect( mapSelectToProps ),
	withDispatch( mapDispatchToProps ),
] )( ChecklistPanel );
