const path = require('path');
const Resolver = require('metro-resolver');

const storyTime = process.env.APP_ENV === 'stories';

if (storyTime) {
  console.log('⚡️ Stories mode engaged: normal app entry point overridden');
}

const moduleIsEntrypoint = moduleName => /\.\/index/.test(moduleName);

const resolveLocal = relativePath => path.resolve(__dirname, relativePath);

module.exports = storyTime
  ? {
      resolveRequest(context, moduleName, platform) {
        if (moduleIsEntrypoint(moduleName)) {
          // overrides our main index.js entry point to ensure stories-related
          // modules do not end up in our normal app bundle
          return {
            filePath: resolveLocal('./stories.tsx'),
            type: 'sourceFile',
          };
        }

        return Resolver.resolve(
          // metro's resolver delegates to 'resolveRequest' on the context
          // unless we unset it, and it doesn't resolve properly in those cases
          {...context, resolveRequest: undefined},
          moduleName,
          platform,
        );
      },
    }
  : {};
