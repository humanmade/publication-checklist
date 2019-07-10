import { get } from 'lodash';

import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';

function ConfirmPublishButtonLabel( {
	isPublished,
	isBeingScheduled,
	hasPublishAction,
} ) {
	if ( ! hasPublishAction ) {
		return __( 'Ignore Checklist and Submit for Review', 'hm-publication-checklist' );
	} else if ( isPublished ) {
		return __( 'Ignore Checklist and Update', 'hm-publication-checklist' );
	} else if ( isBeingScheduled ) {
		return __( 'Ignore Checklist and Schedule', 'hm-publication-checklist' );
	}

	return __( 'Ignore Checklist and Publish', 'hm-publication-checklist' );
}

export default compose( [
	withSelect( ( select ) => {
		const {
			isCurrentPostPublished,
			isEditedPostBeingScheduled,
			getCurrentPost,
			getCurrentPostType,
		} = select( 'core/editor' );
		return {
			isPublished: isCurrentPostPublished(),
			isBeingScheduled: isEditedPostBeingScheduled(),
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
			postType: getCurrentPostType(),
		};
	} ),
] )( ConfirmPublishButtonLabel );
