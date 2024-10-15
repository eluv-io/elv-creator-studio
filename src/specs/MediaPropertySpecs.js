import {MediaCatalogBaseSpec} from "@/specs/MediaCatalogSpecs.js";

export const MediaPropertyFooterItemSpec = {
  id: undefined,
  type: "link",
  label: "",
  text: "",
  url: "",
  image: "",
  image_alt: "",
  content_rich_text: "",
  content_html: undefined
};

const MediaPropertyPermissionSpec = {
  behavior: "",
  alternate_page_id: undefined,
  secondary_market_purchase_option: "",
  permission_item_ids: []
};

export const MediaPropertyLoginConsentSpec = {
  key: "",
  message: "",
  initially_checked: true,
  required: false
};

export const MediaPropertyAdvancedSearchOptionSpec = {
  type: "tags",
  title: "",
  attribute: undefined,
  tags: [],
  tag_display: "select"
};

export const MediaPropertySearchFilterSpec = {
  primary_filter_value: "",
  primary_filter_image: undefined,
  secondary_filter_attribute: "",
  secondary_filter_spec: "automatic",
  secondary_filter_style: "text",
  secondary_filter_options: [],
};

export const MediaPropertySearchSecondaryFilterSpec = {
  secondary_filter_value: "",
  image: undefined
};

export const MediaPropertyFilterSpec = {
  media_catalog: "",
  content_type: "",
  media_types: [],
  attributes: [],
  attribute_values: {},
  date: undefined,
  schedule: "", // live, upcoming, past, time_range
  start_time: undefined,
  end_time: undefined,
  sort: "start_time"
};

export const MediaPropertySectionItemBaseSpec = {
  id: undefined,
  label: "",
  description: "",
  type: "media", // Filter link, page link, property link
  display: {
    ...MediaCatalogBaseSpec,
    banner_image: undefined,
    banner_image_mobile: undefined
  },
  permissions: {
    ...MediaPropertyPermissionSpec
  }
};

export const MediaPropertySectionItemMediaSpec = {
  ...MediaPropertySectionItemBaseSpec,
  media_id: "",
  media_type: "",
  expand: false,
  use_media_settings: true
};

export const MediaPropertySectionItemFilterSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "filter_link",
  select: MediaPropertyFilterSpec
};

export const MediaPropertySectionItemPageLinkSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "page_link",
  page_id: "",
};

export const MediaPropertySectionItemPropertyLinkSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "property_link",
  property_id: "",
  property_page_id: "",
};

export const MediaPropertySectionItemSubpropertyLinkSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "subproperty_link",
  subproperty_id: "",
  subproperty_page_id: "",
};

export const MediaPropertySectionItemMarketplaceLinkSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "marketplace_link",
  marketplace: undefined,
  marketplace_sku: ""
};

export const MediaPropertySectionItemRedeemableOfferSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "redeemable_offer",
  marketplace: undefined,
  marketplace_sku: "",
  offer_id: ""
};

export const MediaPropertySectionItemExternalLinkSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "external_link",
  url: ""
};

export const MediaPropertySectionItemPurchaseSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "item_purchase",
  items: []
};

export const MediaPropertySectionItemPurchaseItemSpec = {
  id: undefined,
  title: "",
  description: "",
  marketplace: undefined,
  marketplace_sku: "",
  use_custom_image: false,
  image: undefined
};

export const MediaPropertySectionItemVisualSpec = {
  ...MediaPropertySectionItemBaseSpec,
  type: "visual_only"
};

export const MediaPropertySectionBaseSpec = {
  id: undefined,
  url_slug: "",
  label: "<New Media Section>",
  description: "",
  type: "manual",
  tags: [],
  filters: {
    primary_filter: "",
    filter_options: [],
    group_by: "",
  },
  display: {
    title: "",
    subtitle: "",
    description: "",
    description_rich_text: "",
    display_format: "carousel",
    display_limit: undefined,
    justification: "left",
    aspect_ratio: "Landscape",
    content_display_text: "titles",
    inline_background_color: "",
    inline_background_image: undefined,
    inline_background_image_mobile: undefined,
    background_image: undefined,
    background_image_mobile: undefined
  },
  permissions: {
    ...MediaPropertyPermissionSpec
  }
};

