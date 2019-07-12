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
		return __( 'Ignore Checklist and Submit for Review', 'altis-publication-checklist' );
	} else if ( isPublished ) {
		return __( 'Ignore Checklist and Update', 'altis-publication-checklist' );
	} else if ( isBeingScheduled ) {
		return __( 'Ignore Checklist and Schedule', 'altis-publication-checklist' );
	}

	return __( 'Ignore Checklist and Publish', 'altis-publication-checklist' );
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
