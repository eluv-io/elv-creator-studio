import {useState} from "react";
import {rootStore, editStore, uiStore} from "@/stores";
import {observer} from "mobx-react-lite";
import {
  Container,
  Modal,
  Group,
  Stack,
  Text,
  Title,
  Button,
  Accordion,
  Box,
  Textarea
} from "@mantine/core";
import InputWrapper from "@/components/inputs/InputWrapper";
import CheckboxCard from "@/components/inputs/CheckboxCard.jsx";
import {IconEdit} from "@tabler/icons-react";

const ModifiedItem = observer(({
  item,
  selected,
  setSelected,
  commitMessages,
  setCommitMessages,
  error
}) => {
  const indentWidth = 25;

  return (
    <InputWrapper
      label={
        <Stack spacing={0}>
          <Text fw={600} fz="lg">{item.name}</Text>
          <Text fz="sm" fw={400} color="dimmed">{rootStore.l10n.components.save_modal.types[item.type]}</Text>
          <Text fz="xs" fw={400} color="dimmed">{item.objectId}</Text>
        </Stack>
      }
      error={error ? rootStore.l10n.components.save_modal.error : undefined}
      withBorder
      p="xl"
      pt="md"
      wrapperProps={{
        styles: theme => ({
          label: {
            fontSize: theme.fontSizes.lg,
            fontWeight: 600,
            opacity: selected.includes(item.objectId) ? 1 : 0.5,
          },
          error: {
            marginTop: theme.spacing.md
          }
        })
      }}
    >
      <CheckboxCard
        mt="lg"
        label="Save Changes"
        checked={selected.includes(item.objectId)}
        onChange={checked => {
          if(checked) {
            setSelected([...selected, item.objectId]);
          } else {
            setSelected(selected.filter(objectId => objectId !== item.objectId));
          }
        }}
      />

      <Accordion variant="contained">
        <Accordion.Item value="default">
          <Accordion.Control icon={<IconEdit />}>
            { rootStore.l10n.components.save_modal.changelist }
          </Accordion.Control>
          <Accordion.Panel mx="md">
            { item.changeList.elements.map(({level=0, value}, index) => {
              const key = `changelist-${item.objectId}-${index}`;
              if(level === 0) {
                return (
                  <Box
                    key={key}
                    mt="sm"
                    pt="sm"
                    sx={theme => ({
                      borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[3]}`,
                    })}
                  >
                    <Title order={5}>
                      { value }
                    </Title>
                  </Box>
                );
              } else if(level === 1) {
                return <Title mt={5} ml={indentWidth} order={6} key={key}>{ value }</Title>;
              } else {
                return <Text ml={2 * indentWidth} fz="sm" key={key}>{ value }</Text>;
              }
            })}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {
        !selected.includes(item.objectId) ? null :
          <Textarea
            mt="xs"
            minRows={2}
            label="Commit Message"
            value={commitMessages[item.objectId] || ""}
            onChange={event => setCommitMessages({...commitMessages, [item.objectId]: event.target.value})}
          />
      }
    </InputWrapper>
  );
});

const SaveModalContent = observer(() => {
  const [selected, setSelected] = useState(editStore.ChangeLists().map(item => item.objectId));
  const [commitMessages, setCommitMessages] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const modifiedItems = (
    editStore.ChangeLists().map(item =>
      <ModifiedItem
        key={`modified-item-${item.objectId}`}
        item={item}
        selected={selected}
        setSelected={setSelected}
        commitMessages={commitMessages}
        setCommitMessages={setCommitMessages}
        error={errors[item.objectId]}
      />
    )
  );

  return (
    <Container p={0} maw={uiStore.inputWidthWide}>
      <Stack>
        { modifiedItems }
      </Stack>
      <Group position="right" mt="xl">
        <Button variant="subtle" w={200} onClick={() => editStore.ToggleSaveModal(false)}>
          { rootStore.l10n.components.actions.cancel }
        </Button>
        <Button
          disabled={selected.length === 0}
          loading={saving}
          w={200}
          onClick={async () => {
            setSaving(true);
            try {
              const errors = await editStore.Save({
                selectedObjectIds: selected,
                commitMessages
              });

              if(Object.keys(errors).length === 0) {
                // Saved successfully
                editStore.ToggleSaveModal(false);
              } else {
                // Errors
                setErrors(errors);
                setSaving(false);
              }
            } catch(error) {
              rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
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
      size={uiStore.inputWidth + 40}
      title={rootStore.l10n.components.save_modal.title}
      padding="xl"
    >
      <SaveModalContent />
    </Modal>
  );
});

export default SaveModal;
