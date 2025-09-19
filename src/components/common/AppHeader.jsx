import NavStyles from "@/assets/stylesheets/modules/nav.module.scss";

import {Modal, Button, Group, Select} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {editStore, rootStore, uiStore} from "@/stores";
import {useEffect, useState} from "react";
import LanguageCodes from "@/assets/localization/LanguageCodes.js";
import {StorageHandler} from "@/helpers/Misc.js";

const S = (...classes) => classes.map(c => NavStyles[c] || "").join(" ");

let recentLanguageKeys = (StorageHandler.get({type: "local", key: "recent-language-keys"}) || "").split(",").filter(k => k);
const LocalizationModal = observer(({opened, Close}) => {
  const [localization, setLocalization] = useState(rootStore.localizationKey || "");

  useEffect(() => {
    setLocalization(rootStore.localizationKey || "");
  }, [opened]);

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
        onChange={value => {
          setLocalization(value);
          recentLanguageKeys = [
            value,
            ...recentLanguageKeys
          ]
            .filter((v, i, a) => a.indexOf(v) === i);

          StorageHandler.set({
            type: "local",
            key: "recent-language-keys",
            value: recentLanguageKeys.join(",")
          });
        }}
        data={
          [
            ...recentLanguageKeys,
            ...Object.keys(LanguageCodes)
          ]
            .filter((v, i, a) => a.indexOf(v) === i)
            .map(key => ({
              label: `[${key}] - ${LanguageCodes[key]}`,
              value: key
            }))
        }
      />
      <Group position="right" mt={40}>
        <Button
          w={170}
          variant="subtle"
          onClick={() => Close(true)}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          w={170}
          onClick={() => {
            rootStore.SetLocalizationKey(undefined);
            Close(true);
          }}
        >
          Clear Localization
        </Button>
        <Button
          w={170}
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
