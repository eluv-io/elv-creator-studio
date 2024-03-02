import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, mediaCatalogStore, marketplaceStore, uiStore} from "@/stores";
import {
  Input as MantineInput,
  Button,
  Container,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Checkbox,
  Paper
} from "@mantine/core";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {useEffect, useState} from "react";
import {LocalizeString} from "@/components/common/Misc.jsx";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";
import {MarketplaceItemSelect} from "@/components/inputs/marketplace/MarketplaceItemInput";
import {MediaCatalogItemSelectionModal} from "@/components/inputs/media_catalog/MediaCatalogItemTable";
import {MediaItemCard, MediaItemImage} from "@/components/common/MediaCatalog.jsx";
import {ValidateSlug} from "@/components/common/Validation.jsx";

const CreateSectionItemForm = ({mediaProperty, Create}) => {
  const [creating, setCreating] = useState(false);
  const [showMediaSelectionModal, setShowMediaSelectionModal] = useState(false);

  const pages = Object.keys(mediaProperty.pages);
  const mediaProperties = mediaPropertyStore.allMediaProperties
    .filter(otherProperty => otherProperty.id !== mediaProperty.id);
  const marketplaces = marketplaceStore.allMarketplaces;

  const l10n = rootStore.l10n.pages.media_property.form;
  const form = useForm({
    initialValues: {
      type: "media",
      label: "",
      mediaItemIds: [],
      expand: false,
      pageId: pages[0],
      subpropertyId: mediaProperties[0]?.objectId,
      marketplaceId: marketplaces[0]?.objectId,
      marketplaceSKU: "",
    },
    validate: {
      label: value => form.values.type === "media" || value ? null : l10n.section_items.create.validation.label,
      mediaItemIds: value => form.values.type !== "media" || value.length > 0 ? null : l10n.section_items.create.validation.media_items,
      pageId: value => form.values.type !== "page_link" || value ? null : l10n.section_items.create.validation.page,
      subpropertyId: value => form.values.type !== "subproperty_link" || value ? null : l10n.section_items.create.validation.subproperty,
      marketplaceId: value => form.values.type !== "marketplace_link" || value ? null : l10n.section_items.create.validation.marketplace
    }
  });

  const selectedMediaItems = form.values.mediaItemIds.map(mediaItemId =>
    mediaPropertyStore.GetMediaItem({mediaItemId})
  );

  useEffect(() => {
    form.getInputProps("marketplaceSKU").onChange("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.marketplaceId]);

  let formContent;
  switch(form.values.type) {
    case "media":
      formContent = (
        <MantineInput.Wrapper
          disabled
          {...l10n.section_items.media_items}
          {...form.getInputProps("mediaItemIds")}
        >
          <Stack mb={5} spacing={5}>
            <Button variant="outline" onClick={() => setShowMediaSelectionModal(true)}>
              { l10n.section_items.select_media.label }
            </Button>
            {
              selectedMediaItems.length === 0 ? null :
                <>
                  {selectedMediaItems.map(selectedMediaItem =>
                    <MediaItemCard
                      key={`media-item-${selectedMediaItem.id}`}
                      mediaItem={selectedMediaItem}
                      imageSize={50}
                    />
                  )}
                  {
                    selectedMediaItems[0].type === "media" ? null :
                      <Checkbox
                        mt="md"
                        {...l10n.section_items[`expand_${selectedMediaItems[0].type}`]}
                        {...form.getInputProps("expand")}
                      />
                  }
                </>
            }
          </Stack>
        </MantineInput.Wrapper>
      );

      break;
    case "page_link":
      formContent = (
        <Select
          withinPortal
          {...l10n.section_items.page}
          data={pages.map(pageId => ({label: mediaProperty.pages[pageId].label, value: pageId}))}
          {...form.getInputProps("pageId")}
        />
      );

      break;
    case "subproperty_link":
      formContent = (
        <Select
          withinPortal
          {...l10n.section_items.subproperty}
          data={mediaProperties.map(subproperty => ({label: subproperty.name, value: subproperty.objectId}))}
          {...form.getInputProps("subpropertyId")}
        />
      );

      break;
    case "marketplace_link":
      formContent = (
        <>
          <Select
            withinPortal
            {...l10n.section_items.marketplace}
            data={marketplaces.map(marketplace => ({label: marketplace.brandedName || marketplace.name, value: marketplace.objectId}))}
            {...form.getInputProps("marketplaceId")}
          />
          <MarketplaceItemSelect
            key={form.values.marketplaceId}
            marketplaceId={form.values.marketplaceId}
            useBasicInput
            componentProps={{
              withBorder: false,
              p: 0,
              pt: 0,
              pb: 0,
              mb:0
            }}
            inputProps={{
              withinPortal: true,
              mb: form.values.marketplaceSKU ? "xs" : 0,
              ...l10n.section_items.marketplace_sku,
              ...form.getInputProps("marketplaceSKU")
            }}
          />
        </>
      );
  }

  return (
    <Container p={0}>
      <form
        onSubmit={form.onSubmit(values => {
          setCreating(true);
          Create(values)
            .catch(error => {
              rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
              setCreating(false);
            })
            .then(() => {
              modals.closeAll();
            });
        })}
      >
        <Stack spacing="md">
          <Select
            withinPortal
            data-autofocus
            {...l10n.section_items.type}
            defaultValue="media"
            data={
              Object.keys(mediaPropertyStore.SECTION_CONTENT_TYPES)
                .map(key => ({label: mediaPropertyStore.SECTION_CONTENT_TYPES[key], value: key}))
            }
            {...form.getInputProps("type")}
          />
          { formContent }
          {
            form.values.type === "media" ? null :
              <TextInput
                {...l10n.section_items.label}
                {...form.getInputProps("label")}
              />
          }
        </Stack>

        <Group mt="xl">
          <Button
            w="100%"
            loading={creating}
            type="submit"
          >
            { rootStore.l10n.components.actions.submit }
          </Button>
        </Group>
      </form>
      {
        !showMediaSelectionModal ? null :
          <MediaCatalogItemSelectionModal
            multiple
            allowTypeSelection
            mediaCatalogIds={mediaProperty.media_catalogs || []}
            Submit={(mediaItemIds) => form.getInputProps("mediaItemIds").onChange(mediaItemIds)}
            Close={() => setShowMediaSelectionModal(false)}
          />
      }
    </Container>
  );
};

export const SectionItemTitle = observer(({sectionItem, aspectRatio}) => {
  sectionItem = mediaPropertyStore.GetResolvedSectionItem({sectionItem});

  const mediaLabel = (
    !sectionItem.label &&
    sectionItem.mediaItem &&
    sectionItem.use_media_settings &&
    sectionItem.mediaItem.label
  ) || "";

  return (
    <Group noWrap>
      <MediaItemImage
        mediaItem={sectionItem.display}
        scale={400}
        width={50}
        height={50}
        fit="contain"
        position="left"
        aspectRatio={aspectRatio}
      />
      <Stack spacing={2}>
        <Text italic={mediaLabel}>
          { mediaLabel || sectionItem.label || sectionItem.display.title || sectionItem.id }
        </Text>
      </Stack>
    </Group>
  );
});

const SectionContentList = observer(() => {
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
        routePath="content"
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
                  mediaPropertyId={mediaPropertyId}
                  mediaProperty={info}
                  Create={async args => {
                    let id;
                    if(args.type === "media") {
                      // When specifying media, multiple items are allowed. Create an entry for each and don't redirect
                      args.mediaItemIds.forEach(mediaItemId =>
                        mediaPropertyStore.CreateSectionItem({
                          page: location.pathname,
                          mediaPropertyId,
                          sectionId,
                          mediaItemId,
                          ...args
                        })
                      );
                    } else {
                      id = mediaPropertyStore.CreateSectionItem({
                        page: location.pathname,
                        mediaPropertyId,
                        sectionId,
                        ...args
                      });
                    }

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
            field: "label",
            render: sectionItem => <SectionItemTitle sectionItem={sectionItem} aspectRatio={section.display.aspect_ratio} />
              //sectionItem.label :
              //<Text italic>{mediaPropertyStore.GetSectionItemLabel({mediaPropertyId, sectionId, sectionItemId: sectionItem.id})}</Text>
          },
          {
            label: l10n.sections.type.label,
            field: "type",
            render: sectionItem => {
              if(sectionItem.type !== "media") {
                return <Text>{mediaPropertyStore.SECTION_CONTENT_TYPES[sectionItem.type]}</Text>;
              }

              const mediaItem = mediaPropertyStore.GetMediaItem({mediaItemId: sectionItem.media_id});

              return (
                <Text>
                  {mediaItem.type === "collection" ? "Media Collection" : mediaItem.type === "list" ? "Media List" : "Media"}
                  {!sectionItem.expand ? null : <Text italic>(Expanded)</Text>}
                </Text>
              );
            }
          }
        ]}
      />
    );
  }
});

