import {observer} from "mobx-react-lite";
import {useLocation, useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {AspectRatio, Group, Image, Text, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import UrlJoin from "url-join";
import {
  MediaCatalogCommonFields,
  MediaCatalogViewedSettings
} from "@/pages/media_catalogs/MediaCatalogCommon.jsx";
import {ListItemCategory} from "@/components/common/Misc.jsx";
import {ScaleImage} from "@/helpers/Fabric.js";
import {MediaCatalogGalleryItemSpec} from "@/specs/MediaCatalogSpecs.js";
import {useEffect, useState} from "react";

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
      labelField: "label",
      l10n: l10n.categories.gallery_item_label
    })
  };

  return (
    <PageContent
      backLink={location.pathname.split("/").slice(0, -2).join("/")}
      title={`${pageTitle} - ${galleryItem.label || galleryItem.id}`}
      section="mediaCatalog"
      useHistory
    >
      <Inputs.UUID
        {...inputProps}
        {...l10n.common.id}
        field="id"
        hidden
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.media.label}
        field="label"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.media.gallery_item.title}
        field="title"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.media.gallery_item.subtitle}
        field="subtitle"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.media.gallery_item.description}
        field="description"
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.media.gallery_item.thumbnail_aspect_ratio}
        field="thumbnail_aspect_ratio"
        defaultValue="Square"
        options={aspectRatioOptions}
      />
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.media.gallery_item.images}
        fields={[
          {
            field: "thumbnail",
            aspectRatio: mediaCatalogStore.IMAGE_ASPECT_RATIOS[galleryItem.thumbnail_aspect_ratio]?.ratio,
            baseSize: 125,
            ...l10n.media.gallery_item.thumbnail
          },
          { field: "image", baseSize: 125, ...l10n.media.gallery_item.image }
        ]}
      />
      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.media.gallery_item.video}
        field="video"
        previewable
      />
      {
        !galleryItem.video ? null :
          <Inputs.ImageInput
            {...inputProps}
            {...l10n.media.gallery_item.poster_image}
            fields={[
              { field: "poster_image", aspectRatio: 16/9 }
            ]}
          />
      }
    </PageContent>
  );
});

