import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {modals} from "@mantine/modals";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useState} from "react";
import {useForm} from "@mantine/form";
import {Button, Container, Group, Select, TextInput} from "@mantine/core";

const CreateSectionForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const l10n = rootStore.l10n.pages.media_property.form;

  const form = useForm({
    initialValues: {
      name: "",
      type: "manual"
    },
    validate: {
      name: value => value ? null : l10n.sections.create.validation.name
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
        <Select
          withinPortal
          data-autofocus
          {...l10n.sections.create.type}
          defaultValue="manual"
          mb="md"
          data={[
            { label: "Manual", value: "manual" },
            { label: "Automatic", value: "automatic" }
          ]}
          {...form.getInputProps("type")}
        />
        <TextInput
          data-autofocus
          mb="md"
          {...l10n.sections.create.name}
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

const MediaPropertySections = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.sections,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.sections}`}
      section="mediaProperty"
      useHistory
    >
      <Inputs.ReferenceTable
        {...inputProps}
        {...l10n.sections.sections}
        field="sections"
        fieldLabel={l10n.categories.section}
        nameField="name"
        filterable
        filterFields={["name", "description"]}
        AddItem={async () => {
          return new Promise((resolve) => {
            modals.open({
              title: LocalizeString(l10n.create.create, {type: l10n.categories.section}),
              centered: true,
              onCancel: () => resolve(),
              children:
                <CreateSectionForm
                  Create={async ({name, type}) => {
                    const id = mediaPropertyStore.CreateSection({
                      name,
                      type,
                      page: location.pathname,
                      mediaPropertyId,
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
            title: l10n.sections.name.label
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

export default MediaPropertySections;
