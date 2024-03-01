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

export const MediaPropertySectionItemBaseSpec = {
  id: undefined,
  label: "",
  description: "",
  ...MediaCatalogBaseSpec,
  type: "media" // Filter link, page link, property link
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
  filter: {
    media_catalogs: [],
    tags: [],
    attributes: {}
  }
};

export const MediaPropertySectionItemPageLinkSpec = {
  ...MediaPropertySectionItemBaseSpec,
  page_id: "",
};

export const MediaPropertySectionItemSubpropertyLinkSpec = {
  ...MediaPropertySectionItemBaseSpec,
  subproperty_id: ""
};

export const MediaPropertySectionItemMarketplaceLinkSpec = {
  ...MediaPropertySectionItemBaseSpec,
  marketplace: undefined,
  marketplace_sku: ""
};

export const MediaPropertySectionBaseSpec = {
  id: undefined,
  url_slug: "",
  label: "<New Media Section>",
  description: "",
  type: "manual",
  display: {
    title: "",
    description: "",
    description_rich_text: "",
    display_format: "carousel",
    display_limit: undefined,
    aspect_ratio: ""
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
  select: {
    media_catalog: "",
    tags: [],
    attributes: [],
    schedule: "", // live, upcoming, past, time_range
    start_time: undefined,
    end_time: undefined,
    sort: "start_time"
  }
};

export const MediaPropertyPageSpec = {
  id: undefined,
  url_slug: "",
  label: "<New Page>",
  description: "",
  layout: {
    title: "",
    description: "",
    logo: undefined,
    logo_alt: "",
    header_logo: undefined,
    background_image: undefined,
    background_image_mobile: undefined,
    sections: [],
  }
};

export const MediaPropertySpec = {
  id: undefined,
  url_slug: "",
  name: "",
  description: "",
  image: undefined,
  subproperties: [],
  media_catalogs: [],
  associated_marketplaces: [],
  sections: {},
  pages: {
    main: {
      ...MediaPropertyPageSpec,
      id: "main",
      slug: "main",
      label: "Main Page"
    }
  }
};
