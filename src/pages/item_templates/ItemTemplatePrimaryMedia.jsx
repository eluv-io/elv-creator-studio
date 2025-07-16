import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, itemTemplateStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";

const ItemTemplatePrimaryMedia = observer(() => {
  const { itemTemplateId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];

  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.primary_media,
    path: "/public/asset_metadata/nft"
  };

  const mediaProperties = (mediaPropertyStore.allMediaProperties || []).map(({name, objectId}) => ({
    label: name,
    value: objectId
  }));

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.primary_media}`}
      section="itemTemplate"
      useHistory
    >
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.media.images}
        fields={[
          { field: "image", ...l10n.general.image, url: true },
          { field: "background_image_tv", ...l10n.media.background_image_tv }
        ]}
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.media.media_type}
        field="media_type"
        defaultValue="Image"
        options={[
          "Image",
          "Video",
          "Audio",
          "Ebook",
          "HTML"
        ]}
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.media.playable}
        field="playable"
        defaultValue={false}
      />

      {
        info.playable || !["Video", "Audio"].includes(info.media_type) ? null :
          <Inputs.FabricBrowser
            {...inputProps}
            {...l10n.media.media}
            field="media_link"
            previewable
            previewIsAnimation={!info.has_audio}
          />
      }

      {
        !(info.playable || info.media_type === "Video") ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.media.has_audio}
            field="has_audio"
            defaultValue={false}
          />
      }

      {
        !["Ebook", "HTML"].includes(info.media_type) ? null :
          <Inputs.File
            {...inputProps}
            {...l10n.media.media_file}
            field="media_file"
            extensions={info.media_type === "HTML" ? ["html"] : ["epub"]}
          />
      }

      {
        info.media_type !== "HTML" ? null :
          <Inputs.List
            {...inputProps}
            {...l10n.media.media_parameters}
            narrow
            field="media_parameters"
            idField="id"
            fields={[
              { field: "id", InputComponent: Inputs.UUID, hidden: true },
              { field: "name", InputComponent: Inputs.Text, ...l10n.media.parameter },
              { field: "value", InputComponent: Inputs.Text, ...l10n.media.value },
            ]}
          />
      }

      <br/>
      <Title order={3} mb="md">{ l10n.categories.bundled_media_property }</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.additional_media.bundled_property}
        field="bundled_property_id"
        options={mediaProperties}
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.additional_media.additional_media_type}
        field="additional_media_type"
        defaultValue="property"
        hidden
        options={[
          { label: "Bundled Media Property", value: "property" },
          "List",
          "Sections"
        ]}
      />

    </PageContent>
  );
});

export default ItemTemplatePrimaryMedia;
