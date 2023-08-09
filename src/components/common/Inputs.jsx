/* eslint-disable react-refresh/only-export-components */

import {
  Input as MantineInput,
  Button,
  Paper,
  ActionIcon,
  Group,
  UnstyledButton,
  Checkbox,
  Text,
  Select,
  TextInput,
  Textarea,
  Container,
  Image,
  Tooltip,
  NumberInput,
  Stack,
  MultiSelect,
  JsonInput, PasswordInput
} from "@mantine/core";
import {DatePickerInput, DateTimePicker} from "@mantine/dates";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {observer} from "mobx-react-lite";
import {useLocation} from "react-router-dom";
import UrlJoin from "url-join";
import {modals} from "@mantine/modals";
import {rootStore} from "Stores";
import {LocalizeString} from "./Misc.jsx";
import {FabricUrl} from "../../helpers/Fabric";
import {useEffect, useState} from "react";
import FileBrowser from "./FileBrowser";
import RichTextEditor from "./RichTextEditor.jsx";
import {ParseDate} from "../../helpers/Misc";
import {v4 as UUID, parse as UUIDParse} from "uuid";

import {
  IconX,
  IconPlus,
  IconGripVertical,
  IconQuestionMark
} from "@tabler/icons-react";

// Icon with hint tooltip on hover
const HintIcon = ({hint, componentProps={}}) => {
  return (
    <Tooltip label={hint} multiline maw={350} w="max-content" withArrow position="top-start" events={{ hover: true, focus: true, touch: false }}>
      <Group {...componentProps} style={{cursor: "help", ...(componentProps?.style || {})}}>
        <IconQuestionMark alt={hint} size={12} strokeWidth={1} />
      </Group>
    </Tooltip>
  );
};

// Field label - includes hint icon if hint is specified
const InputLabel = ({label, hint}) => {
  return (
    !hint ? label :
      <Group spacing={5} align="center">
        <Text>{ label }</Text>
        <HintIcon hint={hint} />
      </Group>
  );
};


// General input
const Input = observer(({
  type="text",
  store,
  objectId,
  path,
  field,
  options,
  label,
  description,
  hint,
  defaultValue,
  clearable,
  componentProps={}
}) => {
  const location = useLocation();

  useEffect(() => {
    // Ensure the default value is set for this field if the field is not yet defined
    if((type === "uuid" || typeof defaultValue !== "undefined") && typeof store.GetMetadata({objectId, path, field}) === "undefined") {
      let value = defaultValue;
      if(type === "uuid") {
        value = store.utils.B58(UUIDParse(UUID()));
      }

      store.SetDefaultValue({objectId, path, field, value});
    }
  });

  let value = store.GetMetadata({objectId, path, field});

  let Component = TextInput;
  switch(type) {
    case "text":
      value = value || "";
      break;
    case "textarea":
      value = value || "";
      Component = Textarea;
      break;
    case "number":
      // Additional options: min, max, step
      Component = NumberInput;
      break;
    case "uuid":
      componentProps.disabled = true;
      value = value || "";
      break;
    case "json":
      Component = JsonInput;
      componentProps.formatOnBlur = true;
      break;
    case "select":
      Component = Select;
      componentProps.searchable = true;
      componentProps.data = options;
      break;
    case "multiselect":
      Component = MultiSelect;
      componentProps.searchable = true;
      componentProps.data = options;
      break;
    case "date":
      Component = DatePickerInput;
      componentProps.valueFormat = "LL";
      value = ParseDate(value);
      break;
    case "datetime":
      Component = DateTimePicker;
      componentProps.valueFormat = "LLL ZZ";
      value = ParseDate(value);
      break;
  }

  if(clearable) {
    componentProps.rightSection = (
      <Tooltip label={rootStore.l10n.ui.inputs.clear} position="top-end" withArrow>
        <ActionIcon mr="xs" onClick={() => store.SetMetadata({objectId, page: location.pathname, path, field, value: type === "number" ? undefined : ""})}>
          <IconX size={15} />
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Component
      // Ensure uncontrolled -> controlled transition doesn't print a warning when default value isn't set
      key={typeof defaultValue === "undefined" ? undefined : `component-${field}-${typeof value === "undefined" ? "uncontrolled" : "controlled"}`}
      mb="md"
      {...componentProps}
      label={<InputLabel label={label} hint={hint} />}
      description={description}
      value={value}
      onChange={event => {
        let value = event?.target ? event.target.value : event;

        if(type === "number" && !value) {
          // Set missing numbers to undefined instead of empty string
          value = undefined;
        } else if(["date", "datetime"].includes(type)) {
          value = value ? value.toISOString() : undefined;
        }

        store.SetMetadata({objectId, page: location.pathname, path, field, value});
      }}
    />
  );
});

const SHA512 = async (str) => {
  if(!str) { return ""; }

  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str));
  return Array.prototype.map.call(new Uint8Array(buf), x=>(("00"+x.toString(16)).slice(-2))).join("");
};

