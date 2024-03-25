import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore, rootStore, siteStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";

import {MarketplaceItemSelect} from "@/components/inputs/marketplace/MarketplaceItemInput.jsx";

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

  useEffect(() => {
    // Marketplaces need to be loaded for marketplace selection
    marketplaceStore.LoadMarketplaces();
  }, []);

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
            <MarketplaceItemSelect
              {...inputProps}
              {...l10n.actions.main_button_marketplace_item}
              clearable
              marketplaceSlug={info?.event_info?.event_button_marketplace || info?.marketplace_info?.marketplace_slug}
              subcategory={l10n.categories.main_button_behavior}
              field="event_button_marketplace_sku"
            />
            {
              !info?.event_info?.event_button_marketplace_sku ? null :
                <>
                  <Inputs.Checkbox
                    {...inputProps}
                    {...l10n.actions.main_button_marketplace_redirect_to_owned_item}
                    subcategory={l10n.categories.main_button_behavior}
                    field="event_button_marketplace_redirect_to_owned_item"
                    defaultValue={false}
                  />
                  {
                    !info?.event_info?.event_button_marketplace_redirect_to_owned_item ? null :
                      <Inputs.Select
                        {...inputProps}
                        {...l10n.actions.main_button_marketplace_redirect_page}
                        subcategory={l10n.categories.main_button_behavior}
                        field="event_button_marketplace_redirect_page"
                        options={[
                          { label: "Item Details", value: "item_details" },
                          { label: "Media", value: "media" }
                        ]}
                      />
                  }
                </>
            }
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

            <Title order={3} mb="md" mt={50}>{ l10n.categories.post_login_modal }</Title>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.event_modals.show_post_login}
              subcategory={l10n.categories.post_login_modal}
              path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
              field="show"
              defaultValue={false}
            />

            {
              !info?.event_info?.modal_message_get_started?.post_login?.show ? null :
                <>
                  <Inputs.ImageInput
                    {...inputProps}
                    {...l10n.event_modals.image}
                    subcategory={l10n.categories.post_login_modal}
                    path="/public/asset_metadata/info/event_info/modal_message_get_started/post_login"
                    altTextField="image_alt"
                    fields={[
                      {field: "image"},
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
          </>
      }

      <Title order={3} mt={50}>{ l10n.categories.post_login }</Title>
      <Title order={6} mb="md" color="dimmed">{ l10n.categories.post_login_description }</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.post_login.action}
        path="/public/asset_metadata/info/event_info/post_login"
        subcategory={l10n.categories.post_login}
        field="action"
        defaultValue=""
        options={[
          { label: "None", value: "" },
          { label: "Open Marketplace", value: "marketplace" }
        ]}
      />

      {
        info.event_info.post_login?.action !== "marketplace" ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.post_login.marketplace}
              path="/public/asset_metadata/info/event_info/post_login"
              subcategory={l10n.categories.post_login}
              field="marketplace"
              defaultValue={info?.marketplace_info?.marketplace_slug}
              defaultOnBlankString
              options={marketplaceOptions}
            />
            <MarketplaceItemSelect
              {...inputProps}
              {...l10n.post_login.sku}
              clearable
              marketplaceSlug={info?.event_info?.event_button_marketplace || info?.marketplace_info?.marketplace_slug}
              subcategory={l10n.categories.post_login}
              path="/public/asset_metadata/info/event_info/post_login"
              field="sku"
            />

            {
              !info.event_info.post_login?.sku ? null :
                <>
                  <Inputs.Checkbox
                    {...inputProps}
                    {...l10n.post_login.redirect_to_owned_item}
                    path="/public/asset_metadata/info/event_info/post_login"
                    subcategory={l10n.categories.post_login}
                    field="redirect_to_owned_item"
                    defaultValue={false}
                  />
                  {
                    !info.event_info.post_login?.redirect_to_owned_item ? null :
                      <Inputs.Select
                        {...inputProps}
                        {...l10n.post_login.redirect_page}
                        path="/public/asset_metadata/info/event_info/post_login"
                        subcategory={l10n.categories.post_login}
                        field="redirect_page"
                        defaultValue="item_details"
                        options={[
                          { label: "Item Details", value: "item_details" },
                          { label: "Media", value: "media" }
                        ]}
                      />
                  }
                </>
            }
          </>
      }
    </PageContent>
  );
});

export default SiteActions;
