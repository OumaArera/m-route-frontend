import React from "react";
import ReactDOM from "react-dom";
import { LoadScript } from "@react-google-maps/api"; 
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LoadScript
      googleMapsApiKey = {process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LoadScript>
  </React.StrictMode>
);
