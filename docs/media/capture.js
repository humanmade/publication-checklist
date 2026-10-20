// Captures the README media. Usage: BASE=http://127.0.0.1:9536 OUT=<dir> VIDEO=<dir> node capture.js
const path = require( 'path' );
const { chromium } = require( process.env.PW || path.join( __dirname, '../../node_modules/playwright' ) );

const BASE = process.env.BASE || 'http://127.0.0.1:9536';
const OUT = process.env.OUT || path.join( __dirname, '../images' );
const VIDEO = process.env.VIDEO || path.join( __dirname, 'video' );

const dismissNoise = async ( page ) => {
	await page.evaluate( () => {
		wp.data.dispatch( 'core/preferences' )?.set( 'core/edit-post', 'welcomeGuide', false );
	} );
	for ( let i = 0; i < 3; i++ ) {
		if ( ! ( await page.locator( '.components-modal__screen-overlay' ).count() ) ) {
			break;
		}
		await page.keyboard.press( 'Escape' );
		await page.waitForTimeout( 300 );
	}
};

const openEditor = async ( page ) => {
	await page.goto( BASE + '/wp-admin/post-new.php' );
	await page.waitForFunction( () => window.wp?.data?.select( 'core/editor' )?.getCurrentPostId() );
	await dismissNoise( page );
};

const openPanel = async ( page ) => {
	await page.locator( '.editor-post-publish-panel__toggle' ).click();
	await page.locator( '.altis-publication-checklist__panel' ).waitFor();
	await page.waitForTimeout( 1500 );
};

const openSidebar = async ( page ) => {
	const btn = page.locator( '.interface-pinned-items button[aria-label="Publication Checklist"]' );
	if ( ( await btn.getAttribute( 'aria-pressed' ) ) !== 'true' ) {
		await btn.click();
	}
	await page.locator( '.interface-complementary-area .altis-publication-checklist__required, .interface-complementary-area .altis-publication-checklist__toggle-completed' ).first().waitFor();
	await page.waitForTimeout( 800 );
};

// Screenshot the sidebar from its header to the end of the checklist.
const shootSidebar = async ( page, file ) => {
	const area = await page.locator( '.interface-complementary-area' ).boundingBox();
	const last = await page.locator( '.interface-complementary-area .altis-publication-checklist__items' ).last().boundingBox();
	await page.mouse.move( 5, 5 );
	const pad = 16;
	await page.screenshot( {
		path: path.join( OUT, file ),
		clip: { x: area.x - pad, y: area.y, width: area.width + pad * 2, height: last.y + last.height - area.y + pad },
	} );
};

// Screenshot the publish panel's checklist section with a little padding.
const shootPanel = async ( page, file ) => {
	const box = await page.locator( '.altis-publication-checklist__panel' ).boundingBox();
	await page.mouse.move( 5, 5 );
	await page.screenshot( {
		path: path.join( OUT, file ),
		clip: { x: box.x, y: box.y, width: box.width, height: box.height + 16 },
	} );
};

const api = ( page, args ) => page.evaluate( ( a ) => wp.apiFetch( a ), args );

