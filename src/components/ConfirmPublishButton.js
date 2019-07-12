import { get } from 'lodash';
import PropTypes from 'prop-types';

import { Button } from '@wordpress/components';
import { Component, createRef } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

import ConfirmPublishButtonLabel from './ConfirmPublishButtonLabel';

class ConfirmPublishButton extends Component {
	constructor( props ) {
		super( props );
		this.buttonNode = createRef();
	}
	componentDidMount() {
		if ( this.props.focusOnMount ) {
			this.buttonNode.current.focus();
		}
	}

	render() {
		const {
			forceIsDirty,
			forceIsSaving,
			hasPublishAction,
			isBeingScheduled,
			isPostSavingLocked,
			isPublishable,
			isPublished,
			isSaveable,
			isSaving,
			onSave,
			onStatusChange,
			visibility,
		} = this.props;

		const isButtonDisabled = (
			isSaving
			|| forceIsSaving
			|| ! isSaveable
			|| isPostSavingLocked
			|| ( ! isPublishable && ! forceIsDirty )
		);

		let publishStatus;
		if ( ! hasPublishAction ) {
			publishStatus = 'pending';
		} else if ( isBeingScheduled ) {
			publishStatus = 'future';
		} else if ( visibility === 'private' ) {
			publishStatus = 'private';
		} else {
			publishStatus = 'publish';
		}

		const onClickButton = () => {
			if ( isButtonDisabled ) {
				return;
			}
			onStatusChange( publishStatus );
			onSave();
		};

		const buttonProps = {
			'aria-disabled': isButtonDisabled,
			className: 'editor-post-publish-button',
			isBusy: isSaving && isPublished,
			isLarge: true,
			isPrimary: true,
			onClick: onClickButton,
		};

		return (
			<Button
				ref={ this.buttonNode }
				{ ...buttonProps }
			>
				<ConfirmPublishButtonLabel />
			</Button>
		);
	}
}

ConfirmPublishButton.propTypes = {
	focusOnMount: PropTypes.bool.isRequired,
	forceIsDirty: PropTypes.bool.isRequired,
	forceIsSaving: PropTypes.bool.isRequired,
	hasPublishAction: PropTypes.bool.isRequired,
	isBeingScheduled: PropTypes.bool.isRequired,
	isPostSavingLocked: PropTypes.bool.isRequired,
	isPublishable: PropTypes.bool.isRequired,
	isPublished: PropTypes.bool.isRequired,
	isSaveable: PropTypes.bool.isRequired,
	isSaving: PropTypes.bool.isRequired,
	visibility: PropTypes.string.isRequired,
	onSave: PropTypes.func.isRequired,
	onStatusChange: PropTypes.func.isRequired,
};

export default compose( [
	withSelect( ( select ) => {
		const {
			isSavingPost,
			isEditedPostBeingScheduled,
			getEditedPostVisibility,
			isCurrentPostPublished,
			isEditedPostSaveable,
			isEditedPostPublishable,
			isPostSavingLocked,
			getCurrentPost,
			getCurrentPostType,
		} = select( 'core/editor' );
		return {
			isSaving: isSavingPost(),
			isBeingScheduled: isEditedPostBeingScheduled(),
			visibility: getEditedPostVisibility(),
			isSaveable: isEditedPostSaveable(),
			isPostSavingLocked: isPostSavingLocked(),
			isPublishable: isEditedPostPublishable(),
			isPublished: isCurrentPostPublished(),
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
			postType: getCurrentPostType(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { editPost, savePost } = dispatch( 'core/editor' );
		return {
			onStatusChange: ( status ) => editPost( { status } ),
			onSave: savePost,
		};
	} ),
] )( ConfirmPublishButton );