const Password = observer(({
  store,
  objectId,
  path,
  field,
  label,
  description,
  hint,
  componentProps={}
}) => {
  const location = useLocation();

  const value = store.GetMetadata({objectId, path, field});
  const [password, setPassword] = useState(value);
  const [changed, setChanged] = useState(false);

  return (
    <PasswordInput
      {...componentProps}
      label={<InputLabel label={label} hint={hint} />}
      description={description}
      mb="md"
      onFocus={() => setPassword("")}
      onBlur={async () => {
        if(!changed) {
          setPassword(value);
        } else {
          const digest = await SHA512(password);
          setPassword(digest);
          store.SetMetadata({objectId, page: location.pathname, path, field, value: digest});
          setChanged(false);
        }
      }}
      value={password}
      onChange={event => {
        setChanged(true);
        setPassword(event.target.value);
      }}
    />
  );
});

// Checkbox
const CheckboxCard = observer(({
  store,
  objectId,
  path,
  field,
  defaultValue=false,
  label,
  description,
  hint,
  componentProps={}
}) => {
  const location = useLocation();

  useEffect(() => {
    // Ensure the default value is set for this field if the field is not yet defined
    if(typeof store.GetMetadata({objectId, path, field}) === "undefined") {
      store.SetDefaultValue({objectId, path, field, value: defaultValue});
    }
  });

  let value = !!store.GetMetadata({objectId, path, field});

  return (
    <UnstyledButton
      style={{display: "block"}}
      onClick={() => store.SetMetadata({actionType: "TOGGLE_FIELD", objectId, page: location.pathname, path, field, value: !value})}
    >
      <Paper withBorder p="xl" pt="md" pb="lg" mb="md" w="max-content">
        <MantineInput.Wrapper
          pr={50}
          label={<InputLabel label={label} hint={hint} />}
          description={description}
          style={{position: "relative", display: "flex", flexDirection: "column", justifyContent: "center"}}
        >
          <Checkbox
            style={{position: "absolute", right: -25}}
            {...componentProps}
            checked={value}
            onChange={() => {}}
            tabIndex={-1}
            size="md"
            mr="xl"
            styles={{ input: { cursor: "pointer" } }}
          />
        </MantineInput.Wrapper>
      </Paper>
    </UnstyledButton>
  );
});

