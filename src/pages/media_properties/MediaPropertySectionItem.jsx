import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, uiStore, mediaCatalogStore, marketplaceStore} from "@/stores";
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
import {useEffect} from "react";
import {MediaPropertySectionItemPurchaseItemSpec} from "@/specs/MediaPropertySpecs.js";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";

export const MediaPropertySectionItemPurchaseItems = observer((inputProps) => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};
  const l10n = rootStore.l10n.pages.media_property.form;

  const secondaryEnabled = info.domain?.features?.secondary_marketplace;

  return (
    <Inputs.List
      {...inputProps}
      {...l10n.section_items.purchasable_items}
      newItemSpec={MediaPropertySectionItemPurchaseItemSpec}
      field="items"
      maw="100%"
      renderItem={props => {
        return (
          <>
            <Inputs.UUID
              {...props}
              hidden
              field="id"
            />
            <PermissionItemSelect
              {...l10n.section_items.purchasable_item.permission_item_id}
              {...props}
              defaultValue=""
              field="permission_item_id"
              permissionSetIds={info?.permission_sets}
            />
            {
              props.item.permission_item_id ? null :
                <>
                  <Inputs.Text
                    {...props}
                    {...l10n.section_items.purchasable_item.title}
                    subcategory={l10n.categories.purchase_item}
                    field="title"
                  />
                  <Inputs.Text
                    {...props}
                    {...l10n.section_items.purchasable_item.subtitle}
                    subcategory={l10n.categories.purchase_item}
                    field="subtitle"
                  />
                  <Inputs.TextArea
                    {...props}
                    {...l10n.section_items.purchasable_item.description}
                    subcategory={l10n.categories.purchase_item}
                    field="description"
                  />
                  <MarketplaceSelect
                    {...props}
                    {...l10n.section_items.purchasable_item.marketplace}
                    subcategory={l10n.categories.purchase_item}
                    path={UrlJoin(props.path, "/marketplace")}
                    field="marketplace_slug"
                    defaultFirst
                  />
                  <MarketplaceItemSelect
                    {...props}
                    {...l10n.section_items.purchasable_item.marketplace_sku}
                    subcategory={l10n.categories.purchase_item}
                    marketplaceSlug={props.item?.marketplace?.marketplace_slug}
                    field="marketplace_sku"
                    componentProps={{
                      withBorder: false,
                      p: 0,
                      pt: 0,
                      pb: 0
                    }}
                  />
                </>
            }
            <Inputs.Checkbox
              {...props}
              {...l10n.section_items.purchasable_item.use_item_image}
              INVERTED
              defaultValue={false}
              subcategory={l10n.categories.purchase_item}
              field="use_custom_image"
            />
            {
              !props.item.use_custom_image ? null :
                <Inputs.ImageInput
                  {...props}
                  {...l10n.section_items.purchasable_item.image}
                  subcategory={l10n.categories.purchase_item}
                  fields={[
                    {field: "image"}
                  ]}
                />
            }
            <Inputs.Select
              {...props}
              {...l10n.section_items.purchasable_item.secondary_market_purchase_option}
              subcategory={l10n.categories.purchase_item}
              field="secondary_market_purchase_option"
              defaultValue=""
              disabled={!secondaryEnabled}
              options={[
                { label: "None", value: "" },
                { label: "Show", value: "show" },
                { label: "Show if Out of Stock", value: "out_of_stock" },
                { label: "Secondary Only", value: "only" }
              ]}
            />
            <Inputs.Select
              {...props}
              {...l10n.section_items.purchasable_item.redirect_on_purchase}
              subcategory={l10n.categories.purchase_item}
              field="redirect_page"
              defaultValue=""
              options={[
                { label: "None", value: "" },
                { label: "(Property Main Page)", value: "main" },
                ...Object.keys(info.pages || {})
                  .filter(pageId => pageId !== "main")
                  .map(pageId => ({
                    label: info.pages[pageId].label,
                    value: pageId
                  }))
              ]}
            />
          </>
        );
      }}
    />
  );
});

