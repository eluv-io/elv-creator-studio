import {Flex, Header, ActionIcon} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {uiStore} from "Stores";

import {IconBrightnessUpFilled} from "@tabler/icons-react";

const AppHeader = observer(() => {
  return (
    <Header height={60}>
      <Flex justify="flex-end" align="center" m="lg" px="xl" gap={50}>
        <ActionIcon onClick={() => uiStore.SetTheme(uiStore.theme === "light" ? "dark" : "light")}>
          <IconBrightnessUpFilled />
        </ActionIcon>
      </Flex>
    </Header>
  );
});

export default AppHeader;
