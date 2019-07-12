import PropTypes from 'prop-types';

import { withFilters } from '@wordpress/components';
import { Component } from '@wordpress/element';

import ChecklistItemContent from './ChecklistItemContent';
import StatusIcon from './StatusIcon';

class ChecklistItem extends Component {
	/**
	 * Render the status icon for the checklist item.
	 */
	renderStatusIcon = () => {
		return (
			<StatusIcon
				baseClassName={ this.props.baseClassName }
				name={ this.props.name }
				status={ this.props.status }
			/>
		);
	};

	render() {
		const {
			data,
			name,
			message,
			status,
		} = this.props;

		const itemClassName = `${ this.props.baseClassName }__item`;

		// Ignore lint bug: https://github.com/WordPress/gutenberg/issues/16418
		// eslint-disable-next-line @wordpress/no-unused-vars-before-return
		const ItemElement = withFilters( 'altis-publishing-workflow.item.' + name )( ChecklistItemContent );

		const classes = [
			itemClassName,
			`${ itemClassName }--${ name }`,
			`${ itemClassName }--status-${ status }`,
		];

		return (
			<li className={ classes.join( ' ' ) }>
				<ItemElement
					baseClassName={ this.props.baseClassName }
					data={ data }
					name={ name }
					message={ message }
					renderStatusIcon={ this.renderStatusIcon }
					status={ status }
				/>
			</li>
		);
	}
}

ChecklistItem.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	data: PropTypes.any,
	name: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	status: PropTypes.string.isRequired,
};

export default ChecklistItem;
