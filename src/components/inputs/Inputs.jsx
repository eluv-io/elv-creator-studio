import "Assets/stylesheets/rich-text.scss";

import {
  Input as MantineInput,
  Paper,
  ActionIcon,
  Group,
  UnstyledButton,
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
  JsonInput,
  PasswordInput,
  ScrollArea,
  Table,
  HoverCard,
  ColorInput
} from "@mantine/core";
import {DatePickerInput, DateTimePicker} from "@mantine/dates";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {observer} from "mobx-react-lite";
import {Link, useLocation, useNavigate} from "react-router-dom";
import UrlJoin from "url-join";
import {modals} from "@mantine/modals";
import {rootStore} from "Stores";
import {LocalizeString} from "Components/common/Misc.jsx";
import {FabricUrl, ScaleImage} from "Helpers/Fabric";
import {useEffect, useState} from "react";
import FileBrowser from "./FileBrowser";
import RichTextEditor from "./RichTextEditor.jsx";
import {GenerateUUID, ParseDate} from "Helpers/Misc";
import {Prism} from "@mantine/prism";
import {ValidateUrl, ValidateCSS} from "Components/common/Validation.jsx";
import SanitizeHTML from "sanitize-html";
import {useDebouncedValue} from "@mantine/hooks";
import FabricBrowser from "./FabricBrowser.jsx";
import CheckboxCard from "./CheckboxCard.jsx";
import InputWrapper, {InputLabel} from "./InputWrapper.jsx";
import Video from "Components/common/Video.jsx";

import {
  IconX,
  IconPlus,
  IconGripVertical,
  IconPhotoX,
  IconEdit,
  IconEditOff,
  IconTrashX,
  IconSelect,
  IconFile,
  IconDownload, IconPlayerPause, IconPlayerPlay
} from "@tabler/icons-react";


export const ConfirmDelete = ({title, itemName, modalProps={}, listItem, onConfirm}) => {
  modals.openConfirmModal({
    title: title || LocalizeString(rootStore.l10n.components.inputs.remove, {item: itemName}),
    centered: true,
    children: (
      <Text size="sm">
        { LocalizeString(rootStore.l10n.components.inputs[listItem ? "remove_confirm_list_item" : "remove_confirm"], {item: itemName}) }
      </Text>
    ),
    labels: { confirm: rootStore.l10n.components.actions.remove, cancel: rootStore.l10n.components.actions.cancel },
    confirmProps: { color: "red.6" },
    onConfirm,
    ...modalProps
  });
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
        value = GenerateUUID();
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
      value = value || "";
      break;
    case "uuid":
      componentProps.disabled = true;
      value = value || "";
      break;
    case "color":
      Component = ColorInput;
      componentProps.withEyeDropper = true;
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
      clearable = true;
      value = ParseDate(value);
      break;
    case "datetime":
      Component = DateTimePicker;
      componentProps.valueFormat = "LLL ZZ";
      clearable = true;
      value = ParseDate(value);
      break;
  }

  componentProps.maw = componentProps.maw || 600;

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

        store.SetMetadata({
          actionType: ["select", "multiselect"].includes(type) ? "MODIFY_FIELD_UNSTACKABLE" : "MODIFY_FIELD",
          objectId,
          page: location.pathname,
          path,
          field,
          value
        });

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

  componentProps.maw = componentProps.maw || 600;

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
const CheckboxInput = observer(({
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
    <CheckboxCard
      label={label}
      description={description}
      hint={hint}
      INVERTED={INVERTED}
      checked={value}
      onChange={() => store.SetMetadata({actionType: "TOGGLE_FIELD", objectId, page: location.pathname, path, field, value: !value})}
      componentProps={componentProps}
    />
  );
});

