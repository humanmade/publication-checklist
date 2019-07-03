import classNames from 'classnames';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';

import { PanelBody } from '@wordpress/components';
import { PluginPrePublishPanel, PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editPost';
import { Component, Fragment } from '@wordpress/element';
import { doAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

import Checklist from './Checklist';
import CompletionIndicator from './CompletionIndicator';

import { COMPLETE, INCOMPLETE } from '../itemStatus';
import { itemsMapPropType } from '../propTypes';

const baseClassName = 'hm-publication-checklist';
const panelClassName = `${ baseClassName }__panel`;
const sidebarName = 'hm-publication-checklist';

export const ACTION_REGISTER_ITEMS = 'hm-publication-checklist.registerItems';

class ChecklistPanel extends Component {
	state = {
		completion: {
			completed: 0,
			toComplete: 0,
		},
		sortedItems: [],
	};

	componentDidMount() {
		const { registerItem } = this.props;

		// The following action allows third parties to register custom items for the publication checklist.
		doAction( ACTION_REGISTER_ITEMS, registerItem );
	}

	shouldComponentUpdate( nextProps ) {
		const { items } = this.props;

		// Only ever update if there are new items.
		return ! _isEqual( items, nextProps.items );
	}

	static getDerivedStateFromProps( props ) {
		const { items } = props;

		// TODO: Split into two functions.
		const { completion, sortedItems } = Object.values( items ).reduce( ( { completion, sortedItems }, item ) => {
			const [ completed, toComplete ] = completion;
			const [ incompleteItems, completedItems, otherItems ] = sortedItems;

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
			sortedItems: [ ...incompleteItems, ...completedItems, ...otherItems ],
		};
	}

	render() {
		const { sortedItems } = this.state;

		if ( _isEmpty( sortedItems ) ) {
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
					items={ sortedItems }
				/>
			</div>
		);

		return (
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
	registerItem: PropTypes.func.isRequired,
	setItemStatus: PropTypes.func.isRequired,
	setTimeout: PropTypes.func.isRequired,
	shouldRenderInPublishSidebar: PropTypes.bool.isRequired,
};

export default ChecklistPanel;
