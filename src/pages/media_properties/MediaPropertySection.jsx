import {observer} from "mobx-react-lite";
import {Link, useParams} from "react-router-dom";
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
  Paper, Accordion
} from "@mantine/core";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {useEffect, useState} from "react";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import {useForm} from "@mantine/form";
import {modals} from "@mantine/modals";
import {MarketplaceItemSelect} from "@/components/inputs/marketplace/MarketplaceItemInput";
import {MediaCatalogItemSelectionModal} from "@/components/inputs/media_catalog/MediaCatalogItemTable";
import {
  MediaItemCard,
  MediaItemImage,
  MediaItemPermissionIcon,
  MediaPropertySectionPermissionIcon
} from "@/components/common/MediaCatalog.jsx";
import {ValidateSlug} from "@/components/common/Validation.jsx";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {IconExternalLink, IconSettings} from "@tabler/icons-react";
import {MediaPropertySectionSelectionModal} from "@/pages/media_properties/MediaPropertySections.jsx";
import {
  MediaPropertyHeroItemSpec,
  MediaPropertySearchFilterSpec,
  MediaPropertySearchSecondaryFilterSpec
} from "@/specs/MediaPropertySpecs.js";

const CreateSectionItemForm = observer(({mediaProperty, Create}) => {
  const [creating, setCreating] = useState(false);
  const [showMediaSelectionModal, setShowMediaSelectionModal] = useState(false);

  const pages = Object.keys(mediaProperty.pages);
  const mediaProperties = mediaPropertyStore.allMediaProperties
    .filter(otherProperty => otherProperty.id !== mediaProperty.id);
  const subProperties = mediaProperties.filter(property => mediaProperty.subproperties?.includes(property.objectId));
  const marketplaces = marketplaceStore.allMarketplaces;

  const l10n = rootStore.l10n.pages.media_property.form;
  const form = useForm({
    initialValues: {
      type: "media",
      label: "",
      mediaItemIds: [],
      expand: false,
      pageId: pages[0],
      subpropertyId: subProperties[0]?.objectId,
      propertyId: mediaProperties[0]?.objectId,
      propertyPageId: "main",
      marketplaceId: marketplaces[0]?.objectId,
      marketplaceSKU: "",
    },
    validate: {
      label: value => form.values.type === "media" || value ? null : l10n.section_items.create.validation.label,
      mediaItemIds: value => form.values.type !== "media" || value.length > 0 ? null : l10n.section_items.create.validation.media_items,
      pageId: value => form.values.type !== "page_link" || value ? null : l10n.section_items.create.validation.page,
      subpropertyId: value => form.values.type !== "subproperty_link" || value ? null : l10n.section_items.create.validation.subproperty,
      propertyId: value => form.values.type !== "property_link" || value ? null : l10n.section_items.create.validation.property,
      marketplaceId: value => !["marketplace_link", "redeemable_offer"].includes(form.values.type) || value ? null : l10n.section_items.create.validation.marketplace,
      marketplaceSKU: value => form.values.type !== "redeemable_offer" || value ? null :  l10n.section_items.create.validation.marketplace_item,
      offerId: value =>form.values.type !== "redeemable_offer" || value ? null : l10n.section_items.create.validation.offer_id
    }
  });

  const selectedMediaItems = form.values.mediaItemIds.map(mediaItemId =>
    mediaPropertyStore.GetMediaItem({mediaItemId})
  );

  const marketplaceItem = (marketplaceStore.marketplaces[form.values.marketplaceId]?.metadata?.public?.asset_metadata?.info?.items || [])
    ?.find(item => item.sku === form.values.marketplaceSKU);
  const redeemableOffers = (marketplaceItem?.nft_template?.nft?.redeemable_offers || [])
    .filter(offer => !isNaN(parseInt(offer.offer_id)));

  useEffect(() => {
    form.getInputProps("marketplaceSKU").onChange("");
    form.getInputProps("offerId").onChange("");
  }, [form.values.marketplaceId]);

  useEffect(() => {
    if(!["property_link", "subproperty_link"].includes(form.values.type)) {
      return;
    }

    // Ensure all properties are loaded
    mediaPropertyStore.allMediaProperties.forEach(mediaProperty =>
      mediaPropertyStore.LoadMediaProperty({mediaPropertyId: mediaProperty.objectId})
    );

    form.getInputProps("propertyPageId").onChange("main");
  }, [form.values.type, form.values.propertyId, form.values.subpropertyId]);

  let formContent, property;
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
            <Stack mb={5} spacing={5} mah={500} style={{overflowY: "auto"}}>
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
            {
              selectedMediaItems.length === 0 ? null :
                <Text fz="xs" align="center">{selectedMediaItems.length} Items Selected</Text>
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
          data={[
            { label: "(Property Main Page)", value: "main" },
            ...pages
              .filter(pageId => pageId !== "main")
              .map(pageId =>
                ({label: mediaProperty.pages[pageId].label, value: pageId})
              )
          ]}
          {...form.getInputProps("pageId")}
        />
      );

      break;

    case "property_link":
      property = mediaPropertyStore.mediaProperties[form.values.propertyId]?.metadata.public.asset_metadata.info;
      formContent = (
        <>
          <Select
            withinPortal
            {...l10n.section_items.property}
            data={mediaProperties.map(property => ({label: property.name, value: property.objectId}))}
            {...form.getInputProps("propertyId")}
          />
          {
            !property ? null :
              <Select
                withinPortal
                {...l10n.section_items.page}
                data={Object.keys(property.pages)?.map(pageId => ({label: property.pages[pageId].label, value: pageId}))}
                {...form.getInputProps("propertyPageId")}
              />
          }
        </>
      );

      break;

    case "subproperty_link":
      property = mediaPropertyStore.mediaProperties[form.values.subpropertyId]?.metadata.public.asset_metadata.info;
      formContent = (
        <>
          <Select
            withinPortal
            {...l10n.section_items.subproperty}
            data={subProperties.map(subproperty => ({label: subproperty.name, value: subproperty.objectId}))}
            {...form.getInputProps("subpropertyId")}
          />
          {
            !property ? null :
              <Select
                withinPortal
                {...l10n.section_items.page}
                data={Object.keys(property.pages)?.map(pageId => ({label: property.pages[pageId].label, value: pageId}))}
                {...form.getInputProps("propertyPageId")}
              />
          }
        </>
      );

      break;
    case "marketplace_link":
    case "redeemable_offer":
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
          {
            form.values.type !== "redeemable_offer" ? null :
              <Select
                withinPortal
                {...l10n.section_items.redeemable_offer}
                data={[
                  { label: "<Select Offer>", value: "" },
                  ...(redeemableOffers.map(offer => ({label: offer.name, value: offer.offer_id})))
                ]}
                {...form.getInputProps("offerId")}
              />
          }
        </>
      );

      break;
    case "item_purchase":
      formContent = null;
      break;
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
});

