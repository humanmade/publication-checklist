import PropTypes from 'prop-types';

import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import Checklist from './Checklist';
import CompletionIndicator from './CompletionIndicator';

import { itemsCollectionPropType } from '../propTypes';

const ChecklistPanelContent = ( {
	baseClassName,
	completableItems,
	completed,
	otherItems,
	toComplete,
} ) => {
	return (
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

			{ otherItems.length > 0 && (
				<Fragment>
					<h3
						className={ `${ baseClassName }__subtitle` }
					>
						{ __( 'Optional tasks:', 'hm-publication-checklist' ) }
					</h3>
					<Checklist
						baseClassName={ baseClassName }
						items={ otherItems }
					/>
				</Fragment>
			) }
		</div>
	);
};

ChecklistPanelContent.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	completed: PropTypes.number,
	completableItems: itemsCollectionPropType.isRequired,
	otherItems: itemsCollectionPropType.isRequired,
	toComplete: PropTypes.number,
};

export default ChecklistPanelContent;