// Rich text
const RichTextInput = observer(({store, objectId, path, field, label, description, hint}) => {
  const location = useLocation();
  const [showEditor, setShowEditor] = useState(false);

  return (
    <Paper withBorder={showEditor} p={showEditor ? "xl" : 0} pt={showEditor ? "md" : 0} mb="md" w={showEditor ? undefined : "max-content"}>
      <MantineInput.Wrapper label={<InputLabel label={label} hint={hint} />} description={description} style={{position: "relative"}}>
        {
          !showEditor ? null :
            <Container p={0} m={0} my="xl">
              <RichTextEditor store={store} objectId={objectId} page={location.pathname} path={path} field={field} />
            </Container>
        }
        <Group mt={showEditor ? 0 : "xs"}>
          {
            showEditor ?
              <Button
                size="sm"
                variant="light"
                onClick={() => setShowEditor(false)}
                style={{position: "absolute", top: 0, right: 0}}
              >
                { rootStore.l10n.ui.inputs.hide_editor }
              </Button> :
              <Button
                size="xs"
                onClick={() => setShowEditor(true)}
              >
                { rootStore.l10n.ui.inputs.show_editor }
              </Button>
          }
        </Group>
      </MantineInput.Wrapper>
    </Paper>
  );
});

// Single image
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

// Multiple images, including optional alt text input
const ImageInput = observer(({
  store,
  objectId,
  path,
  fields,
  altTextField,
  label,
  description,
  hint
}) => {
  const location = useLocation();

  return (
    <Paper withBorder shadow="sm" p="xl" pt="md" w="max-content" mb="md">
      <MantineInput.Wrapper label={<InputLabel label={label} hint={hint} />} description={description}>
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
      </MantineInput.Wrapper>
    </Paper>
  );
});

// List of inputs with the same type
const SimpleList = observer(({
  type="text",
  store,
  objectId,
  path,
  field,
  label,
  hint,
  description,
  fieldLabel,
}) => {
  const location = useLocation();
  const values = (store.GetMetadata({objectId, path, field}) || []);

  const items = values.map((value, index) => (
    <Draggable key={`item-${index}`} index={index} draggableId={`item-${index}`}>
      {(provided, snapshot) => (
        <Paper
          withBorder
          shadow={snapshot.isDragging ? "lg" : ""}
          p="sm"
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
    <Paper withBorder p="xl" pt="md" m={0} mb="xl">
      <MantineInput.Wrapper label={<InputLabel label={label} hint={hint} />} description={description} style={{position: "relative"}}>
        <Container p={0} m={0} mt="lg">
          <DragDropContext
            onDragEnd={({source, destination}) =>
              store.MoveListElement({objectId, page: location.pathname, path, field, index: source.index, newIndex: destination.index})
            }
          >
            <Droppable droppableId="simple-list" direction="vertical">
              {provided => (
                <Stack p={0} spacing="xs" {...provided.droppableProps} ref={provided.innerRef}>
                  { items }
                  { provided.placeholder }
                </Stack>
              )}
            </Droppable>
          </DragDropContext>
          <Group position="right" style={{position: "absolute", top: 5, right: 0}}>
            <ActionIcon
              title={LocalizeString(rootStore.l10n.ui.inputs.add, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
              aria-label={LocalizeString(rootStore.l10n.ui.inputs.add, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
              onClick={() => store.InsertListElement({objectId, page: location.pathname, path, field, value: ""})}
            >
              <IconPlus />
            </ActionIcon>
          </Group>
        </Container>
      </MantineInput.Wrapper>
    </Paper>
  );
});

export default {
  Text: props => <Input {...props} type="text" />,
  TextArea: props => <Input {...props} type="textarea" />,
  UUID: props => <Input {...props} type="uuid" />,
  JSON: props => <Input {...props} type="json" />,
  Integer: ({min, max, componentProps, ...props}) =>
    <Input {...props} type="number" componentProps={{min, max, step: 1, ...(componentProps || {})}} />,
  Number: ({min, max, step, precision, componentProps, ...props}) =>
    <Input {...props} type="number" componentProps={{min, max, step, precision, ...(componentProps || {})}} />,
  Select: props => <Input {...props} type="select" />,
  MultiSelect: props => <Input {...props} type="multiselect" />,
  Date: props => <Input {...props} type="date" />,
  DateTime: props => <Input {...props} type="datetime" />,
  RichText: RichTextInput,
  Password,
  Checkbox: CheckboxCard,
  SingleImageInput,
  ImageInput,
  SimpleList
};
