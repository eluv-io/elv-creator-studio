import "Assets/stylesheets/reset.scss";

import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"

import {MantineProvider} from "@mantine/core";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider
      theme={{
        shadows: {
          xs: "0.0625rem 0.0625rem 0.0625rem rgba(0, 0, 0, 0.3)",
          sm: "0.0625rem 0.0625rem 0.0625rem rgba(0, 0, 0, 0.4)",
          md: "0.1875rem 0.1875rem 0.0625rem rgba(0, 0, 0, 0.4)",
          lg: "0.1875rem 0.1875rem 0.0625rem 0.5rem rgba(0, 0, 0, 0.4)",
          xl: "0.1875rem 0.1875rem 0.0625rem 1rem rgba(0, 0, 0, 0.4)",
        },
      }}
      withGlobalStyles
    >
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
