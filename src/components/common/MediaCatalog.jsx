import {Image} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric.js";

export const MediaItemImageUrl = ({mediaItem, aspectRatio}) => {
  switch(aspectRatio) {
    case "Square":
      return mediaItem?.thumbnail_image_square?.url;
    case "Landscape":
      return mediaItem?.thumbnail_image_landscape?.url;
    case "Portrait":
      return mediaItem?.thumbnail_image_portrait?.url;
    case "Canonical":
      if(mediaItem?.media_type === "Video") {
        // Prefer landscape for video
        return (
          mediaItem?.thumbnail_image_landscape ||
          mediaItem?.thumbnail_image_square ||
          mediaItem?.thumbnail_image_portrait
        )?.url;
      }
    // eslint-disable-next-line no-fallthrough
    default:
      // Prefer square for all other types
      return (
        mediaItem?.thumbnail_image_square ||
        mediaItem?.thumbnail_image_landscape ||
        mediaItem?.thumbnail_image_portrait
      )?.url;
  }
};

export const MediaItemImage = ({mediaItem, aspectRatio, scale, ...componentProps}) => {
  const imageUrl = MediaItemImageUrl({mediaItem, aspectRatio});

  return (
    <Image
      {...componentProps}
      src={!scale ? imageUrl : ScaleImage(imageUrl, 400)}
      withPlaceholder
    />
  );
};
