const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

// The checklist also renders in a PluginSidebar, so scope to the pre-publish panel.
const PANEL = '.altis-publication-checklist__panel';

/**
 * Close the welcome guide and wait for the altis store to be registered.
 *
 * @param {Object}                          fixtures        - Test fixtures.
 * @param {Object}                          fixtures.editor - Editor utils.
 * @param {import('@playwright/test').Page} fixtures.page   - Editor page.
 */
async function prepareEditor( { editor, page } ) {
	await editor.setPreferences( 'core/edit-post', {
		welcomeGuide: false,
		fullscreenMode: false,
	} );
	await page.waitForFunction(
		() => !! window.wp?.data?.select?.( 'altis/publication-checklist' ),
		{ timeout: 10000 }
	);
}

test.describe( 'Optional-only checklist', () => {
	test( 'A post with no required items shows its optional items expanded', async ( {
		admin,
		baseURL,
		context,
		editor,
		page,
	} ) => {
		// The fixture then registers only checks that never return incomplete.
		await context.addCookies( [
			{
				name: 'publication_checklist_optional_only',
				value: '1',
				url: baseURL,
			},
		] );

		await admin.createNewPost();
		await prepareEditor( { editor, page } );

		// An empty post cannot be published, so the publish button needs a title.
		// The excerpt stays empty so static-check stays INFO.
		await page.evaluate( () =>
			window.wp.data
				.dispatch( 'core/editor' )
				.editPost( { title: 'Optional only post' } )
		);

		await page.locator( '.editor-post-publish-panel__toggle' ).click();

		const panel = page.locator( PANEL );

		await expect( panel ).toBeVisible();
		await expect( panel ).not.toHaveClass(
			/altis-publication-checklist__panel--completed/
		);
		// The required list is rendered empty, so look for the list holding items.
		await expect(
			panel.locator( '.altis-publication-checklist__items:has( li )' )
		).toBeVisible();
		await expect(
			panel.locator( '.altis-publication-checklist__toggle-completed' )
		).toHaveCount( 0 );
		await expect(
			panel.locator( '.altis-publication-checklist__required' )
		).toHaveCount( 0 );
	} );
} );
