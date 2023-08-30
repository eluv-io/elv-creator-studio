import {observer} from "mobx-react-lite";
import {Container, Title, ActionIcon, Group} from "@mantine/core";
import HistoryButtons from "./HistoryButtons.jsx";
import {Link} from "react-router-dom";
import {rootStore} from "@/stores";

import {IconArrowBackUp} from "@tabler/icons-react";

const PageContent = observer(({title, section, useHistory, backLink, children}) => {
  return (
    <Container p="md" pb={100} fluid>
      {
        !title ? null :
          <Title order={2} mb="xl">
            <Group align="top">
              {
                !backLink ? null :
                  <ActionIcon
                    aria-label={rootStore.l10n.components.actions.back}
                    title={rootStore.l10n.components.actions.back}
                    component={Link}
                    to={backLink}
                  >
                    <IconArrowBackUp size={30}/>
                  </ActionIcon>
              }
              {title}
            </Group>
          </Title>
      }
      { section && useHistory ? <HistoryButtons section={section} /> : null }
      { children }
    </Container>
  );
});

export default PageContent;
