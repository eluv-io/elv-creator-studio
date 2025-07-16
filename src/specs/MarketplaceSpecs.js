// NOTE: Default value only applies when field is undefined, not ""

export const MarketplaceItemSpec = {
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

export const MarketplaceCollectionSpec = {
  sku: undefined,
  name: "<New Collection>",
  collection_header: "",
  collection_subheader: "",
  collection_icon: undefined,
  collection_banner: undefined,
  items: [],
  redeemable: false,
  redeem_items: [],
  redeem_animation: undefined,
  redeem_animation_mobile: undefined,
  reveal_animation: undefined,
  reveal_animation_mobile: undefined,
  hide_text: false
};
