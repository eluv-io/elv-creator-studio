import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {modals} from "@mantine/modals";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useState} from "react";
import {useForm} from "@mantine/form";
import {Button, Container, Group, TextInput} from "@mantine/core";

const CreatePageForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const l10n = rootStore.l10n.pages.media_property.form;

  const form = useForm({
    initialValues: {
      name: ""
    },
    validate: {
      name: value => value ? null : l10n.pages.create.validation.name
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setCreating(true);
          Create({name: values.name, type: values.type})
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
          mb="md"
          {...l10n.pages.create.name}
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

const MediaPropertyPages = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.pages,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.pages}`}
      section="mediaProperty"
      useHistory
    >
      <Inputs.ReferenceTable
        {...inputProps}
        {...l10n.pages.pages}
        field="pages"
        fieldLabel={l10n.categories.page}
        nameField="name"
        filterable
        filterFields={["name", "description"]}
        AddItem={async () => {
          return new Promise((resolve) => {
            modals.open({
              title: LocalizeString(l10n.create.create, {type: l10n.categories.page}),
              centered: true,
              onCancel: () => resolve(),
              children:
                <CreatePageForm
                  Create={async ({name}) => {
                    const id = mediaPropertyStore.CreatePage({
                      name,
                      page: location.pathname,
                      mediaPropertyId
                    });

                    modals.closeAll();

                    resolve(id);
                  }}
                />
            });
          });
        }}
        columns={[
          {
            accessor: "name",
            sortable: true,
            title: l10n.pages.name.label
          },
          {
            accessor: "description",
            title: l10n.pages.description.label
          }
        ]}
      />
    </PageContent>
  );
});

export default MediaPropertyPages;
