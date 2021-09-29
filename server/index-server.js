const React = require("react");
require("./style.css");
//服务端测试打包组件
class Tittle extends React.Component {
  render() {
    return <div id="app">测试打包ssr</div>;
  }
}
module.exports = <Tittle />;
