import {Container, Button, Burger, Flex, Header} from "@mantine/core";
import {Link} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {uiStore} from "Stores";

const AppHeader = observer(() => {
  return (
    <Header height="xl">
      <Flex justify="flex-start" align="center" m="lg" px="xl" gap={50}>
        <Burger size="md" opened={uiStore.showSideNav} onClick={() => uiStore.SetShowSideNav(!uiStore.showSideNav)} />
        <Link to="/">Header</Link>
        <Link to="/page1">Page1</Link>
        <Link to="/page2">Page2</Link>
        <Link to="/marketplaces">Marketplaces</Link>
        <Button onClick={() => uiStore.SetTheme(uiStore.theme === "light" ? "dark" : "light")}>
          Toggle Theme
        </Button>
      </Flex>
    </Header>
  );
});

export default AppHeader;
