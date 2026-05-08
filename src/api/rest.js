import apiFetch from '@wordpress/api-fetch';

/**
 * Run a batch of server-side live checks against the current edited-post snapshot.
 *
 * @param {string}   postType - The post type being edited.
 * @param {Object}   post     - Edited post attributes snapshot.
 * @param {Object}   meta     - Edited meta snapshot.
 * @param {Object}   terms    - Edited terms snapshot.
 * @param {string[]} ids      - Check ids to run (subset of registered live checks).
 * @return {Promise<Object>} Promise resolving to { [id]: { status, message, data } }.
 */
export function runServerChecks( postType, post, meta, terms, ids ) {
	return apiFetch( {
		path: '/altis/publication-checklist/v1/check',
		method: 'POST',
		data: { post_type: postType, post, meta, terms, ids },
	} );
}
