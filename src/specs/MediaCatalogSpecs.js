/*

mediaCatalog = {
  media: {
    abc123: {
      ...,
      tags: [Rocky],
      attributes: {
        franchise: Rocky,

      },
      associated_media: [
        qwe123
      ]
    }
  },
  media_lists: {
    qwe123: {
      ...,
      playlist: true,
      media: [
        "abc123",
        "sdf123"
      ]
    }
  },
  media_collections: {
    ...,
    media_lists: [
      "qwe123"
    ],
    or,
    media_lists: [
      playlist: true,
        media: [
        "abc123",
        "sdf123"
      ]
    ]
  }
}



 */
const MediaCatalogMediaBaseSpec = {
  id: undefined,
  title: "",
  catalog_title: "",
  headers: [],
  subtitle: "",
  description: "",
  description_rich_text: "",
  image: undefined,
  tags: [],
  attributes: {}
};

export const MediaCatalogMediaImageSpec = {
  ...MediaCatalogMediaBaseSpec,
  media_type: "Image",
  title: "<New Image>",
  catalog_title: "<New Image>",
  image_aspect_ratio: "Square"
};

export const MediaCatalogMediaVideoSpec = {
  ...MediaCatalogMediaBaseSpec,
  title: "<New Video>",
  catalog_title: "<New Video>",
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
  catalog_title: "<New Media Item>",
  media_type: mediaType,
  media_link: undefined,
  media_file: undefined,
  url: "",
  authorized_link: false,
  offerings: [],
  parameters: []
});

export const MediaCatalogCollectionSpec = {
  ...MediaCatalogMediaBaseSpec,
  media_lists: []
};

export const MediaCatalogMediaListSpec = {
  ...MediaCatalogMediaBaseSpec,
  playlist: true,
  media: []
};

export const MediaCatalogSpec = {
  name: "",
  description: "",
  image: undefined,
  tags: [],
  media: {},
  collections: []
};
