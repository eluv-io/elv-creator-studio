import {observer} from "mobx-react-lite";
import Inputs from "@/components/inputs/Inputs.jsx";
import {Link, useParams} from "react-router-dom";
import {mediaCatalogStore, rootStore, uiStore} from "@/stores/index.js";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {IconExternalLink} from "@tabler/icons-react";
import {MediaCatalogItemSelectionModal, MediaItemTitle} from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";
import {useState} from "react";
import {Paper, Text} from "@mantine/core";

export const MediaItemSubList = observer(({type, mediaId}) => {
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const mediaItem = info[type]?.[mediaId];

  if(!mediaItem) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;

  let subType, field;
  if(type === "media_collections") {
    subType = "media_lists";
    field = "media_lists";
  } else if(type === "media_lists") {
    subType = "media";
    field = "media";
  } else {
    subType = "media";
    field = "associated_media";
  }

  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({type, mediaCatalogId, id: mediaId}),
    subcategory: l10n.categories[subType],
    path: UrlJoin("/public/asset_metadata/info/", type, mediaId)
  };

  return (
    <>
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.media[subType]}
        subcategory={l10n.categories[subType]}
        field={field}
        idField="."
        GetName={mediaItemId => info[subType][mediaItemId]?.title}
        editable={false}
        AddItem={() => setShowSelectionModal(true)}
        Actions={mediaItemId => [
          <IconButton
            key="link-button"
            label={LocalizeString(rootStore.l10n.components.inputs.navigate_to, {item: info[subType][mediaItemId]?.title || mediaItemId })}
            component={Link}
            to={UrlJoin("/media-catalogs/", mediaCatalogId, subType, mediaItemId)}
            color="blue.5"
            Icon={IconExternalLink}
          />
        ]}
        columns={[
          {
            label: l10n.categories[subType],
            field: "catalog_title",
            render: mediaItemId => <MediaItemTitle mediaItem={info[subType][mediaItemId]} />
          },
          subType === "media" ?
            {
              label: l10n.media.media_type.label,
              field: "media_type",
              width: "100px",
              render: mediaItemId => info.media[mediaItemId]?.media_type
            } :
            {
              label: l10n.media.media.label,
              field: "media",
              width: "100px",
              render: mediaItemId => info.media_lists[mediaItemId]?.media?.length || 0
            }
        ]}
      />

      {
        !showSelectionModal ? null :
          <MediaCatalogItemSelectionModal
            type={subType}
            mediaCatalogId={mediaCatalogId}
            excludedMediaIds={[mediaId, ...(mediaItem[subType] || [])]}
            Close={() => setShowSelectionModal(false)}
            Submit={mediaIds => {
              mediaIds.forEach(mediaId => {
                mediaCatalogStore.InsertListElement({
                  ...inputProps,
                  subcategory: l10n.categories[subType],
                  page: location.pathname,
                  field,
                  value: mediaId,
                  label: l10n.media[subType].fieldLabel,
                });
              });

              setShowSelectionModal(false);
            }}
          />
      }
    </>
  );
});

export const MediaCatalogCommonFields = observer(({type, mediaId}) => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({type, mediaCatalogId, id: mediaId}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/", type, mediaId)
  };

  return (
    <>
      <Inputs.Text
        {...inputProps}
        {...l10n.media.id}
        disabled
        field="id"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.catalog_title}
        field="catalog_title"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.title}
        field="title"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.subtitle}
        field="subtitle"
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
        disabled={(info.tags || []).length === 0}
        field="tags"
        options={info.tags || []}
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
      />
    </>
  );
});

export const MediaCatalogViewedSettings = observer(({type, mediaId}) => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const mediaItem = info[type]?.[mediaId];

  if(!mediaItem) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({type, mediaCatalogId, id: mediaId}),
    subcategory: l10n.categories.viewed_settings,
    path: UrlJoin("/public/asset_metadata/info/", type, mediaId, "viewed_settings")
  };

  return (
    <>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.media.override_settings_when_viewed}
        path={UrlJoin("/public/asset_metadata/info/", type, mediaId)}
        field="override_settings_when_viewed"
      />
      {
        !mediaItem.override_settings_when_viewed ? null :
          <Paper withBorder p="xl" maw={uiStore.inputWidth}>
            <Text fz="sm">{ l10n.media.viewed_settings.label }</Text>
            <Text fz="xs" color="dimmed" mb="md">{ l10n.media.viewed_settings.description }</Text>
            <Inputs.Text
              {...inputProps}
              {...l10n.media.title}
              field="title"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.media.subtitle}
              field="subtitle"
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
            />
            <Inputs.RichText
              {...inputProps}
              {...l10n.media.description_rich_text}
              field="description_rich_text"
            />
          </Paper>
      }
    </>
  );
});