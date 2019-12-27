const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const config = {
  // mode: 'production',
  mode: 'development',
  entry: {
    modelTool: './src/index.ts'
  },
  devtool: 'source-map',
  // 失败之后中断并抛出错误
  bail: true,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/transform-runtime']
          }
        }
      }
    ]
  },
  // 清理dist文件夹
  plugins: [
    new CleanWebpackPlugin(['dist/modelTool.js', 'dist/modelTool.js.map'])
  ],
  optimization: {
    // 使用uglifyjs压缩js体积
    minimizer: [new UglifyJsPlugin()]
  }
}

module.exports = config
