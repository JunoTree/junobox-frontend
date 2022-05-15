module.exports = function override (config) {
  const loaders = config.resolve;
  loaders.fallback = {
    "path": require.resolve("path-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer-browserify"),
    "assert": require.resolve("assert-browserify"),
  }
  return config;
}
