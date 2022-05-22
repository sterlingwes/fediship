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

module.exports = (async () => {
  return {
    cacheVersion,
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      ...storiesResolverConfig,
    },
  };
})();
