/*
Media Catalog 1
Media Catalog 2

Champion's League (Property)
Europa League (Property)


Property
 - Subproperties:
   - Champion's League
   - Europa League

 - Media Catalogs
   - Media Catalog 1
   - Media Catalog 2

 - Pages
  - Main (2024)
    - bg image, title, logo, etc.
    - Sections:
      -> Live Now
      -> Upcoming
      -> Previous Matches
      -> National Associations
      -> More Clubs and Competitors
  - 2023
    - bg image, title, logo, etc.
    - Sections:
      -> Highlights (2023)
      -> All Matches (2023)
  - Country


  -> Country page, filtered by attributes=[{"association": "albania"}]
  ...

 - Sections
   - Live now (automatic, schedule="live", tags=[2024 season, Live Event])
   - Upcoming (automatic, schedule="upcoming", tags=[2024 season])
   - Watch previous matches (2024) (automatic, schedule="past", tags=[2024 Season])
   - All Matches (2023) (automatic, schedule="past", tags=[2023 Season])
   - Highlights (2023) (manual)
   - Previous Seasons (manual)
     - 2023 - (Link to 2023 page)
     - 2022 - (Link to 2022 page)
     ...
   - National Associations
     - Albania (Link to Albania page, or all content page filtered by tag=["albania"] or attributes=[{"association": "albania"}]
     ...
   - More Clubs and Competitors
     - Champion's League (Link to subproperty main page)
     - Europa League (Link to subproperty main page)

  - Filtered view
    - filtered by tags, attributes dates, etc.
    - can be organized by attribute


  media catalog:
    attributes:
      stage:
        Week 1
        Week 2
        ...
        Wildcard
        ...
 */

import {MediaCatalogBaseSpec} from "@/specs/MediaCatalogSpecs.js";

/*
Hide
Disable
Show Page
Purchase Gate
 */

const MediaPropertyPermissionSpec = {
  permissions: {
    behavior: "",
    alternate_page_id: undefined,
    permission_item_ids: []
  }
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
  secondary_filter_attribute: "",
  image: undefined
};


export const MediaPropertyFilterSpec = {
  media_catalog: "",
  content_type: "",
  media_types: [],
  tags: [],
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
  ...MediaPropertyPermissionSpec
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

export const MediaPropertySectionBaseSpec = {
  id: undefined,
  url_slug: "",
  label: "<New Media Section>",
  description: "",
  type: "manual",
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
    background_image: undefined,
    background_image_mobile: undefined
  },
  ...MediaPropertyPermissionSpec
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

export const MediaPropertyPageActionSpec = {
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
  ...MediaPropertyPermissionSpec,
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
    property_permission_behavior: "show_alternate_page"
  },
  permission_behavior: "hide",
  search: {
    primary_filter: "",
    filter_options: [],
    group_by: "",
    enable_advanced_search: false,
    advanced_options: []
  },
  domain: {
    custom_domain: ""
  },
  login: {
    styling: {},
    terms: {},
    consent: {}
  },
  pages: {},
  page_ids: {
    main: undefined
  },
  ...MediaPropertyPermissionSpec,
};
