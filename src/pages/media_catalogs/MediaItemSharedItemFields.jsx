import {observer} from "mobx-react-lite";
import Inputs from "@/components/inputs/Inputs.jsx";
import {Link, useParams} from "react-router-dom";
import {mediaCatalogStore, rootStore} from "@/stores/index.js";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {IconExternalLink} from "@tabler/icons-react";
import {MediaCatalogItemSelectionModal, MediaItemTitle} from "@/components/inputs/MediaCatalogItemTable.jsx";
import {useState} from "react";

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

const MediaItemSharedItemFields = observer(({type, mediaId}) => {
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

      {
        type !== "media" ? null :
          <Inputs.Text
            {...inputProps}
            {...l10n.media.media_type}
            disabled
            field="media_type"
          />
      }

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

      <Inputs.List
        {...inputProps}
        {...l10n.media.headers}
        field="headers"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.subtitle}
        field="subtitle"
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
        disabled={(info.tags || []).length === 0}
        field="tags"
        options={info.tags || []}
      />
    </>
  );
});

export default MediaItemSharedItemFields;
