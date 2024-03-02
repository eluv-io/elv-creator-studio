import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, uiStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {MediaItemCard} from "@/components/common/MediaCatalog";
import {
  Input as MantineInput
} from "@mantine/core";
import {MarketplaceItemSelect} from "@/components/inputs/marketplace/MarketplaceItemInput.jsx";
import {MarketplaceSelect} from "@/components/inputs/ResourceSelection";
import {ValidateSlug} from "@/components/common/Validation.jsx";

const SectionItemOptions = observer(({mediaProperty, sectionItem, mediaItem, inputProps, l10n}) => {
  const pages = Object.keys(mediaProperty.pages);
  const mediaProperties = mediaPropertyStore.allMediaProperties
    .filter(otherProperty => otherProperty.id !== mediaProperty.id);

  switch(sectionItem.type) {
    case "media":
      return (
        <>
          <MantineInput.Wrapper
            disabled
            {...l10n.section_items.media_item}
          >
            <MediaItemCard mediaItem={mediaItem} size="md" mb="md" withLink />
          </MantineInput.Wrapper>
          {
            mediaItem.type === "media" ? null :
              <Inputs.Checkbox
                {...inputProps}
                {...l10n.section_items[`expand_${mediaItem.type}`]}
                field="expand"
              />
          }
        </>
      );
    case "page_link":
      return (
        <Inputs.Select
          {...inputProps}
          {...l10n.section_items.page}
          options={pages.map(pageId => ({label: mediaProperty.pages[pageId].label, value: pageId}))}
          field="page_id"
        />
      );
    case "subproperty_link":
      return (
        <Inputs.Select
          {...inputProps}
          {...l10n.section_items.subproperty}
          options={mediaProperties.map(subproperty => ({label: subproperty.name, value: subproperty.objectId}))}
          field="subproperty_id"
        />
      );
    case "marketplace_link":
      return (
        <>
          <MarketplaceSelect
            {...inputProps}
            {...l10n.section_items.marketplace}
            path={UrlJoin(inputProps.path, "/marketplace")}
            field="marketplace_slug"
          />
          <MarketplaceItemSelect
            {...inputProps}
            {...l10n.section_items.marketplace_sku}
            marketplaceSlug={sectionItem.marketplace.marketplace_slug}
            field="marketplace_sku"
            componentProps={{
              withBorder: false,
              p: 0,
              pt: 0,
              pb: 0,
              mb:0
            }}
          />
        </>
      );
  }
});

const SectionItemPresentation = observer(({mediaPropertyId, inputProps, mediaItem}) => {
  // These fields mirror catalog media configuration
  const l10n = rootStore.l10n.pages.media_catalog.form;

  inputProps = {
    ...inputProps,
    path: UrlJoin(inputProps.path, "display")
  };

  const tags = mediaPropertyStore.GetMediaPropertyTags({mediaPropertyId});

  return (
    <>
      <Inputs.Text
        {...inputProps}
        {...l10n.media.title}
        field="title"
        placeholder={mediaItem?.title}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.subtitle}
        field="subtitle"
        placeholder={mediaItem?.subtitle}
      />

      <Inputs.List
        {...inputProps}
        {...l10n.media.headers}
        field="headers"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.media.description}
        field="description"
        placeholder={mediaItem?.description}
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.media.description_rich_text}
        field="description_rich_text"
      />

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.media.tags}
        subcategory={l10n.categories.tags}
        disabled={tags.length === 0}
        field="tags"
        searchable
        options={tags}
        placeholder={mediaItem?.tags?.join(", ") || ""}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.media.thumbnail_images}
        componentProps={{maw: uiStore.inputWidthWide}}
        fields={[
          { ...l10n.media.image_portrait, baseSize: 125, aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS["Portrait"]?.ratio, field: "thumbnail_image_portrait" },
          { ...l10n.media.image_square, baseSize: 125, aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS["Square"]?.ratio, field: "thumbnail_image_square" },
          { ...l10n.media.image_landscape, baseSize: 125, aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS["Landscape"]?.ratio, field: "thumbnail_image_landscape" }
        ]}
        altTextField="thumbnail_alt_text"
      />
    </>
  );
});

const MediaPropertySectionItem = observer(() => {
  const { mediaPropertyId, sectionId, sectionItemId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const section = info.sections?.[sectionId];

  if(!section) {
    return null;
  }

  const sectionItemIndex = section.content?.findIndex(sectionItem => sectionItem.id === sectionItemId);
  const sectionItem = section.content?.[sectionItemIndex];

  if(!sectionItem) {
    return null;
  }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id: sectionId, label: section.label}),
    subcategory: mediaPropertyStore.MediaPropertyCategory({category: "section_item_label", mediaPropertyId, type: "sectionItem", id: sectionId, sectionItemId, label: sectionItem.label}),
    path: UrlJoin("/public/asset_metadata/info/sections", sectionId, "content", sectionItemIndex.toString())
  };

  const mediaItem = sectionItem.type !== "media" ? null : mediaPropertyStore.GetMediaItem({mediaItemId: sectionItem.media_id});

  return (
    <PageContent
      backLink={UrlJoin("/media-properties", mediaPropertyId, "sections", sectionId)}
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.section_item} - ${sectionItem.label || mediaItem?.label || ""}`}
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

      {
        !["media", "filter"].includes(sectionItem.type) ? null :
          <Inputs.Text
            {...inputProps}
            {...l10n.common.slug}
            field="slug"
            Validate={ValidateSlug}
          />
      }

      <Inputs.Text
        {...inputProps}
        {...l10n.sections.label}
        field="label"
        placeholder={mediaItem?.label}
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.sections.description}
        field="description"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.section_items.type}
        disabled
        options={
          Object.keys(mediaPropertyStore.SECTION_CONTENT_TYPES)
            .map(key => ({label: mediaPropertyStore.SECTION_CONTENT_TYPES[key], value: key}))
        }
        field="type"
      />

      <SectionItemOptions
        mediaProperty={info}
        sectionItem={sectionItem}
        mediaItem={mediaItem}
        l10n={l10n}
        inputProps={inputProps}
      />

      {
        sectionItem.expand ? null :
          <>
            <Title order={3} mb="md" mt={50}>{l10n.categories.section_item_presentation}</Title>

            {
              sectionItem.type !== "media" ? null :
                <Inputs.Checkbox
                  {...inputProps}
                  {...l10n.section_items.use_media_settings}
                  defaultValue={true}
                  field="use_media_settings"
                />
            }

            {
              sectionItem.type === "media" && sectionItem.use_media_settings ? null :
                <SectionItemPresentation
                  mediaPropertyId={mediaPropertyId}
                  inputProps={inputProps}
                  mediaItem={mediaItem}
                />
            }
          </>
      }
    </PageContent>
  );
});

export default MediaPropertySectionItem;
