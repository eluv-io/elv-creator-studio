import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {modals} from "@mantine/modals";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useEffect, useState} from "react";
import {useForm} from "@mantine/form";
import {Button, Container, Group, Modal, Paper, Select, TextInput, Text} from "@mantine/core";
import {MediaPropertySectionPermissionIcon} from "@/components/common/MediaCatalog";

const CreateSectionForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const l10n = rootStore.l10n.pages.media_property.form;

  const form = useForm({
    initialValues: {
      label: "",
      type: "manual"
    },
    validate: {
      label: value => value ? null : l10n.sections.create.validation.label
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
          {...l10n.sections.create.label}
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

export const MediaPropertySectionsTable = observer(({
  mediaPropertyId,
  editable,
  excludedSectionIds=[],
  selectedRecords,
  setSelectedRecords
}) => {
  useEffect(() => {
    mediaPropertyStore.LoadMediaProperty({mediaPropertyId});
  }, [mediaPropertyId]);

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.sections,
    path: "/public/asset_metadata/info"
  };

  return (
    <Inputs.ReferenceTable
      {...inputProps}
      {...l10n.sections.sections}
      field="sections"
      fieldLabel={l10n.categories.section}
      nameField="label"
      filterable
      filterFields={["label", "description"]}
      selectedRecords={selectedRecords}
      setSelectedRecords={setSelectedRecords}
      excludedKeys={excludedSectionIds}
      editable={editable}
      width="ExtraWide"
      CopyItem={({item}) => mediaPropertyStore.CreateSection({mediaPropertyId, copySectionId: item.id})}
      AddItem={async () => {
        return new Promise((resolve) => {
          modals.open({
            title: LocalizeString(l10n.create.create, {type: l10n.categories.section}),
            centered: true,
            onCancel: () => resolve(),
            children:
              <CreateSectionForm
                Create={async ({label, type}) => {
                  const id = mediaPropertyStore.CreateSection({
                    label,
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
          accessor: "label",
          sortable: true,
          title: l10n.sections.label.label
        },
        {
          accessor: "type",
          sortable: true,
          title: l10n.sections.type.label,
          render: section => <Text>{section.type?.capitalize() || ""}</Text>,
          width: 175
        },
        {
          accessor: "display.display_format",
          sortable: true,
          title: l10n.sections.display.display_format.label,
          render: section => <Text>{ section.display?.display_format?.capitalize() || "" }</Text>,
          width: 175
        },
        {
          accessor: "permissions",
          title: l10n.sections.permissions.label,
          textAlignment: "center",
          render: section => <MediaPropertySectionPermissionIcon sectionOrSectionItem={section} />,
          width: 125
        },
      ]}
    />
  );
});

export const MediaPropertySectionSelectionModal = observer(({
  excludedSectionIds=[],
  mediaPropertyId,
  Submit,
  Close
}) => {
  const [selectedRecords, setSelectedRecords] = useState([]);
  return (
    <Modal
      title={rootStore.l10n.pages.media_property.form.sections.modal.title}
      size={uiStore.inputWidthWide}
      opened
      onClose={Close}
    >
      <Paper p="xl" pt="md" withBorder>
        <MediaPropertySectionsTable
          editable={false}
          excludedSectionIds={excludedSectionIds}
          mediaPropertyId={mediaPropertyId}
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
            onClick={() => Submit(selectedRecords.map(section => section.id))}
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </Paper>
    </Modal>
  );
});

const MediaPropertySections = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.sections}`}
      section="mediaProperty"
      useHistory
    >
      <MediaPropertySectionsTable editable mediaPropertyId={mediaPropertyId} />
    </PageContent>
  );
});

export default MediaPropertySections;
