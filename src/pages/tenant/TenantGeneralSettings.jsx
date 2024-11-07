import {observer} from "mobx-react-lite";
import {rootStore, tenantStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Accordion, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import {ValidateAddress} from "@/components/common/Validation.jsx";
import {IconSettings} from "@tabler/icons-react";

const TenantGeneralSettings = observer(() => {
  const tenant = tenantStore.latestTenant;

  const info = tenant?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.tenant.form;
  const inputProps = {
    store: tenantStore,
    objectId: tenantStore.tenantObjectId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info?.name || "Tenant"} - General`}
      section="tenant"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.info }</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.general.name}
        subcategory={l10n.categories.info}
        field="name"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.tenant_id}
        subcategory={l10n.categories.info}
        disabled
        field="tenant_id"
        defaultValue={rootStore.tenantId}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.tenant_slug}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata"
        field="slug"
        defaultValue={tenantStore.tenantInfo?.tenantSlug}
      />

      <Inputs.Number
        {...inputProps}
        {...l10n.general.max_concurrent_logins}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata"
        field="max_concurrent_logins"
        defaultValue={0}
      />

      <Title order={3} mt={50} mb="md">{ l10n.categories.sales }</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.general.revenue_address}
        subcategory={l10n.categories.sales}
        path="/public/asset_metadata/info/token"
        field="revenue_addr"
        Validate={ValidateAddress}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.royalty_address}
        subcategory={l10n.categories.sales}
        path="/public/asset_metadata/info/token"
        field="royalty_addr"
        Validate={ValidateAddress}
      />

      <Inputs.Integer
        {...inputProps}
        {...l10n.general.royalty_percentage}
        subcategory={l10n.categories.sales}
        path="/public/asset_metadata/info/token"
        field="royalty"
        min={0}
        max={100}
      />

      <Inputs.Price
        {...inputProps}
        {...l10n.general.min_listing_price}
        subcategory={l10n.categories.sales}
        path="/public/asset_metadata/info/token"
        field="min_list_price"
      />

      <Inputs.List
        {...inputProps}
        {...l10n.general.owners}
        subcategory={l10n.categories.owners}
        path="/public/asset_metadata/info/token"
        field="owners"
        inputProps={{
          Validate: ValidateAddress
        }}
      />
    </PageContent>
  );
});

export default TenantGeneralSettings;
