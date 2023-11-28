import {observer} from "mobx-react-lite";
import {useLocation, useParams} from "react-router-dom";
import {itemTemplateStore, rootStore, uiStore} from "@/stores/index.js";
import UrlJoin from "url-join";
import {AnnotatedText, ListItemCategory} from "@/components/common/Misc.jsx";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs.jsx";
import {Accordion, AspectRatio, Group, Image, Text, Title} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric.js";
import {GalleryItemSpec} from "@/specs/MediaSpecs.js";
import {IconSettings} from "@tabler/icons-react";

const aspectRatioOptions = [
  { label: "Square (1:1)", value: "Square" },
  { label: "Landscape (16:9)", value: "Wide" },
  { label: "Portrait (3:4)", value: "Tall" }
];

export const ItemTemplateMediaItemGalleryItem = observer(({pageTitle, mediaItem, mediaItemPath}) => {
  const location = useLocation();
  const { itemTemplateId, galleryItemId } = useParams();
  const galleryItemIndex = mediaItem?.gallery?.findIndex(galleryItem => galleryItem.id === galleryItemId);
  const galleryItem = mediaItem?.gallery[galleryItemIndex];

  if(!galleryItem) {
    return (
      <div>
        Gallery Item not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.media.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    path: UrlJoin(mediaItemPath, "gallery", galleryItemIndex.toString()),
    category: ListItemCategory({
      store: itemTemplateStore,
      objectId: itemTemplateId,
      listPath: UrlJoin(mediaItemPath, "gallery"),
      id: galleryItemId,
      labelField: "name",
      l10n: l10n.categories.gallery_item_label
    })
  };

  return (
    <PageContent
      backLink={location.pathname.split("/").slice(0, -2).join("/")}
      title={`${pageTitle} - ${galleryItem.name || galleryItem.id}`}
      section="itemTemplate"
      useHistory
    >
      <Inputs.UUID
        {...inputProps}
        {...l10n.common.id}
        field="id"
        hidden
      />
      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.media.gallery_item.image}
        field="image"
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.media.gallery_item.image_aspect_ratio}
        field="image_aspect_ratio"
        options={aspectRatioOptions}
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.media.gallery_item.name}
        field="name"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.media.gallery_item.description}
        field="description"
      />
      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.media.gallery_item.video}
        field="video"
        previewable
      />
    </PageContent>
  );
});

const ItemTemplateFeaturedItemSettings = observer(({containerType, inputProps, withTitle}) => {
  if(containerType !== "featured") { return null; }

  const l10n = rootStore.l10n.pages.media.form;
  return (
    <>
      { !withTitle ? null : <Title order={3} mb="md" mt={50}>{l10n.categories.featured_media_settings}</Title> }
      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.featured_media.animation}
        subcategory={l10n.categories.featured_media_settings}
        field="animation"
        previewable
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.featured_media.button_text}
        subcategory={l10n.categories.featured_media_settings}
        field="button_text"
      />
      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.featured_media.button_image}
        subcategory={l10n.categories.featured_media_settings}
        field="button_image"
      />
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.featured_media.images}
        subcategory={l10n.categories.featured_media_settings}
        fields={[
          { field: "background_image", ...l10n.featured_media.background_image },
          { field: "poster_image", ...l10n.featured_media.poster_image },
          { field: "background_image_tv", ...l10n.featured_media.background_image_tv },
          { field: "background_image_logo_tv", ...l10n.featured_media.background_image_logo_tv }
        ]}
      />
    </>
  );
});

