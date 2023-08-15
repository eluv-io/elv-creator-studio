import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/common/Inputs";
import {Title} from "@mantine/core";

const MarketplaceAnalytics = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Analytics`}
      section="marketplace"
      useHistory
    >
      <Title order={3} mt={50} mb="md">General Analytics</Title>
      <Inputs.List
        {...inputProps}
        path="/public/asset_metadata/info"
        field="analytics_ids"
        label="Analytics Collections"
        fieldLabel="Analytics Collection"
        fields={[
          {
            InputComponent: Inputs.Text,
            field: "label",
            label: "Collection Label",
          },
          {
            InputComponent: Inputs.List,
            field: "ids",
            label: "Analytics IDs",
            fieldLabel: "Analytics Key",
            fields: [
              {
                InputComponent: Inputs.Select,
                field: "type",
                label: "Analytics Type",
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
                InputComponent: Inputs.Text,
                field: "id",
                label: "ID"
              }
            ]
          }
        ]}
      />

      <Title order={3} mt={50} mb="md">Storefront Page View Analytics</Title>

      <Inputs.Text
        {...inputProps}
        path="/public/asset_metadata/info/storefront_page_view_analytics"
        field="google_conversion_label"
        label="Google Conversion Label"
      />
      <Inputs.Text
        {...inputProps}
        path="/public/asset_metadata/info/storefront_page_view_analytics"
        field="google_conversion_id"
        label="Google Conversion ID"
      />
      <Inputs.Text
        {...inputProps}
        path="/public/asset_metadata/info/storefront_page_view_analytics"
        field="facebook_event_id"
        label="Facebook Event ID"
      />
      <Inputs.Text
        {...inputProps}
        path="/public/asset_metadata/info/storefront_page_view_analytics"
        field="twitter_event_id"
        label="Twitter Event ID"
      />
    </PageContent>
  );
});

export default MarketplaceAnalytics;
