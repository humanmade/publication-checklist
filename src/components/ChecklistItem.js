import PropTypes from 'prop-types';

import { withFilters } from '@wordpress/components';
import { Component } from '@wordpress/element';

import ChecklistItemContent from './ChecklistItemContent';
import StatusIcon from './StatusIcon';

class ChecklistItem extends Component {
	/**
	 * Render the status icon for the checklist item with the given name.
	 *
	 * @param {string} name - Item name.
	 * @param {string} status - Item status.
	 */
	renderStatusIcon = ( name, status ) => {
		const { baseClassName } = this.props;

		const className = `${ baseClassName }__status-icon`;

		return (
			<StatusIcon
				className={ `${ className } ${ className }--${ name } ${ className }--${ status }` }
				status={ status }
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
		// eslint-disable-next-line @wordpress/no-unused-vars-before-return
		const ItemElement = withFilters( 'hm-publishing-workflow.item.' + name )( ChecklistItemContent );
		const renderStatusIcon = () => this.renderStatusIcon( name, status );

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
					renderStatusIcon={ renderStatusIcon }
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
