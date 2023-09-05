import {observer} from "mobx-react-lite";
import {Container, Title, Group} from "@mantine/core";
import HistoryButtons from "./HistoryButtons.jsx";
import {Link} from "react-router-dom";
import {rootStore} from "@/stores";

import {IconArrowBackUp} from "@tabler/icons-react";
import {IconButton} from "@/components/common/Misc";

const PageContent = observer(({title, subtitle, section, useHistory, backLink, children}) => {
  return (
    <Container p="md" pb={200} fluid>
      {
        !title ? null :
          <Title order={2} mb={subtitle ? 0 : "xl"}>
            <Group align="center">
              {
                !backLink ? null :
                  <IconButton
                    label={rootStore.l10n.components.actions.back}
                    component={Link}
                    to={backLink}
                    icon={<IconArrowBackUp size={30} />}
                  />
              }
              {title}
            </Group>
          </Title>
      }
      { !subtitle ? null : <Title order={6} color="dimmed" mb="xl">{ subtitle }</Title>}
      { section && useHistory ? <HistoryButtons section={section} /> : null }
      { children }
    </Container>
  );
});

export default PageContent;
