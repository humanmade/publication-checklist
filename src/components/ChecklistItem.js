import PropTypes from 'prop-types';

import { Component, Fragment } from '@wordpress/element';

class ChecklistItem extends Component {
	render() {
		const {
			baseClassName,
			message,
			name,
			renderStatusIcon,
			status,
		} = this.props;

		return (
			<Fragment>
				{ renderStatusIcon() }
				<span className={ `${ baseClassName }__item-message` }>
					{ message }
				</span>
			</Fragment>
		);
	}
}

ChecklistItem.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	data: PropTypes.any,
	name: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	renderStatusIcon: PropTypes.func.isRequired,
	status: PropTypes.string.isRequired,
};

export default ChecklistItem;
