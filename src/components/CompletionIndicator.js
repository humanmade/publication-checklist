import PropTypes from 'prop-types';
import { Line } from 'rc-progress';

import { _n, sprintf } from '@wordpress/i18n';

import 'rc-progress/assets/index.css';

const CompletionIndicator = ( { baseClassName, completed, toComplete } ) => {
	if ( toComplete <= 0 ) {
		return null;
	}

	/* translators: %s: number of completed tasks, %s: total number of to-complete tasks */
	const label = sprintf(
		_n( '%s of %s task completed.', '%s of %s tasks completed.', toComplete, 'altis-publication-checklist' ),
		completed,
		toComplete,
	);

	const color = completed >= toComplete ? '#3fcf8e' : '#f97a14';
	const percent = 100 / toComplete * completed;

	return (
		<div className={ `${ baseClassName }__completion-indicator` }>
			<em>{ label }</em>
			<Line percent={ percent } strokeColor={ color } strokeWidth="2" />
		</div>
	);
};

CompletionIndicator.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	completed: PropTypes.number.isRequired,
	toComplete: PropTypes.number.isRequired,
};

export default CompletionIndicator;
