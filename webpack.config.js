const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Set production mode for builds
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    },
    argv
  );
  return config;
};

