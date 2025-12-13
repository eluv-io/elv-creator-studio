import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, pocketStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import ColorOptions from "@/components/inputs/media_property/Components.jsx";

const PocketThemeSettings = observer(() => {
  const { pocketId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    category: l10n.categories.theme,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || pocket.name || "Pocket TV Property"} - Theme Settings`}
      section="pocket"
      useHistory
    >
      <ColorOptions
        {...inputProps}
        {...l10n.theme.button_style}
        allowGradient
        allowBorderWidth
        info={info?.styling?.button_style || {}}
        path="/public/asset_metadata/info/styling"
        field="button_style"
        placeholders={{
          background_color: "#FFFFFF",
          background_color_2: "#FFFFFF",
          background_type: "solid",
          background_gradient_angle: 0,
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
          { label: "Montserrat (Default)", value: "" },
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
    </PageContent>
  );
});

export default PocketThemeSettings;
