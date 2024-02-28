import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, mediaCatalogStore} from "@/stores";
import {Button, Container, Group, Select, Text, TextInput} from "@mantine/core";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {useState} from "react";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";

const CreateSectionItemForm = ({Create}) => {
  const [creating, setCreating] = useState(false);

  const l10n = rootStore.l10n.pages.media_property.form;

  const form = useForm({
    initialValues: {
      type: "media",
      label: ""
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
          {...l10n.section_items.create.type}
          defaultValue="media"
          mb="md"
          data={
            Object.keys(mediaPropertyStore.SECTION_CONTENT_TYPES)
              .map(key => ({label: mediaPropertyStore.SECTION_CONTENT_TYPES[key], value: key}))
          }
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

const MediaPropertyContentOptions = observer(() => {
  const { mediaPropertyId, sectionId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const section = info.sections?.[sectionId];

  if(!section) {
    return null;
  }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id: sectionId, label: section.label}),
    subcategory: l10n.categories.section_content,
    path: UrlJoin("/public/asset_metadata/info/sections", sectionId)
  };

  if(section.type === "manual") {
    return (
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.sections.section_content}
        subcategoryFnParams={{fields: ["label", "id"], l10n: l10n.categories.section_item_label}}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId)}
        field="content"
        idField="id"
        AddItem={async () => {
          return new Promise((resolve) => {
            modals.open({
              title: LocalizeString(l10n.create.create, {type: l10n.categories.section_item}),
              centered: true,
              onCancel: () => resolve(),
              children:
                <CreateSectionItemForm
                  Create={async ({label, type}) => {
                    const id = mediaPropertyStore.CreateSectionItem({
                      label,
                      type,
                      page: location.pathname,
                      mediaPropertyId,
                      sectionId
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
            label: l10n.sections.label.label,
            field: "label"
          },
          {
            label: l10n.sections.type.label,
            field: "type",
            render: sectionItem => <Text>{mediaPropertyStore.SECTION_CONTENT_TYPES[sectionItem.type]}</Text>
          },
          {
            label: l10n.sections.description.label,
            field: "description"
          }
        ]}
      />
    );
  }
});

const MediaPropertySection = observer(() => {
  const { mediaPropertyId, sectionId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const section = info.sections?.[sectionId];

  if(!section) {
    return null;
  }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id: sectionId, label: section.label}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/sections", sectionId)
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.layout}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.general}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.sections.label}
        field="label"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.sections.description}
        field="description"
      />

      <Title order={3} mb="md" mt={50}>{l10n.categories.section_presentation}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.sections.display.title}
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="title"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.sections.display.description}
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="description"
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.sections.display.description_rich_text}
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="description_rich_text"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.sections.display.display_format}
        defaultValue="Carousel"
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="display_format"
        options={[
          { label: "Carousel", value: "carousel" },
          { label: "Grid", value: "grid" },
          { label: "Featured", value: "featured" }
        ]}
      />

      <Inputs.Integer
        {...inputProps}
        {...l10n.sections.display.display_limit}
        min={0}
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="display_limit"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.sections.display.aspect_ratio}
        defaultValue=""
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="aspect_ratio"
        options={
          [
            { label: "Default", value: "" },
            ...Object.keys(mediaCatalogStore.IMAGE_ASPECT_RATIOS)
              .map(value => ({label: mediaCatalogStore.IMAGE_ASPECT_RATIOS[value].label, value}))
          ]
        }
      />

      <Title order={3} mb="md" mt={50}>{l10n.categories.section_content}</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.sections.type}
        disabled
        field="type"
        options={[
          { label: "Manual", value: "manual" },
          { label: "Automatic", value: "automatic" }
        ]}
      />

      <MediaPropertyContentOptions />
    </PageContent>
  );
});

export default MediaPropertySection;
