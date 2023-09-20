const LockedStateSpec = {
  name: "<Locked State Name>",
  subtitle_1: "",
  subtitle_2: "",
  description_text: "",
  description: "",
  image: undefined,
  image_tv: undefined,
  image_aspect_ratio: "Square"
};

const LockConditionsSpec = {
  hide_when_locked: false,
  lock_conditions: "View Media",
  required_attributes: [],
  required_media_ids: []
};

export const GalleryItemSpec = {
  id: undefined,
  name: "<New Gallery Item>",
  description: "",
  image: undefined,
  image_aspect_ratio: "Square",
  video: undefined
};

export const MediaItemSpec = {
  id: undefined,
  container: "list",
  name: "<New Media Item>",
  subtitle_1: "",
  subtitle_2: "",
  description_text: "",
  description: "",
  image: undefined,
  image_tv: undefined,
  image_aspect_ratio: "Square",
  tags: [],
  requires_permissions: false,
  locked: false,
  media_type: "Video",
  start_time: undefined,
  end_time: undefined,
  media_link: undefined,
  media_file: undefined,
  link: "",
  authorized_link: false,
  media_reference: {
    section_id: "",
    collection_id: ""
  },
  offerings: [],
  background_image: undefined,
  background_image_mobile: undefined,
  controls: "Carousel",
  gallery: [],
  parameters: []
};

export const FeaturedMediaItemSpec = {
  ...MediaItemSpec,
  container: "featured",
  required: false,
  animation: undefined,
  button_text: "",
  button_image: undefined,
  poster_image: undefined,
  background_image: undefined,
  background_image_tv: undefined,
  background_image_logo_tv: undefined,
  lock_conditions: LockConditionsSpec,
  locked_state: {
    ...LockedStateSpec,
    button_text: "",
    button_image: undefined,
    animation: undefined,
    background_image: undefined,
    background_image_tv: undefined,
    background_image_logo_tv: undefined
  }
};

export const CollectionMediaItemSpec = {
  ...MediaItemSpec,
  container: "collection",
  locked: false,
  locked_state: {
    ...LockConditionsSpec,
    ...LockedStateSpec
  }
};