export const MediaPropertySectionManualSpec = {
  ...MediaPropertySectionBaseSpec,
  type: "manual",
  content: []
};

export const MediaPropertySectionAutomaticSpec = {
  ...MediaPropertySectionBaseSpec,
  type: "automatic",
  select: MediaPropertyFilterSpec
};

export const MediaPropertyHeroItemSpec = {
  id: undefined,
  label: "<New Hero Item>",
  description: "",
  display: {
    title: "",
    description: "",
    logo: undefined,
    logo_alt: "",
    background_image: undefined,
    background_image_mobile: undefined
  },
  actions: []
};

export const MediaPropertyHeroSectionSpec = {
  ...MediaPropertySectionBaseSpec,
  display: {
    ...MediaPropertySectionBaseSpec.display,
    display_format: "hero"
  },
  label: "<New Hero Section>",
  type: "hero",
  allow_overlap: true,
  hero_items: [],
  permissions: {
    ...MediaPropertyPermissionSpec
  }
};

export const MediaPropertyContainerSectionSpec = {
  ...MediaPropertySectionBaseSpec,
  display: {
    ...MediaPropertySectionBaseSpec,
    display_format: "container"
  },
  label: "<New Container Section>",
  type: "container",
  filter_tags: [],
  sections: [],
  permissions: {
    ...MediaPropertyPermissionSpec
  }
};

export const MediaPropertyActionSpec = {
  id: undefined,
  label: "<New Action>",
  description: "",
  text: "",
  colors: {
    background_color: "#FFFFFF",
    text_color: "#000000",
    border_color: "#000000",
  },
  border_radius: 5,
  icon: undefined,
  behavior: "sign_in",
  visibility: "unauthenticated",
  permissions: []
};

export const MediaPropertyPageSpec = {
  id: undefined,
  url_slug: "",
  label: "<New Page>",
  description: "",
  actions: [],
  layout: {
    title: "",
    description: "",
    logo: undefined,
    logo_alt: "",
    header_logo: undefined,
    background_image: undefined,
    background_image_mobile: undefined,
    sections: [],
  },
  permissions: {
    page_permissions: [],
    page_permission_behavior: "show_alternate_page",
    page_permissions_alternate_page_id: "",
    page_permissions_secondary_market_purchase_option: "",
    ...MediaPropertyPermissionSpec
  }
};

export const MediaPropertySubpropertySpec = {
  property_id: undefined,
  title: "",
  icon: undefined,
  logo: undefined,
  permission_item_ids: []
};

export const MediaPropertySpec = {
  id: undefined,
  url_slug: "",
  name: "",
  description: "",
  image: undefined,
  header_logo: undefined,
  subproperties: [],
  media_catalogs: [],
  associated_marketplaces: [],
  permission_sets: [],
  attributes: [],
  footer: {
    items: [],
    rich_text: ""
  },
  sections: {},
  media_sidebar: {
    show_media_sidebar: false,
    sidebar_content: "current_section",
    default_sidebar_content: "none",
    default_sidebar_content_section_id: ""
  },
  meta_tags: {
    site_name: "",
    title: "",
    description: "",
    image: undefined,
    favicon: undefined
  },
  permissions: {
    property_permissions: [],
    property_permission_behavior: "show_alternate_page",
    property_permissions_alternate_page_id: "",
    property_permissions_secondary_market_purchase_option: "",
    search_permission_behavior: "hide",
    search_permissions_alternate_page_id: "",
    search_permissions_secondary_market_purchase_option: "",
    ...MediaPropertyPermissionSpec
  },
  permission_behavior: "hide",
  search: {
    primary_filter: "",
    primary_filter_style: "box",
    filter_options: [],
    group_by: "",
    enable_advanced_search: false,
    advanced_options: []
  },
  domain: {
    custom_domain: "",
    disable_registration: false,
    features: {
      discover: true,
      gifting: true,
      secondary_marketplace: true
    },
    provider: "ory"
  },
  login: {
    styling: {},
    terms: {},
    consent: {}
  },
  pages: {},
  page_ids: {
    main: undefined
  }
};
