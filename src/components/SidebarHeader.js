import PropTypes from 'prop-types';

import { Button, IconButton, Popover } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { PostPublishButton } from '@wordpress/editor';
import { PluginPrePublishPanel } from '@wordpress/editPost';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import ConfirmPublish from './ConfirmPublish';

/**
 * Replacement sidebar header.
 *
 * Allows us to replace the header component of the prepublish sidebar so we
 * can override the publish button behaviour to show a popover.
 */
class SidebarHeader extends Component {
	render() {
		const {
			baseClassName,
			closePublishSidebar,
			hasActiveMetaboxes,
			isSaving,
			isCompleted,
			toComplete,
		} = this.props;

		const canBePublished = isCompleted;

		const publishButton = (
			<PostPublishButton
				focusOnMount={ true }
				onSubmit={ this.onSubmit }
				forceIsDirty={ hasActiveMetaboxes }
				forceIsSaving={ isSaving }
			/>
		);

		return (
			<PluginPrePublishPanel
				className={ `${ baseClassName }__replacement-header`}
				initialOpen
			>
				<div className="editor-post-publish-panel__header">
					<div className="editor-post-publish-panel__header-publish-button">
						<ConfirmPublish
							baseClassName={ baseClassName }
							canBePublished={ canBePublished }
							toComplete={ toComplete }
						>
							{ publishButton }
						</ConfirmPublish>
						<span className="editor-post-publish-panel__spacer"></span>
					</div>
					<IconButton
						aria-expanded={ true }
						onClick={ closePublishSidebar }
						icon="no-alt"
						label={ __( 'Close panel' ) }
					/>
				</div>
			</PluginPrePublishPanel>
		);
	}
}

SidebarHeader.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	closePublishSidebar: PropTypes.func.isRequired,
	hasActiveMetaboxes: PropTypes.bool.isRequired,
	isCompleted: PropTypes.bool.isRequired,
	isSaving: PropTypes.bool.isRequired,
	toComplete: PropTypes.number.isRequired,
};

export default compose(
	withSelect( ( select ) => ( {
		hasActiveMetaboxes: select( 'core/edit-post' ).hasMetaBoxes(),
		isSaving: select( 'core/edit-post' ).isSavingMetaBoxes(),
	} ) ),
	withDispatch( ( dispatch ) => {
		const { closePublishSidebar } = dispatch( 'core/edit-post' );
		return {
			closePublishSidebar,
		};
	} ),
)( SidebarHeader );
