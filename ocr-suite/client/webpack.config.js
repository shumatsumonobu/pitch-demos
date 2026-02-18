const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require('node:path');

module.exports = {
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1500,
    ignored: [
      path.resolve(__dirname, 'src/media'),
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  entry: {
    'meal-intake': './src/meal-intake.js',
  },
  output: {
    path: path.resolve(__dirname, '../public/build'),
    filename: '[name].js',
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        {from: 'src/media', to: 'media'},
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: 'css-loader', options: {url: false}},
          'postcss-loader',
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ],
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  performance: {
    maxEntrypointSize: 3 * 1024 * 1024,
    maxAssetSize: 10 * 1024 * 1024,
  },
};
