/**
 * ESLint flat config. Extends the @wordpress/scripts defaults with import checks and project rule overrides.
 */

const isProduction = process.env.NODE_ENV === 'production';

module.exports = [
	...require( '@wordpress/scripts/config/eslint.config.cjs' ),
	// The import plugin is already registered by the WordPress config, so only add its error rules.
	{ rules: require( 'eslint-plugin-import' ).flatConfigs.errors.rules },
	{
		rules: {
			'@wordpress/dependency-group': 'off',
			'@wordpress/react-no-unsafe-timeout': 'error',
			// @wordpress/* packages are provided by WordPress as externals, not installed dependencies.
			'import/no-extraneous-dependencies': 'off',
			'import/no-unresolved': [
				'error',
				{
					commonjs: true,
					ignore: [ '^@wordpress/[^/]+' ],
				},
			],
			'jsdoc/check-param-names': 'warn',
			'jsdoc/check-tag-names': 'warn',
			'jsdoc/check-types': [
				'warn',
				{
					noDefaults: true,
				},
			],
			'jsdoc/no-undefined-types': 'warn',
			'jsdoc/require-description-complete-sentence': 'warn',
			'jsdoc/require-hyphen-before-param-description': 'warn',
			'jsdoc/require-param': 'warn',
			'jsdoc/require-param-description': 'warn',
			'jsdoc/require-param-name': 'warn',
			'jsdoc/require-param-type': 'warn',
			'jsdoc/require-returns-type': 'warn',
			'jsdoc/valid-types': 'warn',
			'max-len': [ 'warn', 120 ],
			'no-console': isProduction ? 'error' : 'warn',
			'no-debugger': isProduction ? 'error' : 'warn',
			'no-shadow': 'off',
			'no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '_',
					args: 'after-used',
					argsIgnorePattern: '_',
					ignoreRestSiblings: true,
				},
			],
			// Prettier breaks long assignments after '=', which this rule forbids.
			'operator-linebreak': 'off',
			'react/prop-types': 'warn',
		},
	},
];
