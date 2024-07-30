module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
  },
  entry: { main: './electron/main.ts' },
  module: {
    rules: require('./rules.webpack'),
  },
}
