import PropTypes from 'prop-types';

export const itemPropType = PropTypes.shape( {
	data: PropTypes.any,
	message: PropTypes.string.isRequired,
	status: PropTypes.string,
} );

export const itemsCollectionPropType = PropTypes.arrayOf( itemPropType );

export const itemsMapPropType = PropTypes.objectOf( itemPropType );
