import { registerStore } from '@wordpress/data';

export const STORE_NAME = 'altis/publication-checklist';

const DEFAULT_STATE = {
	live: {},
};

/**
 * Reducer for the publication checklist store.
 *
 * @param {Object} state  - Current state.
 * @param {Object} action - Action object.
 * @return {Object} Updated state.
 */
const reducer = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
		case 'SET_LIVE_RESULTS':
			return {
				...state,
				live: action.payload,
			};

		case 'CLEAR_LIVE_RESULT':
			return {
				...state,
				live: {
					...state.live,
					[ action.payload ]: undefined,
				},
			};

		default:
			return state;
	}
};

/**
 * Selectors for the publication checklist store.
 */
const selectors = {
	/**
	 * Get live results from the store.
	 *
	 * @param {Object} state - Store state.
	 * @return {Object} Live results object.
	 */
	getLiveResults: ( state ) => state.live,

	/**
	 * Merge live results with REST results, with priority JS > PHP-live > PHP-static.
	 *
	 * @param {Object} state       - Store state.
	 * @param {Object} restResults - REST prepublish_checks object from core/editor.
	 * @return {Object} Merged results without source field.
	 */
	getMergedResults: ( state, restResults ) => {
		const merged = {};

		// Start with REST results (PHP-static)
		if ( restResults ) {
			Object.entries( restResults ).forEach( ( [ id, result ] ) => {
				merged[ id ] = {
					status: result.status,
					message: result.message,
					data: result.data,
				};
			} );
		}

		// Overlay live results with proper priority
		Object.entries( state.live ).forEach( ( [ id, liveResult ] ) => {
			if ( ! liveResult ) {
				return;
			}

			const { source, status, message, data } = liveResult;

			// PHP-live overrides PHP-static, JS overrides everything
			if ( source === 'php-live' || source === 'js' ) {
				merged[ id ] = {
					status,
					message,
					data,
				};
			}
		} );

		return merged;
	},
};

/**
 * Actions for the publication checklist store.
 */
const actions = {
	/**
	 * Set live results, replacing the entire live object.
	 *
	 * @param {Object} map - Live results map keyed by check id.
	 * @return {Object} Action object.
	 */
	setLiveResults: ( map ) => ( {
		type: 'SET_LIVE_RESULTS',
		payload: map,
	} ),

	/**
	 * Clear a single live result by id.
	 *
	 * @param {string} id - Check id to clear.
	 * @return {Object} Action object.
	 */
	clearLiveResult: ( id ) => ( {
		type: 'CLEAR_LIVE_RESULT',
		payload: id,
	} ),
};

/**
 * Register the publication checklist store.
 */
export const store = registerStore( STORE_NAME, {
	reducer,
	selectors,
	actions,
} );
