import {observer} from "mobx-react-lite";
import {Container, Title, Group} from "@mantine/core";
import HistoryButtons from "./HistoryButtons.jsx";
import {Link} from "react-router-dom";
import {rootStore, uiStore} from "@/stores";

import {IconArrowBackUp} from "@tabler/icons-react";
import {IconButton} from "@/components/common/Misc";

const PageContent = observer(({
  title,
  titleContent,
  subtitle,
  section,
  useHistory,
  backLink,
  action,
  children
}) => {
  return (
    <Container p="md" pb={200} pr={50} pl="xl" fluid style={{position: "relative"}}>
      {
        !action ? null :
          <Group style={{position: "absolute", right: 50}}>
            { action }
          </Group>
      }
      {
        !title ? null :
          <Title order={2} mb={subtitle ? 0 : "xl"} maw={uiStore.inputWidthWide}>
            <Group position="apart" align="center">
              <Group align="center" noWrap>
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
              { titleContent }
            </Group>
          </Title>
      }
      { !subtitle ? null : <Title order={6} color="dimmed" mb="xl" maw={uiStore.inputWidthWide}>{ subtitle }</Title>}
      { section && useHistory ? <HistoryButtons section={section} /> : null }
      { children }
    </Container>
  );
});

export default PageContent;
