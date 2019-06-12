import PropTypes from 'prop-types';

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

	render() {
		const { renderStatusIcon } = this;

		const {
			baseClassName,
			items,
			setStatus,
		} = this.props;

		const itemClassName = `${ baseClassName }__item`;

		return (
			<ul className={ `${ baseClassName }__items` }>
				{ items.map( ( { name, render, status } ) => (
					<li key={ name } className={ `${ itemClassName } ${ itemClassName }--${ name }` }>
						<ChecklistItem
							name={ name }
							render={ render }
							renderStatusIcon={ renderStatusIcon }
							setStatus={ setStatus }
							status={ status }
						/>
					</li>
				) ) }
			</ul>
		);
	}
}

Checklist.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	items: itemsCollectionPropType.isRequired,
	setStatus: PropTypes.func.isRequired,
};

export default Checklist;
