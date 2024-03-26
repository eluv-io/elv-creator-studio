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
import {rootStore, mediaPropertyStore} from "@/stores";
import {FabricUrl, ScaleImage} from "@/helpers/Fabric.js";
import UrlJoin from "url-join";
import {LinkButton, LocalizeString} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";
import {modals} from "@mantine/modals";
import {useForm} from "@mantine/form";
import {Slugify, ValidateSlug} from "@/components/common/Validation.jsx";

const CreateMediaPropertyForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      slug: ""
    },
    validate: {
      name: value => value ? null : rootStore.l10n.pages.media_property.form.create.validation.name,
      slug: value => ValidateSlug(value)
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
          mb="md"
          data-autofocus
          {...rootStore.l10n.pages.media_property.form.create.name}
          {...form.getInputProps("name")}
        />
        <TextInput
          {...rootStore.l10n.pages.media_property.form.create.slug}
          {...form.getInputProps("slug")}
          placeholder={Slugify(form.values.name)}
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

const MediaPropertyCard = observer(({mediaProperty, fullMediaProperty}) => {
  const fullMediaPropertyMetadata = fullMediaProperty?.metadata?.public?.asset_metadata || {};
  const name = fullMediaPropertyMetadata?.info?.name || mediaProperty.name;
  const image =
    ScaleImage(fullMediaPropertyMetadata?.info?.image?.url, 400) ||
    FabricUrl({...mediaProperty, path: "/meta/public/asset_metadata/info/image", width: 400});

  return (
    <Card withBorder radius="md" p="md" style={{display: "flex", flexDirection: "column"}}>
      <Card.Section p="xl">
        <AspectRatio ratio={2/3}>
          <Image src={image} alt={name} withPlaceholder />
        </AspectRatio>
      </Card.Section>

      <Card.Section p="xl" pt={0} size="100%" style={{display: "flex", flexDirection: "column", flexGrow: 1}}>
        <Text fz="lg" fw={600}>
          { name }
        </Text>
        <Code fz="xs" p={0} bg="transparent">
          { mediaProperty.objectId }
        </Code>
        <Text fz="sm" mt={20} lineClamp={3}>
          { fullMediaPropertyMetadata?.info?.branding?.description || mediaProperty.description || "" }
        </Text>
        <Group mt="xl" style={{display: "flex", flexGrow: 1, alignItems: "flex-end"}}>
          <LinkButton radius="md" style={{ flex: 1 }} to={UrlJoin("/media-properties", mediaProperty.objectId)}>
            Manage
          </LinkButton>
        </Group>
      </Card.Section>
    </Card>
  );
});

const MediaPropertyList = observer(() => {
  const l10n = rootStore.l10n.pages.media_property.form;
  return (
    <AsyncWrapper
      key="media-properties"
      loadingMessage="Loading Media Properties"
      Load={async () => await mediaPropertyStore.LoadMediaProperties()}
    >
      <PageContent
        title={rootStore.l10n.pages.media_property.form.categories.media_properties}
        action={
          <Button
            onClick={() =>
              modals.open({
                title: LocalizeString(l10n.create.create, {type: l10n.categories.media_property}),
                centered: true,
                children:
                  <CreateMediaPropertyForm
                    Create={async ({name, slug}) => await mediaPropertyStore.CreateMediaProperty({name, slug})}
                  />
              })
            }
          >
            { LocalizeString(l10n.create.create, {type: l10n.categories.media_property}) }
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
            (mediaPropertyStore.allMediaProperties || []).map(mediaProperty =>
              <MediaPropertyCard key={`mediaProperty-${mediaProperty.objectId}`} mediaProperty={mediaProperty} fullMediaProperty={mediaPropertyStore.mediaProperties[mediaProperty.objectId]} />
            )
          }
        </SimpleGrid>
      </PageContent>
    </AsyncWrapper>
  );
});

export default MediaPropertyList;
