const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

// Playground logs in every request without cookies, so this cookie makes a
// request count as a logged-out visitor.
const LOGGED_OUT_HEADERS = {
	Cookie: 'playground_auto_login_already_happened=1',
};

/**
 * Call the REST API from the editor page as the logged-in admin.
 *
 * @param {import('@playwright/test').Page} page    - A wp-admin page with wp.apiFetch.
 * @param {Object}                          options - Options passed to wp.apiFetch.
 * @return {Promise<Object>} The decoded response.
 */
function apiFetch( page, options ) {
	return page.evaluate( ( opts ) => window.wp.apiFetch( opts ), options );
}

test.describe( 'prepublish_checks REST field context', () => {
	let postId;

	test.beforeEach( async ( { admin, page } ) => {
		// The page provides the REST nonce for wp.apiFetch.
		await admin.visitAdminPage( 'post-new.php' );
		await page.waitForFunction( () => !! window.wp?.apiFetch );

		// The title is long enough for the fixture's required checks to pass.
		const post = await apiFetch( page, {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: 'A published REST field post', status: 'publish' },
		} );
		postId = post.id;
	} );

	test.afterEach( async ( { page } ) => {
		await apiFetch( page, {
			path: `/wp/v2/posts/${ postId }?force=true`,
			method: 'DELETE',
		} );
	} );

	test( 'The edit context includes the field', async ( { page } ) => {
		const post = await apiFetch( page, {
			path: `/wp/v2/posts/${ postId }?context=edit`,
		} );

		expect( post.prepublish_checks ).toEqual(
			expect.objectContaining( {
				'php-live-check': expect.objectContaining( {
					status: 'complete',
				} ),
			} )
		);
	} );

	test( 'The view context leaves the field out', async ( { page } ) => {
		const post = await apiFetch( page, {
			path: `/wp/v2/posts/${ postId }`,
		} );

		expect( post.id ).toBe( postId );
		expect( post ).not.toHaveProperty( 'prepublish_checks' );
	} );

	test( 'A logged-out visitor does not get the field', async ( {
		playwright,
		baseURL,
	} ) => {
		const visitor = await playwright.request.newContext( {
			baseURL,
			extraHTTPHeaders: LOGGED_OUT_HEADERS,
		} );

		try {
			// Confirm the request really is logged out.
			const me = await visitor.get( '/wp-json/wp/v2/users/me' );
			expect( me.status() ).toBe( 401 );

			const response = await visitor.get(
				`/wp-json/wp/v2/posts/${ postId }`
			);
			expect( response.status() ).toBe( 200 );

			const post = await response.json();
			expect( post.id ).toBe( postId );
			expect( post ).not.toHaveProperty( 'prepublish_checks' );
		} finally {
			await visitor.dispose();
		}
	} );
} );
