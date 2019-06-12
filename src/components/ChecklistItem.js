import PropTypes from 'prop-types';

import { Component } from '@wordpress/element';

import { COMPLETED, INCOMPLETE, INFO } from '../itemStatus';

class ChecklistItem extends Component {
	/**
	 * Mark the checklist item as completed.
	 */
	markCompleted = () => {
		const {
			name,
			setStatus,
		} = this.props;

		setStatus( name, COMPLETED );
	};

	/**
	 * Mark the checklist item as incomplete.
	 */
	markIncomplete = () => {
		const {
			name,
			setStatus,
		} = this.props;

		setStatus( name, INCOMPLETE );
	};

	/**
	 * Mark the checklist item as info.
	 */
	markInfo = () => {
		const {
			name,
			setStatus,
		} = this.props;

		setStatus( name, INFO );
	};

	/**
	 * Render the status icon for the given or current checklist item status.
	 *
	 * @param {string} [userStatus] - Optional custom checklist item status.
	 */
	renderStatusIcon = ( userStatus ) => {
		const {
			name,
			renderStatusIcon,
			status,
		} = this.props;

		return renderStatusIcon( name, userStatus || status );
	};

	/**
	 * Set the checklist item status to the given value.
	 *
	 * @param {string} status - Checklist item status to set.
	 */
	setStatus = ( status ) => {
		const {
			name,
			setStatus,
		} = this.props;

		setStatus( name, status );
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
	setStatus: PropTypes.func.isRequired,
	status: PropTypes.string.isRequired,
};

export default ChecklistItem;
