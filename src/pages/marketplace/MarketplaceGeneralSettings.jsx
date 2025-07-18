import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore, tenantStore, uiStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Accordion, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import CountryCodesList from "country-codes-list";
import {IconSettings} from "@tabler/icons-react";
import {useEffect} from "react";

const currencies = CountryCodesList.customList("currencyCode", "{currencyNameEn}");
Object.keys(currencies).forEach(currencyCode => {
  if(!currencyCode || !currencies[currencyCode]) {
    delete currencies[currencyCode];
  }
});

delete currencies["USD"];

const ebanxSupportedCountries = [
  {"label":"Argentina","value":"AR"},
  {"label":"Bolivia","value":"BO"},
  {"label":"Brazil","value":"BR"},
  {"label":"Chile","value":"CL"},
  {"label":"Colombia","value":"CO"},
  {"label":"Ecuador","value":"EC"},
  {"label":"El Salvador","value":"SV"},
  {"label":"Guatemala","value":"GT"},
  {"label":"Mexico","value":"MX"},
  {"label":"Panama","value":"PA"},
  {"label":"Paraguay","value":"PY"},
  {"label":"Peru","value":"PE"},
  {"label":"Uruguay","value":"UY"}
];

const MarketplaceGeneralSettings = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = { store: marketplaceStore, objectId: marketplaceId, category: l10n.categories.general };

  useEffect(() => {
    mediaPropertyStore.LoadMediaProperties();
  }, []);

  const mediaProperties = mediaPropertyStore.allMediaProperties || [];

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - General`}
      section="marketplace"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.info }</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info/branding"
        field="name"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info/branding"
        field="description"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.tenant_id}
        subcategory={l10n.categories.info}
        disabled
        path="/public/asset_metadata/info"
        field="tenant_id"
        defaultValue={rootStore.tenantId}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.tenant_slug}
        subcategory={l10n.categories.info}
        disabled
        path="/public/asset_metadata/info"
        field="tenant_slug"
        defaultValue={tenantStore.tenantInfo?.tenantSlug}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.marketplace_slug}
        subcategory={l10n.categories.info}
        disabled
        path="/public/asset_metadata"
        field="slug"
      />

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.general.currencies}
        searchable
        options={
          Object.keys(currencies)
            .sort((a, b) => currencies[a] > currencies[b] ? 1 : -1)
            .map(currencyCode => ({
              label: `${currencies[currencyCode]} (${currencyCode})`,
              value: currencyCode
            }))
        }
        path="/public/asset_metadata/info"
        field="currencies"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.general.property_redirect}
        options={mediaProperties.map(property => ({label: property.name, value: property.objectId}))}
        path="/public/asset_metadata/info"
        field="property_redirect"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.card_images}
        subcategory={l10n.categories.global_settings}
        path="/public/asset_metadata/info/branding"
        altTextField="card_banner_alt"
        fields={[
          { field: "card_banner_front", ...l10n.general.card_front }
        ]}
      />

      <br/>

      <Title order={3} my="md">{ l10n.categories.payment_options }</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.prices_inclusive}
        subcategory={l10n.categories.payment_options}
        path="/public/asset_metadata/info"
        field="prices_inclusive"
        defaultValue={false}
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.stripe}
        subcategory={l10n.categories.payment_options}
        path="/public/asset_metadata/info/payment_options/stripe"
        field="enabled"
        defaultValue={true}
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.wallet_balance}
        subcategory={l10n.categories.payment_options}
        path="/public/asset_metadata/info/payment_options/wallet_balance"
        field="enabled"
        defaultValue={true}
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.coinbase}
        subcategory={l10n.categories.payment_options}
        path="/public/asset_metadata/info/payment_options/coinbase"
        field="enabled"
        defaultValue={true}
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.ebanx}
        subcategory={l10n.categories.payment_options}
        path="/public/asset_metadata/info/payment_options/ebanx"
        field="enabled"
        defaultValue={false}
      />
      {
        !info.payment_options?.ebanx?.enabled ? null :
          <>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.general.ebanx_preferred}
              subcategory={l10n.categories.payment_options}
              path="/public/asset_metadata/info/payment_options/ebanx"
              field="preferred"
              defaultValue={false}
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.general.ebanx_pix_enabled}
              subcategory={l10n.categories.payment_options}
              path="/public/asset_metadata/info/payment_options/ebanx"
              field="pix_enabled"
              defaultValue={false}
            />
            <Inputs.MultiSelect
              {...inputProps}
              {...l10n.general.ebanx_allowed_countries}
              subcategory={l10n.categories.payment_options}
              path="/public/asset_metadata/info/payment_options/ebanx"
              field="allowed_countries"
              options={ebanxSupportedCountries}
              searchable
            />
          </>
      }

      <Accordion mt={50} maw={uiStore.inputWidth} variant="contained">
        <Accordion.Item value="advanced_settings">
          <Accordion.Control icon={<IconSettings />}>
            { l10n.categories.advanced_settings }
          </Accordion.Control>
          <Accordion.Panel>

            <Inputs.Checkbox
              INVERTED
              {...inputProps}
              {...l10n.general.disable_secondary_marketplace}
              subcategory={l10n.categories.advanced_settings}
              path="/public/asset_metadata/info/branding"
              field="disable_secondary_market"
              defaultValue={false}
            />

            <Inputs.Checkbox
              INVERTED
              {...inputProps}
              {...l10n.general.show_secondary_stats}
              subcategory={l10n.categories.advanced_settings}
              path="/public/asset_metadata/info/branding"
              field="hide_secondary_in_store"
              defaultValue={false}
            />

            <Inputs.Checkbox
              INVERTED
              {...inputProps}
              {...l10n.general.allow_usdc}
              subcategory={l10n.categories.advanced_settings}
              path="/public/asset_metadata/info/branding"
              field="disable_usdc"
              defaultValue={false}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

    </PageContent>
  );
});

export default MarketplaceGeneralSettings;
