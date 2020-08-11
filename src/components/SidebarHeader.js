import PropTypes from 'prop-types';

import { IconButton } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { PluginPostPublishPanel, PluginPrePublishPanel } from '@wordpress/editPost';
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
			isBeingScheduled,
			isCompleted,
			isPublished,
			isScheduled,
			isSaving,
			isSavingMetaBoxes,
			shouldBlockPublish,
			toComplete,
		} = this.props;

		const isPublishedOrScheduled = isPublished || ( isScheduled && isBeingScheduled );
		const isPrePublish = ! isPublishedOrScheduled && ! isSaving;
		const isPostPublish = isPublishedOrScheduled && ! isSaving;

		const Panel = isPrePublish ? PluginPrePublishPanel : PluginPostPublishPanel;

		return (
			<Panel
				className={ `${ baseClassName }__replacement-header` }
				initialOpen
			>
				<div className="editor-post-publish-panel__header">
					{ isPostPublish ? (
						<div className="editor-post-publish-panel__header-published">
							{ isScheduled ? __( 'Scheduled' ) : __( 'Published' ) }
						</div>
					) : (
						<div className="editor-post-publish-panel__header-publish-button">
							<ConfirmPublish
								baseClassName={ baseClassName }
								canBePublished={ isCompleted }
								forceIsDirty={ hasActiveMetaboxes }
								forceIsSaving={ isSavingMetaBoxes }
								isBeingScheduled={ isBeingScheduled }
								shouldBlockPublish={ shouldBlockPublish }
								toComplete={ toComplete }
							/>
							<span className="editor-post-publish-panel__spacer"></span>
						</div>
					) }
					<IconButton
						aria-expanded={ true }
						onClick={ closePublishSidebar }
						icon="no-alt"
						label={ __( 'Close panel' ) }
					/>
				</div>
			</Panel>
		);
	}
}

SidebarHeader.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	closePublishSidebar: PropTypes.func.isRequired,
	hasActiveMetaboxes: PropTypes.bool.isRequired,
	isBeingScheduled: PropTypes.bool.isRequired,
	isCompleted: PropTypes.bool.isRequired,
	isPublished: PropTypes.bool.isRequired,
	isSaving: PropTypes.bool,
	isSavingMetaBoxes: PropTypes.bool.isRequired,
	isScheduled: PropTypes.bool.isRequired,
	shouldBlockPublish: PropTypes.bool.isRequired,
	toComplete: PropTypes.number.isRequired,
};

export default compose(
	withSelect( ( select ) => {
		const {
			isEditedPostBeingScheduled,
			isCurrentPostPublished,
			isCurrentPostScheduled,
			isSavingPost,
		} = select( 'core/editor' );

		const {
			hasMetaBoxes,
			isSavingMetaBoxes,
		} = select( 'core/edit-post' );

		return {
			hasActiveMetaboxes: hasMetaBoxes(),
			isBeingScheduled: isEditedPostBeingScheduled(),
			isPublished: isCurrentPostPublished(),
			isSaving: isSavingPost(),
			isSavingMetaBoxes: isSavingMetaBoxes(),
			isScheduled: isCurrentPostScheduled(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { closePublishSidebar } = dispatch( 'core/edit-post' );
		return {
			closePublishSidebar,
		};
	} ),
)( SidebarHeader );