export const SectionItemTitle = observer(({sectionItem, aspectRatio, banner}) => {
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
        imageUrl={banner ? sectionItem?.banner_image?.url : undefined}
        mediaItem={banner ? undefined : sectionItem.display}
        scale={150}
        width={60}
        height={60}
        miw={60}
        banner={banner}
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
        width="ExtraWide"
        AddItem={async () => {
          return new Promise((resolve) => {
            modals.open({
              title: LocalizeString(l10n.create.create, {type: l10n.categories.section_item}),
              centered: true,
              onCancel: () => resolve(),
              children:
                <div>
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
                </div>
            });
          });
        }}
        columns={[
          {
            label: l10n.sections.label.label,
            field: "label",
            render: sectionItem =>
              <SectionItemTitle
                sectionItem={sectionItem}
                aspectRatio={section.display.aspect_ratio}
                banner={section.display?.display_format === "banner"}
              />
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
                  {
                    !mediaItem ? "Missing Media Item" :
                      mediaItem.type === "collection" ? "Media Collection" : mediaItem.type === "list" ? "Media List" : "Media"
                  }
                  {!sectionItem.expand ? null : <Text italic>(Expanded)</Text>}
                </Text>
              );
            }
          },
          {
            accessor: "permissions",
            label: l10n.sections.permissions.label,
            centered: true,
            render: sectionItem => <MediaPropertySectionPermissionIcon sectionOrSectionItem={sectionItem} />,
            width: 125
          },
          {
            accessor: "media_permissions",
            label: l10n.sections.media_permissions.label,
            centered: true,
            render: sectionItem =>
              sectionItem.type !== "media" || !sectionItem.media_id ? null :
                <MediaItemPermissionIcon mediaItem={mediaPropertyStore.GetMediaItem({mediaItemId: sectionItem.media_id})} />,
            width: 150
          },
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
    <Paper shadow="sm" withBorder py="md" px={5} h="max-content" mt="md" w={uiStore.inputWidth}>
      <Title order={4} align="center">Section Content Preview</Title>
      <Text align="center" fz="xs" mb="sm">{content.length} Matching Items</Text>
      <Stack spacing={5} mah={550} px="sm" style={{overflowY: "auto", overflowX: "visible", overscrollBehavior: "none"}}>
        {
          content.map(mediaItem =>
            <MediaItemCard
              key={`media-item-${mediaItem.id}`}
              mediaItem={mediaItem}
              aspectRatio={aspectRatio || "Canonical"}
              size="sm"
              withLink
              showPermissions
            />
          )
        }
      </Stack>
    </Paper>
  );
});

