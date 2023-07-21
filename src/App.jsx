import {observer} from "mobx-react-lite";
import {rootStore} from "Stores";
import Header from "Components/header/Header.jsx";

import {Text, Button, Paper, Loader} from "@mantine/core";
import {BrowserRouter, Outlet, Routes, Route} from "react-router-dom";

const Components = observer(() => {
  return (
    <>
      <Loader m="xl" size="xl"/>
      <Paper shadow="sm" p="md">Paper?: { rootStore.testValue }</Paper>
      <Button onClick={() => rootStore.Increment()} shadow="xl" m="sm">Test Button</Button>
      <Text m="sm">Test Text</Text>
    </>
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

const Layout = observer(() => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
});

const App = observer(() => {
  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<Components />} />
            <Route path="/page1" element={<Page1 />} />
            <Route path="/page2" element={<Page2 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </main>
  )
});

export default App;
