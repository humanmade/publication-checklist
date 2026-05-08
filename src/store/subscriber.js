import { select, subscribe, dispatch } from '@wordpress/data';
import { getRegistered } from '../api';
import { runServerChecks } from '../api/rest';
import { STORE_NAME } from './index';

// Cache PHP check metadata once — it is set at page load and never changes.
const phpChecks = window.altisPublicationChecklist?.checks ?? [];

// Build a snapshot of the currently-edited post attributes.
function buildSnapshot() {
	const editorSelect = select( 'core/editor' );
	const postType = editorSelect.getCurrentPostType();

	// Always include these basics
	const post = {
		title: editorSelect.getEditedPostAttribute( 'title' ),
		content: editorSelect.getEditedPostAttribute( 'content' ),
		excerpt: editorSelect.getEditedPostAttribute( 'excerpt' ),
		featured_media: editorSelect.getEditedPostAttribute( 'featured_media' ),
		status: editorSelect.getEditedPostAttribute( 'status' ),
	};
	const meta = editorSelect.getEditedPostAttribute( 'meta' ) ?? {};
	const terms = editorSelect.getEditedPostAttribute( 'terms' ) ?? {};

	return { postType, post, meta, terms };
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

// Shallow-compare the fields a PHP-live check declares against previously-seen values.
// Returns true if any declared field has changed since last check.
// If check.fields is null (no filter), always returns true.
function hasFieldsChanged( check, post, meta, terms, prevFieldValues ) {
	if ( ! check.fields ) {
		return true; // no filter — always re-run
	}
	const prev = prevFieldValues[ check.id ] ?? {};
	for ( const field of check.fields ) {
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
		if ( ! check.fields ) {
			continue;
		}
		const snapshot = {};
		for ( const field of check.fields ) {
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

	const phpLiveChecks = phpChecks.filter( ( c ) => c.source === 'php-live' );

	const runChecks = debounce( async () => {
		const thisGeneration = ++generation;

		// 1. Get live-registered JS checks.
		const jsChecks = getRegistered(); // { id, type, runCheck }

		// 2. Build a full snapshot.
		const { postType, post, meta, terms } = buildSnapshot();

		// 3. Run JS checks inline.
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
							: result.data ?? null,
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
					post,
					meta,
					terms,
					pendingPhpIds
				);
				// Discard if a newer tick has already resolved.
				if ( thisGeneration !== generation ) {
					return;
				}
				Object.entries( phpResults ).forEach( ( [ id, result ] ) => {
					liveResults[ id ] = { ...result, source: 'php-live' };
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

		// 6. Update store — skip if a newer tick already dispatched.
		if ( thisGeneration !== generation ) {
			return;
		}
		dispatch( STORE_NAME ).setLiveResults( liveResults );
	}, 250 );

	subscribe( runChecks );
}
