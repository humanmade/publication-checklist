import classNames from 'classnames';
import _isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import PropTypes from 'prop-types';

import { PanelBody } from '@wordpress/components';
import { PluginPrePublishPanel, PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editPost';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import ChecklistPanelContent from './ChecklistPanelContent';
import SidebarHeader from './SidebarHeader';

import { COMPLETE, INCOMPLETE } from '../itemStatus';
import { itemsMapPropType } from '../propTypes';

const baseClassName = 'hm-publication-checklist';
const panelClassName = `${ baseClassName }__panel`;
const sidebarName = 'hm-publication-checklist';

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

	render() {
		const { completableItems, otherItems } = this.state;

		const showChecklist = ! _isEmpty( completableItems ) || ! _isEmpty( otherItems );

		const { shouldRenderInPublishSidebar } = this.props;

		const { completion } = this.state;

		const {
			completed,
			toComplete,
		} = completion;
		const isToComplete = toComplete > 0;
		const isCompleted = completed >= toComplete;

		const title = __( 'Publication Checklist', 'hm-publication-checklist' );

		return (
			<Fragment>
				<SidebarHeader
					baseClassName={ baseClassName }
					isCompleted={ isCompleted }
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
	items: itemsMapPropType.isRequired,
	shouldRenderInPublishSidebar: PropTypes.bool.isRequired,
};

export default ChecklistPanel;
