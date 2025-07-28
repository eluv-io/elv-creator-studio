export const MediaCatalogAdditionalViewSpec = {
  media_link: undefined,
  label: ""
};

export const MediaCatalogPermissionSpec = {
  permission_item_id: undefined
};

export const MediaCatalogGalleryItemSpec = {
  id: undefined,
  label: "<New Gallery Item>",
  title: "",
  subtitle: "",
  description: "",
  image: undefined,
  thumbnail: undefined,
  thumbnail_aspect_ratio: "Square",
  video: undefined
};

export const MediaCatalogBaseSpec = {
  id: undefined,
  label: "",
  title: "",
  catalog_title: "",
  subtitle: "",
  headers: [],
  description: "",
  description_rich_text: "",
  background_image: undefined,
  background_image_mobile: undefined,
  thumbnail_image_portrait: undefined,
  thumbnail_image_square: undefined,
  thumbnail_image_landscape: undefined,
  tags: [],
  attributes: {},
  public: false,
  permissions: []
};

export const MediaCatalogAttributeBaseSpec = {
  id: undefined,
  title: "",
  tags: []
};

const MediaCatalogMediaBaseSpec = {
  type: "media",
  viewed_settings: {
    title: "",
    subtitle: "",
    headers: [],
    description: "",
    description_rich_text: ""
  }
};

export const MediaCatalogMediaImageSpec = {
  ...MediaCatalogBaseSpec,
  ...MediaCatalogMediaBaseSpec,
  media_type: "Image",
  title: "<New Image>",
  catalog_title: "<New Image>",
  image_aspect_ratio: "Square",
  full_image: undefined,
  associated_media: [],
};

export const MediaCatalogMediaVideoSpec = {
  ...MediaCatalogBaseSpec,
  ...MediaCatalogMediaBaseSpec,
  title: "<New Video>",
  catalog_title: "<New Video>",
  media_type: "Video",
  media_link: undefined,
  live_video: false,
  date: undefined,
  start_time: undefined,
  end_time: undefined,
  player_profile: undefined,
  offerings: [],
  associated_media: [],
  override_settings_when_viewed: false,
  poster_image: undefined
};

export const MediaCatalogMediaGallerySpec = {
  ...MediaCatalogBaseSpec,
  ...MediaCatalogMediaBaseSpec,
  media_type: "Gallery",
  title: "<New Gallery>",
  catalog_title: "<New Gallery>",
  background_image: undefined,
  background_image_mobile: undefined,
  controls: "Carousel",
  gallery: [],
  associated_media: []
};

export const MediaCatalogMediaOtherSpec = ({mediaType}) => ({
  ...MediaCatalogBaseSpec,
  title: "<New Media Item>",
  catalog_title: "<New Media Item>",
  media_type: mediaType,
  media_link: undefined,
  media_file: undefined,
  url: "",
  authorized_link: false,
  offerings: [],
  parameters: [],
  associated_media: []
});

export const MediaCatalogCollectionSpec = {
  ...MediaCatalogBaseSpec,
  type: "collection",
  media_lists: []
};

export const MediaCatalogMediaListSpec = {
  ...MediaCatalogBaseSpec,
  type: "list",
  playlist: true,
  media: []
};

export const MediaCatalogSpec = {
  name: "",
  description: "",
  image: undefined,
  permission_sets: [],
  tags: [],
  media: {},
  media_lists: {},
  media_collections: {}
};
