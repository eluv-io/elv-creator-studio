import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";
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
  // unused?
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
      <Inputs.Text
        {...inputProps}
        field="name"
        label="Name"
      />
      <Inputs.UUID
        {...inputProps}
        field="sku"
        label="SKU"
      />
      <Inputs.Text
        {...inputProps}
        field="subtitle"
        label="Subtitle"
      />
      <Inputs.Text
        {...inputProps}
        field="subtitle2"
        label="Subtitle 2"
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

      <Inputs.List
        {...inputProps}
        field="tags"
        label="Tags"
        fieldLabel="Tag"
      />

      <Title order={3} mt={50} mb="md">Display Options</Title>

      {
        !item.video ? null :
          <>
            <Inputs.Checkbox
              {...inputProps}
              field="vide_has_audio"
              label="Video has Audio"
            />
            <Inputs.Checkbox
              {...inputProps}
              field="play_on_storefront"
              label="Play Video on Storefront"
            />
          </>
      }

      <Inputs.Checkbox
        {...inputProps}
        INVERTED
        field="hide_available"
        label="Show Available Stock"
      />

      <Title order={3} mt={50} mb="md">Purchase Details</Title>

      <Inputs.Checkbox
        {...inputProps}
        field="for_sale"
        label="Available"
      />
      {
        item.for_sale ? null :
          <Inputs.Checkbox
            {...inputProps}
            field="viewable"
            label="Viewable when not for sale"
          />
      }

      <Inputs.Checkbox
        {...inputProps}
        field="free"
        label="Free"
      />

      {
        item.free ? null :
          <>
            <Inputs.Price
              {...inputProps}
              path={UrlJoin(inputProps.path, "price")}
              field="USD"
              label="Price (USD)"
            />
            <Inputs.Integer
              {...inputProps}
              field="max_per_checkout"
              label="Max Purchasable per Checkout"
            />
            <Inputs.Integer
              {...inputProps}
              field="max_per_user"
              label="Max Purchasable per User"
            />
          </>
      }

      <Inputs.Price
        {...inputProps}
        path={UrlJoin(inputProps.path, "min_secondary_price")}
        field="USD"
        label="Minimum Secondary Market Price (USD)"
      />



      <Title order={3} mt={50} mb="md">Availability</Title>

      <Inputs.DateTime
        {...inputProps}
        field="available_at"
        label="Release Date"
      />
      <Inputs.DateTime
        {...inputProps}
        field="expires_at"
        label="Available Until"
      />

      {
        !item.available_at ? null :
          <Inputs.Checkbox
            {...inputProps}
            field="show_if_unreleased"
            label="Viewable Before Release"
          />
      }

      {
        !item.available_at || !item.show_if_unreleased ? null :
          <Inputs.Checkbox
            {...inputProps}
            field="viewable_if_unreleased"
            label="Item Page Viewable Before Release"
          />
      }


      <Title order={3} mt={50} mb="md">Permissions</Title>
      <Inputs.Checkbox
        {...inputProps}
        field="requires_permissions"
        label="Requires Permissions to View"
      />

      {
        !item.requires_permissions ? null :
          <Inputs.Checkbox
            {...inputProps}
            field="show_if_unauthorized"
            label="Show if Unauthorized"
          />
      }
      {
        !item.requires_permissions || !item.show_if_unauthorized ? null :
          <>
            <Inputs.Text
              {...inputProps}
              field="permission_message"
              label="Permission Denied Message"
            />
            <Inputs.TextArea
              {...inputProps}
              field="permission_description"
              label="Permission Denied Description"
            />
          </>
      }


      <Title order={3} mt={50} mb="md">Analytics</Title>

      <Inputs.Checkbox
        {...inputProps}
        field="use_analytics"
        label="Use Analytics for this Item"
      />

      {
        !item.use_analytics ? null :
          <>
            <Title order={5} mt={20} mb="md">Item Page View Analytics</Title>
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "page_view_analytics")}
              field="google_conversion_label"
              label="Google Conversion Label"
            />
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "page_view_analytics")}
              field="google_conversion_id"
              label="Google Conversion ID"
            />
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "page_view_analytics")}
              field="facebook_event_id"
              label="Facebook Event ID"
            />
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "page_view_analytics")}
              field="twitter_event_id"
              label="Twitter Event ID"
            />
            <Title order={5} mt={40} mb="md">Item Purchase Analytics</Title>
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "purchase_analytics")}
              field="google_conversion_label"
              label="Google Conversion Label"
            />
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "purchase_analytics")}
              field="google_conversion_id"
              label="Google Conversion ID"
            />
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "purchase_analytics")}
              field="facebook_event_id"
              label="Facebook Event ID"
            />
            <Inputs.Text
              {...inputProps}
              path={UrlJoin(inputProps.path, "purchase_analytics")}
              field="twitter_event_id"
              label="Twitter Event ID"
            />
          </>
      }
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
