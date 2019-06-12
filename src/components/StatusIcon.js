import PropTypes from 'prop-types';

import { COMPLETED, INCOMPLETE, INFO } from '../itemStatus';

/**
 * Map a given item status to the according unicode character.
 *
 * @param {string} status - Item status.
 *
 * @returns {string} Icon.
 */
export const mapStatusToIcon = ( status ) => {
	switch ( status ) {
		case COMPLETED:
			return '✔';

		case INCOMPLETE:
			return '✘';

		case INFO:
			return 'ℹ';

		default:
			return '';
	}
};

const StatusIcon = ( { className, status } ) => {
	const icon = mapStatusToIcon( status );
	if ( ! icon ) {
		return null;
	}

	return (
		<span className={ className }>{ icon }</span>
	);
};

StatusIcon.propTypes = {
	className: PropTypes.string.isRequired,
	status: PropTypes.string,
};

StatusIcon.defaultProps = {
	status: '',
};

export default StatusIcon;
