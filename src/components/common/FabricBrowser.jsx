import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {ActionIcon, Button, Container, Group, Modal, Text, TextInput} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {rootStore, fabricBrowserStore, uiStore} from "Stores";
import {SortTable} from "Helpers/Misc.js";
import {useDebouncedValue} from "@mantine/hooks";
import {IconArrowBackUp as IconBackArrow} from "@tabler/icons-react";

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
          <IconBackArrow />
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
        onRowClick={record => Submit(record.objectId)}
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

export const FabricBrowser = observer(({title, Close, Submit}) => {
  const [libraryId, setLibraryId] = useState(undefined);

  return (
    <Modal opened onClose={Close} centered size={1000} title={title} padding="xl">
      {
        libraryId ?
          <ObjectBrowser libraryId={libraryId} Back={() => setLibraryId(undefined)} Submit={objectId => Submit({libraryId, objectId})}/> :
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

export default FabricBrowser;
