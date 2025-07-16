import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, itemTemplateStore, mediaCatalogStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import {ItemTemplateAttributeSpec} from "@/specs/ItemTemplateSpecs.js";
import {useEffect, useState} from "react";
import {GenerateUUID} from "@/helpers/Misc.js";

// Item template attribute, which has a value dependent on the 'type' field
// Must make sure to use the right input component with the right option, and clear the value when the type changes
const ItemTemplateAttribute = observer(({item, ...props}) => {
  const [attributeType, setAttributeType] = useState(undefined);
  useEffect(() => {
    if(!attributeType) {
      setAttributeType(item?.type);
      return;
    }

    if(!item || item.type === attributeType) { return; }

    itemTemplateStore.SetDefaultValue({
      objectId: props.objectId,
      path: props.path,
      field: "value",
      value:
        item.type === "checkbox" ? false :
          item.type === "uuid" ? GenerateUUID() :
          ["fabric_link", "file", "file_url", "number", "integer"].includes(item.type) ? undefined :
            "",
      category: l10n.categories.general,
      subcategory: l10n.categories.item_attributes,
      label: "Reset Value"
    });

    setAttributeType(item.type);
   
  }, [item, attributeType, props.path, props.objectId]);

  if(!item) { return null; }

  const l10n = rootStore.l10n.pages.item_template.form;

  let InputComponent = Inputs.Input;
  let inputOptions = {};

  switch(item.type) {
    case "checkbox":
      InputComponent = Inputs.Checkbox;
      break;
    case "fabric_link":
      InputComponent = Inputs.FabricBrowser;
      break;
    case "file_url":
      inputOptions.url = true;
      InputComponent = Inputs.File;
      break;
    case "file":
      InputComponent = Inputs.File;
      break;
    case "integer":
      InputComponent = Inputs.Integer;
      break;
    case "number":
      InputComponent = Inputs.Number;
      break;
    case "uuid":
      InputComponent = Inputs.UUID;
  }

  return (
    <>
      <Inputs.UUID
        {...props}
        {...l10n.common.id}
        hidden
        subcategory={l10n.categories.item_attributes}
        field="id"
      />
      <Inputs.Text
        {...props}
        {...l10n.common.name}
        subcategory={l10n.categories.item_attributes}
        field="name"
      />
      <Inputs.Select
        {...props}
        {...l10n.general.attribute_type}
        subcategory={l10n.categories.item_attributes}
        field="type"
        options={[
          { label: "Checkbox", value: "checkbox" },
          { label: "Color", value: "color" },
          { label: "DateTime", value: "datetime" },
          { label: "Fabric Link", value: "fabric_link" },
          { label: "File", value: "file" },
          { label: "File URL", value: "file_url" },
          { label: "Integer", value: "integer" },
          { label: "JSON", value: "json" },
          { label: "Number", value: "number" },
          { label: "Text", value: "text" },
          { label: "Text Area", value: "textarea" },
          { label: "UUID", value: "uuid" },
        ]}
      />
      <InputComponent
        {...props}
        {...l10n.general.attribute_value}
        {...inputOptions}
        type={item.type}
        subcategory={l10n.categories.item_attributes}
        field="value"
      />
    </>
  );
});

const ItemTemplateGeneralSettings = observer(() => {
  const { itemTemplateId } = useParams();

  useEffect(() => {
    mediaCatalogStore.LoadMediaCatalogs();
    mediaPropertyStore.LoadMediaProperties();
  }, []);

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];

  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/nft"
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.general}`}
      section="itemTemplate"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.info }</Title>

      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.general.image}
        subcategory={l10n.categories.info}
        field="image"
        url
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        subcategory={l10n.categories.info}
        field="display_name"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.general.tenant_id}
        subcategory={l10n.categories.info}
        hidden
        field="tenant_id"
        defaultValue={rootStore.tenantId}
      />
      <Inputs.UUID
        {...inputProps}
        {...l10n.general.template_id}
        subcategory={l10n.categories.info}
        field="template_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.general.subtitle}
        subcategory={l10n.categories.info}
        field="edition_name"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.general.subtitle_2}
        subcategory={l10n.categories.info}
        field="subtitle2"
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.general.id_format}
        subcategory={l10n.categories.info}
        field="id_format"
        options={[
          { label: "Token ID", value: "token_id" },
          { label: "Token ID / Cap", value: "token_id/cap" },
          { label: "Ordinal", value: "ordinal" },
          { label: "Ordinal / Cap", value: "ordinal/cap" }
        ]}
      />
      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.general.collection_image}
        subcategory={l10n.categories.info}
        field="collection_image"
        url
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.general.collection_name}
        subcategory={l10n.categories.info}
        field="collection_name"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.general.description}
        subcategory={l10n.categories.info}
        field="description"
      />
      <Inputs.RichText
        {...inputProps}
        {...l10n.general.description_rich_text}
        subcategory={l10n.categories.info}
        field="description_rich_text"
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.hide_share}
        subcategory={l10n.categories.item_info}
        field="hide_share"
      />

      <Title order={3} mt={50} mb="md">{ l10n.categories.item_details }</Title>


      <Inputs.Text
        {...inputProps}
        {...l10n.general.creator}
        subcategory={l10n.categories.info}
        field="creator"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.copyright}
        subcategory={l10n.categories.info}
        field="copyright"
      />

      <Inputs.Date
        {...inputProps}
        {...l10n.general.created_at}
        subcategory={l10n.categories.info}
        field="created_at"
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.general.additional_info}
        subcategory={l10n.categories.info}
        field="additional_info"
      />

      <Inputs.File
        {...inputProps}
        {...l10n.general.terms_document}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/nft/terms_document"
        field="terms_document"
        extensions={["html", "pdf"]}
      />

      {
        !info.terms_document?.terms_document ? null :
          <Inputs.Text
            {...inputProps}
            {...l10n.general.terms_document_link_text}
            subcategory={l10n.categories.info}
            path="/public/asset_metadata/nft/terms_document"
            field="link_text"
            defaultValue="Terms and Conditions"
          />
      }

      <Inputs.List
        {...inputProps}
        {...l10n.general.attributes}
        maw={600}
        category={l10n.categories.general}
        field="attributes"
        idField="id"
        newItemSpec={ItemTemplateAttributeSpec}
        renderItem={props => <ItemTemplateAttribute {...props} />}
      />
    </PageContent>
  );
});

export default ItemTemplateGeneralSettings;
