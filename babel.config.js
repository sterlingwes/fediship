module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'global-define',
      {
        __TEST__: process.env.NODE_ENV === 'test',
      },
    ],
  ],
};
