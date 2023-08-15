import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/common/Inputs";
import UrlJoin from "url-join";
import {Title} from "@mantine/core";
import {ItemImage} from "Components/common/Misc";
import {FormatUSD} from "Helpers/Misc.js";

const itemSpec = {
  sku: "",
  type: "nft",
  nft_template: undefined,
  name: "<New Item>",
  subtitle: "",
  subtitle_2: "",
  description: "",
  description_rich_text: "",
  for_sale: false,
  free: false,
  price: {
    USD: undefined
  },
  min_secondary_price: {
    USD: undefined
  },
  max_per_checkout: undefined,
  max_per_user: undefined,
  viewable: false,
  hide_available: false,
  hide_description_on_card_face: false,
  video_has_audio: false,
  play_on_storefront: false,
  show_if_unreleased: false,
  viewable_if_unreleased: false,
  requires_permissions: false,
  permission_message: "",
  permission_description: "",
  show_if_unauthorized: false,
  available_at: undefined,
  expires_at: undefined,
  image: undefined,
  video: undefined,
  tags: [],
  use_analytics: false,
  page_view_analytics: {
    google_conversion_label: "",
    google_conversion_id: "",
    facebook_event_id: "",
    twitter_event_id: ""
  },
  purchase_analytics: {
    google_conversion_label: "",
    google_conversion_id: "",
    facebook_event_id: "",
    twitter_event_id: ""
  }
};

export const MarketplaceItem = observer(() => {
  const { marketplaceId, sku } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};
  const itemIndex = info.items?.findIndex(item => item.sku === sku);
  const item = info.items[itemIndex];

  if(!item) {
    return (
      <div>
        Item not found
      </div>
    );
  }
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin("/public/asset_metadata/info/items", itemIndex.toString())
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Items - ${item.name}`}
      section="marketplace"
      backLink={UrlJoin("/marketplaces", marketplaceId, "items")}
      useHistory
    >
      <Title order={3} mt={50} mb="md">Basic Info</Title>
      <Inputs.SingleImageInput
        {...inputProps}
        label="Image"
        field="image"
      />
      <Inputs.UUID
        {...inputProps}
        field="sku"
        label="SKU"
      />
      <Inputs.Text
        {...inputProps}
        field="name"
        label="Name"
      />
      <Inputs.TextArea
        {...inputProps}
        field="description"
        label="Description"
      />
      <Inputs.RichText
        {...inputProps}
        field="description_rich_text"
        label="Description (Rich Text)"
      />

      <Title order={3} mt={50} mb="md">Voting Event Settings</Title>

    </PageContent>
  );
});

const MarketplaceItems = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Items`}
      section="marketplace"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        path="/public/asset_metadata/info"
        field="items"
        fieldLabel="Item"
        idField="sku"
        filterable
        Filter={({value, filter}) => value.name?.toLowerCase().includes(filter)}
        columns={[
          { field: "image", width: "80px", render: item => <ItemImage item={item} width={200} imageProps={{width: 50, height: 50, radius: "md"}} /> },
          { label: "Name", field: "name", render: item => item.name || item.nft_template?.nft?.name },
          { label: "Price", field: "price", width: "100px", render: item => item.free ? "Free" : FormatUSD(item.price.USD) },
        ]}
        newEntrySpec={itemSpec}
      />
    </PageContent>
  );
});

export default MarketplaceItems;
