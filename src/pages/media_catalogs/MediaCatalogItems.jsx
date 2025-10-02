import {
  Group,
  TextInput,
  Title,
  Container,
  Button,
  Select,
} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {mediaCatalogStore, rootStore, uiStore} from "@/stores";
import UrlJoin from "url-join";
import {IconButton, LocalizeString} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";
import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {IconPlus} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";
import MediaCatalogItemTable from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";

const CreateMediaCatalogItemForm = ({Create, type="media"}) => {
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
        {
          type !== "media" ? null :
            <Select
              withinPortal
              data-autofocus
              {...rootStore.l10n.pages.media_catalog.form.media.media_type}
              defaultValue="Video"
              mb="md"
              data={mediaCatalogStore.MEDIA_TYPES}
              {...form.getInputProps("mediaType")}
            />
        }
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

// General top level list for media, media lists and media catalogs
const MediaCatalogItems = observer(({type="media"}) => {
  const navigate = useNavigate();

  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  if(!["media", "media_lists", "media_collections"].includes(type)) {
    throw Error("Missing type for MediaCatalogItems");
  }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_catalog.form;

  let title, category;
  switch(type) {
    case "media":
      title = l10n.categories.media;
      category = l10n.categories.media_item;
      break;
    case "media_lists":
      title = l10n.categories.media_lists;
      category = l10n.categories.media_list;
      break;
    case "media_collections":
      title = l10n.categories.media_collections;
      category = l10n.categories.media_collection;
      break;
  }

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${title}`}
      subtitle={l10n.type_descriptions[type]}
      section="mediaCatalog"
      useHistory
    >
      <Title order={4} my="md" maw={uiStore.inputWidthWide}>
        <Group position="apart">
          { l10n.categories[type] }
          <IconButton
            label={LocalizeString(rootStore.l10n.components.inputs.add, {item: category})}
            Icon={IconPlus}
            disabled={rootStore.localizing}
            onClick={() => {
              modals.open({
                title: LocalizeString(l10n.create.create, {type: category}),
                centered: true,
                children:
                  <CreateMediaCatalogItemForm
                    type={type}
                    Create={async ({title, mediaType}) => {
                      const id = mediaCatalogStore.CreateMediaItem({
                        type,
                        page: location.pathname,
                        mediaCatalogId,
                        title,
                        mediaType
                      });

                      modals.closeAll();

                      navigate(UrlJoin(location.pathname, id));
                    }}
                  />
              });
            }}
          />
        </Group>
      </Title>

      <MediaCatalogItemTable
        key={`media-catalog-items-${type}`}
        type={type}
        mediaCatalogId={mediaCatalogId}
      />
    </PageContent>
  );
});

export default MediaCatalogItems;
