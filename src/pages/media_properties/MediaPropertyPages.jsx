import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {modals} from "@mantine/modals";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useState} from "react";
import {useForm} from "@mantine/form";
import {Button, Container, Group, Text, TextInput} from "@mantine/core";

const CreatePageForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const l10n = rootStore.l10n.pages.media_property.form;

  const form = useForm({
    initialValues: {
      label: ""
    },
    validate: {
      label: value => value ? null : l10n.pages.create.validation.label
    }
  });

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setCreating(true);
          Create({label: values.label, type: values.type})
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
          {...l10n.pages.create.label}
          {...form.getInputProps("label")}
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

  const mainPageId = info.page_ids.main;

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
        nameField="label"
        filterable
        filterFields={["label", "description"]}
        excludedKeys={["main"]}
        protectedKeys={[mainPageId]}
        CopyItem={({item}) => mediaPropertyStore.CreatePage({mediaPropertyId, copyPageId: item.id})}
        AddItem={async () => {
          return new Promise((resolve) => {
            modals.open({
              title: LocalizeString(l10n.create.create, {type: l10n.categories.page}),
              centered: true,
              onCancel: () => resolve(),
              children:
                <CreatePageForm
                  Create={async ({label}) => {
                    const id = mediaPropertyStore.CreatePage({
                      label,
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
            accessor: "label",
            sortable: true,
            title: l10n.pages.label.label,
            render: item => (
              <Group spacing="xs" align="end">
                <Text>{ item.label }</Text>
                {
                  item.id !== mainPageId ? null :
                    <Text fz="xs" fw={600} italic>(Main)</Text>
                }
              </Group>
            )
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
