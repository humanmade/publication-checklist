import PropTypes from 'prop-types';

import ChecklistItem from './ChecklistItem';

import { itemsCollectionPropType } from '../propTypes';

const Checklist = ( { baseClassName, items } ) => {
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
};

Checklist.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	items: itemsCollectionPropType.isRequired,
};

export default Checklist;
