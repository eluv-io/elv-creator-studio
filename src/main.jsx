import "Assets/stylesheets/reset.scss";

import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"

import {MantineProvider} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {uiStore} from "Stores";

export const MantineProviderWrapper = observer(({children}) => {
  return (
    <MantineProvider theme={{colorScheme: uiStore.theme}} withGlobalStyles>
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
