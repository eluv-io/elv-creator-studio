import {
  Paper,
  ActionIcon,
  Group,
  UnstyledButton,
  Checkbox,
  Text,
  Select,
  TextInput,
  createStyles,
  rem,
  Textarea,
  Container
} from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {observer} from "mobx-react-lite";
import {useLocation} from "react-router-dom";
import UrlJoin from "url-join";

import {X as XIcon, Plus as PlusIcon, GripVertical as GripVerticalIcon} from "tabler-icons-react";
import {modals} from "@mantine/modals";
import {rootStore} from "Stores";
import {LocalizeString} from "./Misc.jsx";

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: rem(60),
    paddingTop: rem(18),
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

export function ContainedInputs() {
  const { classes } = useStyles();

  return (
    <div>
      <TextInput label="Shipping address" placeholder="15329 Huston 21st" classNames={classes} />

      <Select
        mt="md"
        withinPortal
        data={["React", "Angular", "Svelte", "Vue"]}
        placeholder="Pick one"
        label="Your favorite library/framework"
        classNames={classes}
      />

      <DateTimePicker
        mt="md"
        popoverProps={{ withinPortal: true }}
        label="Departure date"
        placeholder="When will you leave?"
        classNames={classes}
        clearable={false}
      />
    </div>
  );
}

const checkboxCardStyles = createStyles((theme) => ({
  button: {
    display: "flex",
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[3]
    }`,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xl,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[0],
    },
  },
}));

export const CheckboxCard = ({
  checked,
  defaultChecked,
  onChange,
  title,
  description,
  className,
  ...args
}) => {
  const { classes, cx } = checkboxCardStyles();

  const [value, handleChange] = useUncontrolled({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  return (
    <UnstyledButton
      {...args}
      onClick={() => handleChange(!value)}
      className={cx(classes.button, className)}
    >
      <Checkbox
        checked={value}
        onChange={() => {}}
        tabIndex={-1}
        size="md"
        mr="xl"
        styles={{ input: { cursor: "pointer" } }}
      />
      <div>
        <Text fw={500} mb={7} sx={{ lineHeight: 1 }}>
          {title}
        </Text>
        <Text fz="sm" c="dimmed">
          {description}
        </Text>
      </div>
    </UnstyledButton>
  );
};

export const ActionInput = observer(({
  type="text",
  store,
  objectId,
  label,
  path,
  field,
  componentProps={}
}) => {
  const location = useLocation();

  let Component = TextInput;
  switch(type) {
    case "textarea":
      Component = Textarea;
      break;
  }

  return (
    <Component
      {...componentProps}
      label={label}
      value={store.GetMetadata({objectId, path, field})}
      onChange={event => store.SetMetadata({objectId, page: location.pathname, path, field, value: event.target.value})}
    />
  );
});


export const SimpleList = observer(({
  type="text",
  store,
  objectId,
  label,
  path,
  field,
  fieldLabel
}) => {
  const location = useLocation();
  const values = (store.GetMetadata({objectId, path, field}) || []);

  const items = values.map((value, index) => (
    <Draggable key={`item-${index}`} index={index} draggableId={`item-${index}`}>
      {(provided, snapshot) => (
        <Paper
          shadow={snapshot.isDragging ? "lg" : "xs"}
          p="sm"
          mb="xs"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Group align="start">
            <div style={{cursor: "grab"}} {...provided.dragHandleProps}>
              <GripVerticalIcon />
            </div>
            <ActionInput
              type={type}
              store={store}
              objectId={objectId}
              path={UrlJoin(path, field)}
              field={index.toString()}
              label={fieldLabel}
              componentProps={{style: {flexGrow: "1"}}}
            />
            <ActionIcon
              title={LocalizeString(rootStore.l10n.ui.inputs.remove, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
              aria-label={LocalizeString(rootStore.l10n.ui.inputs.remove, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
              onClick={() => {
                modals.openConfirmModal({
                  title: LocalizeString(rootStore.l10n.ui.inputs.remove, {item: fieldLabel.toLowerCase()}),
                  centered: true,
                  children: (
                    <Text size="sm">
                      { LocalizeString(rootStore.l10n.ui.inputs.remove_confirm, {item: fieldLabel.toLowerCase()}) }
                    </Text>
                  ),
                  labels: { confirm: rootStore.l10n.ui.actions.remove, cancel: rootStore.l10n.ui.actions.cancel },
                  confirmProps: { color: "red.6" },
                  onConfirm: () => store.RemoveListElement({objectId, page: location.pathname, path, field, index})
                });
              }}
            >
              <XIcon />
            </ActionIcon>
          </Group>
        </Paper>
      )}
    </Draggable>
  ));


  return (
    <Container p={0} m={0} my={20}>
      <Group mb={10}>
        <Text>{ label }</Text>
        <ActionIcon
          title={LocalizeString(rootStore.l10n.ui.inputs.add, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
          aria-label={LocalizeString(rootStore.l10n.ui.inputs.add, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
          onClick={() => store.InsertListElement({objectId, page: location.pathname, path, field, value: ""})}
        >
          <PlusIcon />
        </ActionIcon>
      </Group>
      <Container p={0} m={0} w={500}>
        <DragDropContext
          onDragEnd={({source, destination}) =>
            store.MoveListElement({objectId, page: location.pathname, path, field, index: source.index, newIndex: destination.index})
          }
        >
          <Droppable droppableId="simple-list" direction="vertical">
            {provided => (
              <Container p={0} {...provided.droppableProps} ref={provided.innerRef}>
                { items }
                { provided.placeholder }
              </Container>
            )}
          </Droppable>
        </DragDropContext>
      </Container>
    </Container>
  );
});