// Rich text
const RichTextInput = observer(({store, objectId, path, field, label, description, hint}) => {
  const location = useLocation();
  const [showEditor, setShowEditor] = useState(false);

  const value = store.GetMetadata({objectId, path, field});
  return (
    <InputWrapper label={label} description={description} hint={hint} maw={!value && !showEditor ? 600 : 800} w="100%">
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
          value ?
            <Paper withBorder shadow="sm" p="xl" py="md" m={0} my="xl">
              <div className="rich-text-document" dangerouslySetInnerHTML={{__html: SanitizeHTML(value)}} />
            </Paper> : null
      }
      <ActionIcon
        title={rootStore.l10n.components.inputs[showEditor ? "hide_editor" : "show_editor"]}
        aria-label={rootStore.l10n.components.inputs[showEditor ? "hide_editor" : "show_editor"]}
        onClick={() => setShowEditor(!showEditor)}
        style={{position: "absolute", top: 0, right: 0}}
      >
        { showEditor ? <IconEditOff /> : <IconEdit /> }
      </ActionIcon>
    </InputWrapper>
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
    <InputWrapper label={label} description={description} hint={hint} maw={800} wrapperProps={{error: validationResults?.errorMessage, styles: () => ({error: { marginTop: 30 }})}}>
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
    </InputWrapper>
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
  field,
  componentProps={}
}) => {
  const location = useLocation();

  const [showFileBrowser, setShowFileBrowser] = useState(false);

  const imageMetadata = store.GetMetadata({objectId, path, field});

  let imageUrl;
  if(imageMetadata) {
    imageUrl = FabricUrl({objectId, path: imageMetadata["/"], width: 200});
  }

  return (
    <>
      <Paper shadow="sm" withBorder w="max-content" p={30} mb="md" style={{position: "relative"}} {...componentProps}>
        <HoverCard shadow="xl" openDelay={imageUrl ? 500 : 100000}>
          <HoverCard.Target>
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
              <MantineInput.Wrapper
                maw={150}
                label={<InputLabel centered label={label} hint={hint} />}
                description={description}
                labelProps={{style: { width: "100%", textAlign: "center "}}}
                descriptionProps={{style: { width: "100%", textAlign: "center "}}}
              />
            </UnstyledButton>
          </HoverCard.Target>
          <HoverCard.Dropdown bg="gray.1" p="xl" >
            <Image
              mb="xs"
              withPlaceholder
              height={400}
              width={400}
              src={ScaleImage(imageUrl, 1000)}
              alt={label}
              fit="contain"
              placeholder={<IconPhotoX size={35} />}
              styles={ theme => ({ image: { padding: 10, backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1] }}) }
            />
          </HoverCard.Dropdown>
        </HoverCard>
        {
          !imageMetadata ? null :
            <ActionIcon
              radius="100%"
              style={{position: "absolute", top: "3px", right: "3px"}}
              onClick={event => {
                event.stopPropagation();
                ConfirmDelete({
                  itemName: label || "this image",
                  onConfirm: () => store.SetMetadata({page: location.pathname, objectId, path, field, value: null})
                });
              }}
            >
              <IconX size={20}/>
            </ActionIcon>
        }
      </Paper>
      <FileBrowser
        title={LocalizeString(rootStore.l10n.components.inputs.select_file, { item: label })}
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

export const FileInput = observer(({
  store,
  objectId,
  path,
  field,
  label,
  description,
  hint,
  extensions,
  fileBrowserProps={}
}) => {
  const location = useLocation();
  const [showBrowser, setShowBrowser] = useState(false);

  let value = store.GetMetadata({objectId, path, field});

  const filename = value?.["/"]?.split("/files/")?.[1] || "File";

  return (
    <>
      {
        !showBrowser ? null :
          <FileBrowser
            {...fileBrowserProps}
            objectId={objectId}
            extensions={extensions}
            label={label}
            Close={() => setShowBrowser(false)}
            Submit={async (filePath) => {
              await store.SetLink({objectId, path, field, linkObjectId: objectId, linkType: "file", filePath});
            }}
          />
      }
      <InputWrapper
        label={label}
        description={description}
        hint={hint}
        px="xl"
        pt="md"
        pb="lg"
        mb="md"
        flex
      >
        <Group spacing={0} style={{position: "absolute", top: 0, right: 0}}>
          <ActionIcon
            title={LocalizeString(rootStore.l10n.components.fabric_browser.select, {item: label})}
            aria-label={LocalizeString(rootStore.l10n.components.fabric_browser.select, {item: label})}
            onClick={() => setShowBrowser(true)}
          >
            <IconSelect />
          </ActionIcon>
        </Group>
        {
          !value ? null :
            <Paper withBorder p="xl" mt="md" style={{position: "relative"}}>
              <Group spacing={0} style={{position: "absolute", top: 5, right: 5}}>
                <ActionIcon
                  component="a"
                  href={value.url}
                  target="_blank"
                  title={LocalizeString(rootStore.l10n.components.file_browser.download, {filename})}
                  aria-label={LocalizeString(rootStore.l10n.components.file_browser.download, {filename})}
                >
                  <IconDownload size={15} />
                </ActionIcon>
                <ActionIcon
                  title={LocalizeString(rootStore.l10n.components.inputs.remove, {item: label.toLowerCase()})}
                  aria-label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: label.toLowerCase()})}
                  onClick={() => {
                    ConfirmDelete({
                      itemName: name,
                      onConfirm: () => store.SetLink({objectId, page: location.pathname, path, field, linkObjectId: undefined})
                    });
                  }}
                >
                  <IconX size={15} />
                </ActionIcon>
              </Group>
              <Group align="center">
                <IconFile />
                <Text fz="sm">
                  { filename }
                </Text>
              </Group>
            </Paper>
        }
      </InputWrapper>
    </>
  );
});



