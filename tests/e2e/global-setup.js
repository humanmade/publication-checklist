const { request } = require( '@playwright/test' );

// Playground auto-logs in every cookie-less request, and concurrent auto-logins
// overwrite each other's session tokens. One request here gets one valid session.
module.exports = async ( config ) => {
	const { baseURL, storageState } = config.projects[ 0 ].use;
	const context = await request.newContext( { baseURL } );
	await context.get( '/wp-login.php' );
	await context.storageState( { path: storageState } );
	await context.dispose();
};
