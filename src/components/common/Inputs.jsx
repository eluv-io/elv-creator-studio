/* eslint-disable react-refresh/only-export-components */

import "Assets/stylesheets/rich-text.scss";

import {
  Input as MantineInput,
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
  JsonInput, PasswordInput, ScrollArea
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
import {Prism} from "@mantine/prism";
import {ValidateUrl, ValidateCSS} from "Components/common/Validation.jsx";
import SanitizeHTML from "sanitize-html";

import {
  IconX,
  IconPlus,
  IconGripVertical,
  IconQuestionMark,
  IconPhotoX,
  IconEdit,
  IconEditOff
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
  placeholder,
  defaultValue,
  clearable,
  searchable,
  disabled,
  Validate,
  validateOnLoad=true,
  componentProps={}
}) => {
  const [error, setError] = useState(undefined);
  const location = useLocation();
  const [changed, setChanged] = useState(false);

  let value = store.GetMetadata({objectId, path, field});

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

  useEffect(() => {
    if(!Validate || (!changed && !validateOnLoad)) { return; }

    setError(Validate(value));
  }, [value, changed, Validate, validateOnLoad]);

  let Component = TextInput;
  switch(type) {
    case "text":
      value = value || "";
      break;
    case "textarea":
      value = value || "";
      Component = Textarea;
      componentProps.minRows = componentProps.minRows || 3;
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
      componentProps.searchable = searchable;
      componentProps.data = options;
      break;
    case "multiselect":
      Component = MultiSelect;
      componentProps.searchable = searchable;
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

  componentProps.maw = componentProps.maw || 500;

  if(clearable) {
    componentProps.rightSection = (
      <Tooltip label={rootStore.l10n.components.inputs.clear} position="top-end" withArrow>
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
      disabled={disabled}
      {...componentProps}
      placeholder={placeholder}
      error={error}
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

        setChanged(true);
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

  componentProps.maw = componentProps.maw || 500;

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
  INVERTED=false,
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
      <Paper withBorder p="xl" py="md" mb="md" w="max-content">
        <MantineInput.Wrapper
          pr={50}
          label={<InputLabel label={label} hint={hint} />}
          description={description}
          style={{position: "relative", display: "flex", flexDirection: "column", justifyContent: "center"}}
        >
          <Checkbox
            style={{position: "absolute", right: -25}}
            {...componentProps}
            checked={INVERTED ? !value : value}
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
    <Paper withBorder p="xl" py="md" mb="md" maw={800} w="100%">
      <MantineInput.Wrapper label={<InputLabel label={label} hint={hint} />} description={description} style={{position: "relative"}}>
        {
          showEditor ?
            <Container p={0} m={0} my="xl">
              <RichTextEditor
                store={store}
                objectId={objectId}
                page={location.pathname}
                path={path}
                field={field}
                componentProps={{mih: 200}}
              />
            </Container> :
            <Paper withBorder shadow="sm" p="xl" py="md" m={0} my="xl">
              <div className="rich-text-document" dangerouslySetInnerHTML={{__html: SanitizeHTML(store.GetMetadata({objectId, path, field}))}} />
            </Paper>
        }
        <ActionIcon
          title={rootStore.l10n.components.inputs[showEditor ? "hide_editor" : "show_editor"]}
          aria-label={rootStore.l10n.components.inputs[showEditor ? "hide_editor" : "show_editor"]}
          onClick={() => setShowEditor(!showEditor)}
          style={{position: "absolute", top: 0, right: 0}}
        >
          { showEditor ? <IconEditOff /> : <IconEdit /> }
        </ActionIcon>
      </MantineInput.Wrapper>
    </Paper>
  );
});


const CodeInput = observer(({store, objectId, path, field, label, description, hint, defaultValue, language="css", componentProps={}}) => {
  const [editing, setEditing] = useState(false);
  const [validationResults, setValidationResults] = useState(undefined);

  let value = store.GetMetadata({objectId, path, field});

  useEffect(() => {
    if(language === "css") {
      setValidationResults(ValidateCSS(value));
    }
  }, [editing, language, value]);

  let highlightedLines = {};
  (validationResults?.errors || []).forEach(error =>
    highlightedLines[error.line] = { color: "red", label: `!${error.line}` }
  );

  return (
    <Paper withBorder p="xl" pt="md" maw={800} style={{position: "relative"}}>
      <MantineInput.Wrapper
        label={<InputLabel label={label} hint={hint} />}
        description={description}
        error={validationResults?.errorMessage}
        styles={() => ({error: { marginTop: 30 }})}
      >
        <ActionIcon
          title={rootStore.l10n.components.actions.edit}
          aria-label={rootStore.l10n.components.actions.edit}
          onClick={() => setEditing(!editing)}
          style={{position: "absolute", top: 10, right: 10}}
        >
          { editing ? <IconEditOff /> : <IconEdit /> }
        </ActionIcon>
        {
          editing ?
            <Input
              type="textarea"
              store={store}
              objectId={objectId}
              path={path}
              field={field}
              defaultValue={defaultValue}
              componentProps={{...componentProps, maw: 800, mb:0, minRows: componentProps.minRows || 20}}
            /> :
            <ScrollArea mah={500} style={{overflow: "hidden"}}>
              <Prism
                mt="xl"
                language={language}
                mah={450}
                withLineNumbers
                highlightLines={highlightedLines}
              >
                {value}
              </Prism>
            </ScrollArea>

        }
      </MantineInput.Wrapper>
    </Paper>
  );
});

// Single image
const SingleImageInput = observer(({
  store,
  objectId,
  label,
  description,
  hint,
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
            mb="xs"
            withPlaceholder
            height={150}
            width={150}
            src={imageUrl}
            alt={label}
            fit="contain"
            placeholder={<IconPhotoX size={35} />}
            styles={ theme => ({ image: { padding: 10, backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1] }}) }
          />
          <MantineInput.Wrapper maw={150} label={<InputLabel label={label} hint={hint} />} description={description} />
        </UnstyledButton>
        {
          !imageMetadata ? null :
            <ActionIcon
              radius="100%"
              style={{position: "absolute", top: "3px", right: "3px"}}
              onClick={event => {
                event.stopPropagation();

                modals.openConfirmModal({
                  title: LocalizeString(rootStore.l10n.components.inputs.remove, {item: label}),
                  centered: true,
                  children: (
                    <Text size="sm">
                      { LocalizeString(rootStore.l10n.components.inputs.remove_confirm, {item: label}) }
                    </Text>
                  ),
                  labels: { confirm: rootStore.l10n.components.actions.remove, cancel: rootStore.l10n.components.actions.cancel },
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
        title={LocalizeString(rootStore.l10n.components.inputs.select_file, { item: label }, {stringOnly: true})}
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
    <Paper withBorder p="xl" py="md" w="max-content" mb="md">
      <MantineInput.Wrapper label={<InputLabel label={label} hint={hint} />} description={description}>
        <Group my="md">
          {
            fields.map(({label, description, hint, field}) =>
              <SingleImageInput
                key={`image-input-${field}`}
                store={store}
                objectId={objectId}
                path={path}
                label={label}
                description={description}
                hint={hint}
                field={field}
              />
            )
          }
        </Group>
        {
          !altTextField ? null :
            <Input
              hint={rootStore.l10n.components.inputs.hints.image_alt_text}
              page={location.pathname}
              type="textarea"
              store={store}
              objectId={objectId}
              label="Alt Text"
              path={path}
              field={altTextField}
              componentProps={{minRows: 2}}
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
              title={LocalizeString(rootStore.l10n.components.inputs.remove, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
              aria-label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
              onClick={() => {
                modals.openConfirmModal({
                  title: LocalizeString(rootStore.l10n.components.inputs.remove, {item: fieldLabel.toLowerCase()}),
                  centered: true,
                  children: (
                    <Text size="sm">
                      { LocalizeString(rootStore.l10n.components.inputs.remove_confirm_list_item, {item: fieldLabel.toLowerCase()}) }
                    </Text>
                  ),
                  labels: { confirm: rootStore.l10n.components.actions.remove, cancel: rootStore.l10n.components.actions.cancel },
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
              title={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
              aria-label={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel.toLowerCase()}, {stringOnly: true})}
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
  URL: props => <Input {...props} type="text" Validate={ValidateUrl} />,
  TextArea: props => <Input {...props} type="textarea" />,
  Code: props => <CodeInput {...props} />,
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
