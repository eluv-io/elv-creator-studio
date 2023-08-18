import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";

const MarketplaceTheme = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: "/public/asset_metadata/info/branding"
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Theme`}
      section="marketplace"
      useHistory
    >
      <Inputs.Checkbox
        {...inputProps}
        field="use_tenant_styling"
        label="Use Tenant Styling"
        description="Override marketplace styling with tenant styling on pages outside of the store"
      />

      {
        info.branding.use_tenant_styling ? null :
          <Inputs.ImageInput
            {...inputProps}
            label="App Background"
            fields={[
              { field: "background", label: "Background (Desktop)" },
              { field: "background_mobile", label: "Background (Mobile)" },
            ]}
          />
      }

      <Inputs.Select
        {...inputProps}
        field="text_justification"
        label="Text Justification"
        defaultValue="Left"
        options={["Left", "Center"]}
      />

      <Inputs.Select
        {...inputProps}
        field="item_text_justification"
        label="Item Text Justification"
        defaultValue="Left"
        options={["Left", "Center"]}
      />

      <Inputs.Select
        {...inputProps}
        field="color_scheme"
        label="Theme"
        defaultValue="Light"
        options={["Light", "Dark", "Custom"]}
      />

      {
        info?.branding?.color_scheme !== "Custom" ? null :
          <Inputs.Code
            {...inputProps}
            field="custom_css"
            label="Custom CSS"
            language="css"
          />
      }
    </PageContent>
  );
});

export default MarketplaceTheme;
