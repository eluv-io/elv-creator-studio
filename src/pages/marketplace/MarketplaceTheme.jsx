import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/common/Inputs";

const MarketplaceTheme = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Theme`}
      section="marketplace"
      useHistory
    >
      <Inputs.Checkbox
        label="Use Tenant Styling"
        path="/public/asset_metadata/info/branding"
        field="use_tenant_styling"
        defaultValue={false}
        {...inputProps}
      />

      <Inputs.Select
        label="Text Justification"
        path="/public/asset_metadata/info/branding"
        field="text_justification"
        defaultValue="Left"
        options={["Left", "Center"]}
        {...inputProps}
      />

      <Inputs.Select
        label="Item Text Justification"
        path="/public/asset_metadata/info/branding"
        field="item_text_justification"
        defaultValue="Left"
        options={["Left", "Center"]}
        {...inputProps}
      />

      <Inputs.Select
        label="Theme"
        path="/public/asset_metadata/info/branding"
        field="color_scheme"
        defaultValue="Light"
        options={["Light", "Dark", "Custom"]}
        {...inputProps}
      />

      {
        info?.branding?.color_scheme !== "Custom" ? null :
          <Inputs.Code
            language="css"
            label="Custom CSS"
            path="/public/asset_metadata/info/branding"
            field="custom_css"
            {...inputProps}
          />
      }
    </PageContent>
  );
});

export default MarketplaceTheme;
