import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, siteStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";

const SiteSearch = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = { store: siteStore, objectId: siteId, category: l10n.categories.search_and_analytics };

  return (
    <PageContent
      title={`${info?.name || "Site"} - ${l10n.categories.search_and_analytics}`}
      section="site"
      useHistory
    >
      <Title order={3}>{l10n.categories.search}</Title>
      <Title order={6} mb="md" color="dimmed">{l10n.search.search_description}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.search.name}
        subcategory={l10n.categories.search}
        path="/public/asset_metadata/info/search_data"
        field="name"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.search.description}
        subcategory={l10n.categories.search}
        path="/public/asset_metadata/info/search_data"
        field="description"
      />

      <Inputs.List
        {...inputProps}
        {...l10n.search.images}
        maw={600}
        subcategory={l10n.categories.search}
        path="/public/asset_metadata/info/search_data"
        field="images"
        Component={Inputs.SingleImageInput}
        inputProps={{mx: "auto"}}
      />

      <Inputs.List
        {...inputProps}
        {...l10n.search.organizations}
        maw={600}
        subcategory={l10n.categories.organizations}
        path="/public/asset_metadata/info/search_data"
        field="organizers"
        fields={[
          {
            ...l10n.search.organization_name,
            InputComponent: Inputs.Text,
            field: "name",
          },
          {
            ...l10n.search.organization_url,
            InputComponent: Inputs.URL,
            field: "url",
          },
          {
            ...l10n.search.organization_image,
            InputComponent: Inputs.SingleImageInput,
            field: "image",
            mx: "auto"
          },
        ]}
      />

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

      <Title order={3} mt={50} mb="md">{l10n.categories.site_analytics}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.google_conversion_label}
        subcategory={l10n.categories.site_analytics}
        path="/public/asset_metadata/info/landing_page_view_analytics"
        field="google_conversion_label"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.google_conversion_id}
        subcategory={l10n.categories.site_analytics}
        path="/public/asset_metadata/info/landing_page_view_analytics"
        field="google_conversion_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.facebook_event_id}
        subcategory={l10n.categories.site_analytics}
        path="/public/asset_metadata/info/landing_page_view_analytics"
        field="facebook_event_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.twitter_event_id}
        subcategory={l10n.categories.site_analytics}
        path="/public/asset_metadata/info/landing_page_view_analytics"
        field="twitter_event_id"
      />

      <Title order={3} mt={50} mb="md">{l10n.categories.marketplace_analytics}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.google_conversion_label}
        subcategory={l10n.categories.marketplace_analytics}
        path="/public/asset_metadata/info/marketplace_page_view_analytics"
        field="google_conversion_label"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.google_conversion_id}
        subcategory={l10n.categories.marketplace_analytics}
        path="/public/asset_metadata/info/marketplace_page_view_analytics"
        field="google_conversion_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.facebook_event_id}
        subcategory={l10n.categories.marketplace_analytics}
        path="/public/asset_metadata/info/marketplace_page_view_analytics"
        field="facebook_event_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.analytics.twitter_event_id}
        subcategory={l10n.categories.marketplace_analytics}
        path="/public/asset_metadata/info/marketplace_page_view_analytics"
        field="twitter_event_id"
      />
    </PageContent>
  );
});

export default SiteSearch;
