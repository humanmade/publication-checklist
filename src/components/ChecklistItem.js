import PropTypes from 'prop-types';

import { Component, Fragment } from '@wordpress/element';

class ChecklistItem extends Component {
	render() {
		const {
			message,
			name,
			renderStatusIcon,
			status,
		} = this.props;

		return (
			<Fragment>
				{ renderStatusIcon() }
				{ message }
			</Fragment>
		);
	}
}

ChecklistItem.propTypes = {
	data: PropTypes.any,
	name: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	renderStatusIcon: PropTypes.func.isRequired,
	status: PropTypes.string.isRequired,
};

export default ChecklistItem;
