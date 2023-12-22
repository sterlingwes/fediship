const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const {
  resolver: {sourceExts, assetExts},
} = getDefaultConfig(__dirname);

const storiesResolverConfig = require('./metro-stories.config');

const env = process.env.APP_ENV || 'default';

const storyTime = env === 'stories';

const envBound = key => `${key}-${env}`;

const generateCacheKey = () => {
  if (storyTime) {
    return envBound('stories-bundle');
  }

  return envBound('default-bundle');
};

const cacheVersion = generateCacheKey();
console.log(`using cache key: ${cacheVersion}`);

const config = {
  cacheVersion,
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    ...storiesResolverConfig,
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