export const FabricBrowserInput = observer(({
  store,
  objectId,
  path,
  field,
  label,
  description,
  hint,
  previewable,
  previewIsAnimation,
  previewOptions={},
  GetName,
  GetImage,
  fabricBrowserProps={}
}) => {
  const location = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);

  GetName = GetName || ((metadata={}) => metadata.display_title || metadata.title || metadata.name || metadata["."]?.source);

  let value = store.GetMetadata({objectId, path, field});
  const name = value ? GetName(value) : "";
  const imageUrl = GetImage?.(value);

  useEffect(() => {
    // Hide preview when anything changes
    setShowPreview(false);
  }, [value, previewable, previewIsAnimation]);

  return (
    <>
      {
        !showBrowser ? null :
          <FabricBrowser
            {...fabricBrowserProps}
            label={label}
            Close={() => setShowBrowser(false)}
            Submit={async (target) => {
              await store.SetLink({objectId, path, field, linkObjectId: target.objectId});
            }}
          />
      }
      <InputWrapper label={label} description={description} hint={hint} flex>
        <Group spacing={0} style={{position: "absolute", top: 0, right: 0}}>
          <ActionIcon
            title={LocalizeString(rootStore.l10n.components.fabric_browser.select, {item: label})}
            aria-label={LocalizeString(rootStore.l10n.components.fabric_browser.select, {item: label})}
            onClick={() => setShowBrowser(true)}
          >
            <IconSelect />
          </ActionIcon>
        </Group>
        {
          !value ? null :
            <Paper withBorder p="xl" mt="md" style={{position: "relative"}}>
              <Group spacing={0} style={{position: "absolute", top: 5, right: 5}}>
                {
                  !previewable ? null :
                    <ActionIcon
                      title={rootStore.l10n.components.fabric_browser[showPreview ? "hide_preview" : "show_preview"]}
                      aria-label={rootStore.l10n.components.fabric_browser[showPreview ? "hide_preview" : "show_preview"]}
                      onClick={() => setShowPreview(!showPreview)}
                      color={showPreview ? "red.7" : "blue.5"}
                    >
                      {showPreview ? <IconPlayerPause size={15}/> : <IconPlayerPlay size={15}/>}
                    </ActionIcon>
                }
                <ActionIcon
                  title={LocalizeString(rootStore.l10n.components.inputs.remove, {item: label.toLowerCase()})}
                  aria-label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: label.toLowerCase()})}
                  onClick={() => {
                    ConfirmDelete({
                      itemName: name,
                      onConfirm: () => store.SetLink({objectId, page: location.pathname, path, field, linkObjectId: undefined})
                    });
                  }}
                >
                  <IconX size={15} />
                </ActionIcon>
              </Group>
              <Container p={0} pr={70}>
                {
                  !imageUrl ? null :
                    <Image
                      mb="xs"
                      height={125}
                      fit="contain"
                      alt={name}
                      src={imageUrl}
                      withPlaceholder
                      bg="gray.1"
                      p="xs"
                    />
                }
                <Text fz="sm">
                  { name }
                </Text>
                <Text fz={11} color="dimmed">
                  {rootStore.utils.DecodeVersionHash(value["."]?.source)?.objectId}
                </Text>
                <Text fz={8} color="dimmed">
                  {value["."]?.source}
                </Text>
              </Container>

              {
                !showPreview ? null :
                  <Paper mt="sm">
                    <Video videoLink={value} animation={previewIsAnimation} playerOptions={previewOptions} />
                  </Paper>
              }
            </Paper>
        }
      </InputWrapper>
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
    <InputWrapper label={label} description={description} hint={hint} h="max-content" w="max-content">
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
              componentProps={{
                mb: 0
              }}
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
    </InputWrapper>
  );
});

