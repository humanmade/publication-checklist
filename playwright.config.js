const { defineConfig, devices } = require( '@playwright/test' );
const crypto = require( 'crypto' );

/**
 * Deterministic port from cwd hash so each git worktree gets its own
 * Playground instance. Override with WP_PLAYGROUND_PORT (e.g., in CI).
 * Range: 9400–9499.
 */
function resolvePort() {
	if ( process.env.WP_PLAYGROUND_PORT ) {
		return Number( process.env.WP_PLAYGROUND_PORT );
	}
	const hash = crypto
		.createHash( 'sha1' )
		.update( process.cwd() )
		.digest();
	return 9400 + ( hash.readUInt16BE( 0 ) % 100 );
}

const port = resolvePort();
const baseURL = process.env.WP_BASE_URL || `http://127.0.0.1:${ port }`;

/** @see https://playwright.dev/docs/test-configuration */
module.exports = defineConfig( {
	testDir: './tests/e2e',
	timeout: 60000,
	fullyParallel: false,
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: [
		[ 'list' ],
		[ 'html', { open: process.env.CI ? 'never' : 'on-failure' } ],
		[ 'json', { outputFile: 'test-results/results.json' } ],
	],
	use: {
		baseURL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 15000,
		navigationTimeout: 30000,
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
	],
	/* Auto-start WordPress Playground locally; in CI it's started separately */
	webServer: process.env.CI
		? undefined
		: {
				command: `npm run playground:start -- --port=${ port }`,
				url: baseURL,
				reuseExistingServer: true,
				timeout: 60000,
		  },
} );
