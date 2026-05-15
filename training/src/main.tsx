import React from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";
import "./index.css";
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
