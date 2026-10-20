import { select, subscribe, dispatch } from '@wordpress/data';
import isEqual from 'lodash/isEqual';
import { getRegistered } from '../api';
import { fetchSavedChecks, runServerChecks } from '../api/rest';
import { STORE_NAME } from './index';

// Cache PHP check metadata once — it is set at page load and never changes.
const phpChecks = window.altisPublicationChecklist?.checks ?? [];

// Build a snapshot of the currently-edited post attributes.
function buildSnapshot() {
	const editorSelect = select( 'core/editor' );
	const postType = editorSelect.getCurrentPostType();
	const id = editorSelect.getCurrentPostId();

	// Read every standard REST API attribute. Attributes not supported by this
	// post type return undefined; those are filtered out before sending so the
	// wire payload stays small and the server never receives spurious nulls.
	const rawPost = {
		title: editorSelect.getEditedPostAttribute( 'title' ),
		content: editorSelect.getEditedPostAttribute( 'content' ),
		excerpt: editorSelect.getEditedPostAttribute( 'excerpt' ),
		status: editorSelect.getEditedPostAttribute( 'status' ),
		featured_media: editorSelect.getEditedPostAttribute( 'featured_media' ),
		author: editorSelect.getEditedPostAttribute( 'author' ),
		slug: editorSelect.getEditedPostAttribute( 'slug' ),
		date: editorSelect.getEditedPostAttribute( 'date' ),
		date_gmt: editorSelect.getEditedPostAttribute( 'date_gmt' ),
		parent: editorSelect.getEditedPostAttribute( 'parent' ),
		format: editorSelect.getEditedPostAttribute( 'format' ),
		sticky: editorSelect.getEditedPostAttribute( 'sticky' ),
		template: editorSelect.getEditedPostAttribute( 'template' ),
		password: editorSelect.getEditedPostAttribute( 'password' ),
		comment_status: editorSelect.getEditedPostAttribute( 'comment_status' ),
		ping_status: editorSelect.getEditedPostAttribute( 'ping_status' ),
	};
	const post = Object.fromEntries(
		Object.entries( rawPost ).filter( ( [ , v ] ) => v !== undefined )
	);
	const meta = editorSelect.getEditedPostAttribute( 'meta' ) ?? {};

	// Only meta that differs from the saved record goes to the server. The
	// edits object can hold every meta key, including stale copies of values a
	// classic metabox saved, which would override the saved values server-side.
	const savedMeta = editorSelect.getCurrentPost()?.meta ?? {};
	const metaEdits = id
		? Object.fromEntries(
				Object.entries( editorSelect.getPostEdits().meta ?? {} ).filter(
					( [ key, value ] ) => ! isEqual( value, savedMeta[ key ] )
				)
			)
		: meta;

	// Build terms from per-taxonomy attributes. Core editor exposes taxonomy
	// assignments under their taxonomy slug (e.g. 'categories', 'tags'), not
	// as a single 'terms' attribute.
	const allTaxonomies = window.altisPublicationChecklist?.taxonomies ?? {};
	const taxonomies = allTaxonomies[ postType ] ?? [];
	const terms = {};
	for ( const tax of taxonomies ) {
		const value = editorSelect.getEditedPostAttribute( tax );
		if ( value !== undefined ) {
			terms[ tax ] = value;
		}
	}

	return { id, postType, post, meta, metaEdits, terms };
}

// Debounce helper (no lodash needed — simple closure)
function debounce( fn, ms ) {
	let timer;
	return ( ...args ) => {
		clearTimeout( timer );
		timer = setTimeout( () => fn( ...args ), ms );
	};
}

// Check if a check's type (string|array) matches the current post type
function matchesType( type, postType ) {
	return Array.isArray( type )
		? type.includes( postType )
		: type === postType;
}

// The fields a PHP-live check watches. A check without a declared list watches
// every field in the snapshot.
function getWatchedFields( check, post, meta, terms ) {
	return (
		check.fields ?? [
			...Object.keys( post ),
			...Object.keys( meta ).map( ( key ) => 'meta.' + key ),
			...Object.keys( terms ).map( ( key ) => 'terms.' + key ),
		]
	);
}

