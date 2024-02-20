import {observer} from "mobx-react-lite";
import {useLocation, useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {AspectRatio, Group, Image, Text, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import UrlJoin from "url-join";
import MediaItemSharedItemFields, {MediaItemSubList} from "@/pages/media_catalogs/MediaItemSharedItemFields.jsx";
import {ListItemCategory} from "@/components/common/Misc.jsx";
import {ScaleImage} from "@/helpers/Fabric.js";
import {MediaCatalogGalleryItemSpec} from "@/specs/MediaCatalogSpecs.js";

const aspectRatioOptions = [
  { label: "Square (1:1)", value: "Square" },
  { label: "Landscape (16:9)", value: "Wide" },
  { label: "Portrait (3:4)", value: "Tall" }
];


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
        aspectRatio={
          galleryItem.image_aspect_ratio === "Wide" ? 16/9 :
            galleryItem.image_aspect_ratio === "Tall" ? 3/4 : 1
        }
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

  let imageInput = (
    <Inputs.SingleImageInput
      {...inputProps}
      {...l10n.media.image}
      field="image"
      aspectRatio={16/9}
    />
  );

  switch(mediaItem.media_type) {
    case "Video":
      return (
        <>
          { imageInput }
          <Inputs.SingleImageInput
            {...inputProps}
            {...l10n.media.poster_image}
            field="poster_image"
            aspectRatio={16/9}
          />
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
        </>
      );

    case "Image":
      return (
        <>
          <Inputs.SingleImageInput
            {...inputProps}
            {...l10n.media.image}
            field="image"
            aspectRatio={
              mediaItem.image_aspect_ratio === "Wide" ? 16/9 :
                mediaItem.image_aspect_ratio === "Tall" ? 3/4 : 1
            }
          />
          <Inputs.Select
            {...inputProps}
            {...l10n.media.image_aspect_ratio}
            field="image_aspect_ratio"
            options={aspectRatioOptions}
          />
        </>
      );

    case "Link":
      return (
        <>
          { imageInput }
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

    case "Ebook":
      return (
        <>
          { imageInput }
          <Inputs.File
            {...inputProps}
            {...l10n.media.media_file}
            subcategory={l10n.categories.media}
            field="media_file"
            extensions={["epub"]}
          />
        </>
      );

    case "HTML":
      return (
        <>
          { imageInput }
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
    case "Gallery":
      return (
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
            newItemSpec={MediaCatalogGalleryItemSpec}
          />
        </>
      );
  }

  return null;
});

const MediaCatalogMediaItem = observer(() => {
  const { mediaCatalogId, mediaItemId, galleryItemId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const mediaItem = info.media?.[mediaItemId];

  if(!mediaItem) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const pageTitle = `${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.media} - ${mediaItem.title}`;

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
      <MediaItemSharedItemFields type="media" mediaId={mediaItemId} />

      <Title order={3} mt={50} mb="md">{ l10n.categories.media }</Title>

      <MediaConfiguration mediaItem={mediaItem} />

      <Title order={3} mt={50}>{ l10n.categories.associated_media }</Title>
      <Title order={6} color="dimmed" mb="xl">{ l10n.type_descriptions.associated_media }</Title>
      <MediaItemSubList type="media" mediaId={mediaItemId} />
    </PageContent>
  );
});

export default MediaCatalogMediaItem;