const SectionItemOptions = observer(({mediaProperty, sectionItem, mediaItem, inputProps, l10n}) => {
  const pages = Object.keys(mediaProperty.pages);
  const mediaProperties = mediaPropertyStore.allMediaProperties
    .filter(otherProperty => otherProperty.id !== mediaProperty.id);
  const subProperties = mediaProperties.filter(property => mediaProperty.subproperties?.includes(property.objectId));

  useEffect(() => {
    if(!["property_link", "subproperty_link"].includes(sectionItem.type)) {
      return;
    }

    let propertyId = sectionItem.type === "property_link" ? sectionItem.property_id : sectionItem.subproperty_id;

    if(!propertyId) { return; }

    mediaPropertyStore.LoadMediaProperty({mediaPropertyId: propertyId});
  }, [sectionItem.property_id, sectionItem.subproperty_id, sectionItem.type]);

  useEffect(() => {
    if(!["marketplace_link", "redeemable_offer"].includes(sectionItem.type)) {
      return;
    }

    marketplaceStore.LoadMarketplace({marketplaceId: sectionItem.marketplace.marketplace_id});
  }, []);

  let property;
  switch(sectionItem.type) {
    case "media":
      return (
        <>
          <MantineInput.Wrapper
            disabled
            {...l10n.section_items.media_item}
          >
            <MediaItemCard mediaItem={mediaItem} size="md" mb="md" withLink showPermissions />
          </MantineInput.Wrapper>
          {
            !mediaItem || mediaItem?.type === "media" ? null :
              <Inputs.Checkbox
                {...inputProps}
                {...l10n.section_items[`expand_${mediaItem?.type}`]}
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
    case "property_link":
      property = mediaPropertyStore.mediaProperties[sectionItem.property_id]?.metadata.public.asset_metadata.info;
      return (
        <>
          <Inputs.Select
            {...inputProps}
            {...l10n.section_items.property}
            options={mediaProperties.map(property => ({label: property.name, value: property.objectId}))}
            field="property_id"
          />
          {
            !property ? null :
              <Inputs.Select
                {...inputProps}
                {...l10n.section_items.property_page}
                defaultValue="main"
                options={Object.keys(property.pages)?.map(pageId => ({label: property.pages[pageId].label, value: pageId}))}
                field="property_page_id"
              />
          }
        </>
      );
    case "subproperty_link":
      property = mediaPropertyStore.mediaProperties[sectionItem.subproperty_id]?.metadata.public.asset_metadata.info;
      return (
        <>
          <Inputs.Select
            {...inputProps}
            {...l10n.section_items.subproperty}
            options={subProperties.map(subproperty => ({label: subproperty.name, value: subproperty.objectId}))}
            field="subproperty_id"
          />
          {
            !property ? null :
              <Inputs.Select
                {...inputProps}
                {...l10n.section_items.subproperty_page}
                defaultValue="main"
                options={Object.keys(property.pages)?.map(pageId => ({label: property.pages[pageId].label, value: pageId}))}
                field="subproperty_page_id"
              />
          }
        </>
      );
    case "marketplace_link":
    case "redeemable_offer":
      // eslint-disable-next-line no-case-declarations
      const marketplaceItem = (marketplaceStore.marketplaces[sectionItem.marketplace?.marketplace_id]?.metadata?.public?.asset_metadata?.info?.items || [])
        ?.find(item => item.sku === sectionItem.marketplace_sku);
      // eslint-disable-next-line no-case-declarations
      const redeemableOffers = (marketplaceItem?.nft_template?.nft?.redeemable_offers || [])
        .filter(offer => !isNaN(parseInt(offer.offer_id)));

      return (
        <>
          <MarketplaceSelect
            disabled
            {...inputProps}
            {...l10n.section_items.marketplace}
            path={UrlJoin(inputProps.path, "/marketplace")}
            field="marketplace_slug"
          />
          <MarketplaceItemSelect
            {...inputProps}
            {...l10n.section_items.marketplace_sku}
            disabled
            marketplaceSlug={sectionItem.marketplace.marketplace_slug}
            field="marketplace_sku"
            componentProps={{
              withBorder: false,
              p: 0,
              pt: 0,
              pb: 0
            }}
          />
          {
            sectionItem.type !== "redeemable_offer" ? null :
              <Inputs.Select
                {...inputProps}
                {...l10n.section_items.redeemable_offer}
                disabled
                field="offer_id"
                options={redeemableOffers.map(offer => ({label: offer.name, value: offer.offer_id}))}
              />
          }
        </>
      );
  }
});

const SectionItemPresentation = observer(({mediaPropertyId, sectionDisplay, inputProps, showDescription, mediaItem}) => {
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

      {
        !showDescription ? null :
          <>
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
          </>
      }

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

      {
        sectionDisplay === "banner" ? null :
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
      }
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
  const secondaryEnabled = info.domain?.features?.secondary_marketplace;

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
      <Title order={3} mb="md" mt={50}>{l10n.categories.permissions}</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.section_items.permission_behavior}
        subcategory={l10n.categories.permissions}
        defaultValue=""
        path={UrlJoin(inputProps.path, "permissions")}
        field="behavior"
        options={[
          { label: "Default", value: "" },
          ...Object.keys(mediaPropertyStore.PERMISSION_BEHAVIORS).map(key => ({
            label: mediaPropertyStore.PERMISSION_BEHAVIORS[key],
            value: key
          })),
          { label: "Show If Not Authorized", value: "show_if_unauthorized"},
          { label: "Show Alternate Page", value: "show_alternate_page"}
        ]}
      />
      {
        sectionItem.permissions?.behavior !== "show_alternate_page" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.general.alternate_page}
            subcategory={l10n.categories.permissions}
            path={UrlJoin(inputProps.path, "permissions")}
            field="alternate_page_id"
            options={[
              { label: "(Property Main Page)", value: "main" },
              ...Object.keys(info.pages || {})
                .filter(pageId => pageId !== "main")
                .map(pageId => ({
                  label: info.pages[pageId].label,
                  value: pageId
                }))
            ]}
          />
      }
      {
        sectionItem.permissions?.behavior !== "show_purchase" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.section_items.purchasable_item.secondary_market_purchase_option}
            subcategory={l10n.categories.permissions}
            path={UrlJoin(inputProps.path, "permissions")}
            field="secondary_market_purchase_option"
            defaultValue=""
            disabled={!secondaryEnabled}
            options={[
              { label: "None", value: "" },
              { label: "Show", value: "show" },
              { label: "Show if Out of Stock", value: "out_of_stock" },
              { label: "Secondary Only", value: "only" }
            ]}
          />
      }
      {
        (info.permission_sets || []).length === 0 ? null :
          <>
            <PermissionItemSelect
              {...l10n.section_items.permissions}
              {...inputProps}
              path={UrlJoin(inputProps.path, "permissions")}
              field="permission_item_ids"
              multiple
              permissionSetIds={info?.permission_sets}
              defaultFirst
            />
          </>
      }

      <Title order={3} mb="md" mt={50}>{l10n.categories.section_item_content}</Title>
      <SectionItemOptions
        mediaProperty={info}
        sectionItem={sectionItem}
        mediaItem={mediaItem}
        l10n={l10n}
        inputProps={inputProps}
      />

      {
        sectionItem.type !== "item_purchase" ? null :
          <MediaPropertySectionItemPurchaseItems {...inputProps} />
      }

      {
        sectionItem.expand ? null :
          <>
            <Title order={3} mb="md" mt={50}>{l10n.categories.section_item_presentation}</Title>

            {
              !["button_vertical", "button_horizontal"].includes(section.display?.card_style) ? null :
                <Inputs.Text
                  {...inputProps}
                  {...l10n.section_items.card_button_text}
                  subcategory={l10n.categories.section_presentation}
                  placeholder={section.display.card_default_button_text}
                  field="card_button_text"
                />
            }
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
                  showDescription={["button_vertical", "button_horizontal"].includes(section.display?.card_style)}
                  sectionDisplay={section.display?.display_format}
                />
            }
            {
              section.display?.display_format !== "banner" ? null :
                <Inputs.ImageInput
                  {...inputProps}
                  {...l10n.section_items.banner_images}
                  componentProps={{maw: uiStore.inputWidthWide}}
                  fields={[
                    { ...l10n.section_items.banner_image, baseSize: 125, aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS["Landscape"]?.ratio, field: "banner_image" },
                    { ...l10n.section_items.banner_image_mobile, baseSize: 125, aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS["Landscape"]?.ratio, field: "banner_image_mobile" }
                  ]}
                  altTextField="banner_alt_text"
                />
            }
          </>
      }
    </PageContent>
  );
});

export default MediaPropertySectionItem;
