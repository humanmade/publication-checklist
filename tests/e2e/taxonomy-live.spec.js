const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Read the status of a check from the merged results in the altis store.
 *
 * @param {import('@playwright/test').Page} page    - Editor page.
 * @param {string}                          checkId - Check id to read.
 * @return {Promise<string|undefined>} The check status, if it has a result.
 */
function getStatus( page, checkId ) {
	return page.evaluate( ( id ) => {
		const store = window.wp.data.select( 'altis/publication-checklist' );
		return store.getMergedResults( {} )?.[ id ]?.status;
	}, checkId );
}

test.describe( 'Live checks on core taxonomies', () => {
	test( 'A category edit reaches a check watching terms.category', async ( {
		admin,
		baseURL,
		context,
		editor,
		page,
	} ) => {
		await context.addCookies( [
			{
				name: 'publication_checklist_category',
				value: '1',
				url: baseURL,
			},
		] );

		await admin.createNewPost();
		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		await page.waitForFunction(
			() => !! window.wp?.data?.select?.( 'altis/publication-checklist' ),
			{ timeout: 10000 }
		);

		// The post starts with only the default category.
		await expect
			.poll( () => getStatus( page, 'category-check' ) )
			.toBe( 'incomplete' );

		const categoryId = await page.evaluate( async () => {
			const found = await window.wp.apiFetch( {
				path: '/wp/v2/categories?slug=pc-test-category',
			} );
			return found[ 0 ].id;
		} );

		// Edit the category in the store, without saving the post.
		await page.evaluate(
			( id ) =>
				window.wp.data
					.dispatch( 'core/editor' )
					.editPost( { categories: [ id ] } ),
			categoryId
		);

		await expect
			.poll( () => getStatus( page, 'category-check' ), {
				timeout: 6000,
			} )
			.toBe( 'complete' );
	} );
} );
