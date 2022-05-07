const path = require('path');

module.exports = {
  entry: './svg-loader.js',
  devtool: 'source-map',
  output: {
    filename: process.env.NODE_ENV === 'production' ? 'svg-loader.min.js' : 'svg-loader.js',
    path: path.resolve(__dirname, './dist'),
  },
};