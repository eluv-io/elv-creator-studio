import {useState} from "react";
import {rootStore, editStore} from "Stores";
import {observer} from "mobx-react-lite";
import Inputs from "Components/inputs/Inputs";
import {
  Container,
  Modal,
  Paper,
  Checkbox,
  Group,
  Stack,
  Text,
  Title,
  UnstyledButton,
  Button,
  Accordion
} from "@mantine/core";
import CheckboxCard from "../inputs/CheckboxCard.jsx";
import {IconEdit} from "@tabler/icons-react";
import {LocalizeString} from "./Misc.jsx";

const FormatChangeList = changelist => {
  let formattedChangeList = {
    uncategorized: []
  };

  changelist.actions.forEach((action) => {
    if(!rootStore.l10n.actions[action.actionType]) { return; }

    if(!action.label) {
      rootStore.DebugLog({message: "Unlabelled action", level: rootStore.logLevels.DEBUG_LEVEL_MEDIUM});
      rootStore.DebugLog({message: action, level: rootStore.logLevels.DEBUG_LEVEL_MEDIUM});
      return;
    }

    if(!action.category) {
      formattedChangeList.uncategorized.push(action);
      return;
    }

    formattedChangeList[action.category] = formattedChangeList[action.category] || { uncategorized: [] };

    if(!action.subcategory) {
      formattedChangeList[action.category].uncategorized.push(action);
    } else {
      formattedChangeList[action.category][action.subcategory] = formattedChangeList[action.category][action.subcategory] || [];
      formattedChangeList[action.category][action.subcategory].push(action);
    }
  });

  let changelistString = [];
  Object.keys(formattedChangeList).forEach(category => {
    if(category === "uncategorized") { return; }

    changelistString.push(`${category}:`);

    Object.keys(formattedChangeList[category]).forEach(subcategory => {
      if(subcategory === "uncategorized") { return; }

      changelistString.push(`  ${subcategory}:`);
      formattedChangeList[category][subcategory].forEach(action =>
        changelistString.push(`    ${LocalizeString(rootStore.l10n.actions[action.actionType], {label: action.label})}`)
      );
    });

    if(formattedChangeList[category].uncategorized.length > 0) {
      changelistString.push("  Other Changes:");
      formattedChangeList[category].uncategorized.forEach(action =>
        changelistString.push(`    ${LocalizeString(rootStore.l10n.actions[action.actionType], {label: action.label})}`)
      );
    }
  });

  if(formattedChangeList.uncategorized.length > 0) {
    changelistString.push("Other Changes:");
    formattedChangeList.uncategorized.forEach(action =>
      changelistString.push(`  ${LocalizeString(rootStore.l10n.actions[action.actionType], {label: action.label})}`)
    );
  }


  console.log(changelistString.join("\n"));

  return formattedChangeList;
};

const ModifiedItem = observer(({item, excludeList, setExcludeList}) => {
  console.log(FormatChangeList(item));
  return (
    <Paper withBorder p="xl">
      <CheckboxCard
        label={item.name}
        description={item.objectId}
        checked={!excludeList[item.objectId]}
        onChange={() => setExcludeList({...excludeList, [item.objectId]: !excludeList[item.objectId]})}
      />

      <Accordion variant="contained" defaultValue="default">
        <Accordion.Item value="default">
          <Accordion.Control icon={<IconEdit />}>
            { rootStore.l10n.components.save_modal.changelist }
          </Accordion.Control>
          <Accordion.Panel>
            { item.actions.map((action, index) =>
              <Group key={`action-${item.objectId}-${index}`}>
                <Text>{action.actionType}</Text>
                <Text>{action.category} | { action.subcategory } | { action.label }</Text>
              </Group>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
});

const SaveModalContent = observer(() => {
  const [excludeList, setExcludeList] = useState({});
  const [saving, setSaving] = useState(false);

  const modifiedItems = (
    editStore.changeList.map((item) =>
      <ModifiedItem
        key={`modified-item-${item.objectId}`}
        item={item}
        excludeList={excludeList}
        setExcludeList={setExcludeList}
      />
    )
  );

  return (
    <Container p={0}>
      <Stack>
        { modifiedItems }
      </Stack>
      <Group position="right" mt="xl">
        <Button variant="subtle" w={200} onClick={() => editStore.ToggleSaveModal(false)}>
          { rootStore.l10n.components.actions.cancel }
        </Button>
        <Button
          loading={saving}
          w={200}
          onClick={async () => {
            setSaving(true);
            try {
              await editStore.Save(excludeList);
            } catch(error) {
              setSaving(false);
            }
          }}
        >
          { rootStore.l10n.components.actions.save }
        </Button>
      </Group>
    </Container>
  );
});

const SaveModal = observer(() => {
  return (
    <Modal
      opened={editStore.showSaveModal}
      onClose={() => editStore.ToggleSaveModal(false)}
      centered
      size={600}
      title={rootStore.l10n.components.save_modal.title}
      padding="xl"
    >
      <SaveModalContent />
    </Modal>
  );
});

export default SaveModal;
