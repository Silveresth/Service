const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "querystring": require.resolve("querystring-es3"),
        "http": require.resolve("stream-http"),
        "buffer": require.resolve("buffer"),
        "url": require.resolve("url"),
        "util": require.resolve("util"),
        "assert": require.resolve("assert"),
        "fs": false,
        "net": false
      };
      return webpackConfig;
    },
  },
};

