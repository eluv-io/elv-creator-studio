import {
  Group,
  Text,
  Stack,
  TextInput,
  Paper,
  Select,
  MultiSelect,
  Modal,
  Button
} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {mediaCatalogStore, rootStore, uiStore} from "@/stores";
import UrlJoin from "url-join";
import {IconButton, LocalizeString} from "@/components/common/Misc";
import {DataTable} from "mantine-datatable";
import {useEffect, useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";
import {SortTable} from "@/helpers/Misc.js";
import {Link} from "react-router-dom";
import {IconEdit, IconTrashX} from "@tabler/icons-react";
import {ConfirmDelete} from "@/components/inputs/Inputs.jsx";
import {MediaItemImage} from "@/components/common/MediaCatalog";

const MediaTypes = [
  "Video",
  "Image",
  "Ebook",
  "HTML",
  "Link"
];

export const MediaItemTitle = observer(({mediaItem}) => {
  if(!mediaItem) { return null; }

  return (
    <Group noWrap>
      <MediaItemImage
        mediaItem={mediaItem}
        scale={400}
        width={40}
        height={40}
        fit="contain"
        position="left"
        style={{objectPosition: "left" }}
      />
      <Stack spacing={2}>
        <Text fz={12} fw={500} mb={2}>
          <Group spacing={5} align="top">
            { mediaItem.label || mediaItem.id }
          </Group>
        </Text>
        <Group spacing={3}>
          {
            mediaItem.tags?.map(tag =>
              <Paper
                withBorder
                radius="md"
                fz={11}
                py={0}
                px={5}
                key={`tag-${tag}`}
                sx={theme => ({backgroundColor: theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[2]})}
              >
                { tag }
              </Paper>
            )
          }
        </Group>
      </Stack>
    </Group>
  );
});

let mediaCatalogItemTableSettingsCache = {};

// Display and select from top level media, media lists and media collections
const MediaCatalogItemTable = observer(({
  type,
  allowTypeSelection,
  mediaCatalogId,
  mediaCatalogIds=[],
  excludedMediaIds=[],
  initialTagFilter,
  initialMediaTypeFilter,
  selectedRecords,
  setSelectedRecords,
  multiple=true,
  perPage=10,
  disableActions
}) => {
  let settingsCache = mediaCatalogItemTableSettingsCache;
  if(settingsCache.pathname !== location.pathname || settingsCache.search !== location.search) {
    mediaCatalogItemTableSettingsCache = {};
    settingsCache = undefined;
  }

  initialTagFilter = initialTagFilter || new URLSearchParams(window.location.search).get("tags")?.split(",");
  initialMediaTypeFilter = initialMediaTypeFilter || new URLSearchParams(window.location.search).get("media_type");

  const [selectedMediaCatalogId, setSelectedMediaCatalogId] = useState(mediaCatalogId || settingsCache?.mediaCatalogId || mediaCatalogIds[0]);
  const [selectedContentType, setSelectedContentType] = useState(type || settingsCache?.type || "media");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(perPage);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "label", direction: "asc"});
  const [filter, setFilter] = useState(settingsCache?.filter || "");
  const [mediaTypeFilter, setMediaTypefilter] = useState((settingsCache ? settingsCache.mediaType : initialMediaTypeFilter) || "");
  const [tagFilter, setTagFilter] = useState((settingsCache ? settingsCache.tags : initialTagFilter) || []);
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const mediaCatalog = mediaCatalogStore.mediaCatalogs[selectedMediaCatalogId];

  if(!mediaCatalog) { return null; }

  if(!["media", "media_lists", "media_collections"].includes(selectedContentType)) {
    throw Error("Missing type for MediaCatalogItemTable");
  }

  // Save settings so that they are applied when viewing the same table again
  useEffect(() => {
    mediaCatalogItemTableSettingsCache = {
      pathname: location.pathname,
      search: location.search,
      mediaCatalogId: selectedMediaCatalogId,
      type: selectedContentType,
      filter: debouncedFilter,
      mediaType: mediaTypeFilter,
      tags: tagFilter.length > 0 ? tagFilter : undefined
    };
  }, [selectedMediaCatalogId, selectedContentType, tagFilter, mediaTypeFilter, debouncedFilter]);

  useEffect(() => {
    setSelectedRecords && setSelectedRecords([]);
  }, [setSelectedRecords, selectedContentType]);

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const content = info[selectedContentType] || {};

  const mediaItems =
    Object.values(content)
      .filter(mediaItem => !excludedMediaIds.includes(mediaItem.id))
      .filter(mediaItem =>
        selectedContentType !== "media" ||
        !mediaTypeFilter ||
        mediaItem.media_type === mediaTypeFilter
      )
      .filter(mediaItem =>
        tagFilter.length === 0 ||
        !tagFilter.find(tag => !mediaItem.tags.includes(tag))
      )
      .filter(mediaItem =>
        !debouncedFilter ||
        mediaItem.label?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        mediaItem.title?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        mediaItem.catalog_title?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        mediaItem.id?.toLowerCase()?.includes(debouncedFilter.toLowerCase())
      )
      .sort(SortTable({sortStatus}));
  const mediaItemIds = mediaItems.map(mediaItem => mediaItem.id);

  const allRecordsSelected =
    !setSelectedRecords ? false :
      selectedRecords.length === mediaItems.length &&
      !selectedRecords.find(record => !mediaItemIds.includes(record.id));

  const mediaItemsPage = mediaItems.slice((page - 1) * pageSize, ((page - 1) * pageSize) + pageSize);

  return (
    <Paper maw={uiStore.inputWidthWide}>
      {
        mediaCatalogIds.length <= 1 && !allowTypeSelection ? null :
          <Group mb="xs">
            {
              mediaCatalogIds.length <= 1 ? null :
                <Select
                  label={rootStore.l10n.pages.media_catalog.form.categories.media_catalog}
                  onChange={value => setSelectedMediaCatalogId(value)}
                  value={selectedMediaCatalogId}
                  data={
                    mediaCatalogStore.allMediaCatalogs
                      .map(mediaCatalog => ({
                        label: mediaCatalog.name,
                        value: mediaCatalog.objectId
                      }))
                      .filter(({value}) => mediaCatalogIds.includes(value))
                  }
                />
            }
            {
              !allowTypeSelection ? null :
                <Select
                  label={rootStore.l10n.pages.media_catalog.form.type.label}
                  onChange={value => setSelectedContentType(value)}
                  value={selectedContentType}
                  data={[
                    { label: rootStore.l10n.pages.media_catalog.form.categories.media, value: "media" },
                    { label: rootStore.l10n.pages.media_catalog.form.categories.media_lists, value: "media_lists" },
                    { label: rootStore.l10n.pages.media_catalog.form.categories.media_collections, value: "media_collections" },
                  ]}
                />
            }
          </Group>
      }
      <Group grow align="center" mb="xs" spacing="xs">
        <TextInput
          label={l10n.media.list.filters.filter}
          value={filter}
          onChange={event => {
            setFilter(event.target.value);
            setPage(1);
          }}
        />
        {
          selectedContentType !== "media" ? null :
            <Select
              label={l10n.media.list.filters.media_type}
              value={mediaTypeFilter}
              onChange={type => {
                setMediaTypefilter(type);
                setPage(1);
              }}
              data={[
                {label: "Any", value: ""},
                ...MediaTypes
              ]}
            />
        }
        {
          (info.tags || []).length === 0 ? null :
            <MultiSelect
              searchable
              label={l10n.media.list.filters.tags}
              value={tagFilter}
              onChange={tags => {
                setTagFilter(tags);
                setPage(1);
              }}
              data={info.tags || []}
            />
        }
      </Group>
      <DataTable
        minHeight={mediaItems.length === 0 ? 200 : 0}
        withBorder
        highlightOnHover
        idAccessor="id"
        records={mediaItemsPage}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        totalRecords={mediaItems.length}
        recordsPerPage={pageSize}
        page={mediaItems.length > pageSize ? page : undefined}
        selectedRecords={selectedRecords}
        allRecordsSelectionCheckboxProps={
          !setSelectedRecords ? null :
            {
              style: multiple ? {} : {display: "none"},
              indeterminate: selectedRecords.length > 0 && !allRecordsSelected,
              checked: allRecordsSelected,
              onChange: () => allRecordsSelected ?
                setSelectedRecords([]) :
                setSelectedRecords(mediaItems)
            }
        }
        onRowClick={
        !setSelectedRecords ? undefined :
          record => {
            selectedRecords.includes(record) ?
              setSelectedRecords(selectedRecords.filter(otherRecord => otherRecord !== record)) :
              multiple ?
                setSelectedRecords([...selectedRecords, record]) :
                setSelectedRecords([record]);
          }
        }
        onSelectedRecordsChange={newSelectedRecords => {
          multiple ?
            setSelectedRecords(newSelectedRecords) :
            setSelectedRecords(newSelectedRecords.slice(-1));
        }}
        onPageChange={page => setPage(page)}
        columns={[
          {
            accessor: "label",
            sortable: true,
            title: l10n.media.list.columns.label,
            render: mediaItem => <MediaItemTitle mediaItem={mediaItem} />
          },
          selectedContentType !== "media" ? null :
            {
              accessor: "media_type",
              width: 125,
              sortable: true,
              title: l10n.media.list.columns.media_type,
              render: mediaItem => (
                <Text fz="xs">{mediaItem.media_type}</Text>
              )
            },
          selectedContentType !== "media_lists" ? null :
            {
              accessor: "media",
              width: 125,
              sortable: false,
              title: l10n.media.list.columns.media,
              render: mediaItem => (
                <Text fz="xs">{mediaItem.media?.length || 0}</Text>
              )
            },
          selectedContentType !== "media_collections" ? null :
            {
              accessor: "media_lists",
              width: 125,
              sortable: false,
              title: l10n.media.list.columns.media_lists,
              render: mediaItem => (
                <Text fz="xs">{mediaItem.media_lists?.length || 0}</Text>
              )
            },
          {
            accessor: "id",
            width: 120,
            title: "",
            hidden: disableActions,
            render: mediaItem => (
              <Group position="center">
                <IconButton
                  label={LocalizeString(rootStore.l10n.components.inputs.edit, {item: mediaItem.label})}
                  component={Link}
                  to={UrlJoin(location.pathname, mediaItem.id)}
                  color="blue.5"
                  Icon={IconEdit}
                />
                <IconButton
                  label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: mediaItem.label})}
                  color="red.5"
                  Icon={IconTrashX}
                  onClick={() => {
                    ConfirmDelete({
                      itemName: mediaItem.label,
                      onConfirm: () => mediaCatalogStore.RemoveMediaItem({
                        page: location.pathname,
                        type: selectedContentType,
                        mediaCatalogId: selectedMediaCatalogId,
                        mediaItem
                      })
                    });
                  }}
                />
              </Group>
            )
          }
        ].filter(column => column)}
      />
    </Paper>
  );
});

export const MediaCatalogItemSelectionModal = observer(({
  Submit,
  Close,
  ...props
}) => {
  const [selectedRecords, setSelectedRecords] = useState([]);

  return (
    <Modal
      title={rootStore.l10n.pages.media_catalog.form.media.modal.media}
      size={uiStore.inputWidthWide}
      opened
      onClose={Close}
      style={{position: "relative", zIndex: 1000000}}
    >
      <Paper p="xl" pt="md" withBorder>
        <MediaCatalogItemTable
          {...props}
          key={`catalog-items-${props.type}`}
          disableActions
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
        />
        <Group position="right" spacing="md" mt={50}>
          <Button variant="subtle" w={200} onClick={Close}>
            { rootStore.l10n.components.actions.cancel }
          </Button>
          <Button
            w={200}
            disabled={selectedRecords.length === 0}
            onClick={async () => {
              await Submit(selectedRecords.map(mediaItem => mediaItem.id));
              Close();
            }}
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </Paper>
    </Modal>
  );
});

export default MediaCatalogItemTable;
