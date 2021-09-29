import React from "react";
import Tittle from "./Tittle.jsx";
import ImageBox from "./ImgBox";
import SyncImportText from "./SyncImportText";
const App = () => {
  return (
    <div id="app">
      <SyncImportText />
      <Tittle />
      <ImageBox />
    </div>
  );
};

export default App;
