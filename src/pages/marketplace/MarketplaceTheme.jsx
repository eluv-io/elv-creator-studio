import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";

const MarketplaceTheme = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: "/public/asset_metadata/info/branding",
    category: l10n.categories.theme
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Theme`}
      section="marketplace"
      useHistory
    >
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.theme.use_tenant_styling}
        field="use_tenant_styling"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.theme.app_background}
        fields={[
          { field: "background", ...l10n.theme.background_desktop },
          { field: "background_mobile", ...l10n.theme.background_mobile }
        ]}
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.theme.text_justification}
        field="text_justification"
        defaultValue="Left"
        options={["Left", "Center"]}
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.theme.item_text_justification}
        field="item_text_justification"
        defaultValue="Left"
        options={["Left", "Center"]}
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.theme.theme}
        field="color_scheme"
        defaultValue="Light"
        options={["Light", "Dark", "Custom"]}
      />

      {
        info?.branding?.color_scheme !== "Custom" ? null :
          <Inputs.Code
            {...inputProps}
            {...l10n.theme.custom_css}
            field="custom_css"
            language="css"
          />
      }
    </PageContent>
  );
});

export default MarketplaceTheme;
