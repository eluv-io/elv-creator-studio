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
import {rootStore, pocketStore} from "@/stores";
import {FabricUrl} from "@/helpers/Fabric.js";
import UrlJoin from "url-join";
import {LinkButton, LocalizeString} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";
import {modals} from "@mantine/modals";
import {useForm} from "@mantine/form";
import {Slugify, ValidateSlug} from "@/components/common/Validation.jsx";

const CreatePocketForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      slug: ""
    },
    validate: {
      name: value => value ? null : rootStore.l10n.pages.pocket.form.create.validation.name,
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
          {...rootStore.l10n.pages.pocket.form.create.name}
          {...form.getInputProps("name")}
        />
        <TextInput
          {...rootStore.l10n.pages.pocket.form.create.slug}
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

const PocketCard = observer(({pocket, fullPocket}) => {
  const fullPocketMetadata = fullPocket?.metadata?.public?.asset_metadata || {};
  const name = fullPocketMetadata?.info?.name || pocket.name;
  const image =
    fullPocketMetadata?.info?.image?.["/"] ?
      FabricUrl({...pocket, path: fullPocketMetadata.info.image["/"], width: 400}) :
      FabricUrl({...pocket, path: "/meta/public/asset_metadata/info/image", width: 400});

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
          { pocket.objectId }
        </Code>
        <Text fz="sm" mt={20} lineClamp={3}>
          { fullPocketMetadata?.info?.description || pocket.description || "" }
        </Text>
        <Group mt="xl" style={{display: "flex", flexGrow: 1, alignItems: "flex-end"}}>
          <LinkButton style={{ flex: 1 }} to={UrlJoin("/pocket", pocket.objectId)}>
            Manage
          </LinkButton>
        </Group>
      </Card.Section>
    </Card>
  );
});

const PocketList = observer(() => {
  const l10n = rootStore.l10n.pages.pocket.form;
  return (
    <AsyncWrapper
      key="pocket"
      loadingMessage="Loading Pocket TV Properties"
      Load={async () => await pocketStore.LoadPockets()}
    >
      <PageContent
        title={rootStore.l10n.pages.pocket.form.categories.pockets}
        action={
          <Button
            variant="light"
            onClick={() =>
              modals.open({
                title: LocalizeString(l10n.create.create, {type: l10n.categories.pocket}),
                centered: true,
                children:
                  <CreatePocketForm
                    Create={async ({name, slug}) => await pocketStore.CreatePocket({name, slug})}
                  />
              })
            }
          >
            { LocalizeString(l10n.create.create, {type: l10n.categories.pocket}) }
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
            (pocketStore.allPockets || []).map(pocket =>
              <PocketCard
                key={`pocket-${pocket.objectId}`}
                pocket={pocket}
                fullPocket={pocketStore.pockets[pocket.objectId]}
              />
            )
          }
        </SimpleGrid>
      </PageContent>
    </AsyncWrapper>
  );
});

export default PocketList;
