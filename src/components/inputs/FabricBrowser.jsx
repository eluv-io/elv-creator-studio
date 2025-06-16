import FabricBrowserStyles from "@/assets/stylesheets/modules/fabric-browser.module.scss";

import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {
  Button,
  Container,
  Group,
  Modal,
  Text,
  TextInput,
  Tooltip
} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {rootStore, fabricBrowserStore, uiStore} from "@/stores";
import {CreateModuleClassMatcher, SortTable} from "@/helpers/Misc.js";
import {useDebouncedValue} from "@mantine/hooks";
import {IconButton, LocalizeString, SVGIcon} from "@/components/common/Misc.jsx";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";

import FolderIcon from "@/assets/icons/folder.svg";
import ObjectIcon from "@/assets/icons/file.svg";
import VideoIcon from "@/assets/icons/video.svg";
import CompositionIcon from "@/assets/icons/composition.svg";
import ClipIcon from "@/assets/icons/clip.svg";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg";

const S = CreateModuleClassMatcher(FabricBrowserStyles);

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
            await Submit(await fabricBrowserStore.LoadObjectDetails({objectId}));
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

const VideoBrowser = observer(({label, libraryId, objectId, allowCompositions, allowClips, Back, Submit}) => {
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [debouncedFilter] = useDebouncedValue(filter, 500);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "name", direction: "asc"});

  useEffect(() => {
    fabricBrowserStore.LoadObjectDetails({
      libraryId,
      objectId
    });
  }, [libraryId, objectId]);

  const info = fabricBrowserStore.objectDetails[objectId];

  let records = [
    { libraryId, objectId, id: objectId, name: info.name, source: "Main Content", type: "main", duration: info.duration },
    ...(allowCompositions ? info.compositions.slice().sort(SortTable({sortStatus})) : []),
    ...(allowClips ? info.clips.slice().sort(SortTable({sortStatus})) : [])
  ]
    .filter(record =>
      !debouncedFilter ||
      record.name.toLowerCase().includes(debouncedFilter) ||
      record.source.toLowerCase().includes(debouncedFilter)
    );

  if(sortStatus.columnAccessor !== "name") {
    records = records.sort(SortTable({sortStatus}));
  }

  const library = fabricBrowserStore.libraries[libraryId];

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
        <Text>{ library?.name || libraryId }</Text>
      </Group>
      <Group align="end" mb="md">
        <TextInput style={{flexGrow: 1}} label={rootStore.l10n.components.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
        <DirectSelectionButton label={label} Submit={Submit} />
      </Group>
      <DataTable
        height={Math.max(250, uiStore.viewportHeight - 350)}
        fetching={loading}
        idAccessor="id"
        sortStatus={sortStatus}
        withBorder
        onSortStatusChange={setSortStatus}
        highlightOnHover
        onRowClick={async record => {
          setLoading(true);
          try {
            await Submit(record);
          } catch(error) {
            rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
            setLoading(false);
          }
        }}
        records={records}
        columns={[
          {
            accessor: "name",
            title: rootStore.l10n.components.fabric_browser.columns.name,
            sortable: true,
            render: ({name, type}) =>
              <Group>
                <SVGIcon
                  icon={
                    type === "composition" ? CompositionIcon :
                      type === "clip" ? ClipIcon : VideoIcon
                  }
                />
                <Text style={{wordWrap: "anywhere"}}>{name}</Text>
              </Group>
          },
          { accessor: "source", sortable: true, title: rootStore.l10n.components.fabric_browser.columns.source },
          { accessor: "duration", sortable: true, width: 150, title: rootStore.l10n.components.fabric_browser.columns.duration, render: ({duration}) => duration },
        ].filter(c => c)}
      />
    </Container>
  );
});

