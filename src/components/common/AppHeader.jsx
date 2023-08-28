import {Button, Flex, Header, ActionIcon} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {editStore, uiStore} from "Stores";

import {IconBrightnessUpFilled} from "@tabler/icons-react";

const AppHeader = observer(() => {
  return (
    <Header height={60}>
      <Flex justify="flex-end" align="center" h="100%" px="xl" gap={50}>
        {
          !editStore.hasUnsavedChanges ? null :
            <Button onClick={() => editStore.ToggleSaveModal(true)}>
              Save
            </Button>
        }
        <ActionIcon onClick={() => uiStore.SetTheme(uiStore.theme === "light" ? "dark" : "light")}>
          <IconBrightnessUpFilled />
        </ActionIcon>
      </Flex>
    </Header>
  );
});

export default AppHeader;
