import NavStyles from "@/assets/stylesheets/modules/nav.module.scss";

import {Button, Header, Group} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {editStore} from "@/stores";

const S = (...classes) => classes.map(c => NavStyles[c] || "").join(" ");

const AppHeader = observer(() => {
  return (
    <Header height={50} pr="xl" withBorder={false} className={S("header")}>
      <Group h="100%" position="right" align="end">
        <Button
          w={100}
          disabled={!editStore.hasUnsavedChanges}
          onClick={() => editStore.ToggleSaveModal(true)}
        >
          Save
        </Button>
      </Group>
    </Header>
  );
});

export default AppHeader;
