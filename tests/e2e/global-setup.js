/**
 * Global Playwright setup: log in to WordPress once and save the auth
 * session to .auth/admin.json so all tests share it via storageState.
 *
 * Runs after the webServer (WordPress Playground) is ready, before any test.
 */

const { chromium } = require( '@playwright/test' );
const { mkdirSync } = require( 'fs' );

module.exports = async ( config ) => {
	const baseURL =
		process.env.WP_BASE_URL ||
		config.use?.baseURL ||
		'http://127.0.0.1:9400';

	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto( `${ baseURL }/wp-login.php` );
	await page.locator( '#user_login' ).fill( 'admin' );
	await page.locator( '#user_pass' ).fill( 'password' );
	await page.locator( '#wp-submit' ).click();

	// Wait for successful redirect to wp-admin
	await page.waitForURL( /wp-admin/, { timeout: 30000 } );

	// Persist the auth cookies for test contexts
	mkdirSync( 'tests/e2e/.auth', { recursive: true } );
	await page.context().storageState( {
		path: 'tests/e2e/.auth/admin.json',
	} );

	await browser.close();
};
