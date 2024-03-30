import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {
  Button,
  Container,
  Group,
  Modal,
  Text,
  TextInput
} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {rootStore, fabricBrowserStore, uiStore} from "@/stores";
import {SortTable} from "@/helpers/Misc.js";
import {useDebouncedValue} from "@mantine/hooks";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";

import {
  IconArrowBackUp,
  IconSelect,
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
    <IconButton
      label={LocalizeString(rootStore.l10n.components.fabric_browser.title_with_label, {item: label})}
      size={36}
      Icon={IconSelect}
      tooltipProps={{position: "bottom"}}
      onClick={() =>
        modals.open({
          title: LocalizeString(rootStore.l10n.components.fabric_browser.title_with_label, {item: label}),
          centered: true,
          children:
            <DirectSelectionForm Submit={Submit} />
        })
      }
    />
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
        <IconButton
          label={rootStore.l10n.components.fabric_browser.back_to_library_selection}
          Icon={IconArrowBackUp}
          variant="transparent"
          onClick={Back}
          tooltipProps={{position: "bottom"}}
        />
        <Text>{ library.name }</Text>
      </Group>
      <Group align="end" mb="md">
        <TextInput style={{flexGrow: 1}} label={rootStore.l10n.components.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
        <DirectSelectionButton label={label} Submit={Submit} />
      </Group>
      <DataTable
        height={Math.max(250, uiStore.viewportHeight - 350)}
        fetching={loading}
        idAccessor="objectId"
        sortStatus={sortStatus}
        withBorder
        onSortStatusChange={setSortStatus}
        highlightOnHover
        onRowClick={async record => {
          setLoading(true);
          try {
            await Submit({libraryId, objectId: record.objectId});
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

const LibraryBrowser = observer(({label, Submit}) => {
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);
  const [loading, setLoading] = useState(false);
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
        height={Math.max(250, uiStore.viewportHeight - 350)}
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

export default FabricBrowser;
