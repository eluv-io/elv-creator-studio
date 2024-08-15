import "@/assets/stylesheets/wallet-rich-text.scss";

import {
  Input as MantineInput,
  Paper,
  Group,
  UnstyledButton,
  Text,
  Select,
  TextInput,
  Textarea,
  Container,
  Image,
  NumberInput,
  Stack,
  MultiSelect as MantineMultiSelect,
  JsonInput,
  PasswordInput,
  ScrollArea,
  Table,
  HoverCard,
  ColorInput, Code
} from "@mantine/core";
import {DatePickerInput, DateTimePicker} from "@mantine/dates";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {observer} from "mobx-react-lite";
import {Link, useLocation, useNavigate} from "react-router-dom";
import UrlJoin from "url-join";
import {modals} from "@mantine/modals";
import {rootStore, uiStore} from "@/stores";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import {ExtractHashFromLink, FabricUrl, ScaleImage} from "@/helpers/Fabric";
import {useEffect, useState} from "react";
import FileBrowser from "./FileBrowser";
import RichTextEditor from "./RichTextEditor.jsx";
import {CategoryFn, GenerateUUID, ParseDate, SortTable} from "@/helpers/Misc";
import {Prism} from "@mantine/prism";
import {ValidateUrl, ValidateCSS} from "@/components/common/Validation.jsx";
import SanitizeHTML from "sanitize-html";
import {useDebouncedValue} from "@mantine/hooks";
import FabricBrowser from "./FabricBrowser.jsx";
import CheckboxCard from "./CheckboxCard.jsx";
import InputWrapper, {InputLabel} from "./InputWrapper.jsx";
import Video from "@/components/common/Video.jsx";

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
  IconDownload,
  IconPlayerPause,
  IconPlayerPlay,
  IconLink,
  IconUnlink, IconCopy
} from "@tabler/icons-react";
import {DataTable} from "mantine-datatable";

export const Confirm = ({title, text, onConfirm, ...modalProps}) => {
  modals.openConfirmModal({
    ...modalProps,
    title: title || rootStore.l10n.components.inputs.confirm,
    centered: true,
    children: (
      <Text size="sm">
        { text }
      </Text>
    ),
    labels: { confirm: rootStore.l10n.components.actions.confirm, cancel: rootStore.l10n.components.actions.cancel },
    onConfirm
  });
};

export const ConfirmDelete = ({title, itemName, listItem, onConfirm, ...modalProps}) => {
  modals.openConfirmModal({
    ...modalProps,
    title: title || LocalizeString(rootStore.l10n.components.inputs.remove, {item: itemName}),
    centered: true,
    children: (
      <Text size="sm">
        { LocalizeString(rootStore.l10n.components.inputs[listItem ? "remove_confirm_list_item" : "remove_confirm"], {item: itemName}) }
      </Text>
    ),
    labels: { confirm: rootStore.l10n.components.actions.remove, cancel: rootStore.l10n.components.actions.cancel },
    confirmProps: { color: "red.6" },
    onConfirm
  });
};

// General input
const MultiSelect = observer(({
  store,
  objectId,
  path,
  field,
  primaryValueField, // If options are objects, use this field to determine the canonical value
  category,
  subcategory,
  label,
  description,
  hint,
  value,
  options,
  placeholder,
  clearable,
  searchable,
  disabled,
  componentProps={}
}) => {
  const location = useLocation();

  let values = value || store.GetMetadata({objectId, path, field}) || [];

  if(!Array.isArray(values)) {
    values = [];
  }

  if(primaryValueField) {
    values = values.map(value => value[primaryValueField]);
  }

  componentProps.maw = componentProps.maw || uiStore.inputWidth;

  if(clearable) {
    componentProps.rightSection = (
      <IconButton
        label={rootStore.l10n.components.inputs.clear}
        mr="xs"
        icon={<IconX size={15} />}
        onClick={() =>{
          for(let i = values.length - 1; i >= 0; i--) {
            store.RemoveListElement({
              objectId,
              page: location.pathname,
              path,
              field,
              index: i,
              category,
              subcategory,
              label: values[i]
            });
          }
        }}
      />
    );
  }

  // Remove additionalOptions from list passed to component
  const inputOptions = options.map(option =>
    option.label ?
      ({label: option.label, value: option.value}) :
      option
  );

  return (
    <MantineMultiSelect
      mb="md"
      disabled={disabled}
      searchable={searchable}
      data={inputOptions}
      {...componentProps}
      placeholder={placeholder}
      label={<InputLabel label={label} hint={hint} />}
      description={description}
      value={values}
      onChange={newValues => {
        const removedValues = values.filter(value => !newValues.includes(value));
        removedValues.forEach(removedValue => {
          const option = options.find(option => option === removedValue || option?.value === removedValue);
          store.RemoveListElement({
            objectId,
            page: location.pathname,
            path,
            field,
            index: values.findIndex(value => value === removedValue),
            category,
            subcategory,
            label: option?.label || option || ""
          });
        });

        const addedValues = newValues.filter(value => !values.includes(value));
        addedValues.forEach(newValue => {
          const option = options.find(option => option === newValue || option?.value === newValue);

          if(primaryValueField) {
            newValue = {
              [primaryValueField]: newValue,
            };

            (option.additionalValues || []).forEach(({field, value}) =>
              newValue[field] = value
            );
          }

          store.InsertListElement({
            objectId,
            page: location.pathname,
            path,
            field,
            category,
            subcategory,
            label: option?.label || option || "",
            value: newValue
          });
        });
      }}
    />
  );
});

