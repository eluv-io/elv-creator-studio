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



export const MediaPropertySectionBaseSpec = {
  id: undefined,
  url_slug: "",
  content_spec: "manual",
  display: {
    mode: "carousel", // or grid
    display_limit: undefined,
    hide_text: false,
    aspect_ratio: ""
  }
};

export const MediaPropertySectionManualSpec = {
  ...MediaPropertySectionBaseSpec,
  content: []
};

export const MediaPropertySectionAutomaticSpec = {
  ...MediaPropertySectionBaseSpec,
  tags: [],
  attributes: [],
  schedule: "", // live, upcoming, past, time_range
  start_time: undefined,
  end_time: undefined,
  sort: "start_time"
};

export const MediaPropertyPageSpec = {
  id: undefined,
  url_slug: "",
  layout: {
    title: "",
    description: "",
    logo: undefined,
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
  sub_properties: [],
  media_catalogs: [],
  sections: {},
  pages: {

  }
};
