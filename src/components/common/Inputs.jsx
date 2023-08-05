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
  Container,
  Image,
  Tooltip, NumberInput
} from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {observer} from "mobx-react-lite";
import {useLocation} from "react-router-dom";
import UrlJoin from "url-join";
import {modals} from "@mantine/modals";
import {rootStore} from "Stores";
import {LocalizeString} from "./Misc.jsx";
import {FabricUrl} from "../../helpers/Fabric";
import {useState} from "react";
import FileBrowser from "./FileBrowser";

import {
  X as IconX,
  Plus as IconPlus,
  GripVertical as IconGripVertical,
  InfoCircle as IconInfoCircle
} from "tabler-icons-react";

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

const CheckboxCard = ({
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

const HintIcon = ({hint}) => {
  return (
    <Tooltip label={hint} multiline width={350} events={{ hover: true, focus: true, touch: false }}>
      <Group>
        <IconInfoCircle alt={rootStore.l10n.ui.hints.hint} size={15} />
      </Group>
    </Tooltip>
  );
};

const Input = observer(({
  type="text",
  hint,
  store,
  objectId,
  label,
  path,
  field,
  componentProps={}
}) => {
  const location = useLocation();

  let value = store.GetMetadata({objectId, path, field});

  let Component = TextInput;
  switch(type) {
    case "input":
      value = value || "";
      break;
    case "textarea":
      value = value || "";
      Component = Textarea;
      break;
    case "number":
      Component = NumberInput;
      break;
    case "checkbox":
      Component = Checkbox;
      componentProps.checked = !!value;
      value = undefined;
      break;
  }

  return (
    <Component
      {...componentProps}
      label={
        !hint ? label :
          <Group spacing={5} align="center">
            <Text>{ label }</Text>
            <HintIcon hint={hint} />
          </Group>
      }
      value={value}
      onChange={event => {
        const value = type === "checkbox" ? event.target.checked :
          event?.target ?
            event.target.value :
            event;
        store.SetMetadata({objectId, page: location.pathname, path, field, value});
      }}
    />
  );
});

const SingleImageInput = observer(({
  store,
  objectId,
  label,
  path,
  field
}) => {
  const location = useLocation();

  const [showFileBrowser, setShowFileBrowser] = useState(false);

  const imageMetadata = store.GetMetadata({objectId, path, field});

  let imageUrl;
  if(imageMetadata) {
    imageUrl = FabricUrl({objectId, path: imageMetadata["/"]});
  }

  return (
    <>
      <Paper shadow="sm" withBorder w="max-content" p={30} style={{position: "relative"}}>
        <UnstyledButton onClick={() => setShowFileBrowser(true)}>
          <Image
            withPlaceholder
            height={150}
            width={150}
            src={imageUrl}
            alt={label}
            caption={<Text>{ label }</Text>}
            fit="contain"
          />
        </UnstyledButton>
        {
          !imageMetadata ? null :
            <ActionIcon
              radius="100%"
              style={{position: "absolute", top: "3px", right: "3px"}}
              onClick={event => {
                event.stopPropagation();

                modals.openConfirmModal({
                  title: LocalizeString(rootStore.l10n.ui.inputs.remove, {item: label}),
                  centered: true,
                  children: (
                    <Text size="sm">
                      { LocalizeString(rootStore.l10n.ui.inputs.remove_confirm, {item: label}) }
                    </Text>
                  ),
                  labels: { confirm: rootStore.l10n.ui.actions.remove, cancel: rootStore.l10n.ui.actions.cancel },
                  confirmProps: { color: "red.6" },
                  onConfirm: () => store.SetMetadata({page: location.pathname, objectId, path, field, value: null})
                });
              }}
            >
              <IconX size={20}/>
            </ActionIcon>
        }
      </Paper>
      <FileBrowser
        title={LocalizeString(rootStore.l10n.ui.inputs.select_file, { item: label }, {stringOnly: true})}
        objectId={objectId}
        extensions="image"
        opened={showFileBrowser}
        Submit={({fullPath}) => {
          store.SetMetadata({
            page: location.pathname,
            objectId,
            path,
            field,
            value: {
              auto_update: { tag: "latest" },
              "/": UrlJoin("./files", fullPath)
            }
          });
        }}
        Close={() => setShowFileBrowser(false)}
      />
    </>
  );
});

const ImageInput = observer(({
  store,
  objectId,
  label,
  path,
  fields,
  altTextField
}) => {
  const location = useLocation();

  return (
    <Paper withBorder shadow="sm" p="xl" w="max-content" my="xl">
      <Text>{ label }</Text>
      <Group my="md">
        {
          fields.map(({label, field}) =>
            <SingleImageInput
              key={`image-input-${field}`}
              store={store}
              objectId={objectId}
              path={path}
              label={label}
              field={field}
            />
          )
        }
      </Group>
      {
        !altTextField ? null :
          <Input
            hint={rootStore.l10n.ui.hints.general.image_alt_text}
            page={location.pathname}
            type="textarea"
            store={store}
            objectId={objectId}
            label="Alt Text"
            path={path}
            field={altTextField}
          />
      }
    </Paper>
  );
});

const SimpleList = observer(({
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
              <IconGripVertical />
            </div>
            <Input
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
                      { LocalizeString(rootStore.l10n.ui.inputs.remove_confirm_list_item, {item: fieldLabel.toLowerCase()}) }
                    </Text>
                  ),
                  labels: { confirm: rootStore.l10n.ui.actions.remove, cancel: rootStore.l10n.ui.actions.cancel },
                  confirmProps: { color: "red.6" },
                  onConfirm: () => store.RemoveListElement({objectId, page: location.pathname, path, field, index})
                });
              }}
            >
              <IconX />
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
          <IconPlus />
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

export default {
  Input,
  Text: props => <Input {...props} type="text" />,
  TextArea: props => <Input {...props} type="textarea" />,
  Integer: ({min, max, componentProps, ...props}) =>
    <Input {...props} type="number" componentProps={{min, max, step: 1, ...(componentProps || {})}} />,
  Number: ({min, max, step, precision, componentProps, ...props}) =>
    <Input {...props} type="number" componentProps={{min, max, step, precision, ...(componentProps || {})}} />,

  Checkbox,

  SingleImageInput,
  ImageInput,
  SimpleList
};
