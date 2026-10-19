const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Poll the altis/publication-checklist store until the given check id has
 * the expected status, or timeout is reached.
 *
 * @param {import('@playwright/test').Page} page      - Editor page.
 * @param {string}                          checkId   - Check id to watch.
 * @param {'complete'|'incomplete'}         status    - Expected status.
 * @param {number}                          [timeout] - Milliseconds to wait.
 */
async function waitForCheckStatus( page, checkId, status, timeout = 6000 ) {
	await page.waitForFunction(
		( { checkId, status } ) => {
			const store = window.wp?.data?.select?.(
				'altis/publication-checklist'
			);
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
 * Set the post title through the editor store. Simulated keystrokes into the
 * title field drop characters on some machines; the subscriber only reacts to
 * store changes, so this exercises the same path.
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
 * Count the POSTs the page sends to the server-side check endpoint.
 *
 * @param {import('@playwright/test').Page} page - Editor page.
 * @return {{count: number}} Counter; assign `count = 0` to reset it.
 */
function trackCheckRequests( page ) {
	const requests = { count: 0 };
	page.on( 'request', ( request ) => {
		if (
			request.method() === 'POST' &&
			decodeURIComponent( request.url() ).includes(
				'publication-checklist/v1/check'
			)
		) {
			requests.count++;
		}
	} );
	return requests;
}

/**
 * Assert that the fields-less `no-fields-check` is idle, re-runs once when
 * `edit` changes the snapshot, and is idle again afterwards.
 *
 * @param {import('@playwright/test').Page} page - Editor page.
 * @param {() => Promise<void>}             edit - Changes the edited post.
 */
async function expectOneRerunAfter( page, edit ) {
	const requests = trackCheckRequests( page );

	await waitForCheckStatus( page, 'no-fields-check', 'info', 15000 );

	requests.count = 0;
	await page.waitForTimeout( 2000 );
	expect( requests.count ).toBe( 0 );

	await edit();
	await page.waitForTimeout( 2000 );
	expect( requests.count ).toBeGreaterThanOrEqual( 1 );
	expect( requests.count ).toBeLessThanOrEqual( 2 );

	requests.count = 0;
	await page.waitForTimeout( 2000 );
	expect( requests.count ).toBe( 0 );
}

test.describe( 'Live publication checks', () => {
	test.beforeEach( async ( { admin, editor, page } ) => {
		await admin.createNewPost();
		await editor.setPreferences( 'core/edit-post', {
			welcomeGuide: false,
			fullscreenMode: false,
		} );
		// Wait for the altis store to be registered before asserting on it.
		await page.waitForFunction(
			() => !! window.wp?.data?.select?.( 'altis/publication-checklist' ),
			{ timeout: 10000 }
		);
	} );

	test( 'JS check updates live without saving', async ( { page } ) => {
		// With a blank title the JS-only check must start incomplete.
		await waitForCheckStatus( page, 'js-only-check', 'incomplete' );

		// Fill a title that satisfies the check (must start with "Hello").
		await setTitle( page, 'Hello world' );

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

	test( 'PHP-live result survives an edit to a field it does not watch', async ( {
		page,
	} ) => {
		await waitForCheckStatus( page, 'php-live-check', 'incomplete', 15000 );

		// The excerpt is not in the check's fields, so this tick skips the REST call.
		await page.evaluate( () =>
			window.wp.data
				.dispatch( 'core/editor' )
				.editPost( { excerpt: 'Unrelated edit' } )
		);
		await page.waitForTimeout( 1000 );

		const result = await page.evaluate(
			() =>
				window.wp.data
					.select( 'altis/publication-checklist' )
					.getLiveResults()[ 'php-live-check' ]
		);
		expect( result?.status ).toBe( 'incomplete' );
	} );

	test( 'PHP-only live check updates via REST without saving', async ( {
		page,
	} ) => {
		// Blank title is under 10 chars — check starts incomplete.
		await waitForCheckStatus( page, 'php-live-check', 'incomplete', 15000 );

		// Fill a title >= 10 characters.
		await setTitle( page, 'A long enough title' );

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

	test( 'Saving stays unlocked until the publish panel opens, and unlocks when all checks pass', async ( {
		page,
	} ) => {
		const isLocked = () =>
			page.evaluate( () =>
				window.wp.data.select( 'core/editor' ).isPostSavingLocked()
			);

		// Save draft stays disabled on an empty post, so give it a title that
		// still fails the checks.
		await setTitle( page, 'Draft' );
		await waitForCheckStatus( page, 'js-only-check', 'incomplete' );

		// With the panel closed, an incomplete check must not block saving.
		expect( await isLocked() ).toBe( false );
		await expect(
			page.getByRole( 'button', { name: 'Save draft', exact: true } )
		).toBeEnabled();

		await page.evaluate( () =>
			window.wp.data.dispatch( 'core/editor' ).savePost()
		);
		await page.waitForFunction(
			() => {
				const editor = window.wp.data.select( 'core/editor' );
				return (
					! editor.isSavingPost() &&
					editor.didPostSaveRequestSucceed()
				);
			},
			null,
			{ timeout: 15000 }
		);

		// Opening the publish panel locks saving, which disables its Publish button.
		await page.locator( '.editor-post-publish-panel__toggle' ).click();
		await page.waitForFunction(
			() => window.wp.data.select( 'core/editor' ).isPostSavingLocked(),
			null,
			{ timeout: 5000 }
		);
		const publishButton = page.locator( '.editor-post-publish-button' );
		await expect( publishButton ).toHaveAttribute(
			'aria-disabled',
			'true'
		);

		// "Hello dual-ok long title" satisfies all three conditions:
		//   • starts with "Hello" → js-only-check complete
		//   • contains "dual-ok"  → dual-check (JS) complete
		//   • length >= 10        → php-live-check complete
		await setTitle( page, 'Hello dual-ok long title' );

		await waitForCheckStatus( page, 'js-only-check', 'complete' );
		await waitForCheckStatus( page, 'dual-check', 'complete' );
		await waitForCheckStatus( page, 'php-live-check', 'complete', 15000 );

		// All checks satisfied — lock must be released.
		await page.waitForFunction(
			() => ! window.wp.data.select( 'core/editor' ).isPostSavingLocked(),
			null,
			{ timeout: 5000 }
		);
		expect( await isLocked() ).toBe( false );
		await expect( publishButton ).toBeEnabled();
	} );

	test( 'Saving stays unlocked while the checklist sidebar is open', async ( {
		page,
	} ) => {
		await setTitle( page, 'Draft' );
		await waitForCheckStatus( page, 'js-only-check', 'incomplete' );

		await page
			.getByRole( 'button', { name: 'Publication Checklist' } )
			.click();
		await expect(
			page.locator( '.altis-publication-checklist__required' )
		).toBeVisible();

		expect(
			await page.evaluate( () =>
				window.wp.data.select( 'core/editor' ).isPostSavingLocked()
			)
		).toBe( false );
		await expect(
			page.getByRole( 'button', { name: 'Save draft', exact: true } )
		).toBeEnabled();
	} );

	test( 'JS result overrides PHP-live result for the same check ID', async ( {
		page,
	} ) => {
		// Fill a title long enough for php-live-check but without "dual-ok".
		await setTitle( page, 'A long enough title' );

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

	test( 'PHP-live run_check receives WP_Post-shaped data (author → post_author)', async ( {
		page,
	} ) => {
		// The 'author-set' fixture check reads $post['post_author']. The JS
		// snapshot sends 'author' (REST key); the server normalises it to
		// 'post_author' before calling run_check. If normalisation is working,
		// the current user's ID is non-empty and the check resolves to 'info'.
		await waitForCheckStatus( page, 'author-set', 'info', 15000 );

		const result = await page.evaluate(
			() =>
				window.wp.data
					.select( 'altis/publication-checklist' )
					.getLiveResults()[ 'author-set' ]
		);
		expect( result.status ).toBe( 'info' );
		expect( result.source ).toBe( 'php-live' );
		// Message includes the author ID, confirming post_author is non-zero.
		expect( result.message ).toMatch( /Author assigned: \d+/ );
	} );

	test( 'PHP-live check without fields does not poll the server while idle', async ( {
		page,
	} ) => {
		const requests = trackCheckRequests( page );

		await waitForCheckStatus( page, 'no-fields-check', 'info', 15000 );

		// The check's own result dispatch is a store change; it must not
		// trigger another request.
		requests.count = 0;
		await page.waitForTimeout( 3000 );
		expect( requests.count ).toBe( 0 );

		// A real edit still re-runs the check.
		await setTitle( page, 'Some new title' );
		await page.waitForTimeout( 2000 );
		expect( requests.count ).toBeGreaterThanOrEqual( 1 );
		expect( requests.count ).toBeLessThanOrEqual( 2 );
	} );

	test( 'PHP-live check without fields re-runs once when a meta value changes', async ( {
		page,
	} ) => {
		await expectOneRerunAfter( page, () =>
			page.evaluate( () =>
				window.wp.data
					.dispatch( 'core/editor' )
					.editPost( { meta: { pc_test_meta: 'x' } } )
			)
		);
	} );

	test( 'PHP-live check without fields re-runs once when a term assignment changes', async ( {
		page,
	} ) => {
		const [ term ] = await page.evaluate( () =>
			window.wp.apiFetch( { path: '/wp/v2/pc_test_tax' } )
		);

		await expectOneRerunAfter( page, () =>
			page.evaluate(
				( termId ) =>
					window.wp.data
						.dispatch( 'core/editor' )
						.editPost( { pc_test_tax: [ termId ] } ),
				term.id
			)
		);
	} );

	test( 'Static PHP check does not re-evaluate live', async ( { page } ) => {
		// static-check is not a live check — it must never appear in getLiveResults().
		const initialLive = await page.evaluate( () =>
			window.wp.data
				.select( 'altis/publication-checklist' )
				.getLiveResults()
		);
		expect( initialLive[ 'static-check' ] ).toBeUndefined();

		// Make an edit that triggers the subscriber.
		await setTitle( page, 'Changed title value' );

		// Use js-only-check appearing as a synchronization signal:
		// once it's in the live results we know the subscriber has run and
		// the PHP-live REST call has returned, so any result for static-check
		// would already be present if it were ever going to appear.
		await waitForCheckStatus( page, 'js-only-check', 'incomplete' );

		const afterLive = await page.evaluate( () =>
			window.wp.data
				.select( 'altis/publication-checklist' )
				.getLiveResults()
		);
		expect( afterLive[ 'static-check' ] ).toBeUndefined();
	} );
} );
