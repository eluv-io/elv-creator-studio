import {observer} from "mobx-react-lite";
import {Container, Title} from "@mantine/core";
import HistoryButtons from "./HistoryButtons.jsx";

const PageContent = observer(({title, section, useHistory, children}) => {
  return (
    <Container p="md" pb={100} fluid>
      <Title mb="xl">{ title }</Title>
      { section && useHistory ? <HistoryButtons section={section} /> : null }
      { children }
    </Container>
  );
});

export default PageContent;
