const fs = require("fs");
const express = require("express");
const path = require("path");
/*

	测试打包ssr的简单node服务器
	打包完成之后
	通过node index.js启动

*/
if (typeof window === "undefined") {
  global.window = {};
}
const { renderToString } = require("react-dom/server");
const template = fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf-8');
const SSR = require("../dist/index-server");
const server = (port) => {
  const app = express();
  app.use(express.static("dist"));
  app.get("/index", (req, res) => {
    console.log(SSR);
    res.status(200).send(renderMarkup(renderToString(SSR)));
  });

  app.listen(port, () => {
    console.log("Server is Running");
  });
};
server(process.env.PORT || 3000);

const renderMarkup = (str) => {
	return template.replace("<!--HTML_PLACEHOLDER-->",str);
};
