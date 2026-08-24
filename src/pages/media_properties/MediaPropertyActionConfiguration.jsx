import {observer} from "mobx-react-lite";
import {mediaPropertyStore, rootStore} from "@/stores/index.js";
import {useEffect, useState} from "react";
import {MediaPropertySectionItemPurchaseItems} from "@/pages/media_properties/MediaPropertySectionItem.jsx";
import Inputs from "@/components/inputs/Inputs.jsx";
import {Button} from "@mantine/core";
import {MediaItemCard} from "@/components/common/MediaCatalog.jsx";
import {MediaCatalogItemSelectionModal} from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {useParams} from "react-router-dom";

export const ActionConditions = {
  "always": "Always Visible",
  "authorized": "User has permissions",
  "unauthorized": "User is signed in but lacks permissions",
  "authenticated": "User is signed in",
  "unauthenticated": "User is not signed in",
  "unauthenticated_or_unauthorized": "User is not signed in or lacks permissions",
};

export const ActionBehaviors = {
  "sign_in": "Sign In",
  "page_link": "Go to Page",
  "media_link": "Go to Media",
  "show_purchase": "Show Purchase Options",
  "video": "Show Video",
  "link": "Link to URL",
  "property_link": "Link to Property",
  "subproperty_link": "Link to Subproperty"
};


