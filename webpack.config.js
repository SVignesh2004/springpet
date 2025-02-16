const path = require('path');
const webpack = require('webpack');

const port = process.env.PORT || 3000;

module.exports = {
  mode: process.env.NODE_ENV || 'development',  // Set mode based on NODE_ENV
  entry: './src/main.tsx',
  devtool: 'source-map',  // Source maps for easier debugging
  output: {
    path: path.join(__dirname, 'public/dist/'),
    filename: 'bundle.js',
    publicPath: '/dist/',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    hot: true,  // Enables hot module replacement
    port: port,
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],  // Updated to modern syntax
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['babel-loader', 'ts-loader'],
        include: path.join(__dirname, 'src'),
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],  // Correct syntax for loaders
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',  // Modern handling for images
        generator: {
          filename: 'images/[name][ext][query]',
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/i,
        type: 'asset/resource',  // Modern handling for fonts
        generator: {
          filename: 'fonts/[name][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),  // For HMR
    new webpack.DefinePlugin({
      __API_SERVER_URL__: JSON.stringify('http://localhost:8080'),  // Define environment variables
    }),
  ],
};