const AutomaticSectionFilters = observer(() => {
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

  const attributes = mediaPropertyStore.GetMediaPropertyAttributes({mediaPropertyId});

  return (
    <>
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
          searchable
          options={mediaPropertyStore.GetMediaPropertyTags({mediaPropertyId})}
          field="tags"
        />
        <Inputs.MultiSelect
          {...inputProps}
          {...l10n.sections.filters.attributes}
          clearable
          searchable
          options={
            Object.keys(attributes).map(attributeId => ({
              label: attributes[attributeId].title || "Attribute",
              value: attributeId
            }))
          }
          field="attributes"
        />

        {
          (section?.select?.attributes || []).map(attributeId => {
            const attribute = attributes[attributeId];

            if(!attribute) { return; }

            return (
              <Inputs.Select
                componentProps={{mt: "md"}}
                key={`attribute-${attributeId}`}
                {...inputProps}
                path={UrlJoin(inputProps.path, "attribute_values")}
                field={attributeId}
                label={attribute.title || "Attribute"}
                searchable
                defaultValue=""
                options={attributes[attributeId].tags || []}
              />
            );
          })
        }

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
              <Inputs.Date
                {...inputProps}
                {...l10n.sections.filters.date}
                field="date"
              />
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
          <AutomaticSectionContentPreview
            mediaPropertyId={mediaPropertyId}
            sectionId={sectionId}
            aspectRatio={section.display.aspect_ratio}
          />
      }
    </>
  );
});

