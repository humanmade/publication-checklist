import { REGISTER_ITEM, SET_ITEM_STATUS } from './types';

/**
 * Return an action object used to register a new publication checklist item.
 *
 * @param {string} name - Item name.
 * @param {Function} render - Render callback.
 * @param {string} [status] - Optional item status.
 *
 * @returns {Object} Action object.
 */
export function registerItem( name, render, status = '' ) {
	return {
		type: REGISTER_ITEM,
		name,
		render,
		status,
	};
}

/**
 * Return an action object used to set an existing publication checklist item's status.
 *
 * @param {string} name - Item name.
 * @param {string} status - Item status.
 *
 * @returns {Object} Action object.
 */
export function setItemStatus( name, status ) {
	return {
		type: SET_ITEM_STATUS,
		name,
		status,
	};
}
