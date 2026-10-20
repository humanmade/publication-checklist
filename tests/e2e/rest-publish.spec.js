const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Send a REST request from the editor page, so it carries a nonce, and return
 * the status and JSON body even for non-2xx responses.
 *
 * @param {import('@playwright/test').Page} page    - Page with wp.apiFetch.
 * @param {Object}                          options - Options for wp.apiFetch.
 * @return {Promise<{status: number, body: Object}>} Response status and body.
 */
async function apiRequest( page, options ) {
	return page.evaluate( async ( opts ) => {
		// With parse: false, apiFetch rejects with the Response on non-2xx.
		const res = await window.wp
			.apiFetch( { ...opts, parse: false } )
			.catch( ( response ) => response );
		return { status: res.status, body: await res.json() };
	}, options );
}

test.describe( 'Publishing through the REST API', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/wp-admin/post-new.php' );
		await page.waitForFunction( () => !! window.wp?.apiFetch );
	} );

	test( 'creating a published post is rejected while a check fails', async ( {
		page,
	} ) => {
		const { status, body } = await apiRequest( page, {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: 'short', status: 'publish' },
		} );

		expect( status ).toBe( 400 );
		expect( body.code ).toBe( 'altis_publication_checklist_incomplete' );
		expect( body.data.checks[ 'php-live-check' ].status ).toBe(
			'incomplete'
		);
	} );

	test( 'publishing an existing post is rejected and saves nothing', async ( {
		page,
	} ) => {
		const draft = await apiRequest( page, {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: 'short', excerpt: 'before' },
		} );
		expect( draft.status ).toBe( 201 );

		const { status, body } = await apiRequest( page, {
			path: `/wp/v2/posts/${ draft.body.id }`,
			method: 'POST',
			data: { status: 'publish', excerpt: 'after' },
		} );
		expect( status ).toBe( 400 );
		expect( body.code ).toBe( 'altis_publication_checklist_incomplete' );

		const saved = await apiRequest( page, {
			path: `/wp/v2/posts/${ draft.body.id }?context=edit`,
		} );
		expect( saved.body.status ).toBe( 'draft' );
		expect( saved.body.excerpt.raw ).toBe( 'before' );
	} );

	test( 'publishing succeeds once the checks pass', async ( { page } ) => {
		const { status, body } = await apiRequest( page, {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: 'A long enough title', status: 'publish' },
		} );

		expect( status ).toBe( 201 );
		expect( body.status ).toBe( 'publish' );
	} );
} );
