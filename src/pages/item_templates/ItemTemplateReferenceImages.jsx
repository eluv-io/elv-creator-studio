import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {itemTemplateStore, rootStore} from "@/stores/index.js";
import UrlJoin from "url-join";
import {ListItemCategory} from "@/components/common/Misc.jsx";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs.jsx";
import {Group, Image, Text} from "@mantine/core";
import {ItemTemplateReferenceImageSpec} from "@/specs/ItemTemplateSpecs.js";

export const ItemTemplateReferenceImage = observer(() => {
  const { itemTemplateId, imageUUID } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];
  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const referenceImageIndex = info.reference_images?.findIndex(reference_image => reference_image.id === imageUUID);
  const referenceImage = info.reference_images?.[referenceImageIndex];

  if(!referenceImage) {
    return (
      <div>
        Reference image not found
      </div>
    );
  }

  const listPath = "/public/asset_metadata/nft/reference_images";
  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    path: UrlJoin(listPath, referenceImageIndex.toString()),
    category: ListItemCategory({
      store: itemTemplateStore,
      objectId: itemTemplateId,
      listPath,
      id: imageUUID,
      labelField: ["alt_text", "image_id"],
      l10n: l10n.categories.reference_image_label
    }),
    subcategory: l10n.categories.reference_images
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.reference_images} - ${referenceImage.image_id}`}
      section="itemTemplate"
      useHistory
      backLink={UrlJoin("/item-templates", itemTemplateId, "reference_images")}
    >
      <Inputs.UUID
        {...inputProps}
        {...l10n.reference_images.uuid}
        hidden
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.reference_images.image_id}
        required
        field="image_id"
      />
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.reference_images.image}
        fields={[
          { field: "image" }
        ]}
        altTextField="alt_text"
      />

    </PageContent>
  );
});

const ItemTemplateReferenceImageList = observer(() => {
  const { itemTemplateId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];
  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.additional_media,
    subcategory: l10n.categories.reference_images,
    path: "/public/asset_metadata/nft"
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.reference_images}`}
      section="itemTemplate"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.reference_images.reference_images}
        categoryFnParams={{fields: ["alt_text", "id"], l10n: l10n.categories.reference_image_label}}
        path="/public/asset_metadata/nft"
        field="reference_images"
        idField="id"
        filterable
        Filter={({filter, value}) =>
          value?.id?.includes(filter.toLowerCase()) ||
          value?.alt_text?.includes(filter.toLowerCase())
        }
        columns={[
          {
            label: l10n.reference_images.reference_images.columns.id,
            field: "image_id",
            render: reference_image => (
              <Group>
                <Image fit="contain" height={30} width={30} src={reference_image.image?.url} withPlaceholder />
                <Text italic fw={500}>{ reference_image.image_id }</Text>
              </Group>
            )
          },
          {
            label: l10n.reference_images.reference_images.columns.alt_text,
            centered: true,
            field: "alt_text",
            render: reference_image => <Text>{reference_image.alt_text}</Text>
          },
        ]}
        newItemSpec={ItemTemplateReferenceImageSpec}
      />
    </PageContent>
  );
});

export default ItemTemplateReferenceImageList;