const ListInputs = observer(({
  type="text",
  store,
  objectId,
  path,
  field,
  fieldLabel,
  fields=[],
  index,
  renderItem
}) => {
  if(renderItem) {
    const value = (store.GetMetadata({objectId, path: UrlJoin(path, field), field: index.toString()}) || []);

    return renderItem({
      value,
      store,
      objectId,
      path: UrlJoin(path, field, index.toString())
    });
  }

  // Fields not specified - simple list
  if(!fields || fields.length === 0) {
    return (
      <Input
        type={type}
        store={store}
        objectId={objectId}
        path={UrlJoin(path, field)}
        field={index.toString()}
        label={fieldLabel}
        componentProps={{style: {flexGrow: "1"}}}
      />
    );
  }

  return (
    <>
      {
        fields.map(({InputComponent, render, ...props}) => {
          const fieldPath = UrlJoin(path, field, index.toString());
          const key = `input-${props.field}`;

          if(render) {
            return render({...props, key, index, store, objectId, path: fieldPath, field: props.field});
          } else {
            return (
              <InputComponent
                key={key}
                store={store}
                objectId={objectId}
                path={fieldPath}
                field={props.field}
                {...props}
              />
            );
          }
        })
      }
    </>
  );
});

// List of inputs
const List = observer(({
  type="text",
  store,
  objectId,
  path,
  field,
  label,
  hint,
  description,
  idField="index",
  fieldLabel,
  fields=[],
  newEntrySpec={},
  renderItem,
  showBottomAddButton
}) => {
  const location = useLocation();
  const values = (store.GetMetadata({objectId, path, field}) || []);
  const simpleList = !renderItem && (!fields || fields.length === 0);

  const items = values.map((value, index) => {
    const id = (idField === "index" ? index.toString() : value[idField]) || "";

    return (
      <Draggable key={`draggable-item-${id}`} index={index} draggableId={`item-${id}`}>
        {(provided, snapshot) => (
          <Paper
            withBorder
            shadow={snapshot.isDragging ? "lg" : ""}
            p="sm"
            maw={800}
            ref={provided.innerRef}
            key={`list-item-${id}`}
            {...provided.draggableProps}
          >
            <Group align="start" style={{position: "relative"}} px={40}>
              <div style={{cursor: "grab", position: "absolute", top: 0, left: 0}} {...provided.dragHandleProps}>
                <IconGripVertical/>
              </div>
              <Container p={0} m={0} fluid w="100%">
                <ListInputs
                  type={type}
                  store={store}
                  objectId={objectId}
                  path={path}
                  field={field}
                  fieldLabel={fieldLabel}
                  fields={fields}
                  index={index}
                  renderItem={renderItem}
                />
              </Container>
              <ActionIcon
                style={{position: "absolute", top: 0, right: 0}}
                title={LocalizeString(rootStore.l10n.components.inputs.remove, {item: fieldLabel.toLowerCase()})}
                aria-label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: fieldLabel.toLowerCase()})}
                onClick={() => {
                  ConfirmDelete({
                    listItem: true,
                    itemName: fieldLabel?.toLowerCase(),
                    onConfirm: () => store.RemoveListElement({objectId, page: location.pathname, path, field, index})
                  });
                }}
              >
                <IconX/>
              </ActionIcon>
            </Group>
          </Paper>
        )}
      </Draggable>
    );
  });

  const addButton = (
    <ActionIcon
      title={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel.toLowerCase()})}
      aria-label={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel.toLowerCase()})}
      onClick={() =>
        store.InsertListElement({objectId, page: location.pathname, path, field, value: simpleList ? "" : newEntrySpec})
    }
    >
      <IconPlus />
    </ActionIcon>
  );

  showBottomAddButton = showBottomAddButton || items.length >= 5;

  return (
    <InputWrapper label={label} description={description} hint={hint} maw={simpleList ? 600 : 800}>
      <Container p={0} pb={showBottomAddButton ? 50 : 0} m={0} mt={items.length > 0 ? "md" : 0}>
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
        <Group position="right" style={{position: "absolute", top: 0, right: 0}}>
          {addButton}
        </Group>
        {
          !showBottomAddButton ? null :
            <Group position="right" style={{position: "absolute", bottom: 0, right: 0}}>
              {addButton}
            </Group>
        }
      </Container>
    </InputWrapper>
  );
});

