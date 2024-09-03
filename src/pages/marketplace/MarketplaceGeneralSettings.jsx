import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore, tenantStore, uiStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Accordion, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";

import {IconReportMoney, IconSettings} from "@tabler/icons-react";
import {MarketplaceSelect} from "@/components/inputs/ResourceSelection.jsx";
import {useEffect} from "react";

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

  const mediaProperties = mediaPropertyStore.allMediaProperties;

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

      <Inputs.Password
        {...inputProps}
        {...l10n.general.preview_password}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info"
        field="preview_password_digest"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.general.property_redirect}
        options={mediaProperties.map(property => ({label: property.name, value: property.objectId}))}
        path="/public/asset_metadata/info"
        field="property_redirect"
      />

      <Title order={3} mt={50} mb="md">{ l10n.categories.global_settings }</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.show_global}
        subcategory={l10n.categories.global_settings}
        path="/public/asset_metadata/info/branding"
        field="show"
        defaultValue={false}
      />

      {
        !info?.branding?.show ? null :
          <Inputs.URL
            {...inputProps}
            {...l10n.general.external_link}
            subcategory={l10n.categories.global_settings}
            path="/public/asset_metadata/info/branding"
            field="external_link"
          />
      }

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.general.tags}
        subcategory={l10n.categories.tags}
        path="/public/asset_metadata/info/branding"
        field="tags"
        fieldLabel="Tag"
        clearable
        searchable
        options={[
          "Movies",
          "TV",
          "Music",
          "Software"
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.card_images}
        subcategory={l10n.categories.global_settings}
        path="/public/asset_metadata/info/branding"
        altTextField="card_banner_alt"
        fields={[
          { field: "card_banner_front", ...l10n.general.card_front },
          { field: "card_banner_back", ...l10n.general.card_back },
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.tv_images}
        subcategory={l10n.categories.global_settings}
        path="/public/asset_metadata/info/branding/tv"
        fields={[
          { field: "logo", ...l10n.general.tv_logo },
          { field: "image", ...l10n.general.tv_image },
          { field: "header_image", ...l10n.general.tv_header_image },
        ]}
      />


      <Title order={3} mt={50} mb="md">{ l10n.categories.notification }</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.show_notification}
        subcategory={l10n.categories.notification}
        path="/public/asset_metadata/info/branding/notification"
        field="active"
        defaultValue={false}
      />

      {
        !info.branding?.notification?.active ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.general.notification_header}
              subcategory={l10n.categories.notification}
              path="/public/asset_metadata/info/branding/notification"
              field="header"
            />
            <Inputs.RichText
              {...inputProps}
              {...l10n.general.notification_text}
              subcategory={l10n.categories.notification}
              path="/public/asset_metadata/info/branding/notification"
              field="text"
            />
          </>
      }

      <Accordion mt={50} maw={uiStore.inputWidth} variant="contained">
        <Accordion.Item value="payment_options">
          <Accordion.Control icon={<IconReportMoney />}>
            { l10n.categories.payment_options }
          </Accordion.Control>
          <Accordion.Panel>
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
              {...l10n.general.coinbase}
              subcategory={l10n.categories.payment_options}
              path="/public/asset_metadata/info/payment_options/coinbase"
              field="enabled"
              defaultValue={true}
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.general.circle}
              subcategory={l10n.categories.payment_options}
              path="/public/asset_metadata/info/payment_options/circle"
              field="enabled"
              defaultValue={false}
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
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="advanced_settings">
          <Accordion.Control icon={<IconSettings />}>
            { l10n.categories.advanced_settings }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.List
              {...inputProps}
              {...l10n.general.additional_marketplaces}
              subcategory={l10n.categories.advanced_settings}
              path="/public/asset_metadata/info/branding"
              field="additional_marketplaces"
              maw="100%"
              renderItem={props => (
                <MarketplaceSelect
                  {...props}
                  {...l10n.general.additional_marketplace}
                  field="marketplace_slug"
                  tenantSlugField="tenant_slug"
                  marketplaceIdField="marketplace_id"
                  excludedSlugs={[marketplace.metadata.public.asset_metadata.slug]}
                  defaultFirst
                />
              )}
            />

            <Inputs.InputWrapper
              {...l10n.general.page_tabs}
              mt="md"
            >
              <Inputs.Text
                {...inputProps}
                {...l10n.general.page_tab_store}
                subcategory={l10n.categories.page_tabs}
                path="/public/asset_metadata/info/branding/tabs"
                field="store"
                placeholder="Store"
                componentProps={{mt: "md"}}
              />

              {
                !(info?.branding?.additional_marketplaces?.length > 0) ? null :
                  <Inputs.Text
                    {...inputProps}
                    {...l10n.general.page_tab_stores}
                    subcategory={l10n.categories.page_tabs}
                    path="/public/asset_metadata/info/branding/tabs"
                    field="stores"
                    placeholder="Stores"
                  />
              }

              <Inputs.Text
                {...inputProps}
                {...l10n.general.page_tab_listings}
                subcategory={l10n.categories.page_tabs}
                path="/public/asset_metadata/info/branding/tabs"
                field="listings"
                placeholder="Listings"
              />

              <Inputs.Text
                {...inputProps}
                {...l10n.general.page_tab_my_items}
                subcategory={l10n.categories.page_tabs}
                path="/public/asset_metadata/info/branding/tabs"
                field="my_items"
                placeholder="My Items"
              />
            </Inputs.InputWrapper>

            <Inputs.Checkbox
              INVERTED
              {...inputProps}
              {...l10n.general.show_global_nav}
              subcategory={l10n.categories.advanced_settings}
              path="/public/asset_metadata/info/branding"
              field="hide_global_navigation"
              defaultValue={false}
            />

            <Inputs.Checkbox
              INVERTED
              {...inputProps}
              {...l10n.general.show_leaderboard}
              subcategory={l10n.categories.advanced_settings}
              path="/public/asset_metadata/info/branding"
              field="hide_leaderboard"
              defaultValue={false}
            />

            <Inputs.Checkbox
              INVERTED
              {...inputProps}
              {...l10n.general.disable_secondary_marketplace}
              subcategory={l10n.categories.advanced_settings}
              path="/public/asset_metadata/info/branding"
              field="disable_secondary_market"
              defaultValue={false}
            />

            {
              // Irrelevant if header image is set
              info?.branding?.header_image ? null :
                <Inputs.Checkbox
                  {...inputProps}
                  {...l10n.general.hide_name}
                  subcategory={l10n.categories.advanced_settings}
                  path="/public/asset_metadata/info/branding"
                  field="hide_name"
                  defaultValue={false}
                />
            }

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
