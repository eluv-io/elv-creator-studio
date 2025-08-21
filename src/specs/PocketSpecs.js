import {MediaCatalogBaseSpec} from "@/specs/MediaCatalogSpecs.js";

export const PocketMediaItemSpec = {
  id: undefined,
  label: "",
  description: "",
  type: "media",
  media_type: "Video",
  media_id: undefined,
  use_media_settings: true,
  display: {
    ...MediaCatalogBaseSpec
  },
  permissions: []
};


export const PocketSpec = {
  id: undefined,
  slug: "",
  name: "",
  description: "",
  image: undefined,
  media_catalogs: [],
  permission_sets: [],
  post_content_screen: {
    enabled: false,
    background: undefined,
    background_mobile: undefined,
    link: ""
  },
  sidebar_config: {
    hide: false,
    banners: [],
    sort: "start_time",
    content: "all",
    manual_content: [],
  },
  media: {},
  meta_tags: {
    site_name: "",
    title: "",
    description: "",
    image: undefined,
    favicon: undefined
  },
};
