import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import UrlJoin from "url-join";
import MediaItemSharedItemFields from "@/pages/media_catalogs/MediaItemSharedItemFields.jsx";

const aspectRatioOptions = [
  { label: "Square (1:1)", value: "Square" },
  { label: "Landscape (16:9)", value: "Wide" },
  { label: "Portrait (3:4)", value: "Tall" }
];

const MediaConfiguration = observer(({mediaItem, l10n, inputProps}) => {
  inputProps.subcategory = l10n.categories.media;

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
  }

  return null;
});

const MediaCatalogMediaItem = observer(() => {
  const { mediaCatalogId, mediaItemId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const mediaItem = info.media?.[mediaItemId];

  if(!mediaItem) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({type: "media", mediaCatalogId, id: mediaItemId}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/media/", mediaItemId)
  };

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.media} - ${mediaItem.title}`}
      backLink={UrlJoin("/media-catalogs", mediaCatalogId, "media")}
      section="mediaCatalog"
      useHistory
    >
      <MediaItemSharedItemFields l10n={l10n} inputProps={inputProps} type="media" />

      <Title order={3} mt={50} mb="md">{ l10n.categories.media }</Title>

      <MediaConfiguration
        mediaItem={mediaItem}
        l10n={l10n}
        inputProps={inputProps}
      />
    </PageContent>
  );
});

export default MediaCatalogMediaItem;
