import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Input as MantineInput, Paper, ActionIcon, Button, Container, Group, Modal, Text, TextInput} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {rootStore, fabricBrowserStore, uiStore} from "Stores";
import {SortTable} from "Helpers/Misc.js";
import {useDebouncedValue} from "@mantine/hooks";
import {ConfirmDelete, InputLabel} from "./Inputs.jsx";
import Video from "Components/common/Video.jsx";

import {
  IconArrowBackUp,
  IconSelect,
  IconPlayerPlay,
  IconPlayerPause,
  IconX
} from "@tabler/icons-react";
import {LocalizeString} from "../common/Misc.jsx";
import {useLocation} from "react-router-dom";

const ObjectBrowser = observer(({libraryId, Back, Submit}) => {
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
      <TextInput mb="md" label={rootStore.l10n.components.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
      <DataTable
        height={uiStore.viewportHeight - 400}
        fetching={loading}
        idAccessor="objectId"
        sortStatus={sortStatus}
        withBorder
        onSortStatusChange={setSortStatus}
        highlightOnHover
        onRowClick={async record => {
          try {
            setLoading(true);
            await Submit(record.objectId);
          } catch(error) {
            rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
            setLoading(false);
          }
        }}
        records={records}
        columns={[
          { accessor: "name", title: rootStore.l10n.components.fabric_browser.columns.name, sortable: true, render: ({name}) => <Text style={{wordWrap: "anywhere"}}>{name}</Text> },
          { accessor: "objectId", title: rootStore.l10n.components.fabric_browser.columns.object_id }
        ]}
      />
    </Container>
  );
});

const LibraryBrowser = observer(({Submit}) => {
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
      <TextInput mb="md" label={rootStore.l10n.components.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
      <DataTable
        height={uiStore.viewportHeight - 400}
        fetching={loading}
        withBorder
        idAccessor="libraryId"
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        highlightOnHover
        onRowClick={record => Submit(record.libraryId)}
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

  return (
    <Modal opened onClose={Close} centered size={1000} title={title} padding="xl">
      {
        libraryId ?
          <ObjectBrowser
            libraryId={libraryId}
            Back={() => setLibraryId(undefined)}
            Submit={async objectId => {
              await Submit({libraryId, objectId});
              Close();
            }}
          /> :
          <LibraryBrowser Close={Close} Submit={setLibraryId}/>
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
  GetName,
  fabricBrowserProps={}
}) => {
  const location = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);

  GetName = GetName || ((metadata={}) => metadata.display_title || metadata.title || metadata.name || metadata["."]?.source);

  let value = store.GetMetadata({objectId, path, field});
  const name = value ? GetName(value) : "";

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
                  <Text fz="xs">
                    { name }
                  </Text>
                  <Text fz={8} color="dimmed">
                    {value["."]?.source}
                  </Text>
                </Container>

                {
                  !showPreview ? null :
                    <Paper mt="sm">
                      <Video videoLink={value}/>
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
