import PropTypes from 'prop-types';

import { Component, Fragment } from '@wordpress/element';

class ChecklistItemContent extends Component {
	render() {
		const {
			baseClassName,
			message,
			renderStatusIcon,
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

ChecklistItemContent.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	data: PropTypes.any,
	name: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	renderStatusIcon: PropTypes.func.isRequired,
	status: PropTypes.string.isRequired,
};

export default ChecklistItemContent;