const FilterOptions = observer(() => {
  const { mediaPropertyId, sectionId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const section = info.sections?.[sectionId];

  if(!section) {
    return null;
  }

  const attributes = mediaPropertyStore.GetMediaPropertyAttributes({mediaPropertyId});

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id: sectionId, label: section.label}),
    subcategory: l10n.categories.section_full_content_page,
    path: UrlJoin("/public/asset_metadata/info/sections", sectionId, "filters")
  };

  return (
    <>
      <Inputs.Select
        {...inputProps}
        {...l10n.general.search.group_by}
        field="group_by"
        searchable
        defaultValue=""
        options={[
          {label: "None", value: ""},
          {label: "Media Type", value: "__media-type"},
          {label: "Date", value: "__date"},
          ...(Object.keys(attributes).map(attributeId => ({
            label: attributes[attributeId].title || "Attribute",
            value: attributeId
          })))
        ]}
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.general.search.primary_filter}
        field="primary_filter"
        searchable
        defaultValue=""
        options={[
          {label: "None", value: ""},
          {label: "Media Type", value: "__media-type"},
          ...(Object.keys(attributes).map(attributeId => ({
            label: attributes[attributeId].title || "Attribute",
            value: attributeId
          })))
        ]}
      />
      {
        !section.filters?.primary_filter ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.general.search.primary_filter_style}
              field="primary_filter_style"
              defaultValue="box"
              options={[
                {label: "Box", value: "box"},
                {label: "Text", value: "text"},
                {label: "Image", value: "image"},
              ]}
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.sections.display.show_primary_filter_in_page_view}
              field="show_primary_filter_in_page_view"
              defaultValue={false}
            />
          </>
      }

      {
        !section.filters?.primary_filter ? null :
          <Inputs.List
            {...inputProps}
            {...l10n.general.search.filter_options}
            field="filter_options"
            newItemSpec={MediaPropertySearchFilterSpec}
            renderItem={(props) => {
              const attributeValues =
                section.filters.primary_filter === "__media-type" ?
                  ["Video", "Gallery", "Image", "Ebook"] :
                  attributes[section.filters.primary_filter]?.tags || [];

              return (
                <>
                  <Inputs.Select
                    {...props}
                    {...l10n.general.search.filter_option.primary_filter_value}
                    field="primary_filter_value"
                    searchable
                    defaultValue=""
                    options={[
                      {label: "All", value: ""},
                      ...attributeValues.map(tag => ({
                        label: tag || "",
                        value: tag
                      }))
                    ]}
                  />
                  {
                    section.filters.primary_filter_style !== "image" ? null :
                      <Inputs.SingleImageInput
                        {...props}
                        {...l10n.general.search.filter_option.primary_filter_image}
                        field="primary_filter_image"
                        baseSize={125}
                        p="md"
                        pb="xs"
                        horizontal
                      />
                  }
                  <Inputs.Select
                    {...props}
                    {...l10n.general.search.filter_option.secondary_filter_attribute}
                    field="secondary_filter_attribute"
                    searchable
                    defaultValue=""
                    options={
                      [
                        {label: "None", value: ""},
                        {label: "Media Type", value: "__media-type"},
                        ...(Object.keys(attributes).map(attributeId => ({
                          label: attributes[attributeId].title || "Attribute",
                          value: attributeId
                        })))
                      ].filter(({value}) => section.filters.primary_filter !== value)
                    }
                  />

                  {
                    !props.item.secondary_filter_attribute ? null :
                      <>
                        <Inputs.Select
                          {...props}
                          {...l10n.general.search.filter_option.secondary_filter_spec}
                          field="secondary_filter_spec"
                          defaultValue="automatic"
                          options={[
                            {label: "Automatic", value: "automatic"},
                            {label: "Manual", value: "manual"}
                          ]}
                        />

                        <Inputs.Select
                          {...props}
                          {...l10n.general.search.filter_option.secondary_filter_style}
                          field="secondary_filter_style"
                          defaultValue="box"
                          options={[
                            {label: "Box", value: "box"},
                            {label: "Text", value: "text"},
                            {label: "Image", value: "image", disabled: props.item.secondary_filter_spec !== "manual"},
                          ]}
                        />
                        {
                          props.item.secondary_filter_spec !== "manual" ? null :
                            <Inputs.List
                              {...props}
                              {...l10n.general.search.filter_option.secondary_filter_options}
                              field="secondary_filter_options"
                              newItemSpec={MediaPropertySearchSecondaryFilterSpec}
                              renderItem={(secondaryFilterProps) => {
                                const secondaryAttributeValues =
                                  props.item.secondary_filter_attribute === "__media-type" ?
                                    ["Video", "Gallery", "Image", "Ebook"] :
                                    attributes[props.item.secondary_filter_attribute]?.tags || [];

                                return (
                                  <>
                                    <Inputs.Select
                                      {...secondaryFilterProps}
                                      {...l10n.general.search.filter_option.secondary_filter_value}
                                      field="secondary_filter_value"
                                      searchable
                                      defaultValue=""
                                      options={[
                                        {label: "All", value: ""},
                                        ...secondaryAttributeValues.map(tag => ({
                                          label: tag || "",
                                          value: tag
                                        }))
                                      ]}
                                    />
                                    {
                                      props.item.secondary_filter_style !== "image" ? null :
                                        <Inputs.SingleImageInput
                                          {...secondaryFilterProps}
                                          {...l10n.general.search.filter_option.secondary_filter_image}
                                          field="secondary_filter_image"
                                          horizontal
                                          baseSize={125}
                                          p="md"
                                          pb="xs"
                                        />
                                    }
                                  </>
                                );
                              }}
                            />
                        }
                      </>
                  }
                </>
              );
            }}
          />
      }
    </>
  );
});

