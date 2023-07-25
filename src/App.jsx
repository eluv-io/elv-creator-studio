import {observer} from "mobx-react-lite";
import {rootStore, uiStore} from "Stores";
import AppHeader from "Components/header/AppHeader.jsx";

import {Text, Button, Paper, Loader, Overlay, Modal, Container, Flex, Drawer} from "@mantine/core";
import {BrowserRouter, Outlet, Routes, Route} from "react-router-dom";
import MarketplaceList from "./pages/marketplace/MarketplaceList.jsx";

const Components = observer(() => {
  return (
    <Container fluid>
      <Loader m="xl" size="xl"/>
      <Paper shadow="sm" p="md">Paper?: { rootStore.testValue }</Paper>
      <Button onClick={() => rootStore.Increment()} shadow="xl" m="sm">Test Button</Button>
      <Text m="sm">Test Text</Text>
    </Container>
  )
});

const Page1 = () => {
  return (
    <div>Page 1</div>
  );
}

const Page2 = () => {
  return (
    <div>Page 2</div>
  )
}

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
  )
});

const Layout = observer(() => {
  return (
    <>
      <AppHeader />
      <Container fluid>
        <Drawer title={rootStore.l10n.ui.side_nav.header} opened={uiStore.showSideNav} onClose={() => uiStore.SetShowSideNav(false)}>
          Drawer
        </Drawer>
        <Outlet />
      </Container>
    </>
  );
});

const App = observer(() => {
  return (
    <main>
      <LoaderModal />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<Components />} />
            <Route path="/page1" element={<Page1 />} />
            <Route path="/page2" element={<Page2 />} />
            <Route path="/marketplaces" element={<MarketplaceList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </main>
  )
});

export default App;
