import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, itemTemplateStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";

const ItemTemplateSettings = observer(() => {
  const { itemTemplateId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];

  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.settings,
    path: "/public/asset_metadata/nft"
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.settings}`}
      section="itemTemplate"
      useHistory
    >
      { /* Ensure permissioned section is initialized - used for querying to check permission to item template  */}
      <Inputs.Text
        {...inputProps}
        {...l10n.settings.permissioned}
        path="/permissioned"
        field="permissioned"
        hidden
        defaultValue="permissioned"
      />

      <Title order={3} my="md">{ l10n.categories.resale }</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.settings.test}
        subcategory={l10n.categories.resale}
        field="test"
        defaultValue={false}
      />
      <Inputs.Date
        {...inputProps}
        {...l10n.settings.secondary_available_at}
        subcategory={l10n.categories.resale}
        field="secondary_resale_available_at"
      />

      <Inputs.Date
        {...inputProps}
        {...l10n.settings.secondary_expires_at}
        subcategory={l10n.categories.info}
        field="secondary_resale_expires_at"
      />

      <Title order={3} mt={50} mb="md">{ l10n.categories.contract }</Title>


      <Inputs.Text
        {...inputProps}
        {...l10n.settings.contract_address}
        disabled
        subcategory={l10n.categories.contract}
        field="address"
      />
      <Inputs.Integer
        {...inputProps}
        {...l10n.settings.total_supply}
        disabled
        subcategory={l10n.categories.contract}
        field="total_supply"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.settings.mint_key_id}
        subcategory={l10n.categories.contract}
        path="/public/asset_metadata/mint"
        field="cauth_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.settings.fabric_key_id}
        subcategory={l10n.categories.contract}
        path="/public/asset_metadata/mint"
        field="fauth_id"
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.settings.use_mint_ordinal}
        subcategory={l10n.categories.contract}
        path="/public/asset_metadata/mint"
        field="use_mint_ordinal_in_token_id"
      />

      {
        info?.use_mint_ordinal_in_token_id ?
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.settings.shuffle_token_id}
            subcategory={l10n.categories.contract}
            path="/public/asset_metadata/mint"
            field="shuffle_token_id"
          /> :
          <Inputs.Text
            {...inputProps}
            {...l10n.settings.token_template}
            subcategory={l10n.categories.contract}
            path="/public/asset_metadata/mint"
            field="token_template"
          />

      }

      <Inputs.JSON
        {...inputProps}
        {...l10n.settings.merge_meta}
        subcategory={l10n.categories.contract}
        path="/public/asset_metadata/mint"
        field="merge_meta"
      />
    </PageContent>
  );
});

export default ItemTemplateSettings;