const ContentSectionDisplaySettings = observer(() => {
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
    <>
      <Title order={3} mb="md" mt={50}>{l10n.categories.section_presentation}</Title>

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
          { label: "Banner", value: "banner" }
        ]}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.sections.display.title}
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="title"
      />
      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.sections.display.title_icon}
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="title_icon"
        baseSize={75}
        horizontal
        p="md"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.sections.display.subtitle}
        subcategory={l10n.categories.section_presentation}
        path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
        field="subtitle"
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

      {
        !["carousel", "grid"].includes(section.display?.display_format) ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.sections.display.card_style}
              subcategory={l10n.categories.section_presentation}
              path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
              defaultValue=""
              field="card_style"
              options={[
                {label: "Default", value: ""},
                {label: "Card with Button (Vertical)", value: "button_vertical"},
                {label: "Card with Button (Horizontal)", value: "button_horizontal"}
              ]}
            />
            {
              !["button_vertical", "button_vertical"].includes(section.display?.card_style) ? null :
                <Inputs.Text
                  {...inputProps}
                  {...l10n.sections.display.card_default_button_text}
                  subcategory={l10n.categories.section_presentation}
                  path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
                  defaultValue="Click Here"
                  field="card_default_button_text"
                />
            }
          </>
      }

      {
        !["carousel", "grid"].includes(section.display?.display_format) ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.sections.display.aspect_ratio}
              defaultValue="Landscape"
              subcategory={l10n.categories.section_presentation}
              path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
              field="aspect_ratio"
              options={
                [
                  ...Object.keys(mediaCatalogStore.IMAGE_ASPECT_RATIOS)
                    .map(value => ({label: mediaCatalogStore.IMAGE_ASPECT_RATIOS[value].label, value}))
                ]
              }
            />
            {
              section.display?.display_format !== "grid" || !section.display?.aspect_ratio ? null :
                <>
                  <Inputs.Select
                    {...inputProps}
                    {...l10n.sections.display.justification}
                    subcategory={l10n.categories.section_presentation}
                    path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
                    defaultValue="left"
                    field="justification"
                    options={[
                      {label: "Left", value: "left"},
                      {label: "Center", value: "center"},
                      {label: "Right", value: "right"},
                    ]}
                  />
                  <Inputs.Select
                    {...inputProps}
                    {...l10n.sections.display.display_limit_type}
                    subcategory={l10n.categories.section_presentation}
                    path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
                    field="display_limit_type"
                    defaultValue="items"
                    options={[
                      { label: "Number of Items", value: "items" },
                      { label: "Number of Rows", value: "rows" }
                    ]}
                  />
                </>
            }
            <Inputs.Integer
              {...inputProps}
              {...(
                section.display?.display_format === "grid" &&
                !!section.display?.aspect_ratio &&
                section.display?.display_limit_type === "rows" ?
                  l10n.sections.display.display_limit_rows :
                  l10n.sections.display.display_limit
              )}
              defaultValue={0}
              min={0}
              subcategory={l10n.categories.section_presentation}
              path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
              field="display_limit"
            />

            <Inputs.Select
              {...inputProps}
              {...l10n.sections.display.content_display_text}
              subcategory={l10n.categories.section_presentation}
              path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
              defaultValue="all"
              field="content_display_text"
              options={[
                {label: "Title, Subtitle and Headers", value: "all"},
                {label: "Title and Subtitle", value: "titles"},
                {label: "Title Only", value: "title"},
                {label: "No Text", value: "none"}
              ]}
            />

            <Inputs.SingleImageInput
              {...inputProps}
              {...l10n.sections.display.logo}
              subcategory={l10n.categories.section_presentation}
              path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
              field="logo"
              aspectRatio={1}
              horizontal
            />

            {
              !section.display.logo ? null :
                <Inputs.Text
                  {...inputProps}
                  {...l10n.sections.display.logo_text}
                  subcategory={l10n.categories.section_presentation}
                  path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
                  field="logo_text"
                />
            }

            <Inputs.Color
              {...inputProps}
              {...l10n.sections.display.inline_background_color}
              subcategory={l10n.categories.section_presentation}
              path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
              field="inline_background_color"
            />


            <Inputs.ImageInput
              {...inputProps}
              {...l10n.sections.display.inline_background_image}
              subcategory={l10n.categories.section_presentation}
              path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
              fields={[
                { field: "inline_background_image", ...l10n.sections.display.background_image_desktop, aspectRatio: 4, baseSize: 125 },
                { field: "inline_background_image_mobile", ...l10n.sections.display.background_image_mobile, aspectRatio: 2, baseSize: 125 },
              ]}
            />

            <Inputs.ImageInput
              {...inputProps}
              {...l10n.sections.display.section_page_background_image}
              subcategory={l10n.categories.section_presentation}
              path={UrlJoin("/public/asset_metadata/info/sections", sectionId, "display")}
              fields={[
                { field: "background_image", ...l10n.sections.display.background_image_desktop, aspectRatio: 16/9, baseSize: 135 },
                { field: "background_image_mobile", ...l10n.sections.display.background_image_mobile, aspectRatio: 1/2, baseSize: 135 },
              ]}
            />
          </>
      }

      <Title order={3} mt={50} mb="md">{l10n.categories.section_full_content_page}</Title>
      <FilterOptions />

      <Title order={3} mb="md" mt={50}>{l10n.categories[section.type === "manual" ? "section_content" : "section_filters"]}</Title>

      {
        section.type === "manual" ?
          <SectionContentList /> :
          <AutomaticSectionFilters />
      }
    </>
  );
});

