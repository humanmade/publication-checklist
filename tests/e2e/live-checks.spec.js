const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Poll the altis/publication-checklist store until the given check id has
 * the expected status, or timeout is reached.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} checkId
 * @param {'complete'|'incomplete'} status
 * @param {number} [timeout]
 */
async function waitForCheckStatus( page, checkId, status, timeout = 6000 ) {
	await page.waitForFunction(
		( { checkId, status } ) => {
			const store = window.wp?.data?.select?.( 'altis/publication-checklist' );
			if ( ! store ) {
				return false;
			}
			const results = store.getLiveResults();
			return results?.[ checkId ]?.status === status;
		},
		{ checkId, status },
		{ timeout }
	);
}

/**
 * Fill the post title in the block editor canvas using pressSequentially, which
 * is more reliable than fill() for contenteditable elements across WP versions.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor
 * @param {string} title
 */
async function setTitle( editor, title ) {
	const titleField = editor.canvas.getByRole( 'textbox', {
		name: 'Add title',
	} );
	await titleField.click( { force: true } );
	await titleField.press( 'ControlOrMeta+a' );
	await titleField.pressSequentially( title );
}

test.describe( 'Live publication checks', () => {
	test.beforeEach( async ( { admin, editor, page } ) => {
		// Explicit browser login — storageState alone is not reliable with Playground.
		await page.goto( '/wp-login.php' );
		if ( page.url().includes( 'wp-login.php' ) ) {
			await page.locator( '#user_login' ).fill( 'admin' );
			await page.locator( '#user_pass' ).fill( 'password' );
			await page.locator( '#wp-submit' ).click();
			await page.waitForURL( /wp-admin/, { timeout: 30000 } );
		}

		await admin.createNewPost();
		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		// Wait for the altis store to be registered before asserting on it.
		await page.waitForFunction(
			() =>
				!! window.wp?.data?.select?.( 'altis/publication-checklist' ),
			{ timeout: 10000 }
		);
	} );

	test( 'JS check updates live without saving', async ( {
		editor,
		page,
	} ) => {
		// With a blank title the JS-only check must start incomplete.
		await waitForCheckStatus( page, 'js-only-check', 'incomplete' );

		// Fill a title that satisfies the check (must start with "Hello").
		await setTitle( editor, 'Hello world' );

		// Without saving, the JS result should flip to complete.
		await waitForCheckStatus( page, 'js-only-check', 'complete' );

		const status = await page.evaluate(
			() =>
				window.wp.data
					.select( 'altis/publication-checklist' )
					.getLiveResults()[ 'js-only-check' ]?.status
		);
		expect( status ).toBe( 'complete' );
	} );

	test( 'PHP-only live check updates via REST without saving', async ( {
		editor,
		page,
	} ) => {
		// Blank title is under 10 chars — check starts incomplete.
		await waitForCheckStatus( page, 'php-live-check', 'incomplete', 15000 );

		// Fill a title >= 10 characters.
		await setTitle( editor, 'A long enough title' );

		// PHP check must become complete via REST (no save required).
		await waitForCheckStatus( page, 'php-live-check', 'complete', 15000 );

		const result = await page.evaluate(
			() =>
				window.wp.data
					.select( 'altis/publication-checklist' )
					.getLiveResults()[ 'php-live-check' ]
		);
		expect( result.status ).toBe( 'complete' );
		expect( result.source ).toBe( 'php-live' );
	} );

	test( 'Publish is locked while any live check is incomplete, unlocks when all pass', async ( {
		editor,
		page,
	} ) => {
		// Any incomplete live check should engage the save lock.
		await waitForCheckStatus( page, 'js-only-check', 'incomplete' );

		const lockedInitially = await page.evaluate( () =>
			window.wp.data.select( 'core/editor' ).isPostSavingLocked()
		);
		expect( lockedInitially ).toBe( true );

		// "Hello dual-ok long title" satisfies all three conditions:
		//   • starts with "Hello" → js-only-check complete
		//   • contains "dual-ok"  → dual-check (JS) complete
		//   • length >= 10        → php-live-check complete
		await setTitle( editor, 'Hello dual-ok long title' );

		await waitForCheckStatus( page, 'js-only-check', 'complete' );
		await waitForCheckStatus( page, 'dual-check', 'complete' );
		await waitForCheckStatus( page, 'php-live-check', 'complete', 15000 );

		// All checks satisfied — lock must be released.
		await page.waitForFunction(
			() =>
				! window.wp.data.select( 'core/editor' ).isPostSavingLocked(),
			{ timeout: 5000 }
		);

		const lockedAfter = await page.evaluate( () =>
			window.wp.data.select( 'core/editor' ).isPostSavingLocked()
		);
		expect( lockedAfter ).toBe( false );
	} );

	test( 'JS result overrides PHP-live result for the same check ID', async ( {
		editor,
		page,
	} ) => {
		// Fill a title long enough for php-live-check but without "dual-ok".
		await setTitle( editor, 'A long enough title' );

		// PHP-live check should complete (title >= 10 chars).
		await waitForCheckStatus( page, 'php-live-check', 'complete', 15000 );

		// dual-check: PHP always returns COMPLETE, but JS (which requires "dual-ok")
		// has higher priority — result in the store must be INCOMPLETE.
		await waitForCheckStatus( page, 'dual-check', 'incomplete' );

		const dual = await page.evaluate(
			() =>
				window.wp.data
					.select( 'altis/publication-checklist' )
					.getLiveResults()[ 'dual-check' ]
		);
		expect( dual.status ).toBe( 'incomplete' );
		expect( dual.source ).toBe( 'js' );
	} );

	test( 'Static PHP check does not re-evaluate live', async ( {
		editor,
		page,
	} ) => {
		// static-check is not a live check — it must never appear in getLiveResults().
		const initialLive = await page.evaluate(
			() =>
				window.wp.data
					.select( 'altis/publication-checklist' )
					.getLiveResults()
		);
		expect( initialLive[ 'static-check' ] ).toBeUndefined();

		// Make an edit that triggers the subscriber.
		await setTitle( editor, 'Changed title value' );

		// Use js-only-check appearing as a synchronization signal:
		// once it's in the live results we know the subscriber has run and
		// the PHP-live REST call has returned, so any result for static-check
		// would already be present if it were ever going to appear.
		await waitForCheckStatus( page, 'js-only-check', 'incomplete' );

		const afterLive = await page.evaluate(
			() =>
				window.wp.data
					.select( 'altis/publication-checklist' )
					.getLiveResults()
		);
		expect( afterLive[ 'static-check' ] ).toBeUndefined();
	} );
} );
