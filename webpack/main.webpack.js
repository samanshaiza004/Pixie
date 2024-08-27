module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
  },
  entry: { main: './electron/main.ts' },
  module: {
    rules: require('./rules.webpack'),
  },
  target: 'electron-renderer',
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
    },
  },
}
