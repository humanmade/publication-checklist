const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

// Find and replace the dependency extraction plugin
const plugins = defaultConfig.plugins.map(plugin => {
    if (plugin instanceof DependencyExtractionWebpackPlugin) {
        return new DependencyExtractionWebpackPlugin({
            requestToExternal: (request) => {
                if (request === '@wordpress/icons') {
                    return false; // Bundle it
                }
            }
        });
    }
    return plugin;
});

module.exports = {
    ...defaultConfig,
    plugins,
};
