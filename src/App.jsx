import {observer} from "mobx-react-lite";

import {Text,  Loader, Modal, Flex,  MantineProvider} from "@mantine/core";
import {ModalsProvider} from "@mantine/modals";
import MantineTheme from "@/assets/MantineTheme";

import {rootStore, uiStore} from "@/stores";

import AppRoutes from "./Routes.jsx";
import SaveModal from "./components/common/SaveModal.jsx";

// Shows an overlay when something in the app is loading
const LoaderModal = observer(() => {
  return (
    <Modal
      opened={uiStore.loading}
      centered
      withCloseButton={false}
      onClose={() => {}}
      size="lg"
      overlayProps={{zIndex: 201}}
    >
      <Flex direction="column" align="center" justify="center" gap={30} p="xl">
        <Loader />
        <Text fw={500} fz="lg" ta="center">
          { uiStore.loadingMessage }
        </Text>
      </Flex>
    </Modal>
  );
});

const App = observer(() => {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS withCSSVariables theme={{colorScheme: uiStore.theme, ...MantineTheme}}>
      <ModalsProvider>
        <main>
          <SaveModal />
          { rootStore.loaded ? <AppRoutes /> : null }
          <LoaderModal />
        </main>
      </ModalsProvider>
    </MantineProvider>
  );
});

export default App;
