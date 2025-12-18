export const PocketSidebarTabGroupSpec = {
  id: undefined,
  label: "<New Content Group>",
  description: "",
  title: "",
  type: "manual",
  content: [],
  select: {
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
  }
};

export const PocketSidebarTabSpec = {
  id: undefined,
  label: "<New Content Tab>",
  description: "",
  title: "",
  groups: [],
  override_bumpers: false,
  bumpers: []
};

export const PocketBumperSpec = {
  id: undefined,
  label: "<New Content Bumper>",
  description: "",
  position: "before",
  duration: 5,
  background: undefined,
  background_mobile: undefined,
  video: undefined,
  link: ""
};

export const PocketSpec = {
  id: undefined,
  slug: "",
  name: "",
  description: "",
  image: undefined,
  media_catalogs: [],
  permission_sets: [],
  bumpers: [],
  sidebar_config: {
    banners: [],
    tabs: [
      {
        ...PocketSidebarTabSpec,
        id: "main",
        label: "Main Content"
      }
    ]
  },
  meta_tags: {
    site_name: "",
    title: "",
    description: "",
    image: undefined,
    favicon: undefined
  },
};