const MediaConfiguration = observer(({mediaItem}) => {
  const { mediaCatalogId, mediaItemId } = useParams();
  const [offerings, setOfferings] = useState(undefined);

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({type: "media", mediaCatalogId, id: mediaItemId}),
    subcategory: l10n.categories.media,
    path: UrlJoin("/public/asset_metadata/info/media/", mediaItemId)
  };

  useEffect(() => {
    setOfferings(undefined);

    mediaCatalogStore.GetOfferings(mediaItem?.media_link)
      .then(offerings => setOfferings(offerings));
  }, [mediaItem?.media_link]);

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
            {...l10n.media.ebook_file}
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
            {...l10n.media.html_file}
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
            fabricBrowserProps={{
              video: true,
              allowCompositions: true,
              allowClips: true
            }}
            autoUpdate={false}
            field="media_link"
            previewable
          />
          {
            !mediaItem.media_link || (mediaItem.media_link_info && mediaItem.media_link_info?.type !== "main") ? null :
              <>
                {
                  !offerings || offerings.length <= 1 ? null :
                    <Inputs.MultiSelect
                      {...inputProps}
                      {...l10n.media.offerings}
                      options={offerings || []}
                      field="offerings"
                    />
                }
                <Inputs.Checkbox
                  {...inputProps}
                  {...l10n.media.live_video}
                  field="live_video"
                />
                {
                  !mediaItem.live_video ? null :
                    <>
                      <Inputs.Date
                        {...inputProps}
                        {...l10n.media.date}
                        subcategory={l10n.categories.media}
                        field="date"
                      />
                      <Inputs.DateTime
                        {...inputProps}
                        {...l10n.media.start_time}
                        subcategory={l10n.categories.media}
                        field="start_time"
                        componentProps={{withSeconds: true}}
                      />
                      <Inputs.DateTime
                        {...inputProps}
                        {...l10n.media.stream_start_time}
                        subcategory={l10n.categories.media}
                        field="stream_start_time"
                        componentProps={{withSeconds: true}}
                      />
                      <Inputs.DateTime
                        {...inputProps}
                        {...l10n.media.end_time}
                        subcategory={l10n.categories.media}
                        field="end_time"
                        componentProps={{withSeconds: true}}
                      />
                      <Inputs.Checkbox
                        {...inputProps}
                        {...l10n.media.enable_dvr}
                        subcategory={l10n.categories.media}
                        field="enable_dvr"
                      />
                    </>
                }
                {
                  !mediaItem.clip || mediaItem.live_video ? null :
                    <>
                      <Inputs.Number
                        {...inputProps}
                        {...l10n.media.clip_start_time}
                        path={UrlJoin(inputProps.path, "media_link_info")}
                        field="clip_start_time"
                        min={0}
                        max={mediaItem.media_link_info?.clip_end_time}
                      />
                      <Inputs.Number
                        {...inputProps}
                        {...l10n.media.clip_end_time}
                        path={UrlJoin(inputProps.path, "media_link_info")}
                        field="clip_end_time"
                        min={mediaItem.media_link_info?.clip_start_time || 0}
                      />
                    </>
                }
              </>
          }

          <Title order={3} mt={50} mb="md">{ l10n.categories.player_settings }</Title>

          <Inputs.Select
            {...inputProps}
            {...l10n.media.player_profile}
            subcategory={l10n.categories.player_settings}
            field="player_profile"
            defaultValue=""
            options={[
              { label: "Recommended", value: "" },
              { label: "Default (VOD)", value: "DEFAULT"},
              { label: "Low Latency Live", value: "LOW_LATENCY" },
              { label: "Ultra Low Latency Live", value: "ULTRA_LOW_LATENCY" },
            ]}
          />
          <Inputs.Select
            {...inputProps}
            {...l10n.media.player_controls}
            subcategory={l10n.categories.player_settings}
            field="player_controls"
            defaultValue=""
            options={[
              { label: "Default", value: ""},
              { label: "Hidden with Volume Toggle", value: "off_with_volume_toggle" },
              { label: "Hidden", value: "off" },
            ]}
          />
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.media.player_muted}
            subcategory={l10n.categories.player_settings}
            defaultValue={false}
            field="player_muted"
          />
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.media.player_loop}
            subcategory={l10n.categories.player_settings}
            defaultValue={false}
            field="player_loop"
          />
          <Inputs.ImageInput
            {...inputProps}
            {...l10n.media.poster_image}
            subcategory={l10n.categories.player_settings}
            fields={[{field: "poster_image", aspectRatio: 16/9}]}
          />
          {
            !mediaItem.poster_image ? null :
              <Inputs.Checkbox
                {...inputProps}
                {...l10n.media.always_show_poster}
                subcategory={l10n.categories.player_settings}
                defaultValue={false}
                field="always_show_poster"
              />
          }
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
              { field: "background_image", aspectRatio: 16/9, baseSize: 135, ...l10n.media.gallery.background_image },
              { field: "background_image_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.media.gallery.background_image_mobile },
            ]}
          />
          <Inputs.CollectionTable
            {...inputProps}
            {...l10n.media.gallery_media}
            subcategoryFnParams={{fields: ["label", "title", "id"], l10n: l10n.categories.gallery_item_label}}
            field="gallery"
            idField="id"
            routePath="gallery"
            columns={[
              {
                label: l10n.media.gallery_item.columns.label,
                field: "title",
                render: galleryItem => (
                  <Group noWrap>
                    {
                      !galleryItem.thumbnail ? null :
                        <AspectRatio
                          w={75}
                          h={75}
                          ratio={mediaCatalogStore.IMAGE_ASPECT_RATIOS[galleryItem.thumbnail_aspect_ratio]?.ratio}
                        >
                          <Image src={ScaleImage(galleryItem.thumbnail?.url, 400)} alt={galleryItem.label} withPlaceholder />
                        </AspectRatio>
                    }
                    <Text>{galleryItem.label || galleryItem.title || galleryItem.id}</Text>
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
      <MediaCatalogCommonFields type="media" live={mediaItem.live_video} mediaId={mediaItemId} />

      {
        ["Link"].includes(mediaItem.media_type) ? null :
          <>
            <Title order={5} mt="xl" mb="md">{l10n.categories.viewed_settings}</Title>
            <MediaCatalogViewedSettings type="media" mediaId={mediaItemId} />
          </>
      }

      <Title order={3} mt={50} mb="md">{ l10n.categories.media }</Title>
      <MediaConfiguration mediaItem={mediaItem} />

      {
        /*
        ["Link"].includes(mediaItem.media_type) ? null :
          <>
            <Title order={3} mt={50}>{ l10n.categories.associated_media }</Title>
            <Title order={6} color="dimmed" mb="xl">{l10n.type_descriptions.associated_media}</Title>
            <MediaItemSubList type="media" mediaId={mediaItemId}/>
          </>

         */
      }
    </PageContent>
  );
});

export default MediaCatalogMediaItem;
