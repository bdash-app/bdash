import "font-awesome/css/font-awesome.css";
import "./styles/app.css";
import React from "react";
import ReactDOM from "react-dom";
import Bdash from "../lib/Bdash";
import "./components/SplashScreen";
import App from "./pages/App";

Bdash.initialize()
  .then(() => {
    ReactDOM.render(<App />, document.getElementById("app"));
  })
  .catch((err: Error) => {
    // TODO: process exit after close alert
    alert(err.message);
    throw err;
  });