const ItemTemplateMediaItemLockSettings = observer(({containerType, mediaItem, inputProps}) => {
  const l10n = rootStore.l10n.pages.media.form;

  if(!["featured", "collection"].includes(containerType)) {
    return null;
  }

  const lockConditionsPath = UrlJoin(inputProps.path, containerType === "collection" ? "locked_state" : "lock_conditions");
  const lockConditions = mediaItem[containerType === "collection" ? "locked_state" : "lock_conditions"];
  const lockedStateInputProps = {
    ...inputProps,
    path: UrlJoin(inputProps.path, "locked_state"),
    subcategory: l10n.categories.locked_state
  };

  return (
    <>
      <Title order={3} mb="md" mt={50}>{l10n.categories.lock_settings}</Title>
      {
        containerType !== "featured" || mediaItem.locked ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.lock.required}
            subcategory={l10n.categories.lock_settings}
            field="required"
            defaultValue={false}
          />
      }
      {
        mediaItem.required ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.lock.locked}
            subcategory={l10n.categories.lock_settings}
            field="locked"
            defaultValue={false}
          />
      }
      {
        !mediaItem.locked || mediaItem.required ? null :
          <>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.lock.hide_when_locked}
              path={lockConditionsPath}
              subcategory={l10n.categories.lock_settings}
              field="hide_when_locked"
              defaultValue={false}
            />
            <Inputs.Select
              {...inputProps}
              {...l10n.lock.lock_conditions}
              path={lockConditionsPath}
              subcategory={l10n.categories.lock_conditions}
              field="lock_condition"
              defaultValue="View Media"
              options={[
                "View Media",
                "Has Attributes"
              ]}
            />
            {
              lockConditions?.lock_condition === "Has Attributes" ?
                <Inputs.List
                  {...inputProps}
                  {...l10n.lock.required_attributes}
                  maw={uiStore.inputWidth}
                  path={lockConditionsPath}
                  subcategory={l10n.categories.lock_conditions}
                  field="required_attributes"
                  fields={[
                    { field: "attribute", InputComponent: Inputs.Text, ...l10n.lock.attribute },
                    { field: "value", InputComponent: Inputs.Text, ...l10n.lock.value }
                  ]}
                /> :
                <Inputs.List
                  {...inputProps}
                  {...l10n.lock.required_media}
                  maw={uiStore.inputWidth}
                  path={lockConditionsPath}
                  subcategory={l10n.categories.lock_conditions}
                  field="required_media"
                />
            }
          </>
      }
      {
        !mediaItem.required && !mediaItem.locked ? null :
          <Accordion maw={uiStore.inputWidth} variant="contained">
            <Accordion.Item value="default">
              <Accordion.Control icon={<IconSettings/>}>
                {l10n.categories.locked_state}
              </Accordion.Control>
              <Accordion.Panel>
                <Inputs.Text
                  {...lockedStateInputProps}
                  {...l10n.common.name}
                  field="name"
                />
                <Inputs.ImageInput
                  {...lockedStateInputProps}
                  {...l10n.media.image}
                  altTextField="image_alt"
                  fields={[
                    {field: "image", url: true, ...l10n.media.image},
                    {field: "image_tv", url: true, ...l10n.media.image_tv},
                  ]}
                />
                <Inputs.Select
                  {...lockedStateInputProps}
                  {...l10n.media.image_aspect_ratio}
                  field="image_aspect_ratio"
                  defaultValue="Square"
                  options={aspectRatioOptions}
                />

                <Inputs.Text
                  {...lockedStateInputProps}
                  {...l10n.media.subtitle_1}
                  field="subtitle_1"
                />
                <Inputs.Text
                  {...lockedStateInputProps}
                  {...l10n.media.subtitle_2}
                  field="subtitle_2"
                />
                <Inputs.TextArea
                  {...lockedStateInputProps}
                  {...l10n.media.description_text}
                  field="description_text"
                />
                <Inputs.RichText
                  {...lockedStateInputProps}
                  {...l10n.media.description}
                  field="description"
                />
                <ItemTemplateFeaturedItemSettings
                  containerType={containerType}
                  inputProps={lockedStateInputProps}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
      }
    </>
  );
});

