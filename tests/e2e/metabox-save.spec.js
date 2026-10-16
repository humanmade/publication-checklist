const { test } = require( '@wordpress/e2e-test-utils-playwright' );

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
 * Save the post, then wait for the classic metaboxes to finish saving.
 *
 * The editor posts the metaboxes after the post save returns, so wait for that
 * request and for both saving flags to clear.
 *
 * @param {import('@playwright/test').Page} page - Editor page.
 */
async function savePost( page ) {
	const metaBoxRequest = page.waitForResponse(
		( response ) =>
			response.url().includes( 'meta-box-loader=1' ) &&
			response.request().method() === 'POST'
	);
	await page.evaluate( () =>
		window.wp.data.dispatch( 'core/editor' ).savePost()
	);
	await metaBoxRequest;
	await page.waitForFunction(
		() => {
			const { select } = window.wp.data;
			return (
				! select( 'core/editor' ).isSavingPost() &&
				! select( 'core/edit-post' ).isSavingMetaBoxes()
			);
		},
		null,
		{ timeout: 15000 }
	);
}

/**
 * Wait until the checklist, as the editor renders it, gives each check the
 * expected status.
 *
 * @param {import('@playwright/test').Page} page     - Editor page.
 * @param {'complete'|'incomplete'}         status   - Expected status.
 * @param {string[]}                        checkIds - Check ids to watch.
 */
async function expectStatus( page, status, checkIds ) {
	await page.waitForFunction(
		( { status: expected, checkIds: ids } ) => {
			const { select } = window.wp.data;
			const restResults =
				select( 'core/editor' ).getCurrentPost()?.prepublish_checks;
			const results = select(
				'altis/publication-checklist'
			).getMergedResults( restResults );
			return ids.every( ( id ) => results[ id ]?.status === expected );
		},
		{ status, checkIds },
		{ timeout: 15000 }
	);
}

test.describe( 'Classic metabox saves', () => {
	test( 'Checks update after a metabox saves without a reload', async ( {
		admin,
		baseURL,
		context,
		editor,
		page,
	} ) => {
		const ids = [ 'metabox-static', 'metabox-live' ];

		await context.addCookies( [
			{
				name: 'publication_checklist_metabox',
				value: '1',
				url: baseURL,
			},
		] );

		await admin.createNewPost();
		await prepareEditor( { editor, page } );

		await page.evaluate( () =>
			window.wp.data
				.dispatch( 'core/editor' )
				.editPost( { title: 'Metabox save post' } )
		);
		await expectStatus( page, 'incomplete', ids );

		// The metabox value is written after the post save has returned.
		await page.locator( '#pc_metabox_note' ).fill( 'A note' );
		await savePost( page );
		await expectStatus( page, 'complete', ids );

		// The live check must read the saved value, not the editor's stale copy.
		await page.evaluate( () =>
			window.wp.data
				.dispatch( 'core/editor' )
				.editPost( { title: 'Metabox save post edited' } )
		);
		await page.waitForTimeout( 1500 );
		await expectStatus( page, 'complete', ids );

		await page.locator( '#pc_metabox_note' ).fill( '' );
		await savePost( page );
		await expectStatus( page, 'incomplete', ids );
	} );
} );
