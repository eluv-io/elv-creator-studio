import {Container} from "@mantine/core";
import {Link} from "react-router-dom";

const Header = () => {
  return (
    <header>
      <Container m="xl" p="xl" fluid>
        <Link to="/">Header</Link>
        <Link to="/page1">Page1</Link>
        <Link to="/page2">Page2</Link>
      </Container>
    </header>
  );
};

export default Header;