const ContainerSectionSettings = observer(() => {
  const [showSectionSelectionModal, setShowSectionSelectionModal] = useState(false);
  const { mediaPropertyId, sectionId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const section = info.sections?.[sectionId];

  if(!section) {
    return null;
  }

  const tags = mediaPropertyStore.GetMediaPropertyTags({mediaPropertyId}) || [];

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id: sectionId, label: section.label}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/sections", sectionId)
  };

  const excludedSectionIds = [
    ...(section?.sections || []),
    ...(Object.keys(info.sections).filter(sectionId =>
      info.sections[sectionId]?.type === "container"
    ))
  ];

  return (
    <>
      <Title order={3} mb="md" mt={50}>{l10n.categories.section_presentation}</Title>

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.sections.container.filter_tags}
        subcategory={l10n.categories.section_presentation}
        field="filter_tags"
        options={tags.map(tag => ({label: tag, value: tag}))}
      />

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.pages.sections}
        subcategory={l10n.categories.section_presentation}
        field="sections"
        idField="."
        GetName={sectionId => info.sections[sectionId]?.label}
        editable={false}
        AddItem={() => setShowSectionSelectionModal(true)}
        Actions={sectionId => [
          <IconButton
            key="link-button"
            label={LocalizeString(rootStore.l10n.components.inputs.navigate_to, {item: info.sections[sectionId]?.label || sectionId })}
            component={Link}
            to={UrlJoin("/media-properties/", mediaPropertyId, "sections", sectionId)}
            color="purple.6"
            Icon={IconExternalLink}
          />
        ]}
        columns={[
          {
            label: l10n.sections.label.label,
            field: "label",
            render: sectionId => <Text>{info.sections[sectionId]?.label || (!info.sections[sectionId] ? "<Deleted Section>" : sectionId)}</Text>
          },
          {
            label: l10n.sections.type.label,
            field: "type",
            render: sectionId => <Text>{info.sections[sectionId]?.type?.capitalize() || ""}</Text>,
            width: 175
          },
          {
            label: l10n.sections.display.display_format.label,
            field: "display_format",
            render: sectionId => <Text>{info.sections[sectionId]?.display?.display_format?.capitalize() || ""}</Text>,
            width: 175
          }
        ]}
      />

      {
        !showSectionSelectionModal ? null :
          <MediaPropertySectionSelectionModal
            mediaPropertyId={mediaPropertyId}
            excludedSectionIds={excludedSectionIds}
            Close={() => setShowSectionSelectionModal(false)}
            Submit={sectionIds => {
              sectionIds.forEach(sectionId => {
                mediaPropertyStore.InsertListElement({
                  ...inputProps,
                  page: location.pathname,
                  field: "sections",
                  value: sectionId,
                  label: info.sections[sectionId]?.label || sectionId
                });
              });

              setShowSectionSelectionModal(false);
            }}
          />
      }
    </>
  );
});

