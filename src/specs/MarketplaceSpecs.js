// NOTE: Default value only applies when field is undefined, not ""

export const MarketplaceItemDiscountSpec = {
  label: "",
  code: "",
  sku: "",
  percent: 0,
  price: {},
  periods: 0,
};

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

export const MarketplaceSpec = {
  tenant_id: undefined,
  tenant_slug: undefined,
  preview_password_digest: "",
  branding: {
    name: "",
    show: false,
    external_link: "",
    notification: {
      active: false,
      header: "",
      text: "",
    },
    description: "",
    header_logo: undefined,
    header_image: undefined,
    card_banner_front: undefined,
    card_banner_back: undefined,
    background: undefined,
    background_mobile: undefined,
    disable_secondary_market: false,
    hide_leaderboard: false,
    hide_global_navigation: false,
    hide_name: false,
    hide_secondary_in_store: false,
    disable_usdc: false,
    use_tenant_styling: false,
    tabs: {
      store: "",
      stores: "",
      listings: "",
      my_items: ""
    },
    additional_marketplaces: [],
    tags: [],
    text_justification: "Left",
    item_text_justification: "Left",
    color_scheme: "Light",
    custom_css: "",
  },
  items: [],
  banners: [],
  footer_links: [],
  storefront: {
    header: "",
    subheader: "",
    background: undefined,
    background_mobile: undefined,
    show_rich_text_descriptions: false,
    show_card_cta: false,

    purchase_animation: undefined,
    purchase_animation_mobile: undefined,
    reveal_animation: undefined,
    reveal_animation_mobile: undefined,
    hide_text: false,
    skip_reveal: true,
  },
  collections_info: {
    header: "<New Collection>",
    subheader: "",
    icon: undefined,
    banner: undefined,
    show_on_storefront: false,
    redeem_animation: undefined,
    redeem_animation_mobile: undefined,
    reveal_animation: undefined,
    reveal_animation_mobile: undefined,
    hide_text: false
  },
  collections: [],
  voting_events: [],
  terms: "",
  terms_document: {
    link_text: "",
    terms_document: undefined
  },
  login_customization: {
    logo: undefined,
    background: undefined,
    background_mobile: undefined,
    large_logo_mode: false,
    log_in_button: {
      text_color: { color: "" },
      background_color: { color: "" },
      border_color: { color: "" }
    },
    sign_up_button: {
      text_color: { color: "" },
      background_color: { color: "" },
      border_color: { color: "" }
    },
    require_consent: true,
    default_consent: true,
    require_email_verification: true,
    disable_third_party: false,
    custom_consent: {
      enabled: false,
      type: "Modal",
      consent_modal_header: "",
      button_text: "",
      options: []
    }
  },
  payment_options: {
    wallet_balance: {
      enabled: true,
    },
    stripe: {
      enabled: true
    },
    ebanx: {
      enabled: false,
      preferred: false,
      pix_enabled: false,
      allowed_countries: []
    },
    coinbase: {
      enabled: true
    },
    circle: {
      enabled: false
    }
  },
  localizations: [],
  display_currencies: [],
  default_display_currency: ""
};



export default MarketplaceSpec;
