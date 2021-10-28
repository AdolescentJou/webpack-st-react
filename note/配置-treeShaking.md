### tree shaking

tree shaking 是一个术语，通常用于描述移除 JavaScript 上下文中的未引用代码(dead-code)。


### 目标 删除DCE代码
- 代码不会被执行，不可到达
- 代码的执行结果不会被用到
- 代码只会影响死变量（只读不写）

### 原理 

利用ES6模块的特点
- 只能作为模块顶层语句出现，
- import的模块名只能是字符串常量
- import binding是immutable
在编译，uglify阶段删除无用代码

### 基本配置
- 首先，必须处于生产模式，因为生产模式会自带treeshaking,Webpack 只有在压缩代码的时候会 tree-shaking

- 其次，必须将优化选项 “usedExports” 设置为true。这意味着 Webpack 将识别出它认为没有被使用的代码，并在最初的打包步骤中给它做标记。

- 最后，需要一个支持删除死代码的压缩器。这种压缩器将识别出 Webpack 是如何标记它认为没有被使用的代码，并将其剥离。TerserPlugin 支持这个功能，推荐使用。

### 局限性
webpack对可能有副作用的模块不会进行tree-shaking,这可以免于删除必要的文件，但这意味着 Webpack 的默认行为实际上是不进行 tree-shaking。

### 配置告诉webpack没有副作用
package.json 有一个特殊的属性 sideEffects，就是为此而存在的。它有三个可能的值：
- true 是默认值，如果不指定其他值的话。这意味着所有的文件都有副作用，也就是没有一个文件可以 tree-shaking。
- false 告诉 Webpack 没有文件有副作用，所有文件都可以 tree-shaking。
- 第三个值 […] 是文件路径数组。它告诉 webpack，除了数组中包含的文件外，你的任何文件都没有副作用。因此，除了指定的文件之外，其他文件都可以安全地进行 tree-shaking。数组方式支持相关文件的相对路径、绝对路径和 glob 模式。它在内部使用 micromatch。

**注意**，任何导入的文件都会受到 tree shaking 的影响。这意味着，如果在项目中使用类似 css-loader 并导入 CSS 文件，则需要将其添加到 side effect 列表中，以免在生产模式中无意中将它删除： 
```js
{
  "name": "your-project",
  "sideEffects": [
    "./src/some-side-effectful-file.js",
    "*.css"
  ]
}
```
最后，还可以在 module.rules 配置选项 中设置 "sideEffects"