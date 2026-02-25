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
import {PermissionItemAlternateDisplaySpec} from "@/specs/PermissionSetSpecs.js";

const PermissionItemDisplay = observer(({inputProps, permissionItem, marketplace}) => {
  const l10n = rootStore.l10n.pages.permission_set.form;
  return (
    <>

      <Inputs.Text
        {...inputProps}
        {...l10n.permission_item.display.title}
        localizable
        subcategory={l10n.categories.permission_item_display}
        required
        field="title"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.permission_item.display.subtitle}
        localizable
        subcategory={l10n.categories.permission_item_display}
        field="subtitle"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.permission_item.display.description}
        localizable
        subcategory={l10n.categories.permission_item_display}
        field="description"
      />

      {
        permissionItem.type === "external" ?
          <>
            <Inputs.URL
              {...inputProps}
              {...l10n.permission_item.link}
              defaultValue={false}
              field="link"
            />
            <Inputs.Price
              {...inputProps}
              {...l10n.permission_item.price}
              path={UrlJoin(inputProps.path, "price")}
              field="USD"
            />
            {
              (marketplace?.currencies || []).map(currencyCode =>
                <Inputs.Price
                  key={`price-${currencyCode}`}
                  {...inputProps}
                  label={LocalizeString(l10n.permission_item.price_currency.label, {currencyCode})}
                  path={UrlJoin(inputProps.path, "price")}
                  field={currencyCode}
                />
              )
            }
          </> :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.permission_item.display.access_title}
              subcategory={l10n.categories.permission_item_display}
              field="access_title"
            />
            <Inputs.Color
              {...inputProps}
              {...l10n.permission_item.display.access_title_background_color}
              subcategory={l10n.categories.permission_item_display}
              field="access_title_background_color"
            />
            <Inputs.Color
              {...inputProps}
              {...l10n.permission_item.display.access_title_text_color}
              subcategory={l10n.categories.permission_item_display}
              field="access_title_text_color"
            />
          </>
      }
    </>
  );
});

const PermissionSetPermissionItem = observer(() => {
  const { permissionSetId, permissionItemId } = useParams();

  const permissionSet = permissionSetStore.permissionSets[permissionSetId];
  const info = permissionSet?.metadata?.public?.asset_metadata?.info || {};

  const permissionItem = info?.permission_items?.[permissionItemId];
  useEffect(() => {
    marketplaceStore.LoadMarketplaces();
    permissionSetStore.LoadPermissionSets();
  }, []);

  useEffect(() => {
    if(!permissionItem?.marketplace_id) {
      return;
    }

    marketplaceStore.LoadMarketplace({marketplaceId: permissionItem.marketplace_id});
  }, [permissionItem.marketplace_id]);

  if(!permissionItem || !permissionItem) {
    return "Permission Item Not Found";
  }

  const marketplace = marketplaceStore.marketplaces[permissionItem?.marketplace_id];

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
      <Inputs.UUID
        {...inputProps}
        {...l10n.common.id}
        field="id"
        disabled
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.permission_items.create.type}
        field="type"
        disabled
        options={[
          {label: "Owned Item", value: "owned_item"},
          {label: "External Offer", value: "external"}
        ]}
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.permission_item.label}
        field="label"
      />
      <MarketplaceSelect
        disabled={permissionItem.type !== "external"}
        {...inputProps}
        {...l10n.permission_item.marketplace}
        subcategory={l10n.categories.purchase_item}
        path={UrlJoin(inputProps.path, "marketplace")}
        field="marketplace_slug"
        defaultFirst
      />
      {
        permissionItem.type !== "owned_item" ? null :
          <>

            <MarketplaceItemSelect
              disabled
              {...inputProps}
              {...l10n.permission_item.marketplace_sku}
              subcategory={l10n.categories.purchase_item}
              marketplaceId={permissionItem.marketplace?.marketplace_id}
              field="marketplace_sku"
            />

            <Inputs.MultiSelect
              {...inputProps}
              {...l10n.permission_item.subsumes}
              field="subsumes"
              options={
                Object.keys(info.permission_items)
                  .filter(id => id !== permissionItemId)
                  .map(id => ({
                    label: info.permission_items[id].label || id,
                    value: id
                  }))
              }
            />

            { /* TODO: Remove when fabric policy supports this */ }
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.permission_item.dvr}
              defaultValue={false}
              field="dvr"
            />
          </>
      }

      <Inputs.Integer
        {...inputProps}
        {...l10n.permission_item.priority}
        min={0}
        defaultValue={false}
        field="priority"
      />

      <Title mt={50} mb="md" order={3}>{ l10n.categories.permission_item_display }</Title>
      <PermissionItemDisplay
        inputProps={inputProps}
        permissionItem={permissionItem}
        marketplace={marketplace}
      />

      <Title mt={50} mb="md" order={3}>{ l10n.categories.permission_item_alternate_displays }</Title>

      <Inputs.List
        {...inputProps}
        {...l10n.permission_item.alternate_displays}
        field="alternate_displays"
        newItemSpec={PermissionItemAlternateDisplaySpec}
        renderItem={props =>
          <>
            <Inputs.UUID
              {...props}
              {...l10n.common.id}
              hidden
              field="id"
            />
            <Inputs.Select
              {...props}
              {...l10n.permission_item.permission_item_id}
              field="permission_item_id"
              options={
                Object.keys(info.permission_items)
                  ?.filter(id =>
                    id !== permissionItemId &&
                    info.permission_items[id]?.type === "owned_item"
                  )
                  ?.map(id => ({
                    label: info.permission_items[id].label || id,
                    value: id,
                  }))
              }
            />
            <PermissionItemDisplay
              inputProps={props}
              permissionItem={permissionItem}
              marketplace={marketplace}
            />
          </>
        }
      />
    </PageContent>
  );
});

export default PermissionSetPermissionItem;
