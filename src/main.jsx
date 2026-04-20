import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter";
import "bootstrap/dist/css/bootstrap.min.css";

import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);