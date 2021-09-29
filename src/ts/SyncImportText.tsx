import React from "react";
interface IProps {}
interface IState {
  Component: any;
}
//测试懒加载，动态import的组件
class SyncImportText extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      Component: null,
    };
    this.loadComponent = this.loadComponent.bind(this);
  }
  loadComponent() {
    import("../uils/syncImport").then((component) => {
      this.setState({ Component: component.default });
    });
  }
  render() {
    const { Component } = this.state;
    return (
      <>
        <button onClick={this.loadComponent}>加载组件</button>
        {Component ? <Component /> : null}
      </>
    );
  }
}
export default SyncImportText;
