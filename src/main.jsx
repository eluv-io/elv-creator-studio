import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "@/assets/stylesheets/reset.scss";

// Initialize localized format for dayjs
import DayJS from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
DayJS.extend(LocalizedFormat);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
