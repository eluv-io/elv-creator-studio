import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, siteStore, marketplaceStore, tenantStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title, Paper} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import {SiteAdditionalMarketplaceSpec} from "@/specs/SiteSpecs.js";
import {MarketplaceSelect} from "@/components/inputs/ResourceSelection";
import UrlJoin from "url-join";
import {LocalizeString} from "@/components/common/Misc.jsx";

const HeaderLinkConfiguration = observer(({type}) => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    category: l10n.categories.general
  };

  const path = UrlJoin("/public/asset_metadata/info/header_links", type);

  return (
    <Paper withBorder p="xl" mt="xl" w={uiStore.inputWidth}>
      <Title order={5} mb="md">{ l10n.general.header_link_types[type] }</Title>

      <Inputs.Checkbox
        INVERTED
        {...inputProps}
        {...l10n.general.header_link_show}
        subcategory={LocalizeString(l10n.categories.header_link_label, {type: l10n.general.header_link_types[type]})}
        path={path}
        field="hide"
        defaultValue={false}
      />
      {
        info.header_links?.[type]?.hide ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.general.header_link_text}
              subcategory={LocalizeString(l10n.categories.header_link_label, {type: l10n.general.header_link_types[type]})}
              path={path}
              field="link_text"
            />
            <Inputs.Checkbox
              INVERTED
              {...inputProps}
              {...l10n.general.header_show_icon}
              subcategory={LocalizeString(l10n.categories.header_link_label, {type: l10n.general.header_link_types[type]})}
              path={path}
              field="hide_icon"
              defaultValue={false}
            />
            {
              info.header_links?.[type]?.hide_icon ? null :
                <Inputs.SingleImageInput
                  {...inputProps}
                  {...l10n.general.header_icon}
                  subcategory={LocalizeString(l10n.categories.header_link_label, {type: l10n.general.header_link_types[type]})}
                  path={path}
                  field="icon"
                  noResizePreview
                />
            }
          </>
      }
    </Paper>
  );
});

const SiteGeneralSettings = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    category: l10n.categories.general
  };

  return (
    <PageContent
      title={`${info.name || site.name || "Site"} - General`}
      section="site"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.info }</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info"
        field="name"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info"
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
        defaultValue={tenantStore.tenantSlug}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.slug}
        subcategory={l10n.categories.info}
        disabled
        path="/public/asset_metadata"
        field="slug"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.title}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info/event_info"
        field="event_title"
      />

      <Inputs.Hidden
        {...inputProps}
        path="/public/asset_metadata/info"
        field="state"
        defaultValue="Available"
      />

      <Title order={3} mt={50} mb="md">{ l10n.categories.marketplace }</Title>

      <MarketplaceSelect
        {...inputProps}
        {...l10n.general.marketplace}
        subcategory={l10n.categories.marketplace}
        path="/public/asset_metadata/info/marketplace_info"
        field="marketplace_slug"
        tenantSlugField="tenant_slug"
        marketplaceIdField="marketplace_id"
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.general.default_store_page}
        subcategory={l10n.categories.marketplace}
        path="/public/asset_metadata/info/marketplace_info"
        field="default_store_page"
        defaultValue="Storefront"
        options={["Storefront", "Listings"]}
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.general.link_text}
        subcategory={l10n.categories.marketplace}
        path="/public/asset_metadata/info/marketplace_info"
        field="link_text"
        placeholder="Store"
      />

      {
        info?.marketplace_info?.disable_marketplace ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.general.marketplace_only}
            subcategory={l10n.categories.marketplace}
            path="/public/asset_metadata/info/marketplace_info"
            field="marketplace_only"
            defaultValue={false}
          />
      }
      {
        info?.marketplace_info?.marketplace_only ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.general.disable_marketplace}
            subcategory={l10n.categories.marketplace}
            path="/public/asset_metadata/info/marketplace_info"
            field="disable_marketplace"
            defaultValue={false}
          />
      }
      {
        (marketplaceStore.allMarketplaces || []).length <= 1 ? null :
          <>
            <Title order={3} mt={50} mb="md">{l10n.categories.additional_marketplaces}</Title>

            <Inputs.List
              {...inputProps}
              {...l10n.general.additional_marketplaces}
              subcategory={l10n.categories.additional_marketplaces}
              path="/public/asset_metadata/info"
              field="additional_marketplaces"
              fieldLabel={l10n.general.additional_marketplace.label}
              newItemSpec={SiteAdditionalMarketplaceSpec}
              renderItem={props => (
                <>
                  <MarketplaceSelect
                    {...props}
                    {...l10n.general.marketplace}
                    field="marketplace_slug"
                    tenantSlugField="tenant_slug"
                    marketplaceIdField="marketplace_id"
                    excludedSlugs={[info?.marketplace_info?.marketplace_slug]}
                    defaultFirst
                  />
                  <Inputs.Select
                    {...props}
                    {...l10n.general.default_store_page}
                    field="default_store_page"
                    defaultValue="Storefront"
                    options={["Storefront", "Listings"]}
                  />
                  <Inputs.Checkbox
                    {...props}
                    {...l10n.general.marketplace_hidden}
                    field="hidden"
                    defaultValue={false}
                  />
                </>
              )}
            />
          </>
      }

      <Title order={3} mt={50}>{ l10n.categories.header_links }</Title>

      <HeaderLinkConfiguration type="sign_in" />
      <HeaderLinkConfiguration type="store" />
      <HeaderLinkConfiguration type="wallet" />
      <HeaderLinkConfiguration type="discover_projects" />

      <Title order={3} mt={50}>{ l10n.categories.featured }</Title>
      <Title order={6} mb="md" color="dimmed">{ l10n.general.featured_note }</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.general.feature_location}
        subcategory={l10n.categories.featured}
        path="/public/asset_metadata/info/event_info"
        field="feature_location"
        defaultValue="Event Site"
        options={[
          { label: "Site", value: "Event Site"},
          { label: "Marketplace", value: "Marketplace" },
          { label: "Link", value: "External Link" }
        ]}
      />

      {
        info?.event_info?.feature_location !== "External Link" ? null :
          <Inputs.URL
            {...inputProps}
            {...l10n.general.external_url}
            subcategory={l10n.categories.featured}
            path="/public/asset_metadata/info/event_info"
            field="external_url"
          />
      }

      <Inputs.InputWrapper {...l10n.general.featured_button}>
        <Inputs.Color
          {...inputProps}
          {...l10n.common.text}
          subcategory={l10n.categories.featured}
          path="/public/asset_metadata/info/event_info/feature_button"
          field="text"
        />
        <Inputs.Color
          {...inputProps}
          {...l10n.common.text_color}
          subcategory={l10n.categories.featured}
          path="/public/asset_metadata/info/event_info/feature_button/text_color"
          field="color"
        />
        <Inputs.Color
          {...inputProps}
          {...l10n.common.background_color}
          subcategory={l10n.categories.featured}
          path="/public/asset_metadata/info/event_info/feature_button/background_color"
          field="color"
        />
      </Inputs.InputWrapper>
    </PageContent>
  );
});

export default SiteGeneralSettings;
