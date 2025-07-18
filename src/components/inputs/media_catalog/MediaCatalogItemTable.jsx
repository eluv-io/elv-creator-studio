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
import {ParseDate, SortTable} from "@/helpers/Misc.js";
import {Link} from "react-router-dom";
import {IconCopy, IconEdit, IconTrashX} from "@tabler/icons-react";
import {Confirm, ConfirmDelete} from "@/components/inputs/Inputs.jsx";
import {MediaItemImage, MediaItemPermissionIcon} from "@/components/common/MediaCatalog";

export const MediaItemTitle = observer(({mediaItem}) => {
  if(!mediaItem) { return null; }

  return (
    <Group noWrap>
      <MediaItemImage
        mediaItem={mediaItem}
        scale={100}
        width={40}
        height={40}
        miw={40}
        fit="contain"
        position="left"
        style={{objectPosition: "left" }}
      />
      <Stack spacing={2}>
        <Text fz={12} fw={500}>
          { mediaItem.label || mediaItem.id }
        </Text>
        <Text fz={11} fw={400} color="dimmed">
          { mediaItem.id }
        </Text>
        {
          mediaItem.type !== "media" || !mediaItem.live_video || !mediaItem.start_time ? null :
            <Text fz={11} fw={400} color="dimmed">
              { ParseDate(mediaItem.start_time).toLocaleString() }
            </Text>
        }
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
  initialFilter,
  initialTagFilter,
  initialMediaTypeFilter,
  selectedRecords,
  setSelectedRecords,
  multiple=true,
  perPage=10,
  disableActions
}) => {
  let settingsCache = mediaCatalogItemTableSettingsCache;
  if(settingsCache.pathname !== location.pathname) {
    mediaCatalogItemTableSettingsCache = {};
    settingsCache = undefined;
  }

  const urlParams = new URLSearchParams(location.search);
  initialFilter = decodeURIComponent(urlParams.get("filter") || "");
  initialTagFilter = decodeURIComponent(initialTagFilter || urlParams.get("tags") || "")?.split(",").filter(tag => tag);
  initialMediaTypeFilter = decodeURIComponent(initialMediaTypeFilter || urlParams.get("media_type") || "");

  const [selectedMediaCatalogId, setSelectedMediaCatalogId] = useState(mediaCatalogId || settingsCache?.mediaCatalogId || mediaCatalogIds[0]);
  const [selectedContentType, setSelectedContentType] = useState(type || settingsCache?.type || "media");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(perPage);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "label", direction: "asc"});
  const [filter, setFilter] = useState(initialFilter || settingsCache?.filter || "");
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
      .filter(mediaItem =>
        mediaItem.id &&
        !excludedMediaIds.includes(mediaItem.id)
      )
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
                ...mediaCatalogStore.MEDIA_TYPES
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
            accessor: "public",
            width: 120,
            textAlignment: "center",
            title: l10n.media.list.columns.permissions,
            render: mediaItem => <MediaItemPermissionIcon mediaItem={mediaItem} />
          },
          {
            accessor: "id",
            width: 180,
            title: "",
            hidden: disableActions,
            render: mediaItem => (
              <Group position="center">
                <IconButton
                  label={LocalizeString(rootStore.l10n.components.inputs.copy, {item: mediaItem.label})}
                  color="blue.6"
                  Icon={IconCopy}
                  onClick={async () =>
                    await Confirm({
                      title: LocalizeString(rootStore.l10n.components.inputs.copy, {item: mediaItem.label}),
                      text: LocalizeString(rootStore.l10n.components.inputs.copy_confirm, {item: mediaItem.label}),
                      onConfirm: () => mediaCatalogStore.CreateMediaItem({
                        page: location.pathname,
                        type: mediaItem.type === "collection" ?
                          "media_collections" : mediaItem.type === "list" ? "media_lists" : "media",
                        mediaType: mediaItem.media_type,
                        mediaCatalogId,
                        copyMediaItemId: mediaItem.id
                      })
                    })
                  }
                />
                <IconButton
                  label={LocalizeString(rootStore.l10n.components.inputs.edit, {item: mediaItem.label})}
                  component={Link}
                  to={UrlJoin(location.pathname, mediaItem.id)}
                  color="purple.6"
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
      centered
      onClose={Close}
      style={{position: "relative", zIndex: 1000000}}
      p={0}
    >
      <Paper p="xl" pt="md" withBorder>
        <MediaCatalogItemTable
          perPage={5}
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
