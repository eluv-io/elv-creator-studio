import {observer} from "mobx-react-lite";

import {Text,  Loader, Modal, Flex,  MantineProvider} from "@mantine/core";
import {ModalsProvider} from "@mantine/modals";
import MantineTheme from "Assets/MantineTheme";

import {rootStore, uiStore} from "Stores";

import AppRoutes from "./Routes.jsx";

// Shows an overlay when something in the app is loading
const LoaderModal = observer(() => {
  return (
    <Modal
      opened={uiStore.loading}
      centered
      withCloseButton={false}
      onClose={() => {}}
      size="lg"
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
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{colorScheme: uiStore.theme, ...MantineTheme}}>
      <ModalsProvider>
        <main>
          <LoaderModal />
          { rootStore.loaded ? <AppRoutes /> : null }
        </main>
      </ModalsProvider>
    </MantineProvider>
  );
});

export default App;
