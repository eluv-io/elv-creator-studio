import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, itemTemplateStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {AspectRatio, Group, Image, Text, Title} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric";
import {MediaItemSpec} from "@/specs/MediaSpecs.js";
import {ItemTemplateMediaCollectionSpec, ItemTemplateMediaSectionSpec} from "@/specs/ItemTemplateSpecs.js";
import UrlJoin from "url-join";
import {AnnotatedText, ListItemCategory} from "@/components/common/Misc.jsx";

const ItemTemplateAdditionalMediaList = observer(({containerType}) => {
  const { itemTemplateId, sectionId, collectionId } = useParams();

  const info = itemTemplateStore.itemTemplates[itemTemplateId].metadata.public.asset_metadata.nft;

  let path, field, routePath, sectionIndex, collectionIndex;
  switch(containerType) {
    case "list":
      path = "/public/asset_metadata/nft";
      field = "additional_media";
      routePath = "/list";
      break;
    case "featured":
      path = "/public/asset_metadata/nft/additional_media_sections";
      field = "featured_media";
      routePath = "/featured";
      break;
    default:
      sectionIndex = info.additional_media_sections?.sections
        ?.findIndex(section => section.id === sectionId);
      collectionIndex = info.additional_media_sections?.sections?.[sectionIndex]?.collections
        ?.findIndex(collection => collection.id === collectionId);

      if(collectionIndex >= 0 && sectionIndex >= 0) {
        path = UrlJoin(
          "/public/asset_metadata/nft/additional_media_sections/sections",
          sectionIndex.toString(),
          "collections",
          collectionIndex.toString()
        );
        field = "media";
      }
      break;
  }

  if(!path) {
    return (
      <div>
        Media list not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.additional_media,
    subcategory: l10n.categories.additional_media_settings,
  };

  return (
    <Inputs.CollectionTable
      {...inputProps}
      {...l10n.additional_media.additional_media}
      categoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.additional_media_label}}
      path={path}
      field={field}
      idField="id"
      routePath={routePath}
      columns={[
        {
          label: l10n.additional_media.additional_media.columns.name,
          field: "name",
          render: mediaItem => (
            <Group noWrap>
              <AspectRatio
                w={100}
                ratio={
                  mediaItem.image_aspect_ratio === "Square" ? 1 : mediaItem.image_aspect_ratio === "Wide" ? 16/9 : 3/4
                }
              >
                <Image src={ScaleImage(mediaItem.image?.url || mediaItem.image, 400)} alt={mediaItem.name} withPlaceholder />
              </AspectRatio>
              {
                mediaItem.annotated_title ?
                  <AnnotatedText text={mediaItem.annotated_title} referenceImages={info.reference_images}/> :
                  <Text>{mediaItem.name || mediaItem.id}</Text>
              }
            </Group>
          )
        },
        {
          label: l10n.additional_media.additional_media.columns.type,
          field: "media_type",
          width: "100px",
        }
      ]}
      newItemSpec={MediaItemSpec}
    />
  );
});