const CollectionTableRows = observer(({
  showDragHandle,
  store,
  objectId,
  path,
  field,
  columns=[],
  fieldLabel,
  idField="index",
  values
}) => {
  return (
    values.map((value, index) => {
      const id = (idField === "index" ? index.toString() : value[idField]) || "";

      return (
        <Draggable key={`draggable-item-${id}}`} index={index} draggableId={`item-${id}`}>
          {(rowProvided) => (
            <tr
              ref={rowProvided.innerRef}
              {...rowProvided.draggableProps}
              key={`tr-${id}`}
            >
              <td style={{width: "40px", display: showDragHandle ? undefined : "none"}}>
                <div style={{cursor: "grab"}} {...rowProvided.dragHandleProps}>
                  <IconGripVertical size={15}/>
                </div>
              </td>
              {columns.map(({field, width, render, centered}, index) =>
                <td key={`td-${id}-${field}`} style={{width: width || "100%"}}>
                  <Group position={centered ? "center" : "left"}>
                    {render ? render(value, index) : (value[field] || "")}
                  </Group>
                </td>
              )}
              <td style={{width: "100px"}}>
                <Group spacing={6} position="center" noWrap onClick={event => event.stopPropagation()}>
                  <ActionIcon
                    component={Link}
                    to={UrlJoin(location.pathname, id)}
                    color="blue.5"
                  >
                    <IconEdit/>
                  </ActionIcon>

                  <ActionIcon
                    color="red.5"
                    onClick={() => {
                      ConfirmDelete({
                        listItem: true,
                        itemName: fieldLabel?.toLowerCase(),
                        onConfirm: () => store.RemoveListElement({objectId, page: location.pathname, path, field, index})
                      });
                    }}
                  >
                    <IconTrashX/>
                  </ActionIcon>
                </Group>
              </td>
            </tr>
          )}
        </Draggable>
      );
    })
  );
});

