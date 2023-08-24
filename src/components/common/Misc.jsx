import {Button, Image} from "@mantine/core";
import {Link} from "react-router-dom";
import {rootStore} from "Stores";

export const LinkButton = (props) => {
  return <Button component={Link} {...props} />;
};

export const ItemImage = ({item, width, imageProps={}}) => {
  let url;
  try {
    if(item?.image?.url) {
      url = new URL(item.image.url);
    } else if(item?.nft_template?.nft?.image) {
      url = new URL(item.nft_template.nft.image);
    }

    if(url && width) {
      url.searchParams.set("width", width);
    }
  } catch(error) {
    rootStore.DebugLog({error: error, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
  }

  return <Image {...imageProps} src={url} alt={item.name || item.sku} withPlaceholder />;
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
    const item = (store.GetMetadata({objectId, path: listPath}) || []).find(item => item[idField] === id);

    if(!item) { return ""; }

    return LocalizeString(l10n, {label: item[labelField || id]});
  };
};
