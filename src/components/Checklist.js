import PropTypes from 'prop-types';

import { withFilters } from '@wordpress/components';
import { Component } from '@wordpress/element';

import ChecklistItem from './ChecklistItem';
import StatusIcon from './StatusIcon';

import { itemsCollectionPropType } from '../propTypes';

class Checklist extends Component {
	/**
	 * Render the status icon for the checklist item with the given name.
	 *
	 * @param {string} name - Item name.
	 * @param {string} status - Item status.
	 */
	renderStatusIcon = ( name, status ) => {
		const { baseClassName } = this.props;

		const className = `${ baseClassName }__status-icon`;

		return (
			<StatusIcon
				className={ `${ className } ${ className }--${ name } ${ className }--${ status }` }
				status={ status }
			/>
		);
	};

	renderItem = ( item ) => {
		const { data, name, message, status } = item;

		const itemClassName = `${ this.props.baseClassName }__item`;
		// eslint-disable-next-line @wordpress/no-unused-vars-before-return
		const ItemElement = withFilters( 'hm-publishing-workflow.item.' + name )( ChecklistItem );
		const renderStatusIcon = () => this.renderStatusIcon( name, status );

		const classes = [
			itemClassName,
			`${ itemClassName }--${ name }`,
			`${ itemClassName }--status-${ status }`,
		];

		return (
			<li key={ name } className={ classes.join( ' ' ) }>
				<ItemElement
					baseClassName={ this.props.baseClassName }
					data={ data }
					name={ name }
					message={ message }
					renderStatusIcon={ renderStatusIcon }
					status={ status }
				/>
			</li>
		);
	}

	render() {
		const {
			baseClassName,
			items,
		} = this.props;

		return (
			<ul className={ `${ baseClassName }__items` }>
				{ items.map( this.renderItem ) }
			</ul>
		);
	}
}

Checklist.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	items: itemsCollectionPropType.isRequired,
};

export default Checklist;
