/**
 * Status indicator.
 *
 * Represents a single check in the checklist: complete (allow publish),
 * incomplete (block publish), or info (failed, but don't block publish).
 */
export default class Status {
	static COMPLETE = 'complete';
	static INCOMPLETE = 'incomplete';
	static INFO = 'info';

	/**
	 * Create a new Status.
	 *
	 * @param {string} status  - One of the status constants (complete, incomplete, info).
	 * @param {string} message - Human-readable message explaining the status.
	 * @param {*}      data    - Additional data about the check. Defaults to null.
	 */
	constructor( status, message, data = null ) {
		const valid = [ Status.COMPLETE, Status.INCOMPLETE, Status.INFO ];
		if ( ! valid.includes( status ) ) {
			throw new TypeError(
				`Invalid status "${ status }". Must be one of: ${ valid.join(
					', '
				) }`
			);
		}

		this.status = status;
		this.message = message;
		this.data = data;
	}

	/**
	 * Get the status type.
	 *
	 * @return {string} One of the status constants (complete, incomplete, info).
	 */
	getStatus() {
		return this.status;
	}

	/**
	 * Get the status message.
	 *
	 * @return {string} Human-readable message explaining the status.
	 */
	getMessage() {
		return this.message;
	}

	/**
	 * Get additional data about the status.
	 *
	 * @return {*} Additional data about the check status.
	 */
	getData() {
		return this.data;
	}
}
