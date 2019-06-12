import { REGISTER_ITEM, SET_ITEM_STATUS } from './types';

/**
 * Reducer for a single publication checklist item.
 *
 * @param {Object} state - Current state.
 * @param {Object} action - Dispatched action.
 *
 * @returns {Object} Updated state.
 */
export function item( state = {}, action ) {
	switch ( action.type ) {
		case REGISTER_ITEM: {
			const {
				name,
				render,
				status,
			} = action;

			return {
				name,
				render,
				status,
			};
		}

		case SET_ITEM_STATUS: {
			const { status } = action;

			return {
				...state,
				status,
			};
		}

		default:
			return state;
	}
}

/**
 * Reducer keeping track of registered publication checklist items.
 *
 * @param {Object} state - Current state.
 * @param {Object} action - Dispatched action.
 *
 * @returns {Object} Updated state.
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case REGISTER_ITEM: {
			const { name } = action;

			return {
				...state,
				[ name ]: item( {}, action ),
			};
		}

		case SET_ITEM_STATUS: {
			const { name } = action;

			return {
				...state,
				[ name ]: item( state[ name ], action ),
			};
		}

		default:
			return state;
	}
}

export default items;
