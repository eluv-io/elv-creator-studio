import {observer} from "mobx-react-lite";
import {useLocation, useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {AspectRatio, Group, Image, Text, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import UrlJoin from "url-join";
import {
  MediaCatalogCommonFields,
  MediaCatalogViewedSettings,
  MediaItemSubList
} from "@/pages/media_catalogs/MediaCatalogCommon.jsx";
import {ListItemCategory} from "@/components/common/Misc.jsx";
import {ScaleImage} from "@/helpers/Fabric.js";
import {MediaCatalogGalleryItemSpec} from "@/specs/MediaCatalogSpecs.js";

const aspectRatioOptions = Object.keys(mediaCatalogStore.IMAGE_ASPECT_RATIOS)
  .map(value => ({label: mediaCatalogStore.IMAGE_ASPECT_RATIOS[value].label, value}));

const MediaCatalogMediaItemGalleryItem = observer(({pageTitle, mediaItem}) => {
  const location = useLocation();
  const { mediaCatalogId, mediaItemId, galleryItemId } = useParams();
  const galleryItemIndex = mediaItem?.gallery?.findIndex(galleryItem => galleryItem.id === galleryItemId);
  const galleryItem = mediaItem?.gallery[galleryItemIndex];

  if(!galleryItem) {
    return (
      <div>
        Gallery Item not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const galleryPath = UrlJoin("/public/asset_metadata/info/media/", mediaItem.id, "gallery");
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    path: UrlJoin(galleryPath, galleryItemIndex.toString()),
    category: mediaCatalogStore.MediaItemCategory({type: "media", mediaCatalogId, id: mediaItemId}),
    subcategory: ListItemCategory({
      store: mediaCatalogStore,
      objectId: mediaCatalogId,
      listPath: galleryPath,
      id: galleryItemId,
      labelField: "name",
      l10n: l10n.categories.gallery_item_label
    })
  };

  return (
    <PageContent
      backLink={location.pathname.split("/").slice(0, -2).join("/")}
      title={`${pageTitle} - ${galleryItem.name || galleryItem.id}`}
      section="mediaCatalog"
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
        aspectRatio={mediaCatalogStore.IMAGE_ASPECT_RATIOS[galleryItem.image_aspect_ratio]?.ratio}
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

const MediaConfiguration = observer(({mediaItem}) => {
  const { mediaCatalogId, mediaItemId } = useParams();

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({type: "media", mediaCatalogId, id: mediaItemId}),
    subcategory: l10n.categories.media,
    path: UrlJoin("/public/asset_metadata/info/media/", mediaItemId)
  };

  let content;
  switch(mediaItem.media_type) {
    case "Image":
      content = (
        <>
          <Inputs.ImageInput
            {...inputProps}
            {...l10n.media.full_image}
            componentProps={{maw: 400}}
            fields={[{field: "image", aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS[mediaItem.image_aspect_ratio]?.ratio}]}
          />
          <Inputs.Select
            {...inputProps}
            {...l10n.media.image_aspect_ratio}
            field="image_aspect_ratio"
            options={aspectRatioOptions}
          />
        </>
      );

      break;

    case "Link":
      content = (
        <>
          <Inputs.URL
            {...inputProps}
            {...l10n.media.link}
            field="url"
          />
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.media.authorized_link}
            field="authorized_link"
          />
        </>
      );

      break;

    case "Ebook":
      content = (
        <>
          <Inputs.File
            {...inputProps}
            {...l10n.media.media_file}
            subcategory={l10n.categories.media}
            field="media_file"
            extensions={["epub"]}
          />
        </>
      );

      break;

    case "HTML":
      content = (
        <>
          <Inputs.File
            {...inputProps}
            {...l10n.media.media_file}
            subcategory={l10n.categories.media}
            field="media_file"
            extensions={["html"]}
          />
          <Inputs.List
            {...inputProps}
            {...l10n.media.parameters}
            field="parameters"
            fields={[
              { field: "name", InputComponent: Inputs.Text, ...l10n.media.key },
              { field: "value", InputComponent: Inputs.Text, ...l10n.media.value },
            ]}
          />
        </>
      );

      break;

    case "Video":
      content = (
        <>
          <Inputs.FabricBrowser
            {...inputProps}
            {...l10n.media.media_link}
            field="media_link"
            previewable
          />
          <Inputs.List
            {...inputProps}
            {...l10n.media.offerings}
            field="offerings"
          />
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.media.live_video}
            field="live_video"
          />
          {
            !mediaItem.live_video ? null :
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
          <Inputs.ImageInput
            {...inputProps}
            {...l10n.media.poster_image}
            fields={[{field: "poster_image", aspectRatio: 16/9}]}
          />
        </>
      );

      break;

    case "Gallery":
      content = (
        <>
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
            subcategoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.gallery_item_label}}
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
                      ratio={mediaCatalogStore.IMAGE_ASPECT_RATIOS[galleryItem.image_aspect_ratio]?.ratio}
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
            newItemSpec={MediaCatalogGalleryItemSpec}
          />
        </>
      );

      break;
  }

  return (
    <>
      <Inputs.Text
        {...inputProps}
        {...l10n.media.media_type}
        disabled
        field="media_type"
      />
      { content }
    </>
  );
});

const MediaCatalogMediaItem = observer(() => {
  const { mediaCatalogId, mediaItemId, galleryItemId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const mediaItem = info.media?.[mediaItemId];

  if(!mediaItem) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const pageTitle = `${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.media} - ${mediaItem.label}`;

  if(galleryItemId) {
    return (
      <MediaCatalogMediaItemGalleryItem
        pageTitle={pageTitle}
        mediaItem={mediaItem}
      />
    );
  }

  return (
    <PageContent
      title={pageTitle}
      backLink={UrlJoin("/media-catalogs", mediaCatalogId, "media")}
      section="mediaCatalog"
      useHistory
    >
      <MediaCatalogCommonFields type="media" mediaId={mediaItemId} />

      {
        ["Link"].includes(mediaItem.media_type) ? null :
          <>
            <Title order={3} mt={50} mb="md">{l10n.categories.viewed_settings}</Title>
            <MediaCatalogViewedSettings type="media" mediaId={mediaItemId} />
          </>
      }

      <Title order={3} mt={50} mb="md">{ l10n.categories.media }</Title>
      <MediaConfiguration mediaItem={mediaItem} />

      {
        ["Link"].includes(mediaItem.media_type) ? null :
          <>
            <Title order={3} mt={50}>{ l10n.categories.associated_media }</Title>
            <Title order={6} color="dimmed" mb="xl">{l10n.type_descriptions.associated_media}</Title>
            <MediaItemSubList type="media" mediaId={mediaItemId}/>
          </>
      }
    </PageContent>
  );
});

export default MediaCatalogMediaItem;
