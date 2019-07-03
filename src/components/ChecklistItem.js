import PropTypes from 'prop-types';

import { Component, Fragment } from '@wordpress/element';

class ChecklistItem extends Component {
	/**
	 * Render the status icon for the given or current checklist item status.
	 */
	renderStatusIcon = () => {
		const {
			name,
			renderStatusIcon,
			status,
		} = this.props;

		return renderStatusIcon( name, status );
	};

	render() {
		const {
			render,
			status,
		} = this.props;

		return render( {
			markCompleted: this.markCompleted,
			markIncomplete: this.markIncomplete,
			markInfo: this.markInfo,
			renderStatusIcon: this.renderStatusIcon,
			setStatus: this.setStatus,
			status,
		} );
	}
}

ChecklistItem.propTypes = {
	name: PropTypes.string.isRequired,
	render: PropTypes.func.isRequired,
	renderStatusIcon: PropTypes.func.isRequired,
	status: PropTypes.string.isRequired,
};

export default ChecklistItem;
