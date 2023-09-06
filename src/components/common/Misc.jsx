import {Box, Button, Group, Image, Tooltip, ActionIcon} from "@mantine/core";
import {Link} from "react-router-dom";
import {rootStore} from "@/stores";

export const LinkButton = (props) => {
  return <Button component={Link} {...props} />;
};

export const IconButton = ({label, Icon, icon, tooltipProps={}, ...props}) => {
  const button = (
    <ActionIcon {...props} aria-label={label}>
      { icon ? icon : <Icon /> }
    </ActionIcon>
  );

  return (
    <Tooltip
      {...tooltipProps}
      label={label}
      events={{ hover: true, focus: true, touch: false }}
    >
      {
        !props.disabled ?
          button :
          <Group>
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

export const ItemImage = ({item, scale, ...props}) => {
  let url;
  try {
    if(item?.image?.url) {
      url = new URL(item.image.url);
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
    const itemIndex = list.findIndex(item => item[idField] === id);

    if(itemIndex < 0) { return ""; }

    const label = (labelField === "index" ? itemIndex.toString() : list[itemIndex]?.[labelField]) || id;
    return LocalizeString(l10n, {label});
  };
};
