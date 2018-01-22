import "font-awesome/css/font-awesome.css";
import "react-select/dist/react-select.css";
import "./styles/app.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./pages/App";

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<App />, document.getElementById("app"));
});
