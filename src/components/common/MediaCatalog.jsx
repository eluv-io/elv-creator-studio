import {Group, Image, Paper, Stack, Text} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric.js";
import {rootStore, permissionSetStore, uiStore} from "@/stores/index.js";
import UrlJoin from "url-join";
import {IconButton, TooltipIcon} from "@/components/common/Misc.jsx";
import {Link} from "react-router-dom";
import {IconExternalLink, IconLock, IconLockOpen, IconWorld, IconWorldOff} from "@tabler/icons-react";
import {observer} from "mobx-react-lite";

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

export const MediaItemImage = ({imageUrl, mediaItem, aspectRatio, scale, ...componentProps}) => {
  imageUrl = imageUrl || MediaItemImageUrl({mediaItem, aspectRatio});

  return (
    <Image
      {...componentProps}
      src={!scale ? imageUrl : ScaleImage(imageUrl, scale)}
      withPlaceholder
    />
  );
};

export const MediaPropertySectionPermissionIcon = observer(({sectionOrSectionItem}) => {
  const permissions = sectionOrSectionItem?.permissions?.permission_item_ids || [];

  return (
    <MediaItemPermissionIcon
      mediaItem={{
        public: permissions.length === 0,
        permissions: permissions.map(permissionItemId => ({
          permission_item_id: permissionItemId
        })),
        invert_permissions: sectionOrSectionItem?.permissions?.invert_permissions
      }}
    />
  );

});

export const MediaItemPermissionIcon = observer(({mediaItem}) => {
  let Icon, color, label;
  if(mediaItem.public) {
    Icon = IconWorld;
    color = "green";
    label = rootStore.l10n.pages.media_catalog.form.media.list.permissions.public;
  } else if(mediaItem.permissions?.length > 0) {
    if(mediaItem.invert_permissions) {
      Icon = IconLockOpen;
      color = "cyan";
      label = rootStore.l10n.pages.media_catalog.form.media.list.permissions.inverted_permissioned;
    } else {
      Icon = IconLock;
      color = "blue";
      label = rootStore.l10n.pages.media_catalog.form.media.list.permissions.permissioned;
    }

    mediaItem.permissions.forEach(permission => {
      if(permission.permission_item_id && permissionSetStore.allPermissionItems[permission.permission_item_id]) {
        label += "\n" + permissionSetStore.allPermissionItems[permission.permission_item_id].label || permission.permission_item_id;
      }
    });
  } else {
    Icon = IconWorldOff;
    color = "red";
    label = rootStore.l10n.pages.media_catalog.form.media.list.permissions.private;
  }

  return (
    <TooltipIcon
      Icon={Icon}
      label={label}
      color={color}
      size={24}
    />
  );
});

export const MediaItemCard = ({mediaItem, aspectRatio, size="sm", withLink, showPermissions, ...componentProps}) => {
  const sizes = {
    sm: { p: 5, fz1: "sm", fz2: "xs", img: 50 },
    md: { p: "sm", fz1: "md", fz2: "sm", img: 75 },
    lg: { p: "md", fz1: "lg", fz2: "md", img: 100 },
  };

  const page = mediaItem.type === "collection" ? "media-collections" : mediaItem.type === "list" ? "media-lists" : "media";
  const link = UrlJoin("/media-catalogs", mediaItem.media_catalog_id, page, mediaItem.id);

  return (
    <Paper withBorder p={sizes[size].p} key={`media-item-${mediaItem.id}`} maw={uiStore.inputWidth} {...componentProps}>
      <Group style={{position: "relative"}} noWrap pr={50} >
        <MediaItemImage
          aspectRatio={aspectRatio}
          mediaItem={mediaItem}
          scale={200}
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
          !withLink && !showPermissions ? null :
            <Group align="center" spacing="xs" style={{position: "absolute", top: 0, right: 0}}>
              {
                !showPermissions ? null :
                  <MediaItemPermissionIcon mediaItem={mediaItem} />
              }
              {
                !withLink ? null :
                  <IconButton
                    label={`View ${mediaItem.label}`}
                    component={Link}
                    to={link}
                    color="purple.6"
                    Icon={IconExternalLink}
                  />
              }
            </Group>
        }
      </Group>
    </Paper>
  );
};