// Shallow-compare the fields a PHP-live check watches against previously-seen values.
// Returns true if any watched field has changed since last check. For a check
// without declared fields, also returns true when a field has appeared or
// disappeared since the previous snapshot.
function hasFieldsChanged( check, post, meta, terms, prevFieldValues ) {
	const prev = prevFieldValues[ check.id ] ?? {};
	const fields = getWatchedFields( check, post, meta, terms );
	if ( ! check.fields && Object.keys( prev ).length !== fields.length ) {
		return true;
	}
	for ( const field of fields ) {
		const current = getFieldValue( field, post, meta, terms );
		if ( current !== prev[ field ] ) {
			return true;
		}
	}
	return false;
}

function getFieldValue( field, post, meta, terms ) {
	if ( field.startsWith( 'meta.' ) ) {
		return meta[ field.slice( 5 ) ];
	}
	if ( field.startsWith( 'terms.' ) ) {
		return terms[ field.slice( 6 ) ];
	}
	return post[ field ];
}

function updatePrevFieldValues(
	phpLiveChecks,
	post,
	meta,
	terms,
	prevFieldValues
) {
	for ( const check of phpLiveChecks ) {
		const snapshot = {};
		for ( const field of getWatchedFields( check, post, meta, terms ) ) {
			snapshot[ field ] = getFieldValue( field, post, meta, terms );
		}
		prevFieldValues[ check.id ] = snapshot;
	}
}

/**
 * Start the debounced subscriber loop that runs live checks on every post edit.
 *
 * JS checks run inline; PHP-live checks are batched into a single REST POST.
 * Called once from the plugin entry point.
 */
