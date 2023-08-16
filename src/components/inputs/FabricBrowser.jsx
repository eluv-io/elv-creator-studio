import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {
  Input as MantineInput,
  Paper,
  ActionIcon,
  Button,
  Container,
  Group,
  Modal,
  Text,
  TextInput,
  Image
} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {rootStore, fabricBrowserStore, uiStore} from "Stores";
import {SortTable} from "Helpers/Misc.js";
import {useDebouncedValue} from "@mantine/hooks";
import {ConfirmDelete, InputLabel} from "./Inputs.jsx";
import Video from "Components/common/Video.jsx";
import {LocalizeString} from "Components/common/Misc.jsx";
import {useLocation} from "react-router-dom";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";

import {
  IconArrowBackUp,
  IconSelect,
  IconPlayerPlay,
  IconPlayerPause,
  IconX
} from "@tabler/icons-react";

const ParseContentID = value => {
  if(!value) { return; }

  try {
    let objectId;
    if(value.startsWith("iq__")) {
      objectId = value;
    } else if(value.startsWith("hq__")) {
      objectId = rootStore.utils.DecodeVersionHash(value).objectId;
    } else {
      objectId = rootStore.utils.AddressToObjectId(value);
    }

    if(rootStore.utils.HashToAddress(objectId).length === 42) {
      // Valid
      return objectId;
    }
    // eslint-disable-next-line no-empty
  } catch(error) {}
};

// Form for inputing object id / hash / contract directly
const DirectSelectionForm = ({Submit}) => {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: { contentId: "" },
    validate: {
      contentId: contentId => {
        if(!ParseContentID(contentId)) {
          return rootStore.l10n.components.fabric_browser.validation.invalid_content_id;
        }
      }
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(async values => {
          setSubmitting(true);

          try {
            const objectId = ParseContentID(values.contentId);
            const libraryId = await rootStore.LibraryId({objectId});
            await Submit({libraryId, objectId});
            modals.closeAll();
          } catch(error) {
            rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
            form.setFieldError("contentId", rootStore.l10n.components.fabric_browser.validation.invalid_content_id);
            setSubmitting(false);
          }
        })}
      >
        <TextInput
          data-autofocus
          label={rootStore.l10n.components.fabric_browser.content_id}
          placeholder={rootStore.l10n.components.fabric_browser.direct_selection_placeholder}
          {...form.getInputProps("contentId")}
        />
        <Group mt="md">
          <Button
            w="100%"
            loading={submitting}
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

const DirectSelectionButton = observer(({label, Submit}) => {
  return (
    <ActionIcon
      size={36}
      onClick={() =>
        modals.open({
          title: LocalizeString(rootStore.l10n.components.fabric_browser.title_with_label, {item: label}),
          centered: true,
          children:
            <DirectSelectionForm Submit={Submit} />,
          overlayProps: {
            zIndex: 202
          }
        })
      }
    >
      <IconSelect />
    </ActionIcon>
  );
});

const ObjectBrowser = observer(({label, libraryId, Back, Submit}) => {
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 500);
  const [loading, setLoading] = useState(true);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "name", direction: "asc"});

  useEffect(() => {
    setLoading(true);
    fabricBrowserStore.LoadObjects({
      libraryId,
      sortStatus,
      filter: debouncedFilter
    })
      .finally(() => setLoading(false));
  }, [libraryId, sortStatus, debouncedFilter]);

  const library = fabricBrowserStore.libraries[libraryId];

  const records = (fabricBrowserStore.objects[libraryId]?.objects || [])
    .map(record => ({...record}))
    .sort(SortTable({sortStatus}));

  return (
    <Container p={0}>
      <Group mb="md" align="center">
        <ActionIcon aria-label={rootStore.l10n.components.fabric_browser.back_to_library_selection} variant="transparent" onClick={Back}>
          <IconArrowBackUp />
        </ActionIcon>
        <Text>{ library.name }</Text>
      </Group>
      <Group align="end" mb="md">
        <TextInput style={{flexGrow: 1}} label={rootStore.l10n.components.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
        <DirectSelectionButton label={label} Submit={Submit} />
      </Group>
      <DataTable
        height={uiStore.viewportHeight - 400}
        fetching={loading}
        idAccessor="objectId"
        sortStatus={sortStatus}
        withBorder
        onSortStatusChange={setSortStatus}
        highlightOnHover
        onRowClick={async record => await Submit({libraryId, objectId: record.objectId})}
        records={records}
        columns={[
          { accessor: "name", title: rootStore.l10n.components.fabric_browser.columns.name, sortable: true, render: ({name}) => <Text style={{wordWrap: "anywhere"}}>{name}</Text> },
          { accessor: "objectId", title: rootStore.l10n.components.fabric_browser.columns.object_id }
        ]}
      />
    </Container>
  );
});