const ObjectBrowser = observer(({label, libraryId, video, allowCompositions, allowClips, Back, Submit}) => {
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 500);
  const [loading, setLoading] = useState(true);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "name", direction: "asc"});
  const [page, setPage] = useState(1);
  const [results, setResults] = useState({objects: [], paging: []});
  const perPage = Math.floor((window.innerHeight * 0.9 - 360) / 39);

  useEffect(() => {
    setLoading(true);
    fabricBrowserStore.LoadObjects({
      libraryId,
      sortStatus,
      filter: debouncedFilter,
      page,
      perPage
    })
      .then(setResults)
      .finally(() => setLoading(false));
  }, [libraryId, page, sortStatus, debouncedFilter]);

  const library = fabricBrowserStore.libraries[libraryId];

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
        <Text>{ library?.name || libraryId }</Text>
      </Group>
      <Group align="end" mb="md">
        <TextInput style={{flexGrow: 1}} label={rootStore.l10n.components.fabric_browser.filter} value={filter} onChange={event => setFilter(event.target.value)} />
        <DirectSelectionButton label={label} Submit={Submit} />
      </Group>
      <DataTable
        page={page}
        onPageChange={newPage => setPage(newPage)}
        recordsPerPage={perPage}
        totalRecords={results.paging?.items}
        height={Math.max(250, uiStore.viewportHeight - 350)}
        fetching={loading}
        idAccessor="objectId"
        sortStatus={sortStatus}
        withBorder
        onSortStatusChange={newSortStatus => {
          setPage(1);
          setSortStatus(newSortStatus);
        }}
        highlightOnHover
        onRowClick={async record => {
          setLoading(true);
          try {
            await Submit({
              libraryId,
              objectId: record.objectId,
              source: "Main Content",
              type: "main",
              duration: record.duration,
              hasCompositions: record.hasCompositions,
              hasClips: record.hasClips,
            });
          } catch(error) {
            rootStore.DebugLog({error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
            setLoading(false);
          }
        }}
        records={results.objects}
        columns={[
          {
            accessor: "name",
            title: rootStore.l10n.components.fabric_browser.columns.name,
            sortable: true,
            render: ({name, isVideo, hasClips, hasCompositions}) =>
              <Group noWrap align="center" maw={500}>
                <Group noWrap spacing={3}>
                  {
                    !allowCompositions && !allowClips ? null :
                      <SVGIcon icon={ChevronRightIcon} className={S("chevron", !hasCompositions && !hasClips ? "chevron--hidden" : "")} />
                  }
                  <SVGIcon icon={isVideo ? VideoIcon : ObjectIcon} />
                </Group>
                <Tooltip label={name} openDelay={500} offset={10}>
                  <Text fz={12} className="ellipsis">{name}</Text>
                </Tooltip>
              </Group>
          },
          !video ? null :
            { accessor: "duration", width: 120, title: rootStore.l10n.components.fabric_browser.columns.duration, render: ({duration}) => <Text fz={12}>{duration}</Text> },
          { accessor: "objectId", title: rootStore.l10n.components.fabric_browser.columns.object_id, render: ({objectId}) => <Text fz={12}>{objectId}</Text> },
        ].filter(c => c)}
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
          {
            accessor: "name",
            title: rootStore.l10n.components.fabric_browser.columns.name,
            sortable: true,
            render: ({name}) =>
              <Group>
                <SVGIcon icon={FolderIcon} />
                <Text style={{wordWrap: "anywhere"}}>{name}</Text>
              </Group>
          },
          { accessor: "libraryId", title: rootStore.l10n.components.fabric_browser.columns.library_id }
        ]}
      />
    </Container>
  );
});

export const FabricBrowser = observer(({title, label, video, allowCompositions, allowClips, Close, Submit}) => {
  const [libraryId, setLibraryId] = useState(undefined);
  const [objectId, setObjectId] = useState(undefined);

  title = title ||
    (label && LocalizeString(rootStore.l10n.components.fabric_browser.title_with_label, {item: label})) ||
    rootStore.l10n.components.fabric_browser[libraryId ? "select_object" : "select_library"];

  const SubmitContent = async ({libraryId, objectId, hasCompositions, hasClips, ...info}) => {
    if(!objectId) {
      setLibraryId(libraryId);
    } else if((allowClips && hasClips) || (allowCompositions && hasCompositions)) {
      setLibraryId(libraryId);
      setObjectId(objectId);
    } else {
      await Submit({libraryId, objectId, ...info});
      Close();
    }
  };

  return (
    <Modal opened onClose={Close} centered size={1000} title={title} padding="xl">
      {
        objectId ?
          <VideoBrowser
            allowCompositions={allowCompositions}
            allowClips={allowClips}
            libraryId={libraryId}
            objectId={objectId}
            label={label}
            Back={() => setObjectId(undefined)}
            Submit={SubmitContent}
          /> :
        libraryId ?
          <ObjectBrowser
            video={video}
            allowCompositions={allowCompositions}
            allowClips={allowClips}
            label={label}
            libraryId={libraryId}
            Back={() => setLibraryId(undefined)}
            Submit={SubmitContent}
          /> :
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