export const ItemTemplateAdditionalMediaCollection = observer(() => {
  const { itemTemplateId, sectionId, collectionId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];
  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const sectionIndex = info.additional_media_sections?.sections.findIndex(section => section.id === sectionId);
  const section = sectionIndex < 0 ? undefined : info.additional_media_sections.sections[sectionIndex];
  const collectionIndex = section?.collections?.findIndex(collection => collection.id === collectionId);
  const collection = collectionIndex < 0 ? undefined : section?.collections?.[collectionIndex];

  if(!collection) {
    return (
      <div>
        Collection not found
      </div>
    );
  }

  const listPath = UrlJoin("/public/asset_metadata/nft/additional_media_sections/sections", sectionIndex.toString(), "collections");
  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    path: UrlJoin(listPath, collectionIndex.toString()),
    category: ListItemCategory({
      store: itemTemplateStore,
      objectId: itemTemplateId,
      listPath,
      id: collectionId,
      labelField: "name",
      l10n: l10n.categories.additional_media_collection_label
    }),
    subcategory: l10n.categories.additional_media_collections
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.additional_media_sections} - ${section.name || section.id} - ${collection.name || collection.id}`}
      section="itemTemplate"
      useHistory
      backLink={UrlJoin("/item-templates", itemTemplateId, "additional_media", sectionId)}
    >
      <Inputs.UUID
        {...inputProps}
        {...l10n.additional_media.section_id}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        field="name"
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.additional_media.additional_media_display}
        field="display"
        defaultValue="Media"
        options={[
          "Media",
          "Album"
        ]}
      />
      {
        collection.display !== "Media" ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.additional_media.show_autoplay}
            field="show_autoplay"
            defaultValue={false}
          />
      }
      <ItemTemplateAdditionalMediaList containerType="collection" />
    </PageContent>
  );
});

export const ItemTemplateAdditionalMediaSection = observer(() => {
  const { itemTemplateId, sectionId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];
  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const sectionIndex = info.additional_media_sections?.sections.findIndex(section => section.id === sectionId);
  const section = sectionIndex < 0 ? undefined : info.additional_media_sections.sections[sectionIndex];

  if(!section) {
    return (
      <div>
        Section not found
      </div>
    );
  }

  const listPath = "/public/asset_metadata/nft/additional_media_sections/sections";
  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    path: UrlJoin(listPath, sectionIndex.toString()),
    category: ListItemCategory({
      store: itemTemplateStore,
      objectId: itemTemplateId,
      listPath,
      id: sectionId,
      labelField: "name",
      l10n: l10n.categories.additional_media_section_label
    }),
    subcategory: l10n.categories.additional_media_sections
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.additional_media_sections} - ${section.name || section.id}`}
      section="itemTemplate"
      useHistory
      backLink={UrlJoin("/item-templates", itemTemplateId, "additional_media")}
    >
      <Inputs.UUID
        {...inputProps}
        {...l10n.additional_media.section_id}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        field="name"
      />
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.additional_media.collections}
        categoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.additional_media_collection_label}}
        field="collections"
        idField="id"
        columns={[
          {
            label: l10n.additional_media.sections.columns.name,
            field: "name",
            render: collection => <Text>{ collection.name || collection.id }</Text>
          },
          {
            label: l10n.additional_media.sections.columns.media_items,
            centered: true,
            field: "media_items",
            width: "120px",
            render: collection => <Text>{collection.media.length}</Text>
          },
        ]}
        newItemSpec={ItemTemplateMediaCollectionSpec}
      />
    </PageContent>
  );
});

const ItemTemplateAdditionalMediaSections = observer(() => {
  const { itemTemplateId } = useParams();

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.additional_media,
    subcategory: l10n.categories.additional_media_sections,
    path: "/public/asset_metadata/nft"
  };

  return (
    <Inputs.CollectionTable
      {...inputProps}
      {...l10n.additional_media.sections}
      categoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.additional_media_section_label}}
      path="/public/asset_metadata/nft/additional_media_sections"
      field="sections"
      idField="id"
      columns={[
        {
          label: l10n.additional_media.sections.columns.name,
          field: "name",
          render: section => <Text>{ section.name || section.id }</Text>
        },
        {
          label: l10n.additional_media.sections.columns.collections,
          centered: true,
          field: "collections",
          width: "120px",
          render: section => <Text>{section.collections.length}</Text>
        },
        {
          label: l10n.additional_media.sections.columns.media_items,
          centered: true,
          field: "media_items",
          width: "120px",
          render: section => (
            <Text>
              {section.collections.map(collection => collection.media.length).reduce((sum, count) => sum + count, 0)}
            </Text>
          )
        }
      ]}
      newItemSpec={ItemTemplateMediaSectionSpec}
    />
  );
});


const ItemTemplateAdditionalMedia = observer(() => {
  const { itemTemplateId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];

  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.additional_media,
    subcategory: l10n.categories.additional_media_settings,
    path: "/public/asset_metadata/nft"
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.additional_media}`}
      section="itemTemplate"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.additional_media_settings}</Title>
      <Inputs.Select
        {...inputProps}
        {...l10n.additional_media.additional_media_type}
        field="additional_media_type"
        defaultValue="List"
        options={[
          "List",
          "Sections"
        ]}
      />
      <Inputs.Code
        {...inputProps}
        {...l10n.additional_media.custom_gallery_css}
        type="css"
        field="custom_gallery_css"
        maw={uiStore.inputWidth}
      />
      {
        info.additional_media_type === "List" ?
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.additional_media.additional_media_display}
              field="additional_media_display"
              defaultValue="Media"
              options={[
                "Media",
                "Album"
              ]}
            />
            {
              info.additional_media_display !== "Media" ? null :
                <>
                  <Inputs.Checkbox
                    {...inputProps}
                    {...l10n.additional_media.show_autoplay}
                    field="show_autoplay"
                    defaultValue={false}
                  />
                </>
            }
            <ItemTemplateAdditionalMediaList containerType="list" />
          </> :
          <>
            <Title order={3} mt={50} mb="md">{l10n.categories.featured_media}</Title>
            <ItemTemplateAdditionalMediaList containerType="featured" />

            <Title order={3} mt={50} mb="md">{l10n.categories.additional_media_sections}</Title>
            <ItemTemplateAdditionalMediaSections />
          </>
      }
    </PageContent>
  );
});

export default ItemTemplateAdditionalMedia;
