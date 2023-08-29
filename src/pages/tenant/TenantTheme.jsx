import {observer} from "mobx-react-lite";
import {rootStore, tenantStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import Inputs from "Components/inputs/Inputs";

const TenantTheme = observer(() => {
  const tenant = tenantStore.latestTenant;

  const info = tenant?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.tenant.form;
  const inputProps = {
    store: tenantStore,
    objectId: tenantStore.tenantObjectId,
    category: l10n.categories.global_theme,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info?.name || "Tenant"} - Global Theme`}
      section="tenant"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.global_wallet_theme }</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.global_theme.enable_global_theme}
        subcategory={l10n.categories.global_wallet_theme}
        defaultValue={false}
        path="/public/asset_metadata/info/branding"
        field="enable_global_theme"
      />

      {
        !info?.branding?.enable_global_theme ? null :
          <>
            <Inputs.ImageInput
              {...inputProps}
              {...l10n.global_theme.app_background}
              subcategory={l10n.categories.global_wallet_theme}
              path="/public/asset_metadata/info/branding"
              fields={[
                {field: "background", ...l10n.global_theme.background_desktop},
                {field: "background_mobile", ...l10n.global_theme.background_mobile}
              ]}
            />

            <Inputs.Code
              {...inputProps}
              {...l10n.global_theme.wallet_css}
              subcategory={l10n.categories.global_wallet_theme}
              path="/public/asset_metadata/info/branding"
              field="wallet_css"
              language="css"
            />
          </>
      }
    </PageContent>
  );
});

export default TenantTheme;
