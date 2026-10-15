const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

// Satisfies every required fixture check:
//   • starts with "Hello" → js-only-check complete
//   • contains "dual-ok"  → dual-check (JS) complete
//   • length >= 10        → php-live-check complete
const COMPLETE_TITLE = 'Hello dual-ok long title';

// The checklist also renders in a PluginSidebar, so scope to the pre-publish panel.
const PANEL = '.altis-publication-checklist__panel';
const TOGGLE = `${ PANEL } .altis-publication-checklist__toggle-completed`;
const LIST = `${ PANEL } .altis-publication-checklist__items`;

/**
 * Set the post title through the editor store.
 *
 * @param {import('@playwright/test').Page} page  - Editor page.
 * @param {string}                          title - New post title.
 */
async function setTitle( page, title ) {
	await page.evaluate(
		( t ) =>
			window.wp.data.dispatch( 'core/editor' ).editPost( { title: t } ),
		title
	);
}

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

/**
 * Complete every required check, then open the pre-publish panel.
 *
 * @param {import('@playwright/test').Page} page - Editor page.
 */
async function completeChecksAndOpenPanel( page ) {
	await setTitle( page, COMPLETE_TITLE );

	// Wait until the store holds results and none of them is incomplete.
	await page.waitForFunction(
		() => {
			const results = window.wp.data
				.select( 'altis/publication-checklist' )
				.getLiveResults();
			const live = Object.values( results );
			return (
				[ 'js-only-check', 'dual-check', 'php-live-check' ].every(
					( id ) => results[ id ]?.status === 'complete'
				) &&
				! live.some( ( result ) => result?.status === 'incomplete' )
			);
		},
		null,
		{ timeout: 15000 }
	);

	await page.locator( '.editor-post-publish-panel__toggle' ).click();
}

test.describe( 'Completed task list', () => {
	test.beforeEach( async ( { admin, editor, page } ) => {
		await admin.createNewPost();
		await prepareEditor( { editor, page } );
	} );

	test( 'Completed tasks start hidden and the toggle shows and hides them', async ( {
		page,
	} ) => {
		await completeChecksAndOpenPanel( page );

		const toggle = page.locator( TOGGLE );
		const list = page.locator( LIST );

		await expect( toggle ).toHaveText( 'Show tasks' );
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( list ).toHaveCount( 0 );

		await toggle.click();
		await expect( toggle ).toHaveText( 'Hide tasks' );
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
		await expect( list.first() ).toBeVisible();

		await toggle.click();
		await expect( toggle ).toHaveText( 'Show tasks' );
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( list ).toHaveCount( 0 );
	} );

	test( 'The show_tasks_expanded filter starts the tasks expanded', async ( {
		admin,
		baseURL,
		context,
		editor,
		page,
	} ) => {
		await context.addCookies( [
			{
				name: 'publication_checklist_tasks_expanded',
				value: '1',
				url: baseURL,
			},
		] );

		// Load the editor again so the page request carries the cookie.
		await admin.createNewPost();
		await prepareEditor( { editor, page } );
		await completeChecksAndOpenPanel( page );

		const toggle = page.locator( TOGGLE );

		await expect( toggle ).toHaveText( 'Hide tasks' );
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
		await expect( page.locator( LIST ).first() ).toBeVisible();
	} );
} );
