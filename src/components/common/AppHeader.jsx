import NavStyles from "@/assets/stylesheets/modules/nav.module.scss";

import {Button, Header} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {editStore} from "@/stores";

const S = (...classes) => classes.map(c => NavStyles[c] || "").join(" ");

const AppHeader = observer(() => {
  return (
    <Header height={50} pr="xl" withBorder={false} className={S("header")}>
      <Button
        w={100}
        disabled={!editStore.hasUnsavedChanges}
        onClick={() => editStore.ToggleSaveModal(true)}
        className={S("header__save")}
      >
        Save
      </Button>
    </Header>
  );
});

export default AppHeader;
