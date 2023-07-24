import {Container, Button} from "@mantine/core";
import {Link} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {uiStore} from "Stores";

const Header = observer(() => {
  return (
    <header>
      <Container m="xl" p="xl" fluid>
        <Link to="/">Header</Link>
        <Link to="/page1">Page1</Link>
        <Link to="/page2">Page2</Link>
        <Link to="/marketplaces">Marketplaces</Link>
        <Button
          onClick={() => uiStore.SetTheme(uiStore.theme === "light" ? "dark" : "light")}
        >
          Toggle Theme
        </Button>
      </Container>
    </header>
  );
});

export default Header;
