const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

const pathsToClean = [
  'build',
];

module.exports = {
  entry: ['babel-polyfill', './src/app.js'],
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[chunkhash].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './template/index.html',
      filename: 'demo.html',
      minify: {
        collapseWhitespace: true,
      }
    }),
    new CleanWebpackPlugin(pathsToClean)
  ],
  devtool: 'source-map',
  devServer: {
    port: 8989,
    open: true,
    compress: true,
    index: 'demo.html',
  },
};
