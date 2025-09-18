import NavStyles from "@/assets/stylesheets/modules/nav.module.scss";

import {Modal, Button, Group, Select} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {editStore, rootStore, uiStore} from "@/stores";
import {useState} from "react";
import LanguageCodes from "@/assets/localization/LanguageCodes.js";

const S = (...classes) => classes.map(c => NavStyles[c] || "").join(" ");

const LocalizationModal = observer(({opened, Close}) => {
  const [localization, setLocalization] = useState(rootStore.localizationKey || "");

  return (
    <Modal
      opened={opened}
      onClose={Close}
      centered
      size={uiStore.inputWidth + 40}
      title={rootStore.l10n.components.localization_modal.title}
      padding="xl"
    >
      <Select
        label="Language"
        value={localization}
        withinPortal={true}
        searchable
        defaultValue=""
        clearable
        placeholder="Select Language"
        onChange={value => setLocalization(value)}
        data={
          Object.keys(LanguageCodes).map(key => ({
            label: `[${key}] - ${LanguageCodes[key]}`,
            value: key
          }))
        }
      />
      <Group position="right" mt={40}>
        <Button
          w={200}
          variant="subtle"
          onClick={() => Close(true)}
        >
          Cancel
        </Button>
        <Button
          w={200}
          onClick={() => {
            rootStore.SetLocalizationKey(localization);
            Close(true);
          }}
        >
          Set Localization
        </Button>
      </Group>
    </Modal>
  );
});

const AppHeader = observer(() => {
  const [showLocalizationModal, setShowLocalizationModal] = useState(false);

  return (
    <>
      <Group spacing="xs" className={S("header__actions")}>
        <Button
          miw={100}
          variant={rootStore.localizing ? "outline" : "subtle"}
          onClick={() => setShowLocalizationModal(true)}
        >
          {
            rootStore.localizationKey ?
              `[${rootStore.localizationKey}] - ${LanguageCodes[rootStore.localizationKey]}` :
              "Localize"
          }
        </Button>
        <Button
          w={100}
          disabled={!editStore.hasUnsavedChanges}
          onClick={() => editStore.ToggleSaveModal(true)}
        >
          Save
        </Button>
      </Group>
      <LocalizationModal
        opened={showLocalizationModal}
        Close={() => setShowLocalizationModal(false)}
      />

    </>
  );
});

export default AppHeader;
