import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore, rootStore, siteStore, tenantStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Accordion, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";

import {IconSettings} from "@tabler/icons-react";
import {MarketplaceItemSelect} from "@/components/inputs/MarketplaceItemInput";

const SiteActions = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/info/event_info"
  };

  const selectedMarketplaceSlug = info?.event_info?.event_button_marketplace;
  const selectedMarketplace = marketplaceStore.allMarketplaces?.find(marketplace => marketplace.marketplaceSlug === selectedMarketplaceSlug);

  useEffect(() => {
    // Marketplaces need to be loaded for marketplace selection
    marketplaceStore.LoadMarketplaces();
  }, []);

  useEffect(() => {
    if(!selectedMarketplace) { return; }

    marketplaceStore.LoadMarketplace({marketplaceId: selectedMarketplace.objectId});
  }, [selectedMarketplace]);

  const marketplaceOptions = (marketplaceStore.allMarketplaces || [])
    .map(marketplace => ({
      label: marketplaceStore.marketplaces[marketplace.objectId]?.metadata?.public?.asset_metadata?.info?.name || marketplace.brandedName,
      value: marketplace.marketplaceSlug
    }));

  return (
    <PageContent
      title={`${info.name || site.name || "Site"} - ${l10n.categories.actions}`}
      section="site"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.actions }</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.actions.main_button_behavior}
        subcategory={l10n.categories.main_button_behavior}
        field="event_button_action"
        defaultValue="sign_in"
        options={[
          { label: "Sign In", value: "sign_in"},
          { label: "Open Marketplace", value: "marketplace"},
          { label: "Show 'Get Started' Modal", value: "modal"},
          { label: "Link", value: "link"},
          { label: "Hidden", value: "hidden"},
        ]}
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.actions.main_button_behavior_post_login}
        subcategory={l10n.categories.main_button_behavior}
        field="event_button_action_post_login"
        defaultValue="sign_in"
        options={[
          { label: "Default", value: ""},
          { label: "Open Marketplace", value: "marketplace"},
          { label: "Show 'After Login' Modal", value: "modal"},
          { label: "Link", value: "link"},
          { label: "Hidden", value: "hidden"},
        ]}
      />

      {
        ![
          info?.event_info?.event_button_action,
          info?.event_info?.event_button_action_post_login
        ].includes("link") ? null :
          <Inputs.URL
            {...inputProps}
            {...l10n.actions.main_button_link}
            subcategory={l10n.categories.main_button_behavior}
            field="event_button_link"
          />
      }

      {
        ![
          info?.event_info?.event_button_action,
          info?.event_info?.event_button_action_post_login
        ].includes("marketplace") ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.actions.main_button_marketplace}
              subcategory={l10n.categories.main_button_behavior}
              field="event_button_marketplace"
              defaultValue={info?.marketplace_info?.marketplace_slug}
              defaultOnBlankString
              options={marketplaceOptions}
            />

            {
              !selectedMarketplace ? null :
                <MarketplaceItemSelect
                  {...inputProps}
                  {...l10n.actions.main_button_marketplace_item}
                  clearable
                  marketplaceId={selectedMarketplace?.objectId}
                  subcategory={l10n.categories.main_button_behavior}
                  field="event_button_marketplace_sku"
                />
            }
            {
              !info?.event_info?.event_button_marketplace_sku ? null :
                <Inputs.Checkbox
                  {...inputProps}
                  {...l10n.actions.main_button_marketplace_redirect_to_owned_item}
                  subcategory={l10n.categories.main_button_behavior}
                  field="event_button_marketplace_redirect_to_owned_item"
                  defaultValue={false}
                />
            }
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.actions.post_login_show_marketplace}
              subcategory={l10n.categories.main_button_behavior}
              field="post_login_show_marketplace"
              defaultValue={false}
            />
          </>
      }

      {
        info?.event_info?.event_button_action !== "modal" ? null :
          <>
            <Title order={3} mb="md" mt={50}>{ l10n.categories.get_started_modal }</Title>

            <Inputs.Hidden
              {...inputProps}
              subcategory={l10n.categories.get_started_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started"
              field="show"
              defaultValue={true}
            />
            <Inputs.ImageInput
              {...inputProps}
              {...l10n.event_modals.image}
              subcategory={l10n.categories.get_started_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started"
              altTextField="image_alt"
              fields={[
                { field: "image" },
              ]}
            />
            <Inputs.RichText
              {...inputProps}
              {...l10n.event_modals.message}
              subcategory={l10n.categories.get_started_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started"
              field="message"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.event_modals.button_text}
              subcategory={l10n.categories.get_started_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started"
              field="button_text"
            />
            <Inputs.URL
              {...inputProps}
              {...l10n.event_modals.button_link}
              subcategory={l10n.categories.get_started_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started"
              field="button_link"
            />
            <Inputs.SingleImageInput
              {...inputProps}
              {...l10n.event_modals.button_image}
              subcategory={l10n.categories.get_started_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started"
              field="button_image"
            />
          </>
      }
      {
        info?.event_info?.event_button_action_post_login !== "modal" ? null :
          <>
            <Title order={3} mb="md" mt={50}>{ l10n.categories.post_login_modal }</Title>

            <Inputs.Hidden
              {...inputProps}
              subcategory={l10n.categories.post_login_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
              field="show"
              defaultValue={true}
            />
            <Inputs.ImageInput
              {...inputProps}
              {...l10n.event_modals.image}
              subcategory={l10n.categories.post_login_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
              altTextField="image_alt"
              fields={[
                { field: "image" },
              ]}
            />
            <Inputs.RichText
              {...inputProps}
              {...l10n.event_modals.message}
              subcategory={l10n.categories.post_login_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
              field="message"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.event_modals.button_text}
              subcategory={l10n.categories.post_login_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
              field="button_text"
            />
            <Inputs.URL
              {...inputProps}
              {...l10n.event_modals.button_link}
              subcategory={l10n.categories.post_login_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
              field="button_link"
            />
            {
              info?.event_info?.modal_message_get_started?.post_login?.button_link ? null :
                <Inputs.Checkbox
                  {...inputProps}
                  {...l10n.event_modals.show_marketplace}
                  subcategory={l10n.categories.post_login_modal}
                  path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
                  field="show_marketplace"
                  defaultValue={false}
                />
            }
            <Inputs.SingleImageInput
              {...inputProps}
              {...l10n.event_modals.button_image}
              subcategory={l10n.categories.get_started_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
              field="button_image"
            />
          </>
      }
    </PageContent>
  );
});

export default SiteActions;