// General input
const Input = observer(({
  type="text",
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  label,
  description,
  hint,
  actionLabel,
  value,
  options,
  placeholder,
  defaultValue,
  defaultOnBlankString,
  clearable,
  searchable,
  disabled,
  hidden,
  required,
  Validate,
  validateOnLoad=true,
  componentProps={}
}) => {
  const [error, setError] = useState(undefined);
  const location = useLocation();
  const [changed, setChanged] = useState(false);

  value = typeof value !== "undefined" ? value : store.GetMetadata({objectId, path, field});

  useEffect(() => {
    // Ensure the default value is set for this field if the field is not yet defined
    if((type === "uuid" || typeof defaultValue !== "undefined")) {
      const currentValue = store.GetMetadata({objectId, path, field});

      // Only set default value on blank string if explicitly specified - otherwise, only set on undefined
      if(!(typeof currentValue === "undefined" || ((currentValue === "" || currentValue === 0) && defaultOnBlankString))) {
        return;
      }

      let value = defaultValue;
      if(type === "uuid") {
        value = GenerateUUID();
      }

      store.SetDefaultValue({objectId, path, field, category, subcategory, label, value});

      if(type === "select") {
        // Apply any additional fields from selected option
        const selectedOption = options.find(option => option === value || option.value === value);
        (selectedOption?.additionalValues || []).forEach(({field, value}) =>
          store.SetDefaultValue({objectId, path, field, category, subcategory, label, value})
        );
      }
    }

    if(type === "json" && !value) {
      store.SetDefaultValue({objectId, path, field, category, subcategory, label, value: "{}", json: true});
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
      componentProps.styles = {
        ...(componentProps.styles || {}),
        input: {
          ...(componentProps?.styles?.input || {}),
          resize: "vertical"
        }
      };
      break;
    case "number":
      // Additional options: min, max, step
      Component = NumberInput;
      value = parseFloat(value);

      if(isNaN(value)) {
        value = "";
      }

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
      componentProps.minRows = componentProps.minRows || 5;
      componentProps.formatOnBlur = true;
      value = typeof value !== "string" ? JSON.stringify(value, null, 2) : value;
      break;
    case "select":
      Component = Select;
      componentProps.searchable = searchable;
      componentProps.data = options.map(option =>
        option.label ?
          ({label: option.label, value: option.value, disabled: option.disabled}) :
          option
      );
      break;
    case "date":
      Component = DatePickerInput;
      componentProps.valueFormat = "LL";
      clearable = true;
      value = ParseDate(value) || null;
      break;
    case "datetime":
      Component = DateTimePicker;
      componentProps.valueFormat = "LLL ZZ";
      clearable = true;
      value = ParseDate(value) || null;
      break;
  }

  componentProps.maw = componentProps.maw || uiStore.inputWidth;

  if(clearable) {
    componentProps.rightSection = (
      <IconButton
        label={rootStore.l10n.components.inputs.clear}
        mr="xs"
        icon={<IconX size={15} />}
        onClick={() => store.SetMetadata({
          objectId,
          page: location.pathname,
          path,
          field,
          value: type === "number" ? undefined : "",
          category,
          subcategory,
          label: actionLabel || label
        })}
      />
    );
  }

  if(hidden) {
    return null;
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
      label={label || hint ? <InputLabel label={label} hint={hint} /> : ""}
      description={description}
      value={value}
      required={required}
      onBlur={() => {
        if(type === "json") {
          value = (value && value.trim?.()) || "{}";

          try {
            setError(undefined);
            JSON.parse(value);
          } catch(error) {
            setError("Invalid JSON: " + error.toString());
          }
        }
      }}
      onChange={event => {
        let value = event?.target ? event.target.value : event;

        if(type === "number" && typeof value !== "number" && !value) {
          // Set missing numbers to undefined instead of empty string
          value = undefined;
        } else if(["date", "datetime"].includes(type)) {
          value = value ? value.toISOString() : undefined;
        }

        if(type === "select") {
          const selectedOption = options.find(option => option === value || option.value === value);

          // Allow select to change multiple values at once - e.g. marketplace select sets marketplace slug, tenant slug and object ID
          store.SetBatchMetadata({
            actionType: "MODIFY_FIELD_BATCH_UNSTACKABLE",
            objectId,
            page: location.pathname,
            path,
            field,
            values: [
              { field, value },
              ...(selectedOption.additionalValues || [])
            ],
            category,
            subcategory,
            label: actionLabel || label
          });
        } else {
          store.SetMetadata({
            actionType: "MODIFY_FIELD",
            objectId,
            page: location.pathname,
            path,
            field,
            value,
            category,
            subcategory,
            label: actionLabel || label,
            json: type === "json"
          });
        }

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
  category,
  subcategory,
  label,
  description,
  hint,
  componentProps={}
}) => {
  const location = useLocation();

  const value = store.GetMetadata({objectId, path, field});
  const [password, setPassword] = useState(value);
  const [changed, setChanged] = useState(false);

  componentProps.maw = componentProps.maw || uiStore.inputWidth;

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
          store.SetMetadata({
            objectId,
            page: location.pathname,
            path,
            field,
            value: digest,
            category,
            subcategory,
            label
          });
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
  category,
  subcategory,
  label,
  description,
  hint,
  defaultValue=false,
  componentProps={}
}) => {
  const location = useLocation();

  useEffect(() => {
    // Ensure the default value is set for this field if the field is not yet defined
    if(typeof store.GetMetadata({objectId, path, field}) === "undefined") {
      store.SetDefaultValue({objectId, path, field, category, subcategory, label, value: defaultValue});
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
      onChange={() => store.SetMetadata({
        actionType: "TOGGLE_FIELD",
        objectId,
        page: location.pathname,
        path,
        field,
        value: !value,
        category,
        subcategory,
        label,
        inverted: INVERTED
      })}
      {...componentProps}
    />
  );
});

// Rich text
const RichTextInput = observer(({
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  label,
  description,
  hint,
  componentProps={},
  componentPropsVisible={}
}) => {
  const location = useLocation();
  const [showEditor, setShowEditor] = useState(false);
  const [editorKey, setEditorKey] = useState(Math.random());

  // React to undo/redo when the editor is open
  useEffect(() => {
    setEditorKey(Math.random());
  }, [store.actionStack[objectId], store.redoStack[objectId]]);

  const value = store.GetMetadata({objectId, path, field});
  return (
    <InputWrapper
      label={label}
      description={description}
      hint={hint}
      maw={showEditor ? uiStore.inputWidthWide : uiStore.inputWidth}
      w="100%"
      wrapperProps={{
        styles: {
          description: {
            paddingRight: "50px"
          }
        }
      }}
      {...componentProps}
      {...(showEditor ? componentPropsVisible : {})}
    >
      {
        showEditor ?
          <Container p={0} m={0} my="xl">
            <RichTextEditor
              key={`editor-${editorKey}`}
              store={store}
              objectId={objectId}
              page={location.pathname}
              path={path}
              field={field}
              category={category}
              subcategory={subcategory}
              label={label}
              componentProps={{mih: 250}}
            />
          </Container> :
          value ?
            <Paper
              py="md"
              m={0}
              mt="xl"
              radius={0}
              sx={theme => ({borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[3]}`})}
            >
              <div className="wallet-rich-text-document" dangerouslySetInnerHTML={{__html: SanitizeHTML(value)}} />
            </Paper> : null
      }
      <IconButton
        label={rootStore.l10n.components.inputs[showEditor ? "hide_editor" : "show_editor"]}
        Icon={showEditor ? IconEditOff : IconEdit}
        onClick={() => setShowEditor(!showEditor)}
        style={{position: "absolute", top: 0, right: 0}}
      />
    </InputWrapper>
  );
});

const CodeInput = observer(({
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  label,
  description,
  hint,
  defaultValue,
  language="css",
  inputProps={},
  ...componentProps
}) => {
  const [editing, setEditing] = useState(false);
  const [validationResults, setValidationResults] = useState(undefined);

  let value = store.GetMetadata({objectId, path, field}) || "";

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
    <InputWrapper
      label={label}
      description={description}
      hint={hint}
      maw={uiStore.inputWidthWide}
      error={validationResults?.errorMessage}
      wrapperProps={{styles: () => ({error: { marginTop: 30 }})}}
      {...componentProps}
    >
      <IconButton
        label={rootStore.l10n.components.actions.edit}
        Icon={editing ? IconEditOff : IconEdit}
        onClick={() => setEditing(!editing)}
        style={{position: "absolute", top: 0, right: 0}}
      />
      {
        editing ?
          <Input
            type="textarea"
            store={store}
            objectId={objectId}
            path={path}
            field={field}
            category={category}
            subcategory={subcategory}
            actionLabel={label}
            defaultValue={defaultValue}
            componentProps={{
              ...inputProps,
              maw: uiStore.inputWidthWide,
              mt:"md",
              mb:0,
              minRows: inputProps.minRows || 20
            }}
          /> :
          value ?
            <ScrollArea mt="md" mah={500} style={{overflow: "hidden"}}>
              <Prism
                language={language}
                mah={470}
                withLineNumbers
                highlightLines={highlightedLines}
              >
                {value}
              </Prism>
            </ScrollArea> : null
      }
    </InputWrapper>
  );
});

// Single image
const SingleImageInput = observer(({
  store,
  objectId,
  category,
  subcategory,
  label,
  description,
  hint,
  actionLabel,
  path,
  field,
  url=false,
  noResizePreview,
  aspectRatio=1,
  baseSize=150,
  horizontal=false,
  ...componentProps
}) => {
  const location = useLocation();

  const [showFileBrowser, setShowFileBrowser] = useState(false);

  const imageMetadata = store.GetMetadata({objectId, path, field});

  let imageUrl;
  if(url) {
    imageUrl = typeof imageMetadata === "string" ? imageMetadata : undefined;
  } else if(imageMetadata) {
    imageUrl = FabricUrl({objectId, path: imageMetadata["/"], width: !noResizePreview ? 200 : undefined});
  }

  let width, height;
  if(aspectRatio < 1) {
    width = baseSize;
    height = width / aspectRatio;
  } else {
    height = baseSize;
    width = height * aspectRatio;
  }

  const hasText = !!label || !!description || !!hint;

  return (
    <>
      <Paper maw={uiStore.inputWidth} shadow="sm" withBorder w="max-content" p={30} mb="md" style={{position: "relative", display: "flex"}} {...componentProps}>
        <HoverCard offset={50} shadow="xl" openDelay={imageUrl ? 500 : 100000}>
          <UnstyledButton
            onClick={() => setShowFileBrowser(true)}
            style={!horizontal ? undefined : {display: "flex", alignItems: "center", gap: 20}}
          >
            <HoverCard.Target>
              <Image
                mb={hasText ? "xs" : 0}
                withPlaceholder
                height={height}
                width={width}
                src={imageUrl}
                alt={label}
                fit="contain"
                placeholder={<IconPhotoX size={35} />}
                styles={ theme => ({ image: { padding: 0, backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[1] }}) }
              />
              </HoverCard.Target>
            {
              !hasText ? null :
                <MantineInput.Wrapper
                  maw={width}
                  label={<InputLabel centered label={label} hint={hint}/>}
                  description={description}
                  labelProps={{style: {width: "100%", textAlign: "center "}}}
                  descriptionProps={{style: {width: "100%", textAlign: "center "}}}
                />
            }
          </UnstyledButton>
          <HoverCard.Dropdown bg="gray.1" p="xl" >
            <Image
              mb="xs"
              withPlaceholder
              height={height * 2}
              width={width * 2}
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
            <IconButton
              label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: actionLabel || label})}
              radius="100%"
              icon={<IconX size={15} />}
              style={{position: "absolute", top: "3px", right: "3px"}}
              onClick={event => {
                event.stopPropagation();
                ConfirmDelete({
                  itemName: label || "this image",
                  onConfirm: () => store.SetMetadata({
                    page: location.pathname,
                    objectId,
                    path,
                    field,
                    value: null,
                    category,
                    subcategory,
                    label: actionLabel || label
                  })
                });
              }}
            />
        }
      </Paper>
      {
        !showFileBrowser ? null :
          <FileBrowser
            store={store}
            url={url}
            title={LocalizeString(rootStore.l10n.components.inputs[label ? "select_file_label" : "select_file"], {item: label})}
            objectId={objectId}
            extensions="image"
            Submit={record => {
              if(url) {
                store.SetMetadata({
                  page: location.pathname,
                  objectId,
                  path,
                  field,
                  value: record.publicUrl,
                  category,
                  subcategory,
                  label: actionLabel || label
                });
              } else {
                store.SetLink({
                  page: location.pathname,
                  objectId,
                  path,
                  field,
                  linkObjectId: record.objectId,
                  linkType: "files",
                  linkPath: record.fullPath,
                  category,
                  subcategory,
                  label: actionLabel || label
                });
              }
            }}
            Close={() => setShowFileBrowser(false)}
          />
      }
    </>
  );
});

export const FileInput = observer(({
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  label,
  description,
  hint,
  extensions,
  url=false,
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
            store={store}
            objectId={objectId}
            extensions={extensions}
            title={LocalizeString(rootStore.l10n.components.fabric_browser.select, {item: label})}
            Close={() => setShowBrowser(false)}
            Submit={async record => {
              if(url) {
                await store.SetMetadata({
                  objectId,
                  path,
                  field,
                  value: record.publicUrl,
                  category,
                  subcategory,
                  label
                });
              } else {
                await store.SetLink({
                  objectId,
                  path,
                  field,
                  linkObjectId: record.objectId,
                  linkType: "files",
                  linkPath: record.fullPath,
                  category,
                  subcategory,
                  label
                });
              }

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
        wrapperProps={{
          styles: {
            description: {
              paddingRight: "50px"
            }
          }
        }}
      >
        <Group spacing={0} style={{position: "absolute", top: -3, right: 0}}>
          <IconButton
            p={0}
            label={LocalizeString(rootStore.l10n.components.fabric_browser.select, {item: label})}
            Icon={IconSelect}
            onClick={() => setShowBrowser(true)}
          />
        </Group>
        {
          !value ? null :
            <Paper withBorder p="xl" mt="md" style={{position: "relative"}}>
              <Group spacing={0} style={{position: "absolute", top: 5, right: 5}}>
                {
                  !value || url ? null :
                    <IconButton
                      label={LocalizeString(rootStore.l10n.components.file_browser.download, {filename})}
                      component="a"
                      href={value.url}
                      target="_blank"
                      icon={<IconDownload size={15}/>}
                    />
                }
                <IconButton
                  label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: label})}
                  icon={<IconX size={15} />}
                  onClick={() => {
                    ConfirmDelete({
                      itemName: name,
                      onConfirm: () => store.SetLink({
                        objectId,
                        page: location.pathname,
                        path,
                        field,
                        linkObjectId: undefined,
                        category,
                        subcategory,
                        label
                      })
                    });
                  }}
                />
              </Group>
              <Group align="center" noWrap pr={50}>
                <IconFile style={{minWidth: 24}}/>
                <Text fz="sm">
                  {
                    !value ? null :
                      url ?
                        <Text
                          fz="xs"
                          color="purple.6"
                          component="a"
                          target="_blank"
                          rel="noreferrer"
                          href={value}
                          style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}
                        >
                          { value }
                        </Text> :
                        <Code p={0} bg="transparent" style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                          {filename}
                        </Code>
                  }
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
  category,
  subcategory,
  label,
  customLabel,
  description,
  hint,
  linkPath,
  previewable,
  previewIsAnimation,
  previewOptions={},
  previewAspectRatio,
  GetName,
  GetImage,
  fabricBrowserProps={},
  autoUpdate=true,
  ...componentProps
}) => {
  const location = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [updatable, setUpdatable] = useState(false);

  GetName = GetName || ((metadata={}) => metadata.display_title || metadata.title || metadata.name || metadata["."]?.source);

  let value = store.GetMetadata({objectId, path, field});
  const targetHash = ExtractHashFromLink(value);
  const targetId = !targetHash ? "" : rootStore.utils.DecodeVersionHash(targetHash).objectId;

  const name = value ? GetName(value) : "";
  const imageUrl = GetImage?.(value);

  useEffect(() => {
    // Hide preview when anything changes
    setShowPreview(false);
  }, [value, previewable, previewIsAnimation]);

  useEffect(() => {
    if(!targetHash) {
      setUpdatable(false);
      return;
    }

    rootStore.client.LatestVersionHash({versionHash: targetHash})
      .then(latestHash => setUpdatable(targetHash !== latestHash));
  }, [targetHash]);

  return (
    <>
      {
        !showBrowser ? null :
          <FabricBrowser
            {...fabricBrowserProps}
            label={label}
            Close={() => setShowBrowser(false)}
            Submit={async (target) => {
              await store.SetLink({
                objectId,
                path,
                field,
                linkPath,
                linkObjectId: target.objectId,
                category,
                subcategory,
                label,
                autoUpdate
              });
            }}
          />
      }
      <InputWrapper
        label={customLabel || label}
        description={description}
        hint={hint}
        flex
        mb="md"
        {...componentProps}
      >
        <Group spacing="xs" style={{position: "absolute", top: -4, right: 0}}>
          {
            !value ? null :
              <IconButton
                variant="transparent"
                disabled={!updatable}
                label={
                  updatable ?
                    LocalizeString(rootStore.l10n.components.fabric_browser.update_link, {item: name || label}) :
                    rootStore.l10n.components.fabric_browser.link_at_latest
                }
                Icon={updatable ? IconUnlink : IconLink}
                color="purple.6"
                onClick={() => {
                  Confirm({
                    text: LocalizeString(rootStore.l10n.components.fabric_browser.update_link_confirm, {item: name || label}),
                    onConfirm: () => store.SetLink({
                      objectId,
                      page: location.pathname,
                      path,
                      field,
                      linkObjectId: targetId,
                      category,
                      subcategory,
                      label
                    })
                  });
                }}
              />
          }
          <IconButton
            label={LocalizeString(rootStore.l10n.components.fabric_browser.select, {item: label})}
            onClick={() => setShowBrowser(true)}
            Icon={IconSelect}
          />
        </Group>
        {
          !value ? null :
            <Paper
              mt="md"
              pt={8}
              style={{position: "relative"}}
              sx={theme => ({
                borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[3]}`}
              )}
            >
              <Group spacing={0} style={{position: "absolute", top: 5, right: 0, zIndex: 1}}>
                {
                  !previewable ? null :
                    <IconButton
                      label={rootStore.l10n.components.fabric_browser[showPreview ? "hide_preview" : "show_preview"]}
                      icon={showPreview ? <IconPlayerPause size={15}/> : <IconPlayerPlay size={15}/>}
                      onClick={() => setShowPreview(!showPreview)}
                      color={showPreview ? "red.7" : "purple.6"}
                    />
                }
                <IconButton
                  label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: label})}
                  icon={<IconX size={15} />}
                  onClick={() => {
                    ConfirmDelete({
                      itemName: name || label,
                      onConfirm: () => store.SetLink({
                        objectId,
                        page: location.pathname,
                        path,
                        field,
                        linkObjectId: undefined,
                        category,
                        subcategory,
                        label
                      })
                    });
                  }}
                />
              </Group>
              <Container p={0} pr={75}>
                {
                  !imageUrl ? null :
                    <Image
                      mb="xs"
                      height={200}
                      fit="contain"
                      alt={name || label}
                      src={imageUrl}
                      withPlaceholder
                      bg="gray.1"
                      p="xs"
                    />
                }
                <Text fz="sm" fw={500}>
                  { name || label }
                </Text>
                <Text fz={11} color="dimmed">
                  { targetId }
                </Text>
                <Text fz={8} color="dimmed">
                  { targetHash }
                </Text>
              </Container>

              {
                !showPreview ? null :
                  <Paper mt="sm">
                    <Video
                      videoLink={value}
                      animation={previewIsAnimation}
                      playerOptions={previewOptions}
                      aspectRatio={previewAspectRatio}
                    />
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
  category,
  subcategory,
  label,
  description,
  hint,
  componentProps={}
}) => {
  const location = useLocation();

  return (
    <InputWrapper
      label={label}
      description={description}
      hint={hint}
      h="max-content"
      w="max-content"
      maw={uiStore.inputWidth}
      {...componentProps}
    >
      <Group my="md" position="center">
        {
          fields.map((field) =>
            <SingleImageInput
              key={`image-input-${field.field}`}
              store={store}
              objectId={objectId}
              path={path}
              category={category}
              subcategory={subcategory}
              label={field.label}
              description={field.description}
              hint={field.hint}
              field={field.field}
              actionLabel={field.label || label}
              aspectRatio={field.aspectRatio}
              mb={0}
              url={field.url}
              baseSize={field.baseSize}
              horizontal={field.horizontal}
              {...(field.componentProps || {})}
            />
          )
        }
      </Group>
      {
        !altTextField ? null :
          <Input
            page={location.pathname}
            type="textarea"
            store={store}
            objectId={objectId}
            category={category}
            subcategory={subcategory}
            label={rootStore.l10n.components.inputs.alt_text.label}
            actionLabel={`${label} - ${rootStore.l10n.components.inputs.alt_text.label}`}
            hint={rootStore.l10n.components.inputs.alt_text.hint}
            path={path}
            field={altTextField}
            componentProps={{minRows: 1}}
          />
      }
    </InputWrapper>
  );
});

const ListInputs = observer(({
  type="text",
  Component,
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  actionLabel,
  fieldLabel,
  fields=[],
  index,
  renderItem,
  inputProps={}
}) => {
  if(renderItem) {
    const item = (store.GetMetadata({objectId, path: UrlJoin(path, field), field: index.toString()}) || []);

    return renderItem({
      item,
      index,
      store,
      objectId,
      path: UrlJoin(path, field, index.toString()),
      category,
      subcategory,
      actionLabel,
      fieldLabel
    });
  }

  // Fields not specified - simple list
  if(!fields || fields.length === 0) {
    if(!Component) {
      Component = Input;
    }

    return (
      <Component
        type={type}
        store={store}
        objectId={objectId}
        path={UrlJoin(path, field)}
        field={index.toString()}
        category={category}
        subcategory={subcategory}
        label={fieldLabel}
        actionLabel={actionLabel}
        componentProps={{mb: 0, style: {flexGrow: "1"}, ...(inputProps.componentProps || {})}}
        {...inputProps}
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
            return render({
              ...props,
              key,
              index,
              store,
              objectId,
              path: fieldPath,
              field: props.field,
              category,
              subcategory,
            });
          } else {
            return (
              <InputComponent
                key={key}
                store={store}
                objectId={objectId}
                path={fieldPath}
                field={props.field}
                category={category}
                subcategory={subcategory}
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
  Component,
  store,
  objectId,
  path,
  field,
  category,
  categoryFnParams,
  subcategory,
  subcategoryFnParams,
  label,
  hint,
  description,
  actionLabel,
  idField="index",
  fieldLabel,
  fields=[],
  newItemSpec={},
  sortable=true,
  renderItem,
  showBottomAddButton,
  inputProps={},
  narrow,
  simpleList,
  children,
  filterable,
  Filter,
  AddItem,
  shrink=false,
  ...componentProps
}) => {
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const location = useLocation();
  const values = (store.GetMetadata({objectId, path, field}) || []);
  simpleList = simpleList || (!renderItem && (!fields || fields.length === 0));

  if(categoryFnParams) {
    category = CategoryFn({store, objectId, path, field, params: categoryFnParams});
  }

  if(subcategoryFnParams) {
    subcategory = CategoryFn({store, objectId, path, field, params: subcategoryFnParams});
  }

  const items = values.map((value, index) => {
    const id = idField === "." ? value : (idField === "index" ? index.toString() : value[idField]) || "";

    if(
      filterable &&
      debouncedFilter &&
      !(
        (Filter && Filter({value, filter: debouncedFilter})) ||
        (value?.toString() || "").toLowerCase().includes(debouncedFilter.toLowerCase())
      )
    ) {
      return null;
    }

    return (
      <Draggable key={`draggable-item-${id || index}`} index={index} draggableId={`item-${id}`}>
        {(provided, snapshot) => (
          <Paper
            withBorder={!simpleList}
            shadow={snapshot.isDragging ? "lg" : ""}
            p={simpleList ? 0 : "sm"}
            maw={uiStore.inputWidthWide}
            ref={provided.innerRef}
            key={`list-item-${id}`}
            {...provided.draggableProps}
          >
            <Group align="start" style={{position: "relative"}} pr={40} pl={sortable ? 40 : 0}>
              <div
                style={{
                  display: sortable ? "block" : "none",
                  cursor: "grab",
                  position: "absolute",
                  top: simpleList ? 5 : 0,
                  left: 0
                }}
                {...provided.dragHandleProps}
              >
                <IconGripVertical/>
              </div>
              <Container p={0} m={0} fluid w={shrink ? "max-content" : "100%"} maw="unset">
                <ListInputs
                  type={type}
                  Component={Component}
                  store={store}
                  objectId={objectId}
                  path={path}
                  field={field}
                  category={category}
                  subcategory={subcategory}
                  actionLabel={actionLabel}
                  fieldLabel={fieldLabel}
                  fields={fields}
                  index={index}
                  renderItem={renderItem}
                  inputProps={inputProps}
                />
              </Container>

              <IconButton
                label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: fieldLabel})}
                style={{position: "absolute", top: 0, right: 0}}
                Icon={IconX}
                onClick={() => {
                  ConfirmDelete({
                    listItem: true,
                    itemName: fieldLabel,
                    onConfirm: () => store.RemoveListElement({
                      objectId,
                      page: location.pathname,
                      path,
                      field,
                      index,
                      category,
                      subcategory,
                      label: actionLabel || fieldLabel
                    })
                  });
                }}
              />
            </Group>
          </Paper>
        )}
      </Draggable>
    );
  });

  const addButton = (
    <IconButton
      label={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel})}
      Icon={IconPlus}
      onClick={async () => {
        let value = simpleList ? "" : newItemSpec;
        if(AddItem) {
          value = await AddItem();
        }

        store.InsertListElement({
          objectId,
          page: location.pathname,
          path,
          field,
          value,
          category,
          subcategory,
          label: actionLabel || fieldLabel
        });
      }}
    />
  );

  showBottomAddButton = showBottomAddButton || items.length >= 5;

  return (
    <>
      {
        !filterable ? null :
          <TextInput
            label={rootStore.l10n.components.inputs.filter}
            mb="xs"
            value={filter}
            onChange={event => setFilter(event.target.value)}
            maw={simpleList || narrow ? uiStore.inputWidth : uiStore.inputWidthWide}
            {...componentProps}
          />
      }
      <InputWrapper
        label={label}
        description={description}
        hint={hint}
        maw={simpleList || narrow ? uiStore.inputWidth : uiStore.inputWidthWide}
        w="min-content"
        miw={`min(100%, ${shrink ? uiStore.inputWidthNarrow : uiStore.inputWidth}px)`}
        {...componentProps}
      >
        <Container p={0} pb={showBottomAddButton ? 50 : 0} m={0} mt={items.length > 0 ? "md" : 0} maw="unset">
          { children }
          <DragDropContext
            onDragEnd={({source, destination}) =>
              store.MoveListElement({
                objectId,
                page: location.pathname,
                path,
                field,
                index: source.index,
                newIndex: destination.index,
                category,
                subcategory,
                label: actionLabel || fieldLabel
              })
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
    </>
  );
});

const CollectionTableRows = observer(({
  showDragHandle,
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  actionLabel,
  columns=[],
  fieldLabel,
  idField=".",
  nameField,
  GetName,
  values,
  routePath="",
  editable=true,
  Actions
}) => {
  return (
    values.map((value, index) => {
      const id = idField === "." ? value : (idField === "index" ? index.toString() : value[idField]) || "";
      const name = (GetName && GetName(value)) || nameField && value[nameField];

      return (
        <Draggable key={`draggable-item-${id || index}}`} index={index} draggableId={`item-${id}`}>
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
                <td key={`td-${id}-${field || index}`} style={{width}}>
                  <Group position={centered ? "center" : "left"}>
                    { render ? render(value, index) : <Text sx={{wordWrap: "anywhere"}}>{value[field] || ""}</Text> }
                  </Group>
                </td>
              )}
              <td style={{width: "100px"}}>
                <Group spacing={6} position="center" noWrap onClick={event => event.stopPropagation()}>
                  {
                    !Actions ? null :
                      Actions(value)
                  }
                  {
                    !editable ? null :
                      <IconButton
                        label={LocalizeString(rootStore.l10n.components.inputs.edit, {item: name || fieldLabel})}
                        component={Link}
                        to={UrlJoin(location.pathname, routePath || "", id)}
                        color="purple.6"
                        Icon={IconEdit}
                      />
                  }
                  <IconButton
                    label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: name || fieldLabel})}
                    color="red.5"
                    Icon={IconTrashX}
                    onClick={() => {
                      ConfirmDelete({
                        listItem: !name,
                        itemName: name || fieldLabel,
                        onConfirm: () => store.RemoveListElement({
                          objectId,
                          page: location.pathname,
                          path,
                          field,
                          index,
                          category,
                          subcategory,
                          label: name || actionLabel || fieldLabel,
                          useLabel: !!name
                        })
                      });
                    }}
                  />
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
  categoryFnParams,
  category,
  subcategoryFnParams,
  subcategory,
  label,
  description,
  hint,
  actionLabel,
  columns=[],
  fieldLabel,
  newItemSpec={},
  idField="index",
  idPrefix,
  nameField,
  GetName,
  routePath="",
  filterable,
  Filter,
  editable=true,
  width="Wide",
  AddItem,
  Actions
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  let values = store.GetMetadata({objectId, path, field}) || [];
  const maxWidth = uiStore[`inputWidth${width}`];

  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const filteredValues = filterable && debouncedFilter && Filter ?
    values.filter(value => Filter({filter: debouncedFilter, value})) :
    values;

  if(categoryFnParams) {
    category = CategoryFn({store, objectId, path, field, params: categoryFnParams});
  }

  if(subcategoryFnParams) {
    subcategory = CategoryFn({store, objectId, path, field, params: subcategoryFnParams});
  }

  // Only show bottom add button if there are a lot of entries
  const showBottomAddButton = values.length >= 10;
  const addButton = (
    <IconButton
      label={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel})}
      Icon={IconPlus}
      onClick={async () => {
        if(AddItem) {
          const id = await AddItem();

          if(id) {
            navigate(UrlJoin(location.pathname, routePath || "", id));
          }
          return;
        }

        let id = values.length.toString();
        let newEntry = {...newItemSpec};

        if(idField !== "index") {
          id = GenerateUUID();

          if(idPrefix) {
            id = `${idPrefix}${id}`;
          }

          newEntry[idField] = id;
        }

        store.InsertListElement({
          objectId,
          page: location.pathname,
          path,
          field,
          value: newEntry,
          category,
          subcategory,
          label: actionLabel || fieldLabel,
          useLabel: false
        });

        navigate(UrlJoin(location.pathname, routePath || "", id));
      }}
    />
  );

  const showDragHandle = !debouncedFilter;

  return (
    <InputWrapper label={label} description={description} hint={hint} m={0} mb="xl" maw={maxWidth} wrapperProps={{descriptionProps: {style: {paddingRight: "50px"}}}}>
      <Container p={0} m={0} pb={showBottomAddButton ? 50 : "md"} mt="lg">
        {
          !filterable ? null :
            <TextInput mb="md" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter" />
        }

        <DragDropContext
          onDragEnd={({source, destination}) =>
            store.MoveListElement({
              objectId,
              page: location.pathname,
              path,
              field,
              index: source.index,
              newIndex: destination.index,
              category,
              subcategory,
              label: actionLabel || fieldLabel,
              useLabel: false
            })
          }
        >
          <Table
            withBorder
            verticalSpacing="xs"
          >
            <thead>
            <tr>
              { showDragHandle ? <th style={{width: "50px"}}></th> : null }
              {
                columns.map(({label, centered, width}) =>
                  <th key={`th-${label}`} style={{width}}>
                    <Group position={centered ? "center" : "left"}>
                      {label}
                    </Group>
                  </th>
                )
              }
              <th style={{width: "120px"}}></th>
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
                    category={category}
                    subcategory={subcategory}
                    label={label}
                    actionLabel={actionLabel}
                    columns={columns}
                    values={filteredValues}
                    idField={idField}
                    nameField={nameField}
                    GetName={GetName}
                    fieldLabel={fieldLabel}
                    routePath={routePath}
                    editable={editable}
                    Actions={Actions}
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


// A table for 'reference' lists (key->value instead of array)
const ReferenceTable = observer(({
  store,
  objectId,
  path,
  field,
  category,
  subcategory,
  label,
  fieldLabel,
  description,
  hint,
  columns=[],
  routePath="",
  pageSize=50,
  nameField="name",
  filterable,
  filterFields=[],
  Filter,
  excludedKeys=[],
  protectedKeys=[],
  editable=true,
  selectedRecords,
  setSelectedRecords,
  width="Wide",
  AddItem,
  CopyItem,
  Actions
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const map = store.GetMetadata({objectId, path, field}) || {};
  const values = Object.keys(map)
    .filter(key => !excludedKeys.includes(key))
    .map(key => map[key]);
  const maxWidth = uiStore[`inputWidth${width}`];

  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [sortStatus, setSortStatus] = useState({columnAccessor: nameField, direction: "asc"});
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilter]);

  let filteredValues = values;
  if(filterable) {
    filteredValues = Filter ?
      values.filter(value => Filter({filter: debouncedFilter, value})) :
      values.filter(value => !!filterFields.find(field => (value[field]?.toLowerCase() || "").includes(debouncedFilter.toLowerCase())));
  }

  filteredValues = filteredValues.sort(
    SortTable({
      sortStatus,
      // Keep special items at the top
      AdditionalCondition: protectedKeys.length === 0 ? undefined :
        (a, b) =>
          protectedKeys.includes(a.id) ?
            protectedKeys.includes(b.id) ? undefined : -1 :
            protectedKeys.includes(b.id) ? 1 : undefined
    })
  );

  const pagedValues = filteredValues.slice((page - 1) * pageSize, ((page - 1) * pageSize) + pageSize);

  // Only show bottom add button if there are a lot of entries
  const showBottomAddButton = values.length >= 10;

  let addButton;
  if(editable && AddItem) {
    addButton = (
      <IconButton
        label={LocalizeString(rootStore.l10n.components.inputs.add, {item: fieldLabel})}
        Icon={IconPlus}
        onClick={async () => {
          const newKey = await AddItem();

          if(newKey) {
            navigate(UrlJoin(location.pathname, routePath || "", newKey));
          }
        }}
      />
    );
  }

  return (
    <InputWrapper label={label} description={description} hint={hint} m={0} mb="xl" maw={maxWidth} wrapperProps={{descriptionProps: {style: {paddingRight: "50px"}}}}>
      <Container p={0} m={0} pb={showBottomAddButton ? 50 : "md"} mt="lg">
        {
          !filterable ? null :
            <TextInput mb="md" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter" />
        }
        <Paper maw={maxWidth}>
          <DataTable
            minHeight={filteredValues.length === 0 ? 200 : 0}
            withBorder
            highlightOnHover
            idAccessor="id"
            records={pagedValues}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            totalRecords={filteredValues.length}
            recordsPerPage={pageSize}
            page={values.length > pageSize ? page : undefined}
            onPageChange={page => setPage(page)}
            selectedRecords={selectedRecords}
            onSelectedRecordsChange={setSelectedRecords}
            columns={[
              ...columns,
              !editable ? null :
              {
                accessor: "id",
                width: 120 + (Actions ? 60 : 0) + (CopyItem ? 60 : 0),
                title: "",
                render: item => {
                  const itemName = item[nameField] || fieldLabel;

                  return (
                    <Group position="right">
                      {
                        !Actions ? null :
                          Actions(item)
                      }
                      <IconButton
                        label={LocalizeString(rootStore.l10n.components.inputs.edit, {item: itemName})}
                        component={Link}
                        to={UrlJoin(location.pathname, routePath || "", item.id)}
                        color="purple.6"
                        Icon={IconEdit}
                      />
                      {
                        !CopyItem ? null :
                          <IconButton
                            label={LocalizeString(rootStore.l10n.components.inputs.copy, {item: item.label})}
                            color="blue.6"
                            Icon={IconCopy}
                            onClick={async () =>
                              await Confirm({
                                title: LocalizeString(rootStore.l10n.components.inputs.copy, {item: item.label}),
                                text: LocalizeString(rootStore.l10n.components.inputs.copy_confirm, {item: item.label}),
                                onConfirm: async () => await CopyItem({item})
                              })
                            }
                          />
                      }
                      <IconButton
                        disabled={protectedKeys.includes(item.id)}
                        label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: itemName})}
                        color="red.5"
                        Icon={IconTrashX}
                        onClick={() => {
                          ConfirmDelete({
                            itemName: itemName,
                            onConfirm: () => {
                              store.RemoveField({
                                objectId,
                                page,
                                path: UrlJoin(path, field),
                                field: item.id,
                                category,
                                subcategory,
                                label: itemName
                              });
                            }
                          });
                        }}
                      />
                    </Group>
                  );
                }
              }
            ].filter(column => column)}
          />
        </Paper>
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
  Input,
  Hidden: props => <Input {...props} type="text" hidden />,
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
  Date: props => <Input {...props} type="date" />,
  DateTime: props => <Input {...props} type="datetime" />,
  Select: props => <Input {...props} type="select" />,
  MultiSelect,
  RichText: RichTextInput,
  Password,
  Checkbox: CheckboxInput,
  SingleImageInput,
  ImageInput,
  List,
  CollectionTable,
  ReferenceTable,
  FabricBrowser: FabricBrowserInput,
  File: FileInput,
  InputWrapper
};
