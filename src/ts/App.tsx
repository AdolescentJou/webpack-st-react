import React from "react";
import ImageBox from "./components/ImgBox";
import SyncImportText from "./components/SyncImportText";
const App = () => {
  return (
    <div id="app">
      <SyncImportText />
      <ImageBox />
    </div>
  );
};

export default App;
