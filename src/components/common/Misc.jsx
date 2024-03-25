import {Box, Button, Group, Image, Tooltip, ActionIcon} from "@mantine/core";
import {Link} from "react-router-dom";
import {rootStore} from "@/stores";
import {FabricUrl} from "@/helpers/Fabric.js";

export const LinkButton = (props) => {
  return <Button component={Link} {...props} />;
};

export const IconButton = ({label, Icon, icon, tooltipProps={}, ...props}) => {
  if(props.disabled) {
    props.onClick = undefined;
  }

  const button = (
    <ActionIcon {...props} aria-label={label}>
      { icon ? icon : <Icon /> }
    </ActionIcon>
  );

  if(!label) {
    return button;
  }

  return (
    <Tooltip
      {...tooltipProps}
      label={label}
      events={{ hover: true, focus: true, touch: false }}
    >
      {
        !props.disabled ?
          button :
          <Group {...props}>
            {button}
          </Group>
      }
    </Tooltip>
  );
};

export const TooltipIcon = ({label, Icon, size, alt, color, tooltipProps={}}) => {
  return (
    <Group h={size} position="center" align="center">
      <Tooltip {...tooltipProps} height={2} label={label}>
        <Box h={size} sx={theme => ({color: theme.colors[color][5] })}>
          <Icon size={size} alt={alt || label} />
        </Box>
      </Tooltip>
    </Group>
  );
};

export const ItemImage = ({marketplaceId, item, scale, ...props}) => {
  let url;
  try {
    if(item?.image?.url) {
      url = new URL(item.image.url);
    } else if(item.image?.["/"]) {
      url = FabricUrl({objectId: marketplaceId, path: item.image["/"], width: 200});
    } else if(item?.nft_template?.nft?.image) {
      url = new URL(item.nft_template.nft.image);
    }

    if(url && scale) {
      url.searchParams.set("width", scale);
    }
  } catch(error) {
    rootStore.DebugLog({error: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
  }

  return <Image {...props} src={url} alt={item.name || item.sku} withPlaceholder />;
};

export const LocalizeString = (text="", variables={}, options={reactNode: false}) => {
  let result = text
    .split(/{(\w+)}/)
    .filter(s => s)
    .map(token => typeof variables[token] !== "undefined" ? variables[token] : token);

  if(!options.reactNode) {
    return result.join("");
  }

  return (
    <>
      {result}
    </>
  );
};

export const ListItemCategory = ({store, objectId, listPath, idField="id", id, labelField="name", l10n}) => {
  return () => {
    const list = store.GetMetadata({objectId, path: listPath}) || [];
    const itemIndex = list?.findIndex(item => item[idField] === id);

    if(!list || itemIndex < 0) { return ""; }

    const labelFields = Array.isArray(labelField) ? labelField : [labelField];
    let label = labelFields.map(field =>
      list[itemIndex]?.[field]
    )
      .filter(f => f)[0] || id;

    return LocalizeString(l10n, {label});
  };
};

export const AnnotatedText = ({text, referenceImages=[], withInput, ...componentProps}) => {
  if(!text) { return null; }

  let referenceMap = {};
  referenceImages.forEach(({uuid, image_id, image, alt_text}) => {
    if(!image?.url) { return; }
    referenceMap[image_id] = <Image width={30} height={30} src={image.url} alt={alt_text} />;
    referenceMap[uuid] = referenceMap[image_id];
  });

  if(withInput) {
    componentProps = {
      mt: -8,
      mb: "md",
      fz: "sm",
      bg: "gray.2",
      w: "max-content",
      p: "xs",
      ...componentProps
    };
  }

  return (
    <Group
      align="center"
      spacing={5}
      {...componentProps}
    >
      { LocalizeString(text, referenceMap, {reactNode: true}) }
    </Group>
  );
};
