import classNames from 'classnames';
import PropTypes from 'prop-types';

import { COMPLETE, INCOMPLETE, INFO } from '../itemStatus';

/**
 * Map a given item status to the according unicode character.
 *
 * @param {string} status - Item status.
 *
 * @returns {string} Icon.
 */
export const mapStatusToIcon = ( status ) => {
	switch ( status ) {
		case COMPLETE:
			return '✔';

		case INCOMPLETE:
			return '·';

		case INFO:
			return 'ℹ';

		default:
			return '';
	}
};

const StatusIcon = ( { baseClassName, name, status } ) => {
	const icon = mapStatusToIcon( status );
	if ( ! icon ) {
		return null;
	}

	const iconClass = `${ baseClassName }__status-icon`;
	const className = classNames( [
		iconClass,
		`${ iconClass }--${ name }`,
		`${ iconClass }--${ status }`,
	] );

	return (
		<span className={ className }>{ icon }</span>
	);
};

StatusIcon.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	status: PropTypes.string.isRequired,
};

StatusIcon.defaultProps = {
	status: '',
};

export default StatusIcon;
