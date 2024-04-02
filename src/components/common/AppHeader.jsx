import NavStyles from "@/assets/stylesheets/modules/nav.module.scss";

import {Button} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {editStore} from "@/stores";

const S = (...classes) => classes.map(c => NavStyles[c] || "").join(" ");

const AppHeader = observer(() => {
  return (
    <Button
      w={100}
      disabled={!editStore.hasUnsavedChanges}
      onClick={() => editStore.ToggleSaveModal(true)}
      className={S("header__save")}
    >
      Save
    </Button>
  );
});

export default AppHeader;
