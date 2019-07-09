import PropTypes from 'prop-types';

import { Button, Popover } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';

class ConfirmPublish extends Component {
	state = {
		showingConfirm: false,
	}

	onShowConfirm = () => {
		this.setState( { showingConfirm: true } );
	}

	/**
	 * @param {Event} e - Click event.
	 */
	onCancelConfirm = ( e ) => {
		e.stopPropagation();
		this.setState( { showingConfirm: false } );
	}

	render() {
		const {
			baseClassName,
			canBePublished,
			children,
			toComplete,
		} = this.props;

		const {
			showingConfirm,
		} = this.state;

		if ( canBePublished ) {
			return (
				<Fragment>
					{ children }
				</Fragment>
			);
		}

		const popoverClass = `${ baseClassName }__confirm`;

		/* translators: %s: total number of to-complete tasks */
		const label = sprintf(
			_n(
				'There is %s incomplete task in your Publication Checklist.',
				'There are %s incomplete tasks in your Publication Checklist.',
				toComplete,
				'hm-publication-checklist'
			),
			toComplete,
		);

		return (
			<Button
				className="editor-post-publish-button"
				isLarge={ true }
				isPrimary={ true }
				onClick={ this.onShowConfirm }
			>
				{ __( 'Publish' ) }

				{ showingConfirm && (
					<Popover
						className={ popoverClass }
						position="bottom left"
						onClose={ this.onCancelConfirm }
					>
						<div className={ `${ popoverClass }-content` }>
							<h2>{ __( 'Are you sure?', 'hm-publication-checklist' ) }</h2>
							<p>{ label }</p>

							{ children }

							<Button
								isTertiary={ true }
								onClick={ this.onCancelConfirm }
							>
								Cancel
							</Button>
						</div>
					</Popover>
				) }
			</Button>
		);
	}
}

ConfirmPublish.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	canBePublished: PropTypes.bool.isRequired,
	children: PropTypes.node,
	toComplete: PropTypes.number.isRequired,
};

export default ConfirmPublish;
