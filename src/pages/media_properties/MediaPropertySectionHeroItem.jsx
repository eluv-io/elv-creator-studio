import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import {Button, Text} from "@mantine/core";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {useState} from "react";
import {MediaPropertyActionSpec} from "@/specs/MediaPropertySpecs.js";
import ColorOptions from "@/components/inputs/media_property/Components";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {MediaItemCard} from "@/components/common/MediaCatalog.jsx";
import {Input as MantineInput} from "@mantine/core";
import {MediaCatalogItemSelectionModal} from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js/lib";
import {MediaPropertySectionItemPurchaseItems} from "@/pages/media_properties/MediaPropertySectionItem";


const ActionConditions = {
  "always": "Always Visible",
  "authorized": "User has permissions",
  "unauthorized": "User is signed in but lacks permissions",
  "authenticated": "User is signed in",
  "unauthenticated": "User is not signed in",
  "unauthenticated_or_unauthorized": "User is not signed in or lacks permissions",
};

const ActionBehaviors = {
  "sign_in": "Sign In",
  "page_link": "Go to Page",
  "media_link": "Go to Media",
  "show_purchase": "Show Purchase Options",
  "video": "Show Video",
  "link": "Link to URL"
};


const ActionBehaviorConfiguration = observer(({inputProps, info, action}) => {
  const l10n = rootStore.l10n.pages.media_property.form;
  const [showMediaSelectionModal, setShowMediaSelectionModal] = useState(false);

  const selectedMediaItem = mediaPropertyStore.GetMediaItem({mediaItemId: action.media_id});

  switch(action.behavior) {
    case "show_purchase":
      return <MediaPropertySectionItemPurchaseItems {...inputProps} />;
    case "page_link":
      return (
        <Inputs.Select
          {...inputProps}
          {...l10n.actions.page_link}
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
          <MantineInput.Wrapper
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
          </MantineInput.Wrapper>
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
    default:
      return null;
  }
});

export const MediaPropertySectionHeroItemAction = observer(() => {
  const { mediaPropertyId, sectionId, heroItemId, actionId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const section = info.sections?.[sectionId];

  if(!section) {
    return null;
  }

  const heroItemIndex = section.hero_items?.findIndex(heroItem => heroItem.id === heroItemId);
  const heroItem = section.hero_items[heroItemIndex];

  if(!heroItem) {
    return null;
  }

  const actionIndex = heroItem?.actions?.findIndex(action => action.id === actionId);
  const action = heroItem?.actions[actionIndex];

  if(!action) {
    return null;
  }

  const l10n = rootStore.l10n.pages.media_property.form;
  const basePath = UrlJoin("/public/asset_metadata/info/sections", sectionId, "hero_items", heroItemIndex.toString(), "actions", actionIndex.toString());
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id: sectionId, label: section.label}),
    subcategory: mediaPropertyStore.MediaPropertyCategory({
      category: "section_hero_item_action_label",
      mediaPropertyId,
      type: "hero_item_action",
      path: basePath,
      label: action.label
    }),
    path: basePath
  };

  return (
    <PageContent
      backLink={UrlJoin("/media-properties", mediaPropertyId, "sections", sectionId, "hero_items", heroItemId)}
      title={`${section.label || ""} - ${heroItem.label || ""} - ${action.label || ""}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.actions.sections.general}</Title>
      <Inputs.Text
        {...inputProps}
        {...l10n.pages.label}
        field="label"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.pages.description}
        field="description"
      />

      <Title order={3} mt={50} mb="md">{l10n.actions.sections.visibility}</Title>
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

      <Title order={3} mt={50} mb="md">{l10n.actions.sections.behavior}</Title>
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

      <Title order={3} mt={50} mb="md">{l10n.actions.sections.button}</Title>
      <ColorOptions
        field="button"
        includeTextField
        includeIcon
        defaultValues={{
          background_color: "#FFFFFF",
          text_color: "#000000",
          border_radius: 5
        }}
        {...l10n.actions.button}
        {...inputProps}
      />
    </PageContent>
  );
});


const MediaPropertySectionHeroItem = observer(() => {
  const { mediaPropertyId, sectionId, heroItemId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const section = info.sections?.[sectionId];

  if(!section) {
    return null;
  }

  const heroItemIndex = section.hero_items?.findIndex(heroItem => heroItem.id === heroItemId);
  const heroItem = section.hero_items[heroItemIndex];

  if(!heroItem) {
    return null;
  }

  const l10n = rootStore.l10n.pages.media_property.form;
  const basePath = UrlJoin("/public/asset_metadata/info/sections", sectionId, "hero_items", heroItemIndex.toString());
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id: sectionId, label: section.label}),
    subcategory: mediaPropertyStore.MediaPropertyCategory({
      category: "section_hero_item_label",
      mediaPropertyId,
      type: "hero_item",
      path: basePath,
      label: heroItem.label
    }),
    path: UrlJoin(basePath, "display")
  };

  return (
    <PageContent
      backLink={UrlJoin("/media-properties", mediaPropertyId, "sections", sectionId)}
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${section.label} - ${heroItem.label || ""}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.general}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.common.id}
        disabled
        path={basePath}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.sections.label}
        path={basePath}
        field="label"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.sections.description}
        path={basePath}
        field="description"
      />

      <Title order={3} mb="md" mt={50}>{l10n.categories.permissions}</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.sections.permission_behavior}
        subcategory={l10n.categories.permissions}
        defaultValue="hide"
        path={UrlJoin(basePath, "permissions")}
        field="behavior"
        options={[
          { label: mediaPropertyStore.PERMISSION_BEHAVIORS.hide, value: "hide" },
          { label: "Show If Not Authorized", value: "show_if_unauthorized"}
        ]}
      />
      {
        (info.permission_sets || []).length === 0 ? null :
          <>
            <PermissionItemSelect
              {...l10n.sections.permissions}
              {...inputProps}
              subcategory={l10n.categories.permissions}
              path={UrlJoin(basePath, "permissions")}
              field="permission_item_ids"
              multiple
              permissionSetIds={info?.permission_sets}
              defaultFirst
            />
          </>
      }

      <Title order={3} mb="md" mt={50}>{l10n.categories.section_hero_item_presentation}</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.pages.header.position}
        defaultValue="Left"
        field="position"
        options={["Left", "Center", "Right"]}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.pages.header.title}
        localizable
        field="title"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.pages.header.description}
        localizable
        field="description"
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.pages.header.description_rich_text}
        localizable
        field="description_rich_text"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.pages.header.logo}
        localizable
        fields={[
          { field: "logo" }
        ]}
        altTextField="logo_alt"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.pages.header.background_image}
        localizable
        fields={[
          { field: "background_image", ...l10n.pages.header.background_image_desktop, aspectRatio: 16/9, baseSize: 135 },
          { field: "background_image_mobile", ...l10n.pages.header.background_image_mobile, aspectRatio: 1/2, baseSize: 135 },
        ]}
      />

      <Inputs.InputWrapper
        {...l10n.pages.header.background_video}
      >
        <Inputs.FabricBrowser
          mt="md"
          {...inputProps}
          {...l10n.pages.header.background_video_desktop}
          field="background_video"
          previewable
          previewOptions={{
            muted: EluvioPlayerParameters.muted.ON,
            autoplay: EluvioPlayerParameters.autoplay.ON,
            controls: EluvioPlayerParameters.controls.OFF,
            loop: EluvioPlayerParameters.loop.OFF
          }}
        />

        <Inputs.FabricBrowser
          {...inputProps}
          {...l10n.pages.header.background_video_mobile}
          field="background_video_mobile"
          previewable
          previewOptions={{
            muted: EluvioPlayerParameters.muted.ON,
            autoplay: EluvioPlayerParameters.autoplay.ON,
            controls: EluvioPlayerParameters.controls.OFF,
            loop: EluvioPlayerParameters.loop.OFF
          }}
        />
      </Inputs.InputWrapper>

      <Title order={3} mb="md" mt={50}>{l10n.categories.page_actions}</Title>
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.pages.actions}
        path={basePath}
        routePath="actions"
        newItemSpec={MediaPropertyActionSpec}
        field="actions"
        idField="id"
        GetName={action => action.label || "Action"}
        columns={[
          {
            label: l10n.actions.label.label,
            field: "label"
          },
          {
            label: l10n.actions.visibility.label,
            field: "visibility",
            render: action => <Text>{ActionConditions[action?.visibility || ""]}</Text>
          }
        ]}
      />
    </PageContent>
  );
});


export default MediaPropertySectionHeroItem;
