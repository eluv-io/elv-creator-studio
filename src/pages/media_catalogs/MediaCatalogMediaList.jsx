import {
  Group,
  Text,
  Image,
  Stack,
  TextInput,
  Paper, Title, Container, Button, Select
} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {mediaCatalogStore, rootStore, uiStore} from "@/stores";
import UrlJoin from "url-join";
import {IconButton, LocalizeString} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";
import {DataTable} from "mantine-datatable";
import {useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";
import {SortTable} from "@/helpers/Misc.js";
import {Link, useNavigate, useParams} from "react-router-dom";
import {IconEdit, IconPlus, IconTrashX} from "@tabler/icons-react";
import {ScaleImage} from "@/helpers/Fabric";
import {ConfirmDelete} from "@/components/inputs/Inputs.jsx";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";

const CreateMediaCatalogMediaItemForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const form = useForm({
    initialValues: {
      title: "",
      mediaType: "Video"
    },
    validate: {
      title: value => value ? null : rootStore.l10n.pages.media_catalog.form.media.create.validation.title
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setCreating(true);
          Create({title: values.title, mediaType: values.mediaType})
            .catch(error => {
              rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              setCreating(false);
            })
            .then(() => {
              modals.closeAll();
            });
        })}
      >
        <Select
          withinPortal
          data-autofocus
          {...rootStore.l10n.pages.media_catalog.form.media.media_type}
          defaultValue="Video"
          mb="md"
          data={[
            "Video",
            "Image",
            "Ebook",
            "HTML",
            "Link"
          ]}
          {...form.getInputProps("mediaType")}
        />
        <TextInput
          data-autofocus
          {...rootStore.l10n.pages.media_catalog.form.media.title}
          {...form.getInputProps("title")}
        />
        <Group mt="md">
          <Button
            w="100%"
            loading={creating}
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
    </Container>
  );
};

const MediaCatalogMediaList = observer(() => {
  const navigate = useNavigate();

  const [sortStatus, setSortStatus] = useState({columnAccessor: "archive_title", direction: "asc"});
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [debouncedFilter] = useDebouncedValue(filter, 200);

  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_catalog.form;

  const mediaItems =
    Object.values(info.media || {})
      .filter(mediaItem =>
        !typeFilter ||
        mediaItem.media_type === typeFilter
      )
      .filter(mediaItem =>
        !tagFilter ||
        mediaItem.tags?.includes(tagFilter)
      )
      .filter(mediaItem =>
        !debouncedFilter ||
        mediaItem.title?.toLowerCase()?.includes(debouncedFilter.toLowerCase()) ||
        mediaItem.archive_title?.toLowerCase()?.includes(debouncedFilter)
      )
      .sort(SortTable({sortStatus}));

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - Media`}
      section="mediaCatalog"
      useHistory
    >
      <Title order={3} my="md" maw={uiStore.inputWidthWide}>
        <Group position="apart">
          { l10n.categories.media }
          <IconButton
            label={LocalizeString(rootStore.l10n.components.inputs.add, {item: l10n.categories.media_item})}
            Icon={IconPlus}
            onClick={() => {
              modals.open({
                title: l10n.media.create.create,
                centered: true,
                children:
                  <CreateMediaCatalogMediaItemForm
                    Create={async ({title, mediaType}) => {
                      const id = mediaCatalogStore.CreateMediaItem({
                        page: location.pathname,
                        mediaCatalogId,
                        title,
                        mediaType
                      });

                      navigate(UrlJoin(location.pathname, id));
                    }}
                  />
              });
            }}
          />
        </Group>
      </Title>

      <Paper maw={uiStore.inputWidthWide}>
        <TextInput mb="md" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter" />
        <DataTable
          minHeight={mediaItems.length === 0 ? 200 : 0}
          withBorder
          highlightOnHover
          idAccessor="id"
          records={mediaItems}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          columns={[
            {
              accessor: "archive_title",
              sortable: true,
              title: l10n.media.list.columns.title,
              render: mediaItem => (
                <Group>
                  <Image width={60} height={60} fit="contain" src={ScaleImage(mediaItem.image?.url, 400)} alt={mediaItem.title} withPlaceholder />
                  <Stack spacing={0}>
                    <Text>
                      <Group spacing={5} align="top">
                        { mediaItem.archive_title }
                      </Group>
                    </Text>
                    <Text fz="xs" color="dimmed">{mediaItem.id}</Text>
                  </Stack>
                </Group>
              )
            },
            {
              accessor: "media_type",
              sortable: true,
              title: l10n.media.list.columns.media_type,
              render: mediaItem => (
                <Text fz="xs">{mediaItem.media_type}</Text>
              )
            },
            {
              accessor: "id",
              title: "",
              render: mediaItem => (
                <Group>
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
                        listItem: true,
                        itemName: mediaItem.title,
                        onConfirm: () => mediaCatalogStore.RemoveMediaItem({
                          page: location.pathname,
                          mediaCatalogId,
                          mediaItem
                        })
                      });
                    }}
                  />
                </Group>
              )
            }
          ]}
        />
      </Paper>
    </PageContent>
  );
});

export default MediaCatalogMediaList;
