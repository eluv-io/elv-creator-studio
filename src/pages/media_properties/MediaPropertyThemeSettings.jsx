import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import ColorOptions from "@/components/inputs/media_property/Components.jsx";
import UrlJoin from "url-join";

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


      <Title order={3} mt={50} mb="md">{l10n.categories.media_sidebar}</Title>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.media_sidebar.show_media_sidebar}
        path={UrlJoin(inputProps.path, "media_sidebar")}
        subcategory={l10n.categories.media_sidebar}
        defaultValue={false}
        field="show_media_sidebar"
      />

      {
        !info?.media_sidebar?.show_media_sidebar ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.general.media_sidebar.sidebar_content}
              path={UrlJoin(inputProps.path, "media_sidebar")}
              subcategory={l10n.categories.media_sidebar}
              field="sidebar_content"
              defaultValue="current_section"
              options={[
                { label: "Current Section", value: "current_section" },
                { label: "Specific Section", value: "specific_section" },
                { label: "All Live Content", value: "live" }
              ]}
            />
            {
              info?.media_sidebar?.sidebar_content !== "current_section" ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.general.media_sidebar.default_sidebar_content}
                  path={UrlJoin(inputProps.path, "media_sidebar")}
                  subcategory={l10n.categories.media_sidebar}
                  field="default_sidebar_content"
                  defaultValue="none"
                  options={[
                    { label: "None", value: "none" },
                    { label: "Specific Section", value: "specific_section" },
                    { label: "All Live Content", value: "live" }
                  ]}
                />
            }
            {
              !(
                info?.media_sidebar?.sidebar_content === "specific_section" ||
                (
                  info?.media_sidebar?.sidebar_content === "current_section" &&
                  info?.media_sidebar?.default_sidebar_content === "specific_section"
                )
              ) ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.general.media_sidebar.sidebar_content_section_id}
                  path={UrlJoin(inputProps.path, "media_sidebar")}
                  subcategory={l10n.categories.media_sidebar}
                  field="sidebar_content_section_id"
                  defaultValue={Object.keys(info.sections || {})[0]}
                  options={
                    Object.keys(info.sections || {}).map(sectionId =>
                      ({label: info.sections[sectionId].label, value: sectionId})
                    )
                  }
                />
            }
          </>
      }

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