const LibraryBrowser = observer(({label, Submit}) => {
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [loading, setLoading] = useState(true);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "name", direction: "asc"});

  useEffect(() => {
    setLoading(true);
    fabricBrowserStore.LoadLibraries()
      .finally(() => setLoading(false));
  }, []);

  const records = Object.values(fabricBrowserStore.libraries)
    .filter(record => !debouncedFilter || record.name.toLowerCase().includes(filter) || record.libraryId.includes(filter))
    .sort(SortTable({sortStatus}));

  return (
    <Container p={0}>
      <Group align="end" mb="md">
        <TextInput style={{flexGrow: 1}} label={rootStore.l10n.components.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
        <DirectSelectionButton label={label} Submit={Submit} />
      </Group>
      <DataTable
        height={uiStore.viewportHeight - 400}
        fetching={loading}
        withBorder
        idAccessor="libraryId"
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        highlightOnHover
        onRowClick={record => Submit({libraryId: record.libraryId})}
        records={records}
        columns={[
          { accessor: "name", title: rootStore.l10n.components.fabric_browser.columns.name, sortable: true, render: ({name}) => <Text style={{wordWrap: "anywhere"}}>{name}</Text> },
          { accessor: "libraryId", title: rootStore.l10n.components.fabric_browser.columns.library_id }
        ]}
      />
    </Container>
  );
});

export const FabricBrowser = observer(({title, label, Close, Submit}) => {
  const [libraryId, setLibraryId] = useState(undefined);

  title = title ||
    (label && LocalizeString(rootStore.l10n.components.fabric_browser.title_with_label, {item: label})) ||
    rootStore.l10n.components.fabric_browser[libraryId ? "select_object" : "select_library"];

  const SubmitContent = async ({libraryId, objectId}) => {
    if(!objectId) {
      setLibraryId(libraryId);
    } else {
      await Submit({libraryId, objectId});
      Close();
    }
  };

  return (
    <Modal opened onClose={Close} centered size={1000} title={title} padding="xl">
      {
        libraryId ?
          <ObjectBrowser label={label} libraryId={libraryId} Back={() => setLibraryId(undefined)} Submit={SubmitContent}/> :
          <LibraryBrowser label={label} Close={Close} Submit={SubmitContent}/>
      }
    </Modal>
  );
});

export const FabricBrowserButton = observer(({fabricBrowserProps, ...props}) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button {...props} onClick={() => setShow(true)} />
      { show ? <FabricBrowser {...fabricBrowserProps} Close={() => setShow(false)} /> : null }
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
  }, [value]);

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
      <Paper withBorder px="xl" pt="md" pb="lg" mb="md" maw={500}>
        <MantineInput.Wrapper
          label={<InputLabel label={label} hint={hint} />}
          description={description}
          style={{position: "relative", display: "flex", flexDirection: "column", justifyContent: "center"}}
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
        </MantineInput.Wrapper>
      </Paper>
    </>
  );
});

export default FabricBrowser;
