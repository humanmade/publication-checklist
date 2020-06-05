import classNames from 'classnames';
import _isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import PropTypes from 'prop-types';

import { PanelBody } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { PluginPrePublishPanel, PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editPost';
import { Component, Fragment } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import ChecklistPanelContent from './ChecklistPanelContent';
import SidebarHeader from './SidebarHeader';

import { COMPLETE, INCOMPLETE } from '../itemStatus';
import { itemsMapPropType } from '../propTypes';

const baseClassName = 'altis-publication-checklist';
const panelClassName = `${ baseClassName }__panel`;
const sidebarName = 'altis-publication-checklist';

class ChecklistPanel extends Component {
	state = {
		completion: {
			completed: 0,
			toComplete: 0,
		},
		sortedItems: [],
	};

	static getDerivedStateFromProps( props ) {
		const { items } = props;

		const completion = {
			completed: 0,
			toComplete: 0,
		};
		const incomplete = [];
		const completed = [];
		const other = [];

		forEach( items, ( status, name ) => {
			const item = {
				name,
				...status,
			};

			switch ( item.status ) {
				case COMPLETE:
					completion.completed++;
					completion.toComplete++;
					completed.push( item );
					return;

				case INCOMPLETE:
					completion.toComplete++;
					incomplete.push( item );
					return;

				default:
					other.push( item );
			}
		} );

		return {
			completion,
			completableItems: [
				...incomplete,
				...completed,
			],
			otherItems: other,
		};
	}

	componentDidMount() {
		// Force the publish sidebar to be enabled.
		if ( ! this.props.isPublishSidebarEnabled ) {
			this.props.onEnablePublishSidebar();
		}
	}

	componentDidUpdate( prevProps ) {
		// Force the publish sidebar to be enabled.
		const current = this.props.isPublishSidebarEnabled;
		if ( prevProps.isPublishSidebarEnabled !== current && ! current ) {
			this.props.onEnablePublishSidebar();
		}
	}

	render() {
		const { completableItems, otherItems } = this.state;

		const showChecklist = ! _isEmpty( completableItems ) || ! _isEmpty( otherItems );

		const { shouldBlockPublish, shouldRenderInPublishSidebar } = this.props;

		const { completion } = this.state;

		const {
			completed,
			toComplete,
		} = completion;
		const isToComplete = toComplete > 0;
		const isCompleted = completed >= toComplete;

		const title = __( 'Publication Checklist', 'altis-publication-checklist' );

		return (
			<Fragment>
				<SidebarHeader
					baseClassName={ baseClassName }
					isCompleted={ isCompleted }
					shouldBlockPublish={ shouldBlockPublish }
					toComplete={ toComplete }
				/>
				{ showChecklist && (
					<Fragment>
						{ shouldRenderInPublishSidebar && (
							<PluginPrePublishPanel
								className={ classNames( panelClassName, {
									[ `${ panelClassName }--to-complete` ]: isToComplete,
									[ `${ panelClassName }--completed` ]: isCompleted,
								} ) }
								initialOpen
								title={ title }
							>
								<ChecklistPanelContent
									baseClassName={ baseClassName }
									completed={ completed }
									completableItems={ completableItems }
									otherItems={ otherItems }
									shouldBlockPublish={ shouldBlockPublish }
									toComplete={ toComplete }
								/>
							</PluginPrePublishPanel>
						) }
						<PluginSidebarMoreMenuItem target={ sidebarName }>
							{ title }
						</PluginSidebarMoreMenuItem>
						<PluginSidebar
							name={ sidebarName }
							title={ title }
						>
							<PanelBody>
								<ChecklistPanelContent
									baseClassName={ baseClassName }
									completed={ completed }
									completableItems={ completableItems }
									otherItems={ otherItems }
									shouldBlockPublish={ shouldBlockPublish }
									toComplete={ toComplete }
								/>
							</PanelBody>
						</PluginSidebar>
					</Fragment>
				) }
			</Fragment>
		);
	}
}

ChecklistPanel.propTypes = {
	isPublishSidebarEnabled: PropTypes.bool.isRequired,
	items: itemsMapPropType.isRequired,
	shouldBlockPublish: PropTypes.bool.isRequired,
	shouldRenderInPublishSidebar: PropTypes.bool.isRequired,
	onEnablePublishSidebar: PropTypes.func.isRequired,
};

export default compose(
	withSelect( ( select ) => {
		const { isPublishSidebarEnabled } = select( 'core/editor' );

		return {
			isPublishSidebarEnabled: isPublishSidebarEnabled(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { enablePublishSidebar } = dispatch( 'core/editor' );

		return {
			onEnablePublishSidebar: enablePublishSidebar,
		};
	} ),
)( ChecklistPanel );
