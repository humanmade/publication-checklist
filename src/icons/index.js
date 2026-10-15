import PropTypes from 'prop-types';

export const Check = ( { size = 24, ...props } ) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={ size }
		height={ size }
		{ ...props }
	>
		<path d="M16.7 7.1l-6.3 8.5-3.3-2.5-.9 1.2 4.5 3.4L17.9 8z" />
	</svg>
);

export const Error = ( { size = 24, ...props } ) => (
	<svg
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		width={ size }
		height={ size }
		{ ...props }
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12.218 5.377a.25.25 0 0 0-.436 0l-7.29 12.96a.25.25 0 0 0 .218.373h14.58a.25.25 0 0 0 .218-.372l-7.29-12.96Zm-1.743-.735c.669-1.19 2.381-1.19 3.05 0l7.29 12.96a1.75 1.75 0 0 1-1.525 2.608H4.71a1.75 1.75 0 0 1-1.525-2.608l7.29-12.96ZM12.75 17.46h-1.5v-1.5h1.5v1.5Zm-1.5-3h1.5v-5h-1.5v5Z"
		/>
	</svg>
);

const iconPropTypes = {
	size: PropTypes.number,
};

Check.propTypes = iconPropTypes;
Error.propTypes = iconPropTypes;
