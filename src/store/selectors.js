import createSelector from 'rememo';

/**
 * Return all registered publication checklist items.
 *
 * @param {Object} state - Current state.
 *
 * @returns {Object} Items.
 */
export const getItems = createSelector(
	( state ) => state,
	( state ) => [ state ]
);
