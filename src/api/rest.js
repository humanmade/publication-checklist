import apiFetch from '@wordpress/api-fetch';

/**
 * Run a batch of server-side live checks against the current edited-post snapshot.
 *
 * @param {string}   postType - The post type being edited.
 * @param {number}   id       - The current post ID (0 for new/unsaved posts).
 * @param {Object}   post     - Edited post attributes snapshot.
 * @param {Object}   meta     - Edited meta snapshot.
 * @param {Object}   terms    - Edited terms snapshot.
 * @param {string[]} ids      - Check ids to run (subset of registered live checks).
 * @return {Promise<Object>} Promise resolving to { [id]: { status, message, data } }.
 */
export function runServerChecks( postType, id, post, meta, terms, ids ) {
	return apiFetch( {
		path: '/altis/publication-checklist/v1/check',
		method: 'POST',
		data: { post_type: postType, id, post, meta, terms, ids },
	} );
}

/**
 * Fetch the saved check results for all checks of a post.
 *
 * @param {string} restNamespace - REST namespace of the post type, e.g. 'wp/v2'.
 * @param {string} restBase      - REST base of the post type, e.g. 'posts'.
 * @param {number} id            - The post ID.
 * @return {Promise<Object>} Promise resolving to { prepublish_checks: { [id]: { status, message, data } } }.
 */
export function fetchSavedChecks( restNamespace, restBase, id ) {
	return apiFetch( {
		path: `/${ restNamespace }/${ restBase }/${ id }?context=edit&_fields=prepublish_checks`,
	} );
}
