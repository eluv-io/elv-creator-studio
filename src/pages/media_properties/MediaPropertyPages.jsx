import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {modals} from "@mantine/modals";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useState} from "react";
import {useForm} from "@mantine/form";
import {Accordion, Button, Container, Group, Text, TextInput} from "@mantine/core";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js/lib";

const PurchasePageSettings = observer(({type}) => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const settings = mediaProperty?.metadata?.public?.asset_metadata?.info?.[type] || {};
  console.log(settings)

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.pages,
    subcategory: l10n.categories[type],
    path: `/public/asset_metadata/info/${type}`
  };

  return (
    <>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.pages[type].enabled}
        field="enabled"
      />
      {
        !settings.enabled ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.pages.header.position}
              defaultValue="Left"
              field="position"
              options={["Left", "Center", "Right"]}
            />

            <Inputs.Text
              {...inputProps}
              {...l10n.pages.header.title}
              field="title"
            />

            <Inputs.TextArea
              {...inputProps}
              {...l10n.pages.header.description}
              field="description"
            />

            <Inputs.RichText
              {...inputProps}
              {...l10n.pages.header.description_rich_text}
              field="description_rich_text"
            />

            <Inputs.ImageInput
              {...inputProps}
              {...l10n.pages.header.logo}
              fields={[
                { field: "logo" }
              ]}
              altTextField="logo_alt"
            />

            <Inputs.ImageInput
              {...inputProps}
              {...l10n.pages.header.background_image}
              fields={[
                { field: "background_image", ...l10n.pages.header.background_image_desktop, aspectRatio: 16/9, baseSize: 135 },
                { field: "background_image_mobile", ...l10n.pages.header.background_image_mobile, aspectRatio: 1/2, baseSize: 135 },
              ]}
            />

            <Inputs.InputWrapper
              {...l10n.pages.header.background_video}
            >
              <Inputs.FabricBrowser
                mt="md"
                {...inputProps}
                {...l10n.pages.header.background_video_desktop}
                field="background_video"
                previewable
                previewOptions={{
                  muted: EluvioPlayerParameters.muted.ON,
                  autoplay: EluvioPlayerParameters.autoplay.ON,
                  controls: EluvioPlayerParameters.controls.OFF,
                  loop: EluvioPlayerParameters.loop.OFF
                }}
              />

              <Inputs.FabricBrowser
                {...inputProps}
                {...l10n.pages.header.background_video_mobile}
                field="background_video_mobile"
                previewable
                previewOptions={{
                  muted: EluvioPlayerParameters.muted.ON,
                  autoplay: EluvioPlayerParameters.autoplay.ON,
                  controls: EluvioPlayerParameters.controls.OFF,
                  loop: EluvioPlayerParameters.loop.OFF
                }}
              />
            </Inputs.InputWrapper>

            {
              type !== "purchase_page" ? null :
                <Inputs.Text
                  {...inputProps}
                  {...l10n.pages[type].button_text}
                  field="card_button_text"
                  placeholder="Select"
                />
            }
          </>
      }
    </>
  );
});

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
  const purchasePageId = info.page_ids.purchase_gate;

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
        excludedKeys={["main", "purchase_gate"]}
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
                {
                  item.id !== purchasePageId ? null :
                    <Text fz="xs" fw={600} italic>(Purchase Page)</Text>
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

      <Accordion maw={uiStore.inputWidthWide} variant="contained">
        <Accordion.Item value="purchase_page">
          <Accordion.Control>
            { l10n.categories.purchase_page }
          </Accordion.Control>
          <Accordion.Panel>
            <PurchasePageSettings type="purchase_page" />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="no_purchase_available_page">
          <Accordion.Control>
            { l10n.categories.no_purchase_available_page }
          </Accordion.Control>
          <Accordion.Panel>
            <PurchasePageSettings type="no_purchase_available_page" />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </PageContent>
  );
});

export default MediaPropertyPages;
