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
