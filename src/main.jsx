import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { TabsProvider } from "./contexts/TabsContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <TabsProvider>
      <App />
    </TabsProvider>
  </BrowserRouter>
);