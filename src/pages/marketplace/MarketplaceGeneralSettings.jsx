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

  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - General`}
      section="marketplace"
      useHistory
    >
      <Title order={3} my="md">Marketplace Info</Title>

      <Inputs.Text
        label="Name"
        path="/public/asset_metadata/info/branding"
        field="name"
        {...inputProps}
      />

      <Inputs.TextArea
        label="Description"
        path="/public/asset_metadata/info/branding"
        field="description"
        {...inputProps}
      />

      <Inputs.Text
        label="Tenant ID"
        disabled
        path="/public/asset_metadata/info"
        field="tenant_id"
        defaultValue={rootStore.tenantId}
        {...inputProps}
      />

      <Inputs.Text
        label="Tenant Slug"
        disabled
        path="/public/asset_metadata/info"
        field="tenant_slug"
        defaultValue={tenantStore.tenantInfo?.tenantSlug}
        {...inputProps}
      />

      <Inputs.Text
        label="Marketplace Slug"
        disabled
        path="/public/asset_metadata"
        field="slug"
        {...inputProps}
      />

      <Inputs.Password
        label="Preview Password"
        path="/public/asset_metadata/info"
        field="preview_password_digest"
        {...inputProps}
      />

      <Title order={3} mt={50} mb="md">Global Marketplace Settings</Title>

      <Inputs.Checkbox
        label="Show on Global Marketplace"
        path="/public/asset_metadata/info/branding"
        field="show"
        defaultValue={false}
        {...inputProps}
      />

      <Inputs.ImageInput
        label="Marketplace Card Images"
        path="/public/asset_metadata/info/branding"
        altTextField="card_banner_alt"
        fields={[
          { field: "card_banner_front", label: "Card Banner (Front)" },
          { field: "card_banner_back", label: "Card Banner (Back)" },
        ]}
        {...inputProps}
      />

      <Inputs.Checkbox
        INVERTED
        label="Show Global Navigation"
        path="/public/asset_metadata/info/branding"
        field="hide_global_navigation"
        defaultValue={false}
        {...inputProps}
      />


      {
        !info?.branding?.show ? null :
          <Inputs.URL
            label="External Link"
            hint="If specified, the link for this marketplace in the global marketplace view will redirect to this URL instead"
            path="/public/asset_metadata/info/branding"
            field="external_link"
            {...inputProps}
          />
      }

      <Inputs.MultiSelect
        label="Tags"
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
        {...inputProps}
      />


      <Title order={3} mt={50} mb="md">Notification</Title>

      <Inputs.Checkbox
        label="Show Store Notification"
        path="/public/asset_metadata/info/branding/notification"
        field="active"
        defaultValue={false}
        {...inputProps}
      />

      {
        !info.branding?.notification?.active ? null :
          <>
            <Inputs.Text
              label="Notification Header"
              path="/public/asset_metadata/info/branding/notification"
              field="header"
              {...inputProps}
            />
            <Inputs.RichText
              label="Notification Text"
              path="/public/asset_metadata/info/branding/notification"
              field="text"
              {...inputProps}
            />
          </>
      }



      <Title order={3} mt={50} mb="md">Page Tabs</Title>

      <Inputs.Text
        label="Store"
        path="/public/asset_metadata/info/branding/tabs"
        field="store"
        placeholder="Store"
        {...inputProps}
      />

      {
        !(info?.branding?.additional_marketplaces?.length > 0) ? null :
          <Inputs.Text
            label="Stores (Plural)"
            path="/public/asset_metadata/info/branding/tabs"
            field="stores"
            placeholder="Stores"
            {...inputProps}
          />
      }

      <Inputs.Text
        label="Listings"
        path="/public/asset_metadata/info/branding/tabs"
        field="listings"
        placeholder="Listings"
        {...inputProps}
      />

      <Inputs.Text
        label="My Items"
        path="/public/asset_metadata/info/branding/tabs"
        field="my_items"
        placeholder="My Items"
        {...inputProps}
      />



      <Accordion mt={50} maw={800} variant="contained">
        <Accordion.Item value="photos">
          <Accordion.Control icon={<IconSettings />}>
            { rootStore.l10n.components.forms.advanced_settings }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Checkbox
              INVERTED
              label="Show Leaderboard"
              path="/public/asset_metadata/info/branding"
              field="hide_leaderboard"
              defaultValue={true}
              {...inputProps}
            />

            <Inputs.Checkbox
              label="Disable Secondary Market"
              path="/public/asset_metadata/info/branding"
              field="disable_secondary_market"
              defaultValue={false}
              {...inputProps}
            />

            {
              // Irrelevant if header image is set
              info?.branding?.header_image ? null :
                <Inputs.Checkbox
                  label="Hide Name on Store Page"
                  path="/public/asset_metadata/info/branding"
                  field="hide_name"
                  defaultValue={false}
                  {...inputProps}
                />
            }

            <Inputs.Checkbox
              label="Hide Secondary Sales Stats on Store Product Page"
              path="/public/asset_metadata/info/branding"
              field="hide_secondary_in_store"
              defaultValue={false}
              {...inputProps}
            />

            <Inputs.Checkbox
              label="Disable USDC"
              path="/public/asset_metadata/info/branding"
              field="disable_usdc"
              defaultValue={false}
              {...inputProps}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

    </PageContent>
  );
});

export default MarketplaceGeneralSettings;
