import React from "react";
import largeNumberAdd from "large-number";
//测试引入打包lib组件
const Tittle = () => {
  const num = largeNumberAdd("333333", "9999999");
  return <h1>webpack测试内容--{num}</h1>;
};

export default Tittle;
