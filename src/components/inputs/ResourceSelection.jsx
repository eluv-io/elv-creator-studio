import {observer} from "mobx-react-lite";
import {useEffect} from "react";
import {marketplaceStore} from "@/stores/index.js";
import Inputs from "./Inputs.jsx";

export const MarketplaceSelect = observer(({
  excludedSlugs=[],
  defaultFirst,
  allowNone,
  tenantSlugField="tenant_slug",
  marketplaceIdField="marketplace_id",
  marketplaceSlugField="marketplace_slug",
  multiselect,
  ...props
}) => {
  useEffect(() => {
    // Marketplaces need to be loaded for marketplace selection
    marketplaceStore.LoadMarketplaces();
  }, []);

  let marketplaces = (marketplaceStore.allMarketplaces || [])
    .filter(marketplace => !excludedSlugs.includes(marketplace.marketplaceSlug))
    .map(marketplace => ({
      label: marketplaceStore.marketplaces[marketplace.objectId]?.metadata?.public?.asset_metadata?.info?.name || marketplace.brandedName || marketplace.marketplaceSlug,
      value: marketplace.marketplaceSlug,
      additionalValues: [
        { field: tenantSlugField, value: marketplace.tenantSlug },
        { field: marketplaceIdField, value: marketplace.objectId }
      ]
    }));

  if(allowNone) {
    marketplaces.unshift({
      label: "None",
      value: "",
      additionalValues: [
        { field: tenantSlugField, value: "" },
        { field: marketplaceIdField, value: "" }
      ]
    });
  }

  if(multiselect) {
    return (
      <Inputs.MultiSelect
        {...props}
        options={marketplaces}
        primaryValueField={marketplaceSlugField}
      />
    );
  } else {
    return (
      <Inputs.Select
        {...props}
        options={marketplaces}
        defaultValue={props.defaultValue || defaultFirst ? marketplaces[0]?.value : undefined}
        defaultOnBlankString={props.defaultOnBlankString || defaultFirst}
      />
    );
  }
});

export const MarketplaceMultiselect = observer(({...props}) => {
  return <MarketplaceSelect {...props} multiselect />;
});
