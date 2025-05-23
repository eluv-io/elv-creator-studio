import {observer} from "mobx-react-lite";
import Inputs from "@/components/inputs/Inputs.jsx";
import {Link, useParams} from "react-router-dom";
import {mediaCatalogStore, rootStore, uiStore} from "@/stores/index.js";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {IconExternalLink} from "@tabler/icons-react";
import {MediaCatalogItemSelectionModal, MediaItemTitle} from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";
import {useState} from "react";
import {Paper, Text, Title} from "@mantine/core";
import {MediaCatalogPermissionSpec} from "@/specs/MediaCatalogSpecs.js";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";

export const MediaCatalogPermissionSettings = observer(({type, mediaId}) => {
  const {mediaCatalogId} = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];
  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};
  const mediaItem = info?.[type]?.[mediaId];

  if(!mediaCatalog || !mediaItem) {
    return null;
  }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({type, mediaCatalogId, id: mediaId}),
    subcategory: l10n.categories.permissions,
    path: UrlJoin("/public/asset_metadata/info/", type, mediaId)
  };

  return (
    <>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.permissions.public}
        defaultValue={false}
        path={UrlJoin("/public/asset_metadata/info/", type, mediaId)}
        field="public"
      />
      {
        mediaItem.public || (info.permission_sets || []).length === 0 ? null :
          <>
            <Inputs.List
              {...inputProps}
              {...l10n.permissions.permissions}
              field="permissions"
              fieldLabel={l10n.permissions.permission.label}
              newItemSpec={MediaCatalogPermissionSpec}
              renderItem={(props) =>
                <>
                  <PermissionItemSelect
                    permissionSetIds={info?.permission_sets}
                    defaultFirst
                    {...props}
                    {...l10n.permissions.permission_item}
                    field="permission_item_id"
                  />
                </>
              }
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.permissions.test_content}
              defaultValue={false}
              path={UrlJoin("/public/asset_metadata/info/", type, mediaId)}
              field="test_content"
            />
          </>
      }
    </>
  );
});

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
        GetName={mediaItemId => info[subType][mediaItemId]?.label}
        editable={false}
        AddItem={() => setShowSelectionModal(true)}
        Actions={mediaItemId => [
          <IconButton
            key="link-button"
            label={LocalizeString(rootStore.l10n.components.inputs.navigate_to, {item: info[subType][mediaItemId]?.label || mediaItemId })}
            component={Link}
            to={UrlJoin("/media-catalogs/", mediaCatalogId, subType, mediaItemId)}
            color="purple.6"
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

export const MediaCatalogCommonFields = observer(({type, live, mediaId}) => {
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
        {...l10n.media.id}
        disabled
        hidden
        defaultValue={mediaCatalogId}
        field="media_catalog_id"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.type}
        disabled
        field="type"
        defaultValue={type === "media_collections" ? "collection" : type === "media_lists" ? "list" : "media"}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.label}
        field="label"
      />

      <Title order={3} mt={50} mb="md">{ l10n.categories.permissions }</Title>
      <MediaCatalogPermissionSettings type={type} mediaId={mediaId} />

      <Title mt={50} mb="md" order={3}>{l10n.categories.display}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.media.catalog_title}
        required
        field="catalog_title"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.media.title}
        required
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

      {
        type === "media" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.media.preferred_aspect_ratio}
            defaultValue="Landscape"
            field="preferred_aspect_ratio"
            options={
              [
                ...Object.keys(mediaCatalogStore.IMAGE_ASPECT_RATIOS)
                  .map(value => value === "Mixed" ? undefined : ({label: mediaCatalogStore.IMAGE_ASPECT_RATIOS[value].label, value}))
                  .filter(option => option)
              ]
            }
          />
      }

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

      {
        type === "media" ? null :
          <Inputs.ImageInput
            {...inputProps}
            {...l10n.media.background_image}
            fields={[
              { field: "background_image", ...l10n.media.background_image_desktop, aspectRatio: 16 / 9, baseSize: 135},
              { field: "background_image_mobile", ...l10n.media.background_image_mobile, aspectRatio: 1/2, baseSize: 135 },
            ]}
          />
      }

      {
        type !== "media" ? null :
          <>
            <Inputs.List
              {...inputProps}
              {...l10n.media.icons}
              shrink
              field="icons"
              renderItem={props =>
                <Inputs.ImageInput
                  {...props}
                  {...l10n.media.icon}
                  altTextField="alt_text"
                  fields={[
                    { field: "icon", aspectRatio: 1, baseSize: 75, componentProps: {p: "sm"} }
                  ]}
                />
              }
            />
            {
              !live ? null :
                <Inputs.ImageInput
                  {...inputProps}
                  {...l10n.media.countdown_background}
                  fields={[
                    { field: "countdown_background_desktop", aspectRatio: 16/9, baseSize: 135, ...l10n.media.countdown_background_desktop },
                    { field: "countdown_background_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.media.countdown_background_mobile }
                  ]}
                />
            }
          </>
      }


      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.media.tags}
        subcategory={l10n.categories.tags}
        disabled={(info.tags || []).length === 0}
        field="tags"
        searchable
        options={info.tags || []}
      />

      {
        Object.keys(info.attributes || {}).length === 0 ? null :
          <Inputs.InputWrapper {...l10n.media.attributes}>
            {
              Object.keys(info.attributes).map(attributeId => {
                const attribute = info.attributes[attributeId];
                return (
                  <Inputs.MultiSelect
                    componentProps={{mt: "md"}}
                    key={`attribute-${attributeId}`}
                    {...inputProps}
                    searchable
                    path={UrlJoin(inputProps.path, "attributes")}
                    field={attributeId}
                    subcategory={l10n.categories.attributes}
                    label={attribute.title || "Attribute"}
                    defaultValue=""
                    options={info.attributes[attributeId].tags || []}
                  />
                );
              })
            }
          </Inputs.InputWrapper>
      }
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