const ActionBehaviorConfiguration = observer(({inputProps, info, action}) => {
  const { mediaPropertyId } = useParams();

  const l10n = rootStore.l10n.pages.media_property.form;
  const [showMediaSelectionModal, setShowMediaSelectionModal] = useState(false);

  const selectedMediaItem = mediaPropertyStore.GetMediaItem({mediaItemId: action.media_id});

  useEffect(() => {
    if(action.property_id) {
      mediaPropertyStore.LoadMediaProperty({mediaPropertyId: action.property_id});
    }

    if(action.subproperty_id) {
      mediaPropertyStore.LoadMediaProperty({mediaPropertyId: action.subproperty_id});
    }
  }, [action.property_id, action.subproperty_id]);

  let otherPropertyId;
  switch(action.behavior) {
    case "show_purchase":
      return <MediaPropertySectionItemPurchaseItems {...inputProps} />;
    case "page_link":
      return (
        <Inputs.Select
          {...inputProps}
          {...l10n.actions.page_link}
          searchable
          options={[
            ...Object.keys(info.pages || {})
              .map(pageId => ({
                label: info.pages[pageId].label,
                value: pageId
              }))
          ]}
          field="page_id"
        />
      );
    case "video":
      return (
        <Inputs.FabricBrowser
          {...inputProps}
          {...l10n.actions.video}
          autoUpdate={false}
          field="video"
          previewable
        />
      );
    case "media_link":
      return (
        <>
          <Inputs.InputWrapper
            disabled
            {...l10n.actions.media_item}
          >
            <Button my="xs" variant="outline" onClick={() => setShowMediaSelectionModal(true)}>
              { l10n.section_items.select_media.label }
            </Button>
            {
              !selectedMediaItem ? null :
                <MediaItemCard
                  key={`media-item-${selectedMediaItem.id}`}
                  mediaItem={selectedMediaItem}
                  imageSize={50}
                  withLink
                />
            }
          </Inputs.InputWrapper>
          {
            !showMediaSelectionModal ? null :
              <MediaCatalogItemSelectionModal
                multiple={false}
                allowTypeSelection
                mediaCatalogIds={info.media_catalogs || []}
                Close={() => setShowMediaSelectionModal(false)}
                Submit={(mediaItemIds) => {
                  mediaPropertyStore.SetMetadata({
                    ...inputProps,
                    ...l10n.actions.media_item,
                    page: location.pathname,
                    field: "media_id",
                    value: mediaItemIds?.[0] || "",
                  });
                }}
              />
          }
        </>
      );
    case "link":
      return (
        <Inputs.URL
          {...inputProps}
          {...l10n.actions.url}
          field="url"
        />
      );
    case "property_link":
      otherPropertyId = mediaPropertyStore.allMediaProperties
        .find(p =>
          p.mediaPropertySlug === action.property ||
          p.objectId === action.property
        )?.objectId;

      return (
        <>
          <Inputs.Select
            {...inputProps}
            {...l10n.actions.property}
            searchable
            key="property"
            field="property"
            options={
              mediaPropertyStore.allMediaProperties.map(mediaProperty => ({
                label: mediaProperty.name,
                value: mediaProperty.mediaPropertySlug || mediaProperty.objectId
              }))
                .filter(({value}) => value !== mediaPropertyId)
            }
          />
          {
            !otherPropertyId ? null :
              <Inputs.Select
                {...inputProps}
                {...l10n.actions.property_page}
                searchable
                key="property-page"
                field="property_page"
                defaultValue=""
                options={[
                  {label: "<Property Main Page>", value: ""},
                  ...Object.values(mediaPropertyStore.mediaProperties[otherPropertyId]?.metadata?.public?.asset_metadata?.info?.pages || {})
                    .filter(page => page.id !== "main")
                    .map(page => ({
                      label: page.label || page.slug || page.id || "",
                      value: page.slug || page.id
                    }))
                ]}
              />
          }
        </>
      );
    case "subproperty_link":
      otherPropertyId = mediaPropertyStore.allMediaProperties
        .find(p =>
          p.mediaPropertySlug === action.subproperty ||
          p.objectId === action.subproperty
        )?.objectId;

      return (
        <>
          <Inputs.Select
            {...inputProps}
            {...l10n.actions.subproperty}
            searchable
            key="subproperty"
            field="subproperty"
            options={
              (info.subproperties || []).map(mediaPropertyId => ({
                label: mediaPropertyStore.allMediaProperties
                  .find(p => p.objectId === mediaPropertyId)?.name || mediaPropertyId,
                value: mediaPropertyStore.allMediaProperties
                  .find(p => p.objectId === mediaPropertyId)?.slug || mediaPropertyId
              }))
                .filter(({value}) => value !== mediaPropertyId)
            }
          />
          {
            !otherPropertyId ? null :
              <Inputs.Select
                {...inputProps}
                {...l10n.actions.subproperty_page}
                searchable
                key="subproperty-page"
                field="subproperty_page"
                defaultValue="main"
                options={[
                  {label: "<Property Main Page>", value: ""},
                  ...Object.values(mediaPropertyStore.mediaProperties[otherPropertyId]?.metadata?.public?.asset_metadata?.info?.pages || {})
                    .filter(page => page.id !== "main")
                    .map(page => ({
                      label: page.label || page.slug || page.id || "",
                      value: page.slug || page.id
                    }))
                ]}
              />
          }
        </>
      );
    default:
      return null;
  }
});

export const ActionConfiguration = observer(({inputProps, action}) => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;

  return (
    <>
      <Inputs.Select
        {...inputProps}
        {...l10n.actions.visibility}
        defaultValue="always"
        field="visibility"
        options={
          Object.keys(ActionConditions).map(key => ({label: ActionConditions[key], value: key}))
        }
      />
      {
        !["authorized", "unauthorized", "unauthenticated_or_unauthorized"].includes(action.visibility) ? null :
          <PermissionItemSelect
            multiple
            {...inputProps}
            {...l10n.actions.permissions}
            permissionSetIds={info.permission_sets}
            subcategory={l10n.categories.permissions}
            field="permissions"
          />
      }
      <Inputs.Select
        {...inputProps}
        {...l10n.actions.behavior}
        defaultValue="sign_in"
        field="behavior"
        options={
          Object.keys(ActionBehaviors).map(key => ({label: ActionBehaviors[key], value: key}))
        }
      />
      <ActionBehaviorConfiguration
        inputProps={inputProps}
        action={action}
        info={info}
      />
    </>
  );
});
