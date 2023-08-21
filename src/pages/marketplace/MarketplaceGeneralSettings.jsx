import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore, tenantStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import {Accordion, Title} from "@mantine/core";
import Inputs from "Components/inputs/Inputs";

import {IconSettings} from "@tabler/icons-react";

const MarketplaceGeneralSettings = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = { store: marketplaceStore, objectId: marketplaceId, category: l10n.categories.general };

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
        path="/public/asset_metadata/info/branding"
        field="name"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        path="/public/asset_metadata/info/branding"
        field="description"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.tenant_id}
        disabled
        path="/public/asset_metadata/info"
        field="tenant_id"
        defaultValue={rootStore.tenantId}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.tenant_slug}
        disabled
        path="/public/asset_metadata/info"
        field="tenant_slug"
        defaultValue={tenantStore.tenantInfo?.tenantSlug}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.marketplace_slug}
        disabled
        path="/public/asset_metadata"
        field="slug"
      />

      <Inputs.Password
        {...inputProps}
        {...l10n.general.preview_password}
        path="/public/asset_metadata/info"
        field="preview_password_digest"
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
        subcategory={l10n.categories.global_settings}
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




      <Accordion mt={50} maw={800} variant="contained">
        <Accordion.Item value="default">
          <Accordion.Control icon={<IconSettings />}>
            { rootStore.l10n.components.forms.advanced_settings }
          </Accordion.Control>
          <Accordion.Panel>
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
