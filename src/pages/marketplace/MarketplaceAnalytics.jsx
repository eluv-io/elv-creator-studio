import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore ,marketplaceStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";

const MarketplaceAnalytics = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = { store: marketplaceStore, objectId: marketplaceId, category: l10n.categories.analytics };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Analytics`}
      section="marketplace"
      useHistory
    >
      <Title order={3} mt={50} mb="md">{l10n.categories.general_analytics}</Title>
      <Inputs.List
        {...inputProps}
        {...l10n.analytics.analytics_collections}
        subcategory={l10n.categories.general_analytics}
        showBottomAddButton
        path="/public/asset_metadata/info"
        field="analytics_ids"
        fields={[
          {
            ...l10n.analytics.collection_label,
            InputComponent: Inputs.Text,
            field: "label",
          },
          {
            ...l10n.analytics.analytics_ids,
            InputComponent: Inputs.List,
            field: "ids",
            fields: [
              {
                ...l10n.analytics.analytics_type,
                InputComponent: Inputs.Select,
                field: "type",
                options: [
                  "Google Analytics ID",
                  "Google Tag Manager ID",
                  "Facebook Pixel ID",
                  "App Nexus Segment ID",
                  "App Nexus Pixel ID",
                  "Twitter Pixel ID"
                ]
              },
              {
                ...l10n.analytics.id,
                InputComponent: Inputs.Text,
                field: "id",
                label: "ID"
              }
            ]
          }
        ]}
      />

      <Title order={3} mt={50} mb="md">{l10n.categories.storefront_analytics}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.google_conversion_label}
        subcategory={l10n.categories.storefront_analytics}
        path="/public/asset_metadata/info/storefront_page_view_analytics"
        field="google_conversion_label"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.google_conversion_id}
        subcategory={l10n.categories.storefront_analytics}
        path="/public/asset_metadata/info/storefront_page_view_analytics"
        field="google_conversion_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.facebook_event_id}
        subcategory={l10n.categories.storefront_analytics}
        path="/public/asset_metadata/info/storefront_page_view_analytics"
        field="facebook_event_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.twitter_event_id}
        subcategory={l10n.categories.storefront_analytics}
        path="/public/asset_metadata/info/storefront_page_view_analytics"
        field="twitter_event_id"
      />
    </PageContent>
  );
});

export default MarketplaceAnalytics;
