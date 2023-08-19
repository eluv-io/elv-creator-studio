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

const ModifiedItem = observer(({item, excludeList, setExcludeList}) => {
  return (
    <Paper withBorder p="xl">
      <CheckboxCard
        label={item.name}
        description={item.objectId}
        checked={!excludeList[item.objectId]}
        onChange={() => setExcludeList({...excludeList, [item.objectId]: !excludeList[item.objectId]})}
      />

      <Accordion variant="contained">
        <Accordion.Item value="default">
          <Accordion.Control icon={<IconEdit />}>
            { rootStore.l10n.components.save_modal.changelist }
          </Accordion.Control>
          <Accordion.Panel>
            { item.actions.map((action, index) =>
              <Group key={`action-${item.objectId}-${index}`}>
                <Text>{action.actionType}</Text>
                <Text>{action.key}</Text>
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
