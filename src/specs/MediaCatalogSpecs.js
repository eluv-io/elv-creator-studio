const MediaCatalogMediaBaseSpec = {
  id: undefined,
  title: "",
  archive_title: "",
  headers: [],
  subtitle: "",
  description: "",
  description_rich_text: "",
  image: undefined,
  tags: []
};

export const MediaCatalogMediaImageSpec = {
  ...MediaCatalogMediaBaseSpec,
  media_type: "Image",
  title: "<New Image>",
  archive_title: "<New Image>",
  image_aspect_ratio: "Square"
};

export const MediaCatalogMediaVideoSpec = {
  ...MediaCatalogMediaBaseSpec,
  title: "<New Video>",
  archive_title: "<New Video>",
  video_poster: undefined,
  media_type: "Video",
  media_link: undefined,
  live: false,
  start_time: undefined,
  end_time: undefined,
  offerings: []
};

export const MediaCatalogMediaOtherSpec = ({mediaType}) => ({
  ...MediaCatalogMediaBaseSpec,
  title: "<New Media Item>",
  archive_title: "<New Media Item>",
  media_type: mediaType,
  media_link: undefined,
  media_file: undefined,
  link: "",
  authorized_link: false,
  offerings: [],
  parameters: []
});

export const MediaCatalogSpec = {
  name: "",
  description: "",
  image: undefined,
  tags: [],
  media: {},
  collections: []
};
