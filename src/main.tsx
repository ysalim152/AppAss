import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSystemErrorListeners } from "./lib/diagnostics";

// Initialize global runtime diagnostics and error listeners
initSystemErrorListeners();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