const AutomaticSectionContentPreview = observer(({mediaPropertyId, sectionId, aspectRatio}) => {
  let content = mediaPropertyStore.GetAutomaticSectionContent({mediaPropertyId, sectionId});

  if(content.length === 0) {
    return (
      <Text mt="md" italic fz="sm" align="center">No Matching Content</Text>
    );
  }

  return (
    <>
      <Text align="center" fz="xs" mb="sm">{content.length} Matching Items</Text>
      <Stack spacing={5}>
        {
          content.map(mediaItem =>
            <MediaItemCard
              key={`media-item-${mediaItem.id}`}
              mediaItem={mediaItem}
              aspectRatio={aspectRatio || "Canonical"}
              size="sm"
              withLink
            />
          )
        }
      </Stack>
    </>
  );
});

const SectionFilters = observer(() => {
  const [showContentPreview, setShowContentPreview] = useState(false);
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
    subcategory: l10n.categories.section_filters,
    path: UrlJoin("/public/asset_metadata/info/sections", sectionId, "select")
  };

  return (
    <Group noWrap align="top" pr={50}>
      <Container m={0} p={0} miw={uiStore.inputWidth}>
        <Inputs.Select
          {...inputProps}
          {...l10n.sections.filters.media_catalog}
          field="media_catalog"
          defaultValue=""
          options={[
            { label: "All Property Catalogs", value: "" },
            ...info.media_catalogs.map(mediaCatalogId => ({
              label: mediaCatalogStore.mediaCatalogs[mediaCatalogId]?.metadata.public.asset_metadata.info.name,
              value: mediaCatalogId
            }))
          ]}
        />
        <Inputs.MultiSelect
          {...inputProps}
          {...l10n.sections.filters.tags}
          clearable
          options={mediaPropertyStore.GetMediaPropertyTags({mediaPropertyId})}
          field="tags"
        />

        <Inputs.Select
          {...inputProps}
          {...l10n.sections.filters.content_type}
          defaultValue=""
          field="content_type"
          options={[
            { label: "All Types", value: "" },
            { label: "Media", value: "media" },
            { label: "Media List", value: "list" },
            { label: "Media Collection", value: "collection" }
          ]}
        />
        {
          section.select.content_type !== "media" ? null :
            <Inputs.MultiSelect
              {...inputProps}
              {...l10n.sections.filters.media_types}
              clearable
              field="media_types"
              options={mediaCatalogStore.MEDIA_TYPES}
            />
        }
        {
          (
            section.select.content_type !== "media" ||
            section.select.media_types.length > 1 ||
            (section.select.media_types.length === 1 && section.select.media_types[0] !== "Video")
          ) ? null :
            <>
              <Inputs.Select
                {...inputProps}
                {...l10n.sections.filters.schedule}
                field="schedule"
                defaultValue=""
                options={[
                  { label: "Any Time", value: "" },
                  { label: "Live Now", value: "live" },
                  { label: "Upcoming", value: "upcoming" },
                  { label: "Past", value: "past" },
                  { label: "Specific Time Period", value: "period" }
                ]}
              />
              {
                !["past", "period"].includes(section.select.schedule) ? null :
                  <Inputs.DateTime
                    {...inputProps}
                    {...l10n.sections.filters.start_time}
                    field="start_time"
                  />
              }
              {
                !["upcoming", "period"].includes(section.select.schedule) ? null :
                  <Inputs.DateTime
                    {...inputProps}
                    {...l10n.sections.filters.end_time}
                    field="end_time"
                  />
              }
            </>
        }
        <Button
          mt="xl"
          fz="xs"
          variant="outline"
          onClick={() => setShowContentPreview(!showContentPreview)}
        >
          { showContentPreview ? "Hide Content Preview" : "Show Content Preview" }
        </Button>
      </Container>

      {
        !showContentPreview ? null :
          <Paper withBorder py="md" h="max-content" mt={-50} w={uiStore.inputWidth} p="sm">
            <Title order={4} align="center">Section Content Preview</Title>
            <AutomaticSectionContentPreview
              mediaPropertyId={mediaPropertyId}
              sectionId={sectionId}
              aspectRatio={section.display.aspect_ratio}
            />
          </Paper>
      }
    </Group>
  );
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
      backLink={UrlJoin("/media-properties", mediaPropertyId, "sections")}
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.sections} - ${section.label || ""}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.general}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.common.id}
        disabled
        field="id"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.common.slug}
        field="slug"
        Validate={ValidateSlug}
        validateOnLoad
      />

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
          { label: "Feature", value: "feature" }
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

      <Title order={3} mb="md" mt={50}>{l10n.categories[section.type === "manual" ? "section_content" : "section_filters"]}</Title>

      {
        section.type === "manual" ?
          <SectionContentList /> :
          <SectionFilters />
      }
    </PageContent>
  );
});

export default MediaPropertySection;