const CollectionTable = observer(({
  store,
  objectId,
  path,
  field,
  label,
  hint,
  description,
  columns=[],
  fieldLabel,
  newEntrySpec={},
  idField="index",
  filterable,
  Filter
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  let values = store.GetMetadata({objectId, path, field}) || [];

  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const filteredValues = filterable && debouncedFilter && Filter ?
    values.filter(value => Filter({filter: debouncedFilter, value})) :
    values;

  // Only show bottom add button if there are a lot of entries
  const showBottomAddButton = values.length >= 10;
  const addButton = (
    <ActionIcon
      title={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel.toLowerCase()})}
      aria-label={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel.toLowerCase()})}
      onClick={() => {
        let id = values.length.toString();
        let newEntry = { ...newEntrySpec };

        if(idField !== "index") {
          id = GenerateUUID();
          newEntry[idField] = id;
        }

        store.InsertListElement({
          objectId,
          page: location.pathname,
          path,
          field,
          value: newEntry
        });

        navigate(UrlJoin(location.pathname, id));
      }}
    >
      <IconPlus />
    </ActionIcon>
  );

  const showDragHandle = !debouncedFilter;

  return (
    <InputWrapper label={label} description={description} hint={hint} m={0} mb="xl" maw={800}>
      <Container p={0} m={0} pb={showBottomAddButton ? 50 : "md"} mt="lg">
        {
          !filterable ? null :
            <TextInput mb="md" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter" />
        }

        <DragDropContext
          onDragEnd={({source, destination}) =>
            store.MoveListElement({objectId, page: location.pathname, path, field, index: source.index, newIndex: destination.index})
          }
        >
          <Table
            withBorder
            verticalSpacing="xs"
          >
            <thead>
            <tr>
              { showDragHandle ? <th></th> : null }
              {
                columns.map(({label, centered}) =>
                  <th key={`th-${label}`}>
                    <Group position={centered ? "center" : "left"}>
                      {label}
                    </Group>
                  </th>
                )
              }
              <th></th>
            </tr>
            </thead>
            <Droppable droppableId="collection-table" direction="vertical">
              {containerProvided => (
                <tbody {...containerProvided.droppableProps} ref={containerProvided.innerRef}>
                  <CollectionTableRows
                    showDragHandle={showDragHandle}
                    store={store}
                    objectId={objectId}
                    path={path}
                    field={field}
                    columns={columns}
                    values={filteredValues}
                    idField={idField}
                    fieldLabel={fieldLabel}
                  />
                  {containerProvided.placeholder}
                </tbody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
        <Group position="right" style={{position: "absolute", top: 5, right: 0}}>
          {addButton}
        </Group>
        {
          !showBottomAddButton ? null :
            <Group position="right" style={{position: "absolute", bottom: 0, right: 0}}>
              {addButton}
            </Group>
        }
      </Container>
    </InputWrapper>
  );
});

export default {
  Text: props => <Input {...props} type="text" />,
  URL: props => <Input {...props} type="text" Validate={ValidateUrl} />,
  TextArea: props => <Input {...props} type="textarea" />,
  Code: props => <CodeInput {...props} />,
  UUID: props => <Input {...props} type="uuid" />,
  JSON: props => <Input {...props} type="json" />,
  Color: props => <Input {...props} type="color" />,
  Integer: ({min, max, componentProps, ...props}) =>
    <Input {...props} type="number" componentProps={{min, max, step: 1, ...(componentProps || {})}} />,
  Number: ({min, max, step, precision, componentProps, ...props}) =>
    <Input {...props} type="number" componentProps={{min, max, step, precision, ...(componentProps || {})}} />,
  Price: ({componentProps, ...props}) => <Input {...props} type="number" componentProps={{...componentProps, min: 0, step: 0.01, precision: 2}} />,
  Select: props => <Input {...props} type="select" />,
  MultiSelect: props => <Input {...props} type="multiselect" />,
  Date: props => <Input {...props} type="date" />,
  DateTime: props => <Input {...props} type="datetime" />,
  RichText: RichTextInput,
  Password,
  Checkbox: CheckboxInput,
  SingleImageInput,
  ImageInput,
  List,
  CollectionTable,
  FabricBrowser: FabricBrowserInput,
  File: FileInput,
  InputWrapper
};