export function startSubscriber() {
	// Track previous snapshot values for each PHP-live check's declared fields,
	// so we only re-fetch when something the check actually cares about has changed.
	const prevFieldValues = {};

	// Generation counter — incremented each debounce tick. If a tick resolves
	// after a newer tick has already dispatched, its results are discarded.
	let generation = 0;

	// Last PHP-live result per check id. Ticks that skip the round-trip reuse
	// these, because setLiveResults replaces the whole live map.
	const lastPhpResults = {};

	const phpLiveChecks = phpChecks.filter( ( c ) => c.source === 'php-live' );

	const runChecks = debounce( async () => {
		const thisGeneration = ++generation;

		// 1. Get live-registered JS checks.
		const jsChecks = getRegistered(); // { id, type, runCheck }

		// 2. Build a full snapshot.
		const { id, postType, post, meta, metaEdits, terms } = buildSnapshot();

		// 3. Run JS checks inline.
		// liveResults is a fresh local object per tick; it is never a reference
		// to store state, so mutations here are safe before dispatch.
		const liveResults = {};
		for ( const { id, type, runCheck } of jsChecks ) {
			if ( ! matchesType( type, postType ) ) {
				continue;
			}
			try {
				const result = runCheck( { post, meta, terms, select } );
				if ( result && typeof result.then === 'function' ) {
					// eslint-disable-next-line no-console
					console.warn(
						// eslint-disable-next-line max-len
						`Publication checklist: check "${ id }" returned a Promise — only synchronous runCheck is supported.`
					);
					continue;
				}
				if ( result ) {
					liveResults[ id ] = {
						status: result.getStatus
							? result.getStatus()
							: result.status,
						message: result.getMessage
							? result.getMessage()
							: result.message,
						data: result.getData
							? result.getData()
							: ( result.data ?? null ),
						source: 'js',
					};
				}
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.warn(
					`Publication checklist: JS check "${ id }" threw an error:`,
					e
				);
			}
		}

		// 4. Determine which PHP-live checks need a server round-trip.
		const pendingPhpIds = [];
		for ( const check of phpLiveChecks ) {
			if ( ! matchesType( check.type, postType ) ) {
				continue;
			}
			if (
				hasFieldsChanged( check, post, meta, terms, prevFieldValues )
			) {
				pendingPhpIds.push( check.id );
			}
		}

		// 5. Fetch PHP-live results (one batched request).
		if ( pendingPhpIds.length > 0 ) {
			try {
				const phpResults = await runServerChecks(
					postType,
					id,
					post,
					metaEdits,
					terms,
					pendingPhpIds
				);
				// Discard if a newer tick has already resolved.
				if ( thisGeneration !== generation ) {
					return;
				}
				Object.entries( phpResults ).forEach( ( [ id, result ] ) => {
					lastPhpResults[ id ] = { ...result, source: 'php-live' };
				} );
				updatePrevFieldValues(
					phpLiveChecks,
					post,
					meta,
					terms,
					prevFieldValues
				);
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.warn(
					'Publication checklist: server check request failed:',
					e
				);
			}
		}

		// JS results have higher priority — skip ids already set by a JS check.
		Object.entries( lastPhpResults ).forEach( ( [ id, result ] ) => {
			if ( liveResults[ id ]?.source !== 'js' ) {
				liveResults[ id ] = result;
			}
		} );

		// 6. Update store — skip if a newer tick already dispatched.
		if ( thisGeneration !== generation ) {
			return;
		}
		dispatch( STORE_NAME ).setLiveResults( liveResults );
	}, 250 );

	// Counter for saved-results requests, so a slow response can't overwrite a newer one.
	let savedRequest = 0;

	// Re-run the checks after classic metaboxes have saved. The editor saves
	// the post first, then posts the metaboxes, so results from the post save
	// miss anything the metaboxes write.
	function refreshAfterMetaBoxSave() {
		for ( const key in prevFieldValues ) {
			delete prevFieldValues[ key ];
		}
		runChecks();

		const { getCurrentPostType, getCurrentPostId } =
			select( 'core/editor' );
		const postType = getCurrentPostType();
		const id = getCurrentPostId();
		const type = select( 'core' ).getPostType( postType );
		const restBase = type?.rest_base;
		if ( ! restBase || ! id ) {
			return;
		}
		const thisRequest = ++savedRequest;
		fetchSavedChecks( type?.rest_namespace ?? 'wp/v2', restBase, id )
			.then( ( response ) => {
				// Discard if a newer save has already started a request.
				if ( thisRequest !== savedRequest ) {
					return;
				}
				dispatch( STORE_NAME ).setSavedResults(
					response.prepublish_checks ?? null
				);
			} )
			.catch( ( e ) => {
				// eslint-disable-next-line no-console
				console.warn(
					'Publication checklist: saved checks request failed:',
					e
				);
			} );
	}

	let wasSavingMetaBoxes = false;
	function watchMetaBoxSaves() {
		const editPost = select( 'core/edit-post' );
		if ( ! editPost?.hasMetaBoxes || ! editPost.hasMetaBoxes() ) {
			return;
		}
		const isSaving = editPost.isSavingMetaBoxes();
		if ( wasSavingMetaBoxes && ! isSaving ) {
			refreshAfterMetaBoxSave();
		}
		wasSavingMetaBoxes = isSaving;
	}

	// Saved results from an earlier save must not outlive the next save: if the
	// refetch after its metaboxes is slow or fails, the checklist falls back to
	// the results the editor got from the post save. Autosaves are skipped
	// because no refetch follows them.
	let wasSavingPost = false;
	function watchPostSaves() {
		const editorSelect = select( 'core/editor' );
		const isSaving =
			editorSelect.isSavingPost() && ! editorSelect.isAutosavingPost();
		const started = ! wasSavingPost && isSaving;
		// Set before dispatching: the dispatch notifies this subscriber again.
		wasSavingPost = isSaving;
		if ( started ) {
			// Also discards a refetch from the previous save that is still in flight.
			savedRequest++;
			dispatch( STORE_NAME ).setSavedResults( null );
		}
	}

	subscribe( runChecks );
	subscribe( watchMetaBoxSaves );
	subscribe( watchPostSaves );
}