export const ItemTemplateMediaItem = observer(({containerType, galleryItem}) => {
  const { itemTemplateId, sectionId, collectionId, mediaId } = useParams();

  const itemTemplateL10n = rootStore.l10n.pages.item_template.form;
  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];
  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  let mediaItem, mediaItemIndex, listPath, sectionIndex, section, collectionIndex, collection;
  let pageTitle = `${info.display_name || itemTemplate.display_name || "Item Template"}`;
  let backLink = UrlJoin("/item-templates", itemTemplateId, "additional_media");
  switch(containerType) {
    case "list":
      mediaItemIndex = info.additional_media?.findIndex(media => media.id === mediaId);
      mediaItem = info?.additional_media?.[mediaItemIndex];
      listPath = "/public/asset_metadata/nft/additional_media";
      pageTitle += ` - ${itemTemplateL10n.categories.additional_media} - ${mediaItem?.name || mediaItem ?.id}`;
      break;
    case "featured":
      mediaItemIndex = info.additional_media_sections.featured_media?.findIndex(media => media.id === mediaId);
      mediaItem = info?.additional_media_sections?.featured_media?.[mediaItemIndex];
      listPath = "/public/asset_metadata/nft/additional_media_sections/featured_media";
      pageTitle += ` - ${itemTemplateL10n.categories.featured_media} - ${mediaItem?.name || mediaItem ?.id}`;
      break;
    default:
      sectionIndex = info.additional_media_sections?.sections.findIndex(section => section.id === sectionId);
      section = sectionIndex < 0 ? undefined : info.additional_media_sections.sections[sectionIndex];
      collectionIndex = section?.collections?.findIndex(collection => collection.id === collectionId);
      collection = collectionIndex < 0 ? undefined : info.additional_media_sections.sections[sectionIndex].collections[collectionIndex];

      mediaItemIndex = collection?.media?.findIndex(media => media.id === mediaId);
      mediaItem = collection?.media?.[mediaItemIndex];
      listPath = UrlJoin(
        "/public/asset_metadata/nft/additional_media_sections/sections",
        sectionIndex.toString(),
        "collections",
        collectionIndex.toString(),
        "media"
      );
      backLink = UrlJoin(backLink, sectionId, collectionId);
      pageTitle += ` - ${itemTemplateL10n.categories.additional_media_sections} - ${section?.name || section?.id} - ${collection?.name || collection?.id} - ${mediaItem?.name || mediaItem ?.id}`;
      break;
  }

  if(!mediaItem) {
    return (
      <div>
        Media item not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.media.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    path: UrlJoin(listPath, mediaItemIndex.toString()),
    category: ListItemCategory({
      store: itemTemplateStore,
      objectId: itemTemplateId,
      listPath,
      id: mediaId,
      labelField: "name",
      l10n: l10n.categories.media_item_label
    }),
    subcategory: l10n.categories.media_item_info
  };

  if(galleryItem) {
    return (
      <ItemTemplateMediaItemGalleryItem
        pageTitle={pageTitle}
        mediaItem={mediaItem}
        mediaItemPath={inputProps.path}
      />
    );
  }

  return (
    <PageContent
      backLink={backLink}
      title={pageTitle}
      section="itemTemplate"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.media_item_info}</Title>
      <Inputs.Hidden
        {...inputProps}
        {...l10n.media.container}
        field="container"
        defaultValue={containerType}
      />
      <Inputs.UUID
        {...inputProps}
        {...l10n.media.media_id}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.media.title}
        field="name"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.media.annotated_title}
        field="annotated_title"
      />
      <AnnotatedText
        text={mediaItem.annotated_title}
        referenceImages={info.reference_images}
        withInput
      />
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.media.image}
        altTextField="image_alt"
        fields={[
          { field: "image", url: true, ...l10n.media.image },
          { field: "image_tv", url: true, ...l10n.media.image_tv },
        ]}
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.media.image_aspect_ratio}
        field="image_aspect_ratio"
        defaultValue="Square"
        options={aspectRatioOptions}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.subtitle_1}
        field="subtitle_1"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.media.subtitle_2}
        field="subtitle_2"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.media.description_text}
        field="description_text"
      />
      <Inputs.RichText
        {...inputProps}
        {...l10n.media.description}
        field="description"
      />

      <Inputs.List
        {...inputProps}
        {...l10n.media.tags}
        field="tags"
        fields={[
          { field: "key", InputComponent: Inputs.Text, ...l10n.media.key },
          { field: "value", InputComponent: Inputs.Text, ...l10n.media.value },
        ]}
      />

      <ItemTemplateFeaturedItemSettings
        withTitle
        containerType={containerType}
        inputProps={inputProps}
      />

      <Title order={3} mb="md" mt={50}>{l10n.categories.media}</Title>
      <Inputs.Select
        {...inputProps}
        {...l10n.media.media_type}
        subcategory={l10n.categories.media}
        searchable
        field="media_type"
        defaultValue="Video"
        options={[
          "Video",
          "Live Video",
          "Audio",
          "Image",
          "Gallery",
          "Ebook",
          "HTML",
          "Link",
          "Embedded Webpage",
          "Media Reference"
        ].sort()}
      />
      {
        ["Media Reference"].includes(mediaItem.media_type) ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.media.requires_permissions}
            subcategory={l10n.categories.media}
            defaultValue={false}
            field="requires_permissions"
          />
      }
      {
        mediaItem.requires_permissions ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.media.hide_share}
            subcategory={l10n.categories.media}
            field="hide_share"
          />
      }
      {
        !["Live Video"].includes(mediaItem.media_type) ? null :
          <>
            <Inputs.DateTime
              {...inputProps}
              {...l10n.media.start_time}
              subcategory={l10n.categories.media}
              field="start_time"
            />
            <Inputs.DateTime
              {...inputProps}
              {...l10n.media.end_time}
              subcategory={l10n.categories.media}
              field="end_time"
            />
          </>
      }
      {
        !["Live Video", "Video", "Audio"].includes(mediaItem.media_type) ? null :
          <>
            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.media.media_link}
              subcategory={l10n.categories.media}
              field="media_link"
              previewable
            />
            <>
              <Inputs.List
                {...inputProps}
                {...l10n.media.offerings}
                subcategory={l10n.categories.media}
                field="offerings"
              />
              <Inputs.JSON
                {...inputProps}
                {...l10n.media.embed_url_parameters}
                subcategory={l10n.categories.media}
                field="embed_url_parameters"
              />
            </>
          </>
      }
      {
        !["Image", "Ebook", "HTML"].includes(mediaItem.media_type) ? null :
          <Inputs.File
            {...inputProps}
            {...l10n.media.media_file}
            subcategory={l10n.categories.media}
            field="media_file"
            extensions={
              mediaItem.media_type === "Ebook" ? ["epub"] :
                mediaItem.media_type === "HTML" ? ["html"] : "image"
            }
          />
      }
      {
        !["HTML"].includes(mediaItem.media_type) ? null :
          <Inputs.List
            {...inputProps}
            {...l10n.media.parameters}
            field="parameters"
            fields={[
              { field: "name", InputComponent: Inputs.Text, ...l10n.media.key },
              { field: "value", InputComponent: Inputs.Text, ...l10n.media.value },
            ]}
          />
      }

      {
        !["Link", "Embedded Webpage"].includes(mediaItem.media_type) ? null :
          <>
            <Inputs.URL
              {...inputProps}
              {...l10n.media.link}
              subcategory={l10n.categories.media}
              field="link"
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.media.authorized_link}
              subcategory={l10n.categories.media}
              field="authorized_link"
            />
          </>
      }
      {
        !["Media Reference"].includes(mediaItem.media_type) ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.media.section_id}
              subcategory={l10n.categories.media_reference}
              path={UrlJoin(inputProps.path, "media_reference")}
              field="section_id"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.media.collection_id}
              subcategory={l10n.categories.media_reference}
              path={UrlJoin(inputProps.path, "media_reference")}
              field="collection_id"
            />
          </>
      }

      {
        !["Gallery"].includes(mediaItem.media_type) ? null :
          <>
            <Title mt={50} mb="md" order={3}>{l10n.categories.gallery_settings}</Title>
            <Inputs.Select
              {...inputProps}
              {...l10n.media.gallery.controls}
              subcategory={l10n.categories.gallery_settings}
              field="controls"
              options={[
                "Carousel",
                "Arrows"
              ]}
            />
            <Inputs.ImageInput
              {...inputProps}
              {...l10n.media.gallery.background_image}
              subcategory={l10n.categories.gallery_settings}
              fields={[
                { field: "background_image", ...l10n.media.gallery.background_image },
                { field: "background_image_mobile", ...l10n.media.gallery.background_image_mobile },
              ]}
            />
            <Inputs.CollectionTable
              {...inputProps}
              {...l10n.media.gallery_media}
              categoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.gallery_item_label}}
              field="gallery"
              idField="id"
              routePath="gallery"
              columns={[
                {
                  label: l10n.media.gallery_item.columns.name,
                  field: "name",
                  render: galleryItem => (
                    <Group noWrap>
                      <AspectRatio
                        w={100}
                        ratio={
                          galleryItem.image_aspect_ratio === "Square" ? 1 : galleryItem.image_aspect_ratio === "Wide" ? 16/9 : 3/4
                        }
                      >
                        <Image src={ScaleImage(galleryItem.image?.url, 400)} alt={galleryItem.name} withPlaceholder />
                      </AspectRatio>
                      <Text>{galleryItem.name || galleryItem.id}</Text>
                    </Group>
                  )
                },
                {
                  label: l10n.media.gallery_item.columns.type,
                  field: "type",
                  width: "100px",
                  render: galleryItem => galleryItem.video ? "Video" : "Image"
                }
              ]}
              newItemSpec={GalleryItemSpec}
            />
          </>
      }
      <ItemTemplateMediaItemLockSettings
        containerType={containerType}
        mediaItem={mediaItem}
        inputProps={inputProps}
      />
    </PageContent>
  );
});

export default ItemTemplateMediaItem;
