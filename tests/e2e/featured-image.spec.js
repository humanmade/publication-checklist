const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const TITLE = 'A post title that is long enough';

/**
 * Run an apiFetch request in the page, so it carries the REST nonce.
 *
 * @param {import('@playwright/test').Page} page    - Admin page with wp.apiFetch loaded.
 * @param {Object}                          options - apiFetch options.
 * @return {Promise<Object>} The decoded response.
 */
const api = ( page, options ) =>
	page.evaluate( ( opts ) => window.wp.apiFetch( opts ), options );

test.describe( 'Featured image checks', () => {
	test( 'Server-side checks see the featured image', async ( {
		baseURL,
		context,
		page,
	} ) => {
		// The fixture then registers a required check that reads featured_media.
		await context.addCookies( [
			{
				name: 'publication_checklist_featured_image',
				value: '1',
				url: baseURL,
			},
		] );

		await page.goto( '/wp-admin/post-new.php' );
		await page.waitForFunction( () => !! window.wp?.apiFetch );

		const media = await page.evaluate( async () => {
			const canvas = document.createElement( 'canvas' );
			canvas.width = 8;
			canvas.height = 8;
			const blob = await new Promise( ( resolve ) =>
				canvas.toBlob( resolve, 'image/png' )
			);
			const body = new FormData();
			body.append( 'file', blob, 'featured-image-check.png' );
			return window.wp.apiFetch( {
				path: '/wp/v2/media',
				method: 'POST',
				body,
			} );
		} );

		const withImage = await api( page, {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: TITLE, status: 'draft', featured_media: media.id },
		} );
		const withoutImage = await api( page, {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: TITLE, status: 'draft' },
		} );

		// The post already has its image, so a request that only sets the status passes.
		const published = await api( page, {
			path: `/wp/v2/posts/${ withImage.id }`,
			method: 'POST',
			data: { status: 'publish' },
		} );
		expect( published.status ).toBe( 'publish' );

		// A post without an image is still blocked.
		const blocked = await api( page, {
			path: `/wp/v2/posts/${ withoutImage.id }`,
			method: 'POST',
			data: { status: 'publish' },
		} );
		expect( blocked.status ).toBe( 'draft' );

		await page.goto( '/wp-admin/edit.php?post_status=all' );

		const cell = ( id ) =>
			page.locator(
				`#post-${ id } td.column-altis_publication_checklist_status`
			);

		await expect( cell( withImage.id ) ).toContainText( 'All done!' );
		await expect( cell( withoutImage.id ) ).toContainText( '1 left' );
	} );
} );
