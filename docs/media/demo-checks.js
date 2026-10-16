( function () {
	const api = window.publicationChecklist;
	if ( ! api ) {
		return;
	}

	const collectImages = ( blocks ) =>
		blocks.flatMap( ( block ) => [
			...( block.name === 'core/image' ? [ block ] : [] ),
			...collectImages( block.innerBlocks || [] ),
		] );

	// The PHP check of the same ID still enforces at save time. This one reads
	// the category straight from the editor so the panel updates as you pick.
	api.registerPrepublishCheck( 'category', {
		type: 'post',
		runCheck: ( { select } ) => {
			const ids = select( 'core/editor' ).getEditedPostAttribute( 'categories' ) || [];
			const chosen = ids.filter( ( id ) => id !== window.demoChecks.defaultCategory );
			return chosen.length > 0
				? new api.Status( api.Status.COMPLETE, 'Category chosen' )
				: new api.Status( api.Status.INCOMPLETE, 'Choose a category other than Uncategorized' );
		},
	} );

	api.registerPrepublishCheck( 'image-alt-text', {
		type: 'post',
		runCheck: ( { select } ) => {
			const images = collectImages( select( 'core/block-editor' ).getBlocks() );
			const missing = images.filter( ( image ) => ! image.attributes.alt );
			return missing.length === 0
				? new api.Status( api.Status.COMPLETE, 'Every image has alt text' )
				: new api.Status( api.Status.INCOMPLETE, 'Every image has alt text' );
		},
	} );
} )();
