import { get } from 'lodash';

import { __ } from '@wordpress/i18n';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Fragment } from '@wordpress/element';

function ConfirmOverrideHelpText( {
	isPublished,
	isBeingScheduled,
	hasPublishAction,
} ) {
	let message = __( 'Confirm that you wish to ignore these tasks and publish anyway.' );

	if ( ! hasPublishAction ) {
		message = __( 'Confirm that you wish to ignore these tasks and submit for review anyway.', 'altis-publication-checklist' );
	} else if ( isPublished ) {
		message = __( 'Confirm that you wish to ignore these tasks and update anyway.', 'altis-publication-checklist' );
	} else if ( isBeingScheduled ) {
		message = __( 'Confirm that you wish to ignore these tasks and schedule anyway.', 'altis-publication-checklist' );
	}

	return (
		<Fragment>
			{ __( 'You have incomplete tasks remaining.', 'altis-publication-checklist' ) }
			{ ' ' }
			{ message }
		</Fragment>
	);
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
] )( ConfirmOverrideHelpText );
