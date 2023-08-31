import {observer} from "mobx-react-lite";
import {useEffect} from "react";
import {marketplaceStore} from "@/stores/index.js";
import Inputs from "./Inputs.jsx";

export const MarketplaceSelect = observer(({excludedSlugs=[], defaultFirst, allowNone, ...props}) => {
  useEffect(() => {
    // Marketplaces need to be loaded for marketplace selection
    marketplaceStore.LoadMarketplaces();
  }, []);

  let marketplaces = (marketplaceStore.allMarketplaces || [])
    .filter(marketplace => !excludedSlugs.includes(marketplace.marketplaceSlug))
    .map(marketplace => ({
      label: marketplaceStore.marketplaces[marketplace.objectId]?.metadata?.public?.asset_metadata?.info?.name || marketplace.brandedName,
      value: marketplace.marketplaceSlug
    }));

  if(allowNone) {
    marketplaces.unshift({ label: "None", value: ""});
  }

  return (
    <Inputs.Select
      {...props}
      options={marketplaces}
      defaultValue={props.defaultValue || defaultFirst ? marketplaces[0]?.value : undefined}
      defaultOnBlankString={props.defaultOnBlankString || defaultFirst}
    />
  );
});
