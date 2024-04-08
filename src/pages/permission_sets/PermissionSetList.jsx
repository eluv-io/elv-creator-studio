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
import {rootStore, permissionSetStore} from "@/stores";
import {FabricUrl, ScaleImage} from "@/helpers/Fabric.js";
import UrlJoin from "url-join";
import {LinkButton, LocalizeString} from "@/components/common/Misc";
import PageContent from "@/components/common/PageContent.jsx";
import {modals} from "@mantine/modals";
import {useForm} from "@mantine/form";

const CreatePermissionSetForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      slug: ""
    },
    validate: {
      name: value => value ? null : rootStore.l10n.pages.permission_set.form.create.validation.name
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
          {...rootStore.l10n.pages.permission_set.form.create.name}
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

const PermissionSetCard = observer(({permissionSet, fullPermissionSet}) => {
  const fullPermissionSetMetadata = fullPermissionSet?.metadata?.public?.asset_metadata || {};
  const name = fullPermissionSetMetadata?.info?.name || permissionSet.name;
  const image =
    ScaleImage(fullPermissionSetMetadata?.info?.image?.url, 400) ||
    FabricUrl({...permissionSet, path: "/meta/public/asset_metadata/info/image", width: 400});

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
          { permissionSet.objectId }
        </Code>
        <Text fz="sm" mt={20} lineClamp={3}>
          { fullPermissionSetMetadata?.info?.description || permissionSet.description || "" }
        </Text>
        <Group mt="xl" style={{display: "flex", flexGrow: 1, alignItems: "flex-end"}}>
          <LinkButton style={{ flex: 1 }} to={UrlJoin("/permission-sets", permissionSet.objectId)}>
            Manage
          </LinkButton>
        </Group>
      </Card.Section>
    </Card>
  );
});

const PermissionSetList = observer(() => {
  const l10n = rootStore.l10n.pages.permission_set.form;
  return (
    <AsyncWrapper
      key="permission-sets"
      loadingMessage="Loading Permission Sets"
      Load={async () => await permissionSetStore.LoadPermissionSets()}
    >
      <PageContent
        title={rootStore.l10n.pages.permission_set.form.categories.permission_sets}
        action={
          <Button
            variant="light"
            onClick={() =>
              modals.open({
                title: LocalizeString(l10n.create.create, {type: l10n.categories.permission_set}),
                centered: true,
                children:
                  <CreatePermissionSetForm
                    Create={async ({name}) => await permissionSetStore.CreatePermissionSet({name})}
                  />
              })
            }
          >
            { LocalizeString(l10n.create.create, {type: l10n.categories.permission_set}) }
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
            (permissionSetStore.allPermissionSets || []).map(permissionSet =>
              <PermissionSetCard key={`permissionSet-${permissionSet.objectId}`} permissionSet={permissionSet} fullPermissionSet={permissionSetStore.permissionSets[permissionSet.objectId]} />
            )
          }
        </SimpleGrid>
      </PageContent>
    </AsyncWrapper>
  );
});

export default PermissionSetList;
