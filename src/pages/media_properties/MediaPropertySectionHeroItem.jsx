import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import {Text} from "@mantine/core";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {MediaPropertyActionSpec} from "@/specs/MediaPropertySpecs.js";
import ColorOptions from "@/components/inputs/media_property/Components";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js/lib";
import {ActionConditions, ActionConfiguration} from "@/pages/media_properties/MediaPropertyActionConfiguration.jsx";

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

      <ActionConfiguration
        inputProps={inputProps}
        action={action}
      />

      <Title order={3} mt={50} mb="md">{l10n.actions.sections.button}</Title>
      <Inputs.Select
        {...inputProps}
        {...l10n.actions.button_style}
        defaultValue=""
        field="button_style"
        options={[
          {label: "Default", value: ""},
          {label: "Clipped Corner", value: "clipped"}
        ]}
      />
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
          fabricBrowserProps={{
            video: true,
            allowCompositions: true,
            allowClips: true
          }}
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
          fabricBrowserProps={{
            video: true,
            allowCompositions: true,
            allowClips: true
          }}
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
