const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the shared folder to the watchFolders
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
];

// Add resolver alias for shared folder
config.resolver.alias = {
  '@shared': path.resolve(__dirname, '../shared/src'),
};

module.exports = config;