const HeroSectionSettings = observer(() => {
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
    subcategory: l10n.categories.section_hero_item,
    path: UrlJoin("/public/asset_metadata/info/sections", sectionId)
  };

  return (
    <>
      <Title order={3} mb="md" mt={50}>{l10n.categories.section_presentation}</Title>

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.sections.hero_items}
        subcategoryFnParams={{fields: ["label", "id"], l10n: l10n.categories.section_hero_item_label}}
        field="hero_items"
        idField="id"
        idPrefix={mediaPropertyStore.ID_PREFIXES.section_hero_item}
        routePath="hero_items"
        newItemSpec={MediaPropertyHeroItemSpec}
        GetName={sectionId => section.hero_items[sectionId]?.label}
        columns={[
          {
            label: l10n.sections.label.label,
            field: "label"
          }
        ]}
      />
      <Accordion mt="md" maw={uiStore.inputWidthWide} variant="contained">
        <Accordion.Item value="default">
          <Accordion.Control icon={<IconSettings />}>
            { rootStore.l10n.components.forms.advanced_settings }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.sections.hero_overlap}
              field="allow_overlap"
              defaultValue={false}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
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

  const tags = mediaPropertyStore.GetMediaPropertyTags({mediaPropertyId}) || [];
  const specialSectionType = !["manual", "automatic"].includes(section.type);
  const secondaryEnabled = info.domain?.features?.secondary_marketplace;

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

      {
        specialSectionType ? null :
          <Inputs.Text
            {...inputProps}
            {...l10n.common.slug}
            field="slug"
            Validate={ValidateSlug}
            validateOnLoad
          />
      }

      <Inputs.Select
        {...inputProps}
        {...l10n.sections.type}
        disabled
        field="type"
        options={[
          { label: "Manual Content Section", value: "manual" },
          { label: "Automatic Content Section", value: "automatic" },
          { label: "Hero Section", value: "hero" },
          { label: "Container Section", value: "container" }
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

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.sections.tags}
        subcategory={l10n.categories.section_presentation}
        field="tags"
        options={tags.map(tag => ({label: tag, value: tag}))}
      />


      <Title order={3} mb="md" mt={50}>{l10n.categories.permissions}</Title>
      <Inputs.Select
        {...inputProps}
        {...l10n.sections.permission_behavior}
        subcategory={l10n.categories.permissions}
        defaultValue=""
        path={UrlJoin(inputProps.path, "permissions")}
        field="behavior"
        disabled={specialSectionType}
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
        section.permissions?.behavior !== "show_alternate_page" ? null :
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
        section.permissions?.behavior !== "show_purchase" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.section_items.purchasable_item.secondary_market_purchase_option}
            subcategory={l10n.categories.permissions}
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
              {...l10n.sections.permissions}
              {...inputProps}
              subcategory={l10n.categories.permissions}
              path={UrlJoin(inputProps.path, "permissions")}
              field="permission_item_ids"
              multiple
              permissionSetIds={info?.permission_sets}
              defaultFirst
            />
          </>
      }

      {
        section.type === "container" ?
          <ContainerSectionSettings /> :
          section.type === "hero" ?
            <HeroSectionSettings /> :
            <ContentSectionDisplaySettings />
      }


    </PageContent>
  );
});

export default MediaPropertySection;
