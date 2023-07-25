import "Assets/stylesheets/reset.scss";

import React from "react"
import ReactDOM from "react-dom/client"
import {MantineProvider} from "@mantine/core";
import {observer} from "mobx-react-lite";
import MantineTheme from "Assets/MantineTheme.js";
import App from "./App.jsx"


import {uiStore} from "Stores";

export const MantineProviderWrapper = observer(({children}) => {
  return (
    <MantineProvider theme={{colorScheme: uiStore.theme, ...MantineTheme}} withGlobalStyles>
      { children }
    </MantineProvider>
  );
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProviderWrapper>
      <App />
    </MantineProviderWrapper>
  </React.StrictMode>,
)