// Upload a generated image and create the posts shown in the list screenshot.
const seed = async ( page ) => {
	await page.goto( BASE + '/wp-admin/post-new.php' );
	await page.waitForFunction( () => window.wp?.apiFetch );
	const media = await page.evaluate( async () => {
		const canvas = document.createElement( 'canvas' );
		canvas.width = 1200;
		canvas.height = 800;
		const ctx = canvas.getContext( '2d' );
		const g = ctx.createLinearGradient( 0, 0, 1200, 800 );
		g.addColorStop( 0, '#3858e9' );
		g.addColorStop( 1, '#f2b134' );
		ctx.fillStyle = g;
		ctx.fillRect( 0, 0, 1200, 800 );
		ctx.fillStyle = 'rgba(255,255,255,0.85)';
		ctx.beginPath();
		ctx.arc( 840, 280, 110, 0, 7 );
		ctx.fill();
		ctx.fillStyle = 'rgba(0,0,0,0.25)';
		ctx.beginPath();
		ctx.moveTo( 0, 800 );
		ctx.lineTo( 420, 380 );
		ctx.lineTo( 760, 800 );
		ctx.fill();
		const blob = await new Promise( ( r ) => canvas.toBlob( r, 'image/png' ) );
		const body = new FormData();
		body.append( 'file', blob, 'demo-featured.png' );
		body.append( 'alt_text', 'Abstract landscape' );
		return wp.apiFetch( { path: '/wp/v2/media', method: 'POST', body } );
	} );
	const cat = async ( name ) => {
		const found = await api( page, { path: '/wp/v2/categories?search=' + name } );
		const hit = found.find( ( c ) => c.name === name );
		return hit
			? hit.id
			: ( await api( page, { path: '/wp/v2/categories', method: 'POST', data: { name } } ) ).id;
	};
	const guides = await cat( 'Guides' );
	const news = await cat( 'News' );
	const posts = await api( page, { path: '/wp/v2/posts?per_page=50&status=any' } );
	for ( const p of posts ) {
		await api( page, { path: `/wp/v2/posts/${ p.id }?force=true`, method: 'DELETE' } );
	}
	const make = ( data ) => api( page, { path: '/wp/v2/posts', method: 'POST', data } );
	const launch = await make( { title: 'Our spring product launch: what to expect', status: 'draft', featured_media: media.id, categories: [ news ], excerpt: 'Everything shipping this season.' } );
	await api( page, { path: `/wp/v2/posts/${ launch.id }`, method: 'POST', data: { status: 'publish' } } );
	await make( { title: 'How we plan the editorial calendar', status: 'draft', featured_media: media.id, categories: [ guides ] } );
	await make( { title: 'Interview with the head gardener', status: 'pending', excerpt: 'A morning among the roses.' } );
	await make( { title: 'Untitled idea', status: 'draft' } );
	return { mediaId: media.id, guides, news };
};

( async () => {
	const browser = await chromium.launch();
	const ctx = await browser.newContext( { viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 } );
	const page = await ctx.newPage();
	const ids = await seed( page );

	// Posts list.
	await page.goto( BASE + '/wp-admin/edit.php' );
	await page.waitForSelector( '.wp-list-table' );
	await page.evaluate( () => document.querySelectorAll( '.notice, #wpfooter, .tablenav, .wp-list-table tfoot' ).forEach( ( n ) => n.remove() ) );
	const t = await page.locator( '.wp-list-table' ).boundingBox();
	await page.screenshot( { path: path.join( OUT, 'tasks-column.png' ), clip: { x: t.x - 8, y: t.y, width: t.width + 16, height: t.height + 8 } } );

	// Incomplete state.
	await openEditor( page );
	await page.evaluate( () => wp.data.dispatch( 'core/editor' ).editPost( { title: 'Spring launch' } ) );
	await page.waitForTimeout( 1500 );
	await openSidebar( page );
	await shootSidebar( page, 'checklist-incomplete.png' );

	// Complete state.
	await page.evaluate( ( i ) => wp.data.dispatch( 'core/editor' ).editPost( {
		title: 'Our spring product launch: what to expect',
		featured_media: i.mediaId,
		categories: [ i.news ],
		excerpt: 'Everything shipping this season.',
	} ), ids );
	await page.waitForTimeout( 2500 );
	await openPanel( page );
	await shootPanel( page, 'checklist-complete.png' );
	await ctx.close();

	// Screen recording.
	const vctx = await browser.newContext( {
		viewport: { width: 1280, height: 800 },
		recordVideo: { dir: VIDEO, size: { width: 1280, height: 800 } },
	} );
	const vp = await vctx.newPage();
	await openEditor( vp );
	await openSidebar( vp );
	await vp.waitForTimeout( 1500 );
	await vp.frameLocator( 'iframe[name="editor-canvas"]' ).locator( '.editor-post-title__input' ).click();
	await vp.keyboard.type( 'Spring launch', { delay: 130 } );
	await vp.waitForTimeout( 1500 );
	await vp.keyboard.type( ': what to expect this season', { delay: 130 } );
	await vp.waitForTimeout( 1800 );
	await vp.evaluate( ( i ) => wp.data.dispatch( 'core/editor' ).editPost( { categories: [ i.news ] } ), ids );
	await vp.waitForTimeout( 2000 );
	await vp.evaluate( ( i ) => wp.data.dispatch( 'core/editor' ).editPost( { featured_media: i.mediaId } ), ids );
	await vp.waitForTimeout( 2500 );
	await openPanel( vp );
	await vp.waitForTimeout( 3000 );
	await vctx.close();
	await browser.close();
} )();
