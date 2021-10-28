## source-map 配置简介

有五种关键的配置，然后实际运用中取其组合

| 关键字        |        含义              |
|---------------|--------------------------|
|source-map     |产生.map的文件            |
|eval           |使用eval包裹模块代码      |
|cheap          |不包含列信息，也不包含loader的sourcemap|
|module         |包含loader的sourcemap(比如jsx)，否则无法定义源文件|
|inline         |将.map作为DataURL嵌入，不单独生成.map文件|

### source-map

定位信息最全，可以精确的定位到代码出错的位置，但生成的.map 文件也最大，效率最低。

### eval
用``eval 包裹源代码进行执行,信息和js文件在一起，利用字符串可缓存从而提效

### Inline-source-map
将 map 作为 DataURI 嵌入，信息和js文件在一起，不单独生成.map 文件,减少文件数，但是生成文件会很大

### cheap-source-map
错误信息只会定义到行，而不会定义到列,精准度降低换取文件内容的缩小,对于经由 babel 之类工具转义的代码，只能定位到转换后的代码

### cheap-module-source-map
会保留 loader 处理前后的文件信息映射,解决对于使用cheap 配置项导致无法定位到 loader 处理前的源代码问题

## 最佳实践

### 开发环境

我们在开发环境对 sourceMap 的要求是：快（eval），信息全（module），
且由于此时代码未压缩，我们并不那么在意代码列信息(cheap),

所以开发环境比较推荐配置：devtool: cheap-module-eval-source-map

### 生产环境
- 一般情况下，我们并不希望任何人都可以在浏览器直接看到我们未编译的源码，
- 所以我们不应该直接提供 sourceMap 给浏览器。但我们又需要 sourceMap 来定位我们的错误信息，
- 一方面 webpack 会生成 sourcemap 文件以提供给错误收集工具比如 sentry，另一方面又不会为 bundle 添加引用注释，以避免浏览器使用。

这时我们可以设置devtool: hidden-source-map

## Map文件
假设源文件为script.js
```js
let a=1;
let b=2;
let c=3;
```
其打包后的文件为script-min.js
```js
var a=1,b=2,c=3;
```
其.map文件为script-min.js.map,格式化之后如下
```
{
"version":3,
"file":"script-min.js",
"lineCount":1,
"mappings":"AAAA,IAAIA,EAAE,CAAN,CACIC,EAAE,CADN,CAEIC,EAAE;","sources":["script.js"],
"names":["a","b","c"]
}
```
字段含义分析

|   字段    |   含义    |
|-----------|-----------|
|version    |Source map 的版本，目前为 3|
|file       |转换后的文件名|
|sourceRoot |转换前的文件所在的目录。如果与转换前的文件在同一目录，该项为空|
|sources    |转换前的文件,该项是一个数组,表示可能存在多个文件合并|
|names      |转换前的所有变量名和属性名|
|mappings   |记录位置信息的字符串|

### 位置记录信息Mapping
- 行对应 :以分号（;）表示，每个分号对应转换后源码的一行。所以，第一个分号前的内容，就对应源码的第一行，以此类推。
- 位置对应:以逗号（,）表示，每个逗号对应转换后源码的一个位置。所以，第一个逗号前的内容，就对应该行源码的第一个位置，以此类推。
- 分词信息:以 VLQ 编码表示，代表记录该位置对应的转换前的源码位置、原来属于那个文件等信息。如AAAA代表该位置转换前的源码位置，以VLQ编码表示；

##### 分词信息每一位的含义
其中【分词信息】每组最多五位（如果不是变量，只会有四位），分别是：

- 第一位，表示这个位置在【转换后代码】的第几列。
- 第二位，表示这个位置属于【sources 属性】中的哪一个文件。
- 第三位，表示这个位置属于【转换前代码】的第几行。
- 第四位，表示这个位置属于【转换前代码】的第几列。
- 第五位，表示这个位置属于【names 属性】的哪一个变量。

##### 为何不用坐标存储位置
因为体积，如果直接坐标记录信息，至少存在两点空间损耗：编译后文件的纵坐标大的惊人；因为坐标信息是数字，如果采用数组存储，将有大量存储空间浪费。

将上面的mappings对应的字符串输入，将会得到对应的数字信息，如AAAA对应的是0000，这两者之间的映射规则就是base64vlq编码。

在线转换网站 https://www.murzwin.com/base64vlq.html