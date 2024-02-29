import {Group, Image, Paper, Stack, Text} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric.js";
import {uiStore} from "@/stores/index.js";
import UrlJoin from "url-join";
import {IconButton} from "@/components/common/Misc.jsx";
import {Link} from "react-router-dom";
import {IconExternalLink} from "@tabler/icons-react";

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

export const MediaItemCard = ({mediaItem, aspectRatio, size="sm", withLink, ...componentProps}) => {
  const sizes = {
    sm: { p: 5, fz1: "sm", fz2: "xs", img: 50 },
    md: { p: "sm", fz1: "md", fz2: "sm", img: 75 },
    lg: { p: "md", fz1: "lg", fz2: "md", img: 100 },
  };

  const page = mediaItem.type === "collection" ? "media-collections" : mediaItem.type === "list" ? "media-lists" : "media";
  const link = UrlJoin("/media-catalogs", mediaItem.mediaCatalogId, page, mediaItem.id);

  return (
    <Paper withBorder p={sizes[size].p} key={`media-item-${mediaItem.id}`} maw={uiStore.inputWidth} {...componentProps}>
      <Group style={{position: "relative"}}>
        <MediaItemImage
          aspectRatio={aspectRatio}
          mediaItem={mediaItem}
          scale={400}
          width={sizes[size].img}
          height={sizes[size].img}
          fit="contain"
          position="left"
          style={{objectPosition: "left" }}
        />
        <Stack spacing={0}>
          <Text fz={sizes[size].fz1} fw={600}>
            { mediaItem.label }
          </Text>
          <Text fz={sizes[size].fz2}>
            {
              mediaItem.type === "collection" ?
                "Media Collection" :
                mediaItem.type === "list" ?
                  "Media List" :
                  `Media - ${mediaItem.media_type}`
            }
          </Text>
        </Stack>
        {
          !withLink ? null :
            <IconButton
              label={`View ${mediaItem.label}`}
              component={Link}
              to={link}
              color="blue.5"
              Icon={IconExternalLink}
              style={{
                position: "absolute",
                top: 0,
                right: 0
              }}
            />
        }
      </Group>
    </Paper>
  );
};
