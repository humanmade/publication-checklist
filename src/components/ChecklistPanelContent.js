import PropTypes from 'prop-types';

import { Button } from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import Checklist from './Checklist';
import CompletionIndicator from './CompletionIndicator';

import { itemsCollectionPropType } from '../propTypes';

const ChecklistPanelContent = ( {
	baseClassName,
	completableItems,
	completed,
	otherItems,
	shouldBlockPublish,
	toComplete,
} ) => {
	const [ isExpanded, setExpanded ] = useState( false );

	const isComplete = completed >= toComplete;
	const requiredLabel = __(
		'This post cannot be published until all required tasks are completed.',
		'altis-publication-checklist'
	);

	const checklists = (
		<Fragment>
			<Checklist
				baseClassName={ baseClassName }
				items={ completableItems }
			/>

			{ otherItems.length > 0 && (
				<Fragment>
					<h3
						className={ `${ baseClassName }__subtitle` }
					>
						{ __( 'Optional tasks:', 'altis-publication-checklist' ) }
					</h3>
					<Checklist
						baseClassName={ baseClassName }
						items={ otherItems }
					/>
				</Fragment>
			) }
		</Fragment>
	);

	return (
		<div className={ baseClassName }>
			{ ( shouldBlockPublish && ! isComplete ) && (
				<p
					className={ `${ baseClassName }__required` }
				>
					{ requiredLabel }
				</p>
			) }
			<CompletionIndicator
				baseClassName={ baseClassName }
				completed={ completed }
				toComplete={ toComplete }
			/>

			{ ( ! isComplete || ( isComplete && isExpanded ) ) && (
				checklists
			) }

			{ isComplete && (
				<Button
					className={ `${ baseClassName }__toggle-completed` }
					isLink={ true }
					type="button"
					onClick={ () => setExpanded( ! isExpanded ) }
					aria-expanded={ isExpanded }
				>
					{ isExpanded ? (
						__( 'Hide tasks', 'altis-publication-checklist' )
					) : (
						__( 'Show tasks', 'altis-publication-checklist' )
					) }
				</Button>
			) }
		</div>
	);
};

ChecklistPanelContent.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	completed: PropTypes.number,
	completableItems: itemsCollectionPropType.isRequired,
	otherItems: itemsCollectionPropType.isRequired,
	shouldBlockPublish: PropTypes.bool.isRequired,
	toComplete: PropTypes.number,
};

export default ChecklistPanelContent;
