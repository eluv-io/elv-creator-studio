import {useState} from "react";
import {
  Group,
  Text,
  Card,
  Image,
  SimpleGrid,
  AspectRatio,
  Code,
  Button,
  Container,
  TextInput
} from "@mantine/core";
import {observer} from "mobx-react-lite";
import AsyncWrapper from "@/components/common/AsyncWrapper.jsx";
import {rootStore, mediaCatalogStore} from "@/stores";
import {FabricUrl} from "@/helpers/Fabric.js";
import UrlJoin from "url-join";
import {LinkButton, LocalizeString} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";
import {modals} from "@mantine/modals";
import {useForm} from "@mantine/form";

const CreateMediaCatalogForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const form = useForm({
    initialValues: { name: "" },
    validate: {
      name: value => value ? null : rootStore.l10n.pages.media_catalog.form.create.validation.name
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setCreating(true);
          Create({name: values.name})
            .catch(error => {
              rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              setCreating(false);
            })
            .then(() => {
              modals.closeAll();
            });
        })}
      >
        <TextInput
          data-autofocus
          label={rootStore.l10n.pages.media_catalog.form.create.name}
          {...form.getInputProps("name")}
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

const MediaCatalogCard = observer(({mediaCatalog, fullMediaCatalog}) => {
  const fullMediaCatalogMetadata = fullMediaCatalog?.metadata?.public?.asset_metadata || {};
  const name = fullMediaCatalogMetadata?.info?.name || mediaCatalog.name;
  const image = FabricUrl({...mediaCatalog, path: "/meta/public/asset_metadata/info/image", width: 400});

  return (
    <Card withBorder radius="md" p="md" style={{display: "flex", flexDirection: "column"}}>
      <Card.Section p="xl">
        <AspectRatio ratio={1}>
          <Image src={image} alt={name} withPlaceholder />
        </AspectRatio>
      </Card.Section>

      <Card.Section p="xl" pt={0} size="100%" style={{display: "flex", flexDirection: "column", flexGrow: 1}}>
        <Text fz="lg" fw={600}>
          { name }
        </Text>
        <Code fz="xs" p={0} bg="transparent">
          { mediaCatalog.objectId }
        </Code>
        <Text fz="sm" mt={20} lineClamp={3}>
          { fullMediaCatalogMetadata?.info?.branding?.description || mediaCatalog.description || "" }
        </Text>
        <Group mt="xl" style={{display: "flex", flexGrow: 1, alignItems: "flex-end"}}>
          <LinkButton radius="md" style={{ flex: 1 }} to={UrlJoin("/media-catalogs", mediaCatalog.objectId)}>
            Manage
          </LinkButton>
        </Group>
      </Card.Section>
    </Card>
  );
});

const MediaCatalogList = observer(() => {
  const l10n = rootStore.l10n.pages.media_catalog.form;
  return (
    <AsyncWrapper
      loadingMessage="Loading MediaCatalogs"
      Load={async () => await mediaCatalogStore.LoadMediaCatalogs()}
    >
      <PageContent
        title={rootStore.l10n.pages.media_catalog.form.categories.media_catalogs}
        action={
          <Button
            onClick={() =>
              modals.open({
                title: LocalizeString(l10n.create.create, {type: l10n.categories.media_catalog}),
                centered: true,
                children:
                  <CreateMediaCatalogForm
                    Create={async ({name}) => await mediaCatalogStore.CreateMediaCatalog({name})}
                  />
              })
            }
          >
            { LocalizeString(l10n.create.create, {type: l10n.categories.media_catalog}) }
          </Button>
        }
      >
        <SimpleGrid
          spacing="xl"
          my="xl"
          cols={4}
          breakpoints={[
            { maxWidth: "xl", cols: 3, spacing: "md" },
            { maxWidth: "md", cols: 2, spacing: "sm" },
            { maxWidth: "sm", cols: 1, spacing: "sm" },
          ]}
        >
          {
            (mediaCatalogStore.allMediaCatalogs || []).map(mediaCatalog =>
              <MediaCatalogCard key={`mediaCatalog-${mediaCatalog.objectId}`} mediaCatalog={mediaCatalog} fullMediaCatalog={mediaCatalogStore.mediaCatalogs[mediaCatalog.objectId]} />
            )
          }
        </SimpleGrid>
      </PageContent>
    </AsyncWrapper>
  );
});

export default MediaCatalogList;
