import classNames from 'classnames';
import _isEmpty from 'lodash/isEmpty';
import _reduce from 'lodash/reduce';
import PropTypes from 'prop-types';

import { PanelBody } from '@wordpress/components';
import { PluginPrePublishPanel, PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editPost';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import Checklist from './Checklist';
import CompletionIndicator from './CompletionIndicator';
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

		const { completion, sortedItems } = _reduce( items, ( { completion, sortedItems }, status, name ) => {
			const [ completed, toComplete ] = completion;
			const [ incompleteItems, completedItems, otherItems ] = sortedItems;

			const item = {
				name,
				...status,
			};

			switch ( item.status ) {
				case COMPLETE:
					return {
						completion: [
							completed + 1,
							toComplete + 1,
						],
						sortedItems: [
							incompleteItems,
							[ ...completedItems, item ],
							otherItems,
						],
					};

				case INCOMPLETE:
					return {
						completion: [
							completed,
							toComplete + 1,
						],
						sortedItems: [
							[ ...incompleteItems, item ],
							completedItems,
							otherItems,
						],
					};

				default:
					return {
						completion: [
							completed,
							toComplete,
						],
						sortedItems: [
							incompleteItems,
							completedItems,
							[ ...otherItems, item ],
						],
					};
			}
		}, {
			completion: [ 0, 0 ],
			sortedItems: [ [], [], [] ],
		} );

		const [ completed, toComplete ] = completion;
		const [ incompleteItems, completedItems, otherItems ] = sortedItems;

		return {
			completion: {
				completed,
				toComplete,
			},
			completableItems: [ ...incompleteItems, ...completedItems ],
			otherItems,
		};
	}

	render() {
		const { completableItems, otherItems } = this.state;

		if ( _isEmpty( completableItems ) && _isEmpty( otherItems ) ) {
			return null;
		}

		const { shouldRenderInPublishSidebar } = this.props;

		const { completion } = this.state;

		const {
			completed,
			toComplete,
		} = completion;
		const isToComplete = toComplete > 0;
		const isCompleted = isToComplete && completed >= toComplete;

		const title = __( 'Publication Checklist', 'hm-publication-checklist' );

		const content = (
			<div className={ baseClassName }>
				<CompletionIndicator
					baseClassName={ baseClassName }
					completed={ completed }
					toComplete={ toComplete }
				/>
				<Checklist
					baseClassName={ baseClassName }
					items={ completableItems }
				/>

				<h3
					className={ `${ baseClassName }__subtitle` }
				>
					{ __( 'Optional tasks:', 'hm-publication-checklist' ) }
				</h3>
				<Checklist
					baseClassName={ baseClassName }
					items={ otherItems }
				/>
			</div>
		);

		return (
			<Fragment>
				<SidebarHeader
					baseClassName={ baseClassName }
					isCompleted={ isCompleted }
					toComplete={ toComplete }
				/>
				{ shouldRenderInPublishSidebar && (
					<PluginPrePublishPanel
						className={ classNames( panelClassName, {
							[ `${ panelClassName }--to-complete` ]: isToComplete,
							[ `${ panelClassName }--completed` ]: isCompleted,
						} ) }
						initialOpen
						title={ title }
					>
						{ content }
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
						{ content }
					</PanelBody>
				</PluginSidebar>
			</Fragment>
		);
	}
}

ChecklistPanel.propTypes = {
	items: itemsMapPropType.isRequired,
	shouldRenderInPublishSidebar: PropTypes.bool.isRequired,
};

export default ChecklistPanel;
