const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const pluginName = "ConsoleLogOnBuildWebpackPlugin";
//自定义插件
class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    //开始执行的构字
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log(compilation);
      console.log("webpack 构建过程开始！");
    });
  }
}

module.exports = {
  //配置入口
  entry: path.resolve(__dirname, "src/index.tsx"),
  output: {
    //打包出口
    path: path.resolve(__dirname, "dist"),
    //打包出口
    filename: "bundle.[contenthash:8].js",
    //publicPath访问资源的路径，可以配置为相对路径，上线时配置的是cdn的地址。
    publicPath: "/",
  },
  //添加需要解析的文件
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", "jsx"],
  },
  plugins: [
    //使用模板html,会在输出目录下面，生成引入打包好js的html文件
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
    //输出前清空目录
    new CleanWebpackPlugin(),
    //分离css
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new ConsoleLogOnBuildWebpackPlugin(),
  ],
  //webpack-dev-server提供了一个简单的Web服务器和实时热更新的能力
  //我们就可以通过webpack-dev-server --mode development , 来启动服务。
  //注意：不同版本的wepack,配置项会有一些差异
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: "8080",
    host: "localhost",
  },
  //devtools，用于配置source-map，用于定位编译前后代码的位置
  devtool: "source-map",
  module: {
    rules: [
      //加载支持处理css的lodader,可以将 css 文件转换成JS文件类型。
      //使用MiniCssExtractPlugin 插件可以分离css文件
      {
        test: /\.css/,
        use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader"],
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src"),
      },
      {
        test: /\.less/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          "css-loader",
          "less-loader",
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src"),
      },
      //file-loader: 解决CSS等文件中的引入图片路径问题
      //url-loader: 当图片小于limit的时候会把图片Base64编码，大于limit参数的时候还是使用file-loader进行拷贝
      {
        test: /\.(git|jpg|png)/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
              outputPath: "images",
              name: "[hash:10].[ext]",
              esModule: false,
            },
          },
        ],
      },

      //支持转义ES6/ES7/JSX
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/react"],
              plugins: [
                [
                  require("@babel/plugin-proposal-decorators"),
                  { legacy: true },
                ],
              ],
            },
          },
        ],
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
      },
      //配置支持ts和tsx
      {
        test: /\.tsx/,
        exclude: /node-modules/,
        use: ["ts-loader"],
      },
    ],
  },

  optimization: {
    //加上压缩配置，打包不会生成.map文件
    minimizer: [
      //配置压缩JS文件
      new UglifyWebpackPlugin({
        parallel: 4,
      }),
      //配置压缩CSS文件
      new OptimizeCssAssetsWebpackPlugin(),
    ],
  },
};
