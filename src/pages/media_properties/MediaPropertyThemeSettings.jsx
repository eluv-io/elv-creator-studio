import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import ColorOptions from "@/components/inputs/media_property/Components.jsx";

const MediaPropertyThemeSettings = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.theme_settings,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "Media Property"} - ${l10n.categories.theme_settings}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mt={50} mb="md">{l10n.categories.theme}</Title>

      <ColorOptions
        {...inputProps}
        {...l10n.theme.button_style}
        info={info?.styling?.button_style || {}}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        field="button_style"
        placeholders={{
          background_color: "#FFFFFF",
          border_color: "#FFFFFF",
          text_color: "#000000",
          border_radius: 5
        }}
      />
      <Inputs.Color
        {...inputProps}
        {...l10n.theme.filter_color}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        defaultValue="#FFFFFF"
        field="filter_color"
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.theme.filter_style}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        defaultValue="rounded"
        field="filter_style"
        options={[
          { label: "Rounded", value: "rounded" },
          { label: "Squared", value: "squared" },
          { label: "Alternating", value: "alternating" }
        ]}
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.theme.font}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        defaultValue=""
        field="font"
        options={[
          { label: "Inter (Default)", value: "" },
          { label: "Custom Font", value: "custom" },
        ]}
      />
      {
        info?.styling?.font !== "custom" ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.theme.custom_font_declaration}
              subcategory={l10n.categories.theme}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_font_declaration"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.theme.custom_title_font_declaration}
              subcategory={l10n.categories.theme}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_title_font_declaration"
            />
            <Inputs.Code
              {...inputProps}
              {...l10n.theme.custom_font_definition}
              subcategory={l10n.categories.theme}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_font_definition"
            />
          </>
      }

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.countdown_background}
        subcategory={l10n.categories.theme}
        fields={[
          { field: "countdown_background_desktop", aspectRatio: 16/9, baseSize: 135, ...l10n.general.countdown_background_desktop },
          { field: "countdown_background_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.general.countdown_background_mobile }
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.profile_background}
        subcategory={l10n.categories.user_profile}
        path="/public/asset_metadata/info/styling/profile"
        fields={[
          { field: "background_image", aspectRatio: 16/9, baseSize: 135, ...l10n.general.profile_background_desktop },
          { field: "background_image_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.general.profile_background_mobile }
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.countdown_background}
        subcategory={l10n.categories.media_sidebar}
        fields={[
          { field: "countdown_background_desktop", aspectRatio: 16/9, baseSize: 135, ...l10n.general.countdown_background_desktop },
          { field: "countdown_background_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.general.countdown_background_mobile }
        ]}
      />
    </PageContent>
  );
});

export default MediaPropertyThemeSettings;
