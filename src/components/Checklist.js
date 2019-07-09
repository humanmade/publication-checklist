import PropTypes from 'prop-types';

import { Component } from '@wordpress/element';

import ChecklistItem from './ChecklistItem';

import { itemsCollectionPropType } from '../propTypes';

class Checklist extends Component {
	render() {
		const {
			baseClassName,
			items,
		} = this.props;

		return (
			<ul className={ `${ baseClassName }__items` }>
				{ items.map( ( item ) => (
					<ChecklistItem
						key={ item.name }
						baseClassName={ baseClassName }
						{ ...item }
					/>
				) ) }
			</ul>
		);
	}
}

Checklist.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	items: itemsCollectionPropType.isRequired,
};

export default Checklist;
