const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const main = {
  entry: './src/entry.js',
  resolve: {
    extensions: ['.js']
  },
  output: {
    path: path.resolve(__dirname, 'public', 'js', 'dist'),
    filename: 'chipgif.bundle.js'
  },
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  node: false
};

module.exports = main; 
