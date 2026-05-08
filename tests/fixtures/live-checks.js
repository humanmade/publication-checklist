/* global window */
( function () {
	var api = window.altis && window.altis.publicationChecklist;
	if ( ! api ) {
		return;
	}

	// JS-only check: COMPLETE when the title starts with "Hello".
	api.registerPrepublishCheck( 'js-only-check', {
		type: 'post',
		runCheck: function ( { post } ) {
			var title = post.title || '';
			return title.startsWith( 'Hello' )
				? new api.Status( api.Status.COMPLETE, 'Title starts with Hello' )
				: new api.Status( api.Status.INCOMPLETE, 'Title must start with "Hello"' );
		},
	} );

	// JS override for the dual-check pair.
	// The PHP side (mu-plugin-live-checks.php) always returns COMPLETE.
	// This JS side requires the title to contain "dual-ok", and JS wins.
	api.registerPrepublishCheck( 'dual-check', {
		type: 'post',
		runCheck: function ( { post } ) {
			var title = post.title || '';
			return title.includes( 'dual-ok' )
				? new api.Status( api.Status.COMPLETE, 'JS check passed' )
				: new api.Status( api.Status.INCOMPLETE, 'Title must contain "dual-ok"' );
		},
	} );
} )();
