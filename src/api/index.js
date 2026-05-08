import Status from './Status';

/**
 * Registry of prepublish checks, keyed by check ID.
 */
const registry = new Map();

/**
 * Register a prepublish check.
 *
 * @param {string} id - Unique identifier for this check.
 * @param {Object} options - Configuration options.
 * @param {Function} options.runCheck - Function to execute the check.
 * @param {string} [options.type='post'] - Type of content this check applies to.
 * @throws {TypeError} If id is not a non-empty string.
 * @throws {TypeError} If options.runCheck is not a function.
 */
export function registerPrepublishCheck(id, options) {
	if (typeof id !== 'string' || id.length === 0) {
		throw new TypeError('Check id must be a non-empty string');
	}

	if (typeof options.runCheck !== 'function') {
		throw new TypeError('options.runCheck must be a function');
	}

	registry.set(id, {
		type: options.type || 'post',
		runCheck: options.runCheck,
	});
}

/**
 * Get all registered checks.
 *
 * Internal accessor for the subscriber. Not part of the public API.
 *
 * @returns {Array<Object>} Array of registered checks with id, type, and runCheck.
 */
export function getRegistered() {
	return Array.from(registry.entries()).map(([id, { type, runCheck }]) => ({
		id,
		type,
		runCheck,
	}));
}

export { Status };
