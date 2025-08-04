module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove any reanimated/worklets plugins if not needed
    ],
  };
};