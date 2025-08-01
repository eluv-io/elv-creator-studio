import CommonStyles from "@/assets/stylesheets/modules/common.module.scss";

import {Box, Button, Group, Image, Tooltip, ActionIcon, CopyButton} from "@mantine/core";
import {Link} from "react-router-dom";
import {rootStore, marketplaceStore} from "@/stores";
import {ExtractHashFromLink, FabricUrl} from "@/helpers/Fabric.js";
import SVG from "react-inlinesvg";
import {CreateModuleClassMatcher, JoinClassNames} from "@/helpers/Misc.js";
import UrlJoin from "url-join";

const S = CreateModuleClassMatcher(CommonStyles);

export const LinkButton = (props) => {
  return <Button component={Link} variant="outline" {...props} />;
};

export const SVGIcon = ({
  icon,
  ...props
}) => {
  return (
    <SVG
      {...props}
      src={icon}
      className={JoinClassNames(S("icon"), props.className)}
    />
  );
};

export const IconButton = ({label, Icon, icon, tooltipProps={}, style={}, ...props}) => {
  if(props.disabled) {
    props.onClick = undefined;
  }

  if(!label) {
    return (
      <ActionIcon style={style} {...props} aria-label={label}>
        {icon ? icon : <Icon/>}
      </ActionIcon>
    );
  }

  return (
    <Tooltip
      {...tooltipProps}
      withinPortal
      label={label}
      events={{ hover: true, focus: true, touch: false }}
    >
      {
        !props.disabled ?
          <ActionIcon style={style} {...props} aria-label={label}>
            {icon ? icon : <Icon/>}
          </ActionIcon> :
          <Group style={style} {...props}>
            <ActionIcon {...props} aria-label={label}>
              {icon ? icon : <Icon/>}
            </ActionIcon>
          </Group>
      }
    </Tooltip>
  );
};

export const CopyIconButton = ({text, ...props}) => {
  return (
    <CopyButton value={text} timeout={2000}>
      {
        ({copied, copy}) =>
          <IconButton
            {...props}
            onClick={copy}
            color={copied ? "teal" : props.color}
          />
      }
    </CopyButton>
  );
};

export const TooltipIcon = ({label, Icon, icon, size, alt, color, tooltipProps={}}) => {
  return (
    <Group h={size} position="center" align="center">
      <Tooltip {...tooltipProps} height={2} label={label} style={{whiteSpace: "pre-wrap"}}>
        {
          icon ? icon :
            <Box h={size} sx={theme => ({color: theme.colors[color][5]})}>
              <Icon size={size} alt={alt || label}/>
            </Box>
        }
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
    } else if(item?.nft_template) {
      const itemTemplateHash = ExtractHashFromLink(item?.nft_template);
      const itemTemplateMetadata = marketplaceStore.itemTemplateMetadata[itemTemplateHash];

      if(itemTemplateMetadata?.nft?.image) {
        url = new URL(itemTemplateMetadata.nft.image);
      }
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

// For collection table, automatically generate category/subcategory label determination function from params specifying the label and where to find the data
export const CategoryFn = ({store, objectId, path, field, params}) => {
  return (
    (action) => {
      const index = action.actionType === "MOVE_LIST_ELEMENT" ? action.info.newIndex : action.info.index;
      let label = params.fields
        .map(labelField =>
          store.GetMetadata({objectId, path: UrlJoin(path, field, index.toString()), field: labelField})
        )
        .filter(f => f)[0];

      return LocalizeString(params.l10n, { label });
    }
  );
};
