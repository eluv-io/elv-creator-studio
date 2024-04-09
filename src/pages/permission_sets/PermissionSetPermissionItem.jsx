import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore, permissionSetStore, rootStore} from "@/stores/index.js";
import {useEffect} from "react";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs.jsx";
import {LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {MarketplaceSelect} from "@/components/inputs/ResourceSelection.jsx";
import {MarketplaceItemSelect} from "@/components/inputs/marketplace/MarketplaceItemInput.jsx";
import {Title} from "@mantine/core";

const PermissionSetPermissionItem = observer(() => {
  const { permissionSetId, permissionItemId } = useParams();

  const permissionSet = permissionSetStore.permissionSets[permissionSetId];

  useEffect(() => {
    marketplaceStore.LoadMarketplaces();
  }, []);

  if(!permissionSet) { return null; }

  const info = permissionSet?.metadata?.public?.asset_metadata?.info || {};

  const permissionItem = info.permission_items[permissionItemId];

  if(!permissionItem) {
    return "Permission Item Not Found";
  }

  const l10n = rootStore.l10n.pages.permission_set.form;
  const inputProps = {
    store: permissionSetStore,
    objectId: permissionSetId,
    category: permissionSetStore.PermissionItemCategory({permissionSetId, permissionItemId, label: permissionItem.label}),
    path: UrlJoin("/public/asset_metadata/info/permission_items", permissionItemId)
  };

  return (
    <PageContent
      title={`${info.name || permissionSet.name || "Permission Set"} - ${LocalizeString(l10n.categories.permission_item_label, { label: permissionItem.label})}`}
      backLink={UrlJoin("/permission-sets/", permissionSetId, "permission-items")}
      section="permissionSet"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.permission_item.label}
        field="label"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.permission_item.description}
        field="description"
      />
      <MarketplaceSelect
        disabled
        {...inputProps}
        {...l10n.permission_item.marketplace}
        subcategory={l10n.categories.purchase_item}
        path={UrlJoin(inputProps.path, "marketplace")}
        field="marketplace_slug"
        defaultFirst
      />
      <MarketplaceItemSelect
        disabled
        {...inputProps}
        {...l10n.permission_item.marketplace_sku}
        subcategory={l10n.categories.purchase_item}
        marketplaceId={permissionItem.marketplace?.marketplace_id}
        field="marketplace_sku"
      />

      <Title mt={50} order={3}>{ l10n.categories.permission_item_display }</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.permission_item.display.title}
        subcategory={l10n.categories.permission_item_display}
        required
        field="title"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.permission_item.display.subtitle}
        subcategory={l10n.categories.permission_item_display}
        field="subtitle"
      />

      <Inputs.List
        {...inputProps}
        {...l10n.permission_item.display.headers}
        subcategory={l10n.categories.permission_item_display}
        field="headers"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.permission_item.display.description}
        subcategory={l10n.categories.permission_item_display}
        field="description"
      />
    </PageContent>
  );
});

export default PermissionSetPermissionItem;
