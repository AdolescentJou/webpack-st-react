const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackExternalsPlugin = require("html-webpack-externals-plugin");
const pluginName = "ConsoleLogOnBuildWebpackPlugin";
/*


	用于服务器渲染的打包配置文件
	详细区别可以查看md文件



*/
//自定义插件
class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    //开始执行构建的钩子方法
    compiler.hooks.run.tap(pluginName, (compilation) => {
      //       console.log(compilation);
      console.log("webpack 构建过程开始！");
    });
  }
}

//动态打包多页面
const setMPA = () => {
  const entry = {};
  const HtmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, "./server/index-server.js"));
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
        chunks: ["index-server"],
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
    filename: "index-server.js",
    //publicPath访问资源的路径，可以配置为相对路径，上线时配置的是cdn的地址。
    publicPath: "/",
    libraryTarget: "umd",
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
    new ConsoleLogOnBuildWebpackPlugin(),
    //分离基础库，通过CND的方式引入，不打包进bundle，提高打包效率
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
    //开启scopehositing的插件，已经弃用
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
  //devtools，用于配置source-map，用于定位编译前后代码的位置
  devtool: "source-map",
  module: {
    rules: [
      //加载支持处理css的lodader,可以将 css 文件转换成JS文件类型。
      //使用MiniCssExtractPlugin 插件可以分离css文件
      {
        test: /\.css/,
        use: "css-loader",
      },
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
	test: /\.js?$/,  
	exclude: /(node_modules|bower_components)/,  
	loader: 'babel-loader', // 'babel-loader' is also a legal name to reference  
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
      //配置压缩JS文件,webpack内置，可以添加参数
      new UglifyWebpackPlugin({
        parallel: 4,
      }),
    ],
  },
};
