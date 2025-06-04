import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import DanfoExample from "./DanfoExample";

const App: React.FC = () => {
  return (
    <div>
      <h1>React + Danfo.js + TypeScript</h1>
      <DanfoExample />
    </div>
  );
};

export default App;
