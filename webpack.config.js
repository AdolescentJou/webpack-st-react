const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackExternalsPlugin = require("html-webpack-externals-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const pluginName = "ConsoleLogOnBuildWebpackPlugin";
//自定义插件,开始构建的钩子
class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log("webpack 构建过程开始！");
    });
  }
}
//构建完成的构字，处理构建错误信息
class CatchErrorWebpackPlugin {
  apply(compiler) {
    compiler.hooks.done.tap(pluginName, (compilation) => {
      //  这里的捕获错误信息暂时有点问题，先注释掉
      //       if (
      //         compilation.errors &&
      //         compilation.errors.length &&
      //         process.argv.indexOf("--watch") == -1
      //       ) {
      //         console.log("build error");
      //         process.exit(1);
      //       }
      console.log("构建完成");
    });
  }
}

//动态打包多页面
const setMPA = () => {
  const entry = {};
  const HtmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, "./src/index.tsx"));
  Object.keys(entryFiles).map((index) => {
    //todo:
    //这个地方实际上应该是动态获取src下面的目录名称（比如 /src/login/index）
    //然后使用正则获取页面名称(login)然后设置每个页面的index
    //然后每个页面创建一个单独的HTML模板，并且引用命名
    entry["index"] = entryFiles[index];
    HtmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "index.html"),
        //这里地方需要引入所有分离的公共包
        chunks: ["index", "vendors"],
      })
    );
  });
  return {
    entry,
    HtmlWebpackPlugins,
  };
};

const { entry, HtmlWebpackPlugins } = setMPA();

module.exports = {
  //配置入口
  //path.resolve会拼装参数生成一个绝对路径，_dirname代表着当前目录名，也可以认为是根目录地址
  entry: entry,
  output: {
    //打包出口
    path: path.resolve(__dirname, "dist"),
    //打包出口,使用chunkhash做为文件指纹
    filename: "bundle.[chunkhash:8].js",
    //publicPath访问资源的路径，可以配置为相对路径，上线时配置的是cdn的地址。
    publicPath: "/",
  },
  mode: "development",
  //添加需要解析的文件
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", "jsx"],
  },
  plugins: [
    //使用模板html,会在输出目录下面，生成引入打包好js的html文件，自带html压缩效果
    //     new HtmlWebpackPlugin({
    //       template: path.resolve(__dirname, "index.html"),
    //     }),
    //输出前清空目录
    new CleanWebpackPlugin(),
    //分离css
    //使用contenthash做为文件指纹
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:8].css",
      chunkFilename: "[id].[contenthash:8].css",
    }),
    //添加规范打印日志的插件
    new CatchErrorWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    //添加自定义插件
    new ConsoleLogOnBuildWebpackPlugin(),
    //分离基础库，通过CND的方式引入，不打包进bundle，提高打包效率，这里使用了splitChunk所以注释这个
    //     new HtmlWebpackExternalsPlugin({
    //       externals: [
    //         {
    //           module: "react",
    //           entry: "https://cdn.bootcss.com/react/16.2.0/umd/react.production.min.js",
    //           global: "React",
    //         },
    //         {
    //           module: "react-dom",
    //           entry: "https://cdn.bootcss.com/react-dom/16.2.0/umd/react-dom.production.min.js",
    //           global: "ReactDOM",
    //         },
    //       ],
    //     }),
    //开启scopehositing的插件，减少打包体积，已经内置，所以不需要配置
    //new webpack.optimize.ModuleConcatenationPlugin()
  ].concat(HtmlWebpackPlugins),
  //webpack-dev-server提供了一个简单的Web服务器和实时热更新的能力
  //我们就可以通过webpack-dev-server --mode development , 来启动服务。
  //注意：不同版本的wepack,配置项会有一些差异
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: "8080",
    host: "localhost",
  },
  //配置日志信息显示类型
  stats: "errors-only",
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
      //支持加载less的loader
      {
        test: /\.less/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          "css-loader",
          "less-loader",
          //用于给css加上适配浏览器的前缀
          {
            loader: "postcss-loader",
            options: {
              //将样式标签插入到header
              insertAt: "top",
              //将所有style标签合成为一个
              singleton: true,
              plugins: () => [
                require("autoprefixer")({
                  //配置浏览器版本
                  browsers: [
                    "Android 4.1",
                    "iOS 7.1",
                    "Chrome > 31",
                    "ff > 31",
                    "ie >= 8",
                  ],
                }),
              ],
            },
          },
          //用于将px转化成rem
          {
            loader: "px2rem-loader",
            options: {
              //根元素大小
              remUnit: 100,
              //转化后的小数点位数
              remPrecision: 2,
            },
          },
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
              //[ext]代表取原文件的后缀名称
              name: "[name].[hash:10].[ext]",
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

  //加上压缩配置，打包不会生成.map文件
  optimization: {
    minimizer: [
      //配置压缩JS文件,webpack内置，可以添加参数
      new UglifyWebpackPlugin({
        parallel: 4,
      }),
      //配置压缩CSS文件
      new OptimizeCssAssetsWebpackPlugin(),
    ],
    //将react喝react-dom打包成基础包通过script引入
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /(react|react-dom)/,
          name: "vendors",
          chunks: "all",
        },
      },
      //将各个页面引用次数为2以上的文件，打包成一个公共包
      //       minSize: 0,
      //       cacheGroups: {
      //         commons: {
      //           name: "commons",
      //           chunks: "all",
      //           minChunks: 2,
      //         },
      //       },
    },
  },
};
