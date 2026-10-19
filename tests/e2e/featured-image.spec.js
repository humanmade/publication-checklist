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

	test( 'The classic editor blocks a post that has no featured image', async ( {
		baseURL,
		context,
		page,
	} ) => {
		await context.addCookies( [
			{
				name: 'publication_checklist_featured_image',
				value: '1',
				url: baseURL,
			},
		] );

		await page.goto( '/wp-admin/post-new.php' );
		await page.waitForFunction( () => !! window.wp?.apiFetch );

		const draft = await api( page, {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: TITLE, status: 'draft' },
		} );

		// The fixture then shows the classic editor, whose form sends
		// _thumbnail_id=-1 for a post without an image.
		await context.addCookies( [
			{
				name: 'publication_checklist_classic_editor',
				value: '1',
				url: baseURL,
			},
		] );

		await page.goto( `/wp-admin/post.php?post=${ draft.id }&action=edit` );
		await expect( page.locator( '#_thumbnail_id' ) ).toHaveValue( '-1' );
		await page.locator( '#publish' ).click();
		await page.waitForURL( /post\.php.*message=/ );

		await page.goto( '/wp-admin/edit.php?post_status=draft' );
		await expect( page.locator( `#post-${ draft.id }` ) ).toBeVisible();
	} );
} );

test.describe( 'Request values in checks', () => {
	const fields = {
		sticky: true,
		format: 'aside',
		template: 'pc-test-template.php',
	};

	test.beforeEach( async ( { baseURL, context, page } ) => {
		// The fixture then registers a required check that reads the sticky,
		// post_format and template keys.
		await context.addCookies( [
			{
				name: 'publication_checklist_post_fields',
				value: '1',
				url: baseURL,
			},
		] );

		await page.goto( '/wp-admin/post-new.php' );
		await page.waitForFunction( () => !! window.wp?.apiFetch );
	} );

	test( 'A publish request supplies the sticky, format and template values', async ( {
		page,
	} ) => {
		const draft = await api( page, {
			path: '/wp/v2/posts',
			method: 'POST',
			data: { title: TITLE, status: 'draft' },
		} );

		const published = await api( page, {
			path: `/wp/v2/posts/${ draft.id }`,
			method: 'POST',
			data: { status: 'publish', ...fields },
		} );
		expect( published.status ).toBe( 'publish' );
	} );

	for ( const [ key, value ] of [
		[ 'sticky', false ],
		[ 'format', 'standard' ],
		[ 'template', '' ],
	] ) {
		test( `A publish request that unsets ${ key } is blocked`, async ( {
			page,
		} ) => {
			const draft = await api( page, {
				path: '/wp/v2/posts',
				method: 'POST',
				data: { title: TITLE, status: 'draft', ...fields },
			} );

			const blocked = await api( page, {
				path: `/wp/v2/posts/${ draft.id }`,
				method: 'POST',
				data: { status: 'publish', [ key ]: value },
			} );
			expect( blocked.status ).toBe( 'draft' );
		} );
	}
} );
