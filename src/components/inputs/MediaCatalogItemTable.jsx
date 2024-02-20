import {
  Group,
  Text,
  Image,
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
import {useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";
import {SortTable} from "@/helpers/Misc.js";
import {Link} from "react-router-dom";
import {IconEdit, IconTrashX} from "@tabler/icons-react";
import {ScaleImage} from "@/helpers/Fabric";
import {ConfirmDelete} from "@/components/inputs/Inputs.jsx";

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
      <Image width={100} height={56} miw={100} fit="contain" src={ScaleImage(mediaItem.image?.url, 400)} alt={mediaItem.title} withPlaceholder />
      <Stack spacing={2}>
        <Text fw={500}>
          <Group spacing={5} align="top">
            { mediaItem.catalog_title || mediaItem.title || mediaItem.id }
          </Group>
        </Text>
        <Text fz={11} mb={3} color="dimmed">{mediaItem.id}</Text>
        <Group spacing={3}>
          {
            mediaItem.tags?.map(tag =>
              <Paper
                withBorder
                radius="md"
                fz="xs"
                py={2}
                px={5}
                key={`tag-${tag}`}
                sx={theme => ({backgroundColor: theme.colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[3]})}
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

// Display and select from top level media, media lists and media collections
const MediaCatalogItemTable = observer(({
  type="media",
  mediaCatalogId,
  excludedMediaIds=[],
  initialTagFilter,
  initialMediaTypeFilter,
  selectedRecords,
  setSelectedRecords,
  perPage=50,
  disableActions
}) => {
  initialTagFilter = initialTagFilter || new URLSearchParams(window.location.search).get("tags")?.split(",");
  initialMediaTypeFilter = initialMediaTypeFilter || new URLSearchParams(window.location.search).get("media_type");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(perPage);
  const [sortStatus, setSortStatus] = useState({columnAccessor: "catalog_title", direction: "asc"});
  const [filter, setFilter] = useState("");
  const [mediaTypeFilter, setMediaTypefilter] = useState(initialMediaTypeFilter || "");
  const [tagFilter, setTagFilter] = useState(initialTagFilter || []);
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  if(!["media", "media_lists", "media_collections"].includes(type)) {
    throw Error("Missing type for MediaCatalogItemTable");
  }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const content = info[type] || {};

  const mediaItems =
    Object.values(content)
      .filter(mediaItem => !excludedMediaIds.includes(mediaItem.id))
      .filter(mediaItem =>
        type !== "media" ||
        !mediaTypeFilter ||
        mediaItem.media_type === mediaTypeFilter
      )
      .filter(mediaItem =>
        tagFilter.length === 0 ||
        !tagFilter.find(tag => !mediaItem.tags.includes(tag))
      )
      .filter(mediaItem =>
        !debouncedFilter ||
        mediaItem.title?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        mediaItem.catalog_title?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        mediaItem.id?.toLowerCase()?.includes(debouncedFilter.toLowerCase())
      )
      .sort(SortTable({sortStatus}));

  const mediaItemsPage = mediaItems.slice((page - 1) * pageSize, ((page - 1) * pageSize) + pageSize);

  return (
    <Paper maw={uiStore.inputWidthWide}>
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
          type !== "media" ? null :
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
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        page={page}
        onPageChange={page => setPage(page)}
        columns={[
          {
            accessor: "catalog_title",
            sortable: true,
            title: l10n.media.list.columns.title,
            render: mediaItem => <MediaItemTitle mediaItem={mediaItem} />
          },
          type !== "media" ? null :
            {
              accessor: "media_type",
              width: 125,
              sortable: true,
              title: l10n.media.list.columns.media_type,
              render: mediaItem => (
                <Text fz="xs">{mediaItem.media_type}</Text>
              )
            },
          type !== "media_lists" ? null :
            {
              accessor: "media",
              width: 125,
              sortable: false,
              title: l10n.media.list.columns.media,
              render: mediaItem => (
                <Text fz="xs">{mediaItem.media?.length || 0}</Text>
              )
            },
          type !== "media_collections" ? null :
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
                  label={LocalizeString(rootStore.l10n.components.inputs.edit, {item: mediaItem.title})}
                  component={Link}
                  to={UrlJoin(location.pathname, mediaItem.id)}
                  color="blue.5"
                  Icon={IconEdit}
                />
                <IconButton
                  label={LocalizeString(rootStore.l10n.components.inputs.remove, {item: mediaItem.title})}
                  color="red.5"
                  Icon={IconTrashX}
                  onClick={() => {
                    ConfirmDelete({
                      itemName: mediaItem.title,
                      onConfirm: () => mediaCatalogStore.RemoveMediaItem({
                        page: location.pathname,
                        type,
                        mediaCatalogId,
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
      title={rootStore.l10n.pages.media_catalog.form.media.modal.select}
      size={uiStore.inputWidthWide}
      opened
      onClose={Close}
    >
      <Paper p="xl" withBorder>
        <MediaCatalogItemTable
          {...props}
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
            onClick={() => Submit(selectedRecords.map(mediaItem => mediaItem.id))}
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </Paper>
    </Modal>
  );
});

export default MediaCatalogItemTable;
