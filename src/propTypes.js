import PropTypes from 'prop-types';

export const itemPropType = PropTypes.shape( {
	// name: PropTypes.string.isRequired,
	// render: PropTypes.func.isRequired,
	message: PropTypes.string.isRequired,
	status: PropTypes.string,
} );

export const itemsCollectionPropType = PropTypes.arrayOf( itemPropType );

export const itemsMapPropType = PropTypes.objectOf( itemPropType );
