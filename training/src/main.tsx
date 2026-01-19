import React from "react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";
import "./index.css";
import ReactDOM from "react-dom";

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,

  document.getElementById("root")
);
