import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {
  MediaPropertyAdvancedSearchOptionSpec,
  MediaPropertySearchFilterSpec, MediaPropertySearchSecondaryFilterSpec
} from "@/specs/MediaPropertySpecs.js";
import {Title} from "@mantine/core";

const MediaPropertySearch = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.search,
    path: "/public/asset_metadata/info/search"
  };

  const attributes = mediaPropertyStore.GetMediaPropertyAttributes({mediaPropertyId});
  const tags = mediaPropertyStore.GetMediaPropertyTags({mediaPropertyId});

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "Media Property"} - Search`}
      section="mediaProperty"
      useHistory
    >
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.search.disable}
        subcategory={l10n.categories.search}
        field="disabled"
        defaultValue={false}
      />
      {
        info?.search?.disabled ? null :
          <>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.general.search.hide_if_unauthenticated}
              subcategory={l10n.categories.search}
              field="hide_if_unauthenticated"
              defaultValue={false}
            />
            <Inputs.Select
              {...inputProps}
              {...l10n.general.search.group_by}
              subcategory={l10n.categories.search}
              field="group_by"
              searchable
              defaultValue=""
              options={[
                {label: "None", value: ""},
                {label: "Media Type", value: "__media-type"},
                {label: "Date", value: "__date"},
                ...(Object.keys(attributes).map(attributeId => ({
                  label: attributes[attributeId].title || "Attribute",
                  value: attributeId
                })))
              ]}
            />
            <Inputs.Select
              {...inputProps}
              {...l10n.general.search.primary_filter}
              subcategory={l10n.categories.search}
              field="primary_filter"
              searchable
              defaultValue=""
              options={[
                {label: "None", value: ""},
                {label: "Media Type", value: "__media-type"},
                ...(Object.keys(attributes).map(attributeId => ({
                  label: attributes[attributeId].title || "Attribute",
                  value: attributeId
                })))
              ]}
            />
            {
              !info.search?.primary_filter ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.general.search.primary_filter_style}
                  subcategory={l10n.categories.search}
                  field="primary_filter_style"
                  defaultValue="box"
                  options={[
                    {label: "Box", value: "box"},
                    {label: "Text", value: "text"},
                    {label: "Image", value: "image"},
                  ]}
                />
            }

            {
              !info.search?.primary_filter ? null :
                <Inputs.List
                  {...inputProps}
                  {...l10n.general.search.filter_options}
                  subcategory={l10n.categories.search}
                  field="filter_options"
                  newItemSpec={MediaPropertySearchFilterSpec}
                  renderItem={(props) => {
                    const attributeValues =
                      info.search.primary_filter === "__media-type" ?
                        ["Video", "Gallery", "Image", "Ebook"] :
                        attributes[info.search.primary_filter]?.tags || [];

                    return (
                      <>
                        <Inputs.Select
                          {...props}
                          {...l10n.general.search.filter_option.primary_filter_value}
                          subcategory={l10n.categories.search}
                          field="primary_filter_value"
                          searchable
                          defaultValue=""
                          options={[
                            {label: "All", value: ""},
                            ...attributeValues.map(tag => ({
                              label: tag || "",
                              value: tag
                            }))
                          ]}
                        />
                        {
                          info.search?.primary_filter_style !== "image" ? null :
                            <Inputs.ImageInput
                              {...props}
                              {...l10n.general.search.filter_option.images}
                              subcategory={l10n.categories.search}
                              fields={[
                                { ...l10n.general.search.filter_option.primary_filter_image, field: "primary_filter_image", baseSize: 125 },
                                { ...l10n.general.search.filter_option.primary_filter_image_tv, field: "primary_filter_image_tv", baseSize: 125 }
                              ]}
                            />
                        }
                        <Inputs.Select
                          {...props}
                          {...l10n.general.search.filter_option.secondary_filter_attribute}
                          subcategory={l10n.categories.search}
                          field="secondary_filter_attribute"
                          searchable
                          defaultValue=""
                          options={
                            [
                              {label: "None", value: ""},
                              {label: "Media Type", value: "__media-type"},
                              ...(Object.keys(attributes).map(attributeId => ({
                                label: attributes[attributeId].title || "Attribute",
                                value: attributeId
                              })))
                            ].filter(({value}) => info.search.primary_filter !== value)
                          }
                        />

                        {
                          !props.item.secondary_filter_attribute ? null :
                            <>
                              <Inputs.Select
                                {...props}
                                {...l10n.general.search.filter_option.secondary_filter_style}
                                subcategory={l10n.categories.search}
                                field="secondary_filter_style"
                                defaultValue="box"
                                options={[
                                  {label: "Box", value: "box"},
                                  {label: "Text", value: "text"},
                                  {label: "Image", value: "image", disabled: props.item.secondary_filter_options.length === 0},
                                ]}
                              />
                              <Inputs.List
                                {...props}
                                {...l10n.general.search.filter_option.secondary_filter_options}
                                subcategory={l10n.categories.search}
                                field="secondary_filter_options"
                                newItemSpec={MediaPropertySearchSecondaryFilterSpec}
                                renderItem={(secondaryFilterProps) => {
                                  const secondaryAttributeValues =
                                    props.item.secondary_filter_attribute === "__media-type" ?
                                      ["Video", "Gallery", "Image", "Ebook"] :
                                      attributes[props.item.secondary_filter_attribute]?.tags || [];

                                  return (
                                    <>
                                      <Inputs.Select
                                        {...secondaryFilterProps}
                                        {...l10n.general.search.filter_option.secondary_filter_value}
                                        subcategory={l10n.categories.search}
                                        field="secondary_filter_value"
                                        searchable
                                        defaultValue=""
                                        options={[
                                          {label: "All", value: ""},
                                          ...secondaryAttributeValues.map(tag => ({
                                            label: tag || "",
                                            value: tag
                                          }))
                                        ]}
                                      />
                                      {
                                        props.item.secondary_filter_style !== "image" ? null :
                                          <Inputs.ImageInput
                                            {...secondaryFilterProps}
                                            {...l10n.general.search.filter_option.images}
                                            subcategory={l10n.categories.search}
                                            fields={[
                                              { ...l10n.general.search.filter_option.secondary_filter_image, field: "secondary_filter_image", baseSize: 125 },
                                              { ...l10n.general.search.filter_option.secondary_filter_image_tv, field: "secondary_filter_image_tv", baseSize: 125 }
                                            ]}
                                          />
                                      }
                                    </>
                                  );
                                }}
                              />
                            </>
                        }
                      </>
                    );
                  }}
                />
            }

            <Title order={3} mt={50}  mb="md">{l10n.categories.advanced_search}</Title>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.general.search.enable_advanced_search}
              subcategory={l10n.categories.advanced_search}
              field="enable_advanced_search"
              defaultValue={false}
            />
            {
              !info.search?.enable_advanced_search ? null :
                <Inputs.List
                  {...inputProps}
                  {...l10n.general.search.advanced_search_options}
                  subcategory={l10n.categories.advanced_search}
                  field="advanced_search_options"
                  newItemSpec={MediaPropertyAdvancedSearchOptionSpec}
                  renderItem={(props) =>
                    <>
                      <Inputs.Select
                        {...props}
                        {...l10n.general.search.advanced.type}
                        subcategory={l10n.categories.advanced_search}
                        options={[
                          {label: "Tags", value: "tags"},
                          {label: "Attribute", value: "attribute"},
                          {label: "Media Type", value: "media_type"},
                          {label: "Date", value: "date"}
                        ]}
                        field="type"
                      />
                      <Inputs.Text
                        {...props}
                        {...l10n.general.search.advanced.title}
                        subcategory={l10n.categories.advanced_search}
                        field="title"
                      />
                      {
                        props.item.type !== "attribute" ? null :
                          <Inputs.Select
                            {...props}
                            {...l10n.general.search.advanced.attribute}
                            subcategory={l10n.categories.advanced_search}
                            searchable
                            defaultValue={Object.keys(attributes)[0]}
                            options={[
                              ...(Object.keys(attributes).map(attributeId => ({
                                label: attributes[attributeId].title || "Attribute",
                                value: attributeId
                              })))
                            ]}
                            field="attribute"
                          />
                      }
                      {
                        props.item.type !== "tags" ? null :
                          <>
                            <Inputs.MultiSelect
                              {...props}
                              {...l10n.general.search.advanced.tags}
                              subcategory={l10n.categories.advanced_search}
                              searchable
                              options={tags}
                              field="tags"
                            />
                            <Inputs.Select
                              {...props}
                              {...l10n.general.search.advanced.tag_display}
                              subcategory={l10n.categories.advanced_search}
                              defaultValue="select"
                              options={[
                                {label: "Select", value: "select"},
                                {label: "Checkboxes", value: "checkboxes"}
                              ]}
                              field="tag_display"
                            />
                          </>
                      }
                    </>
                  }
                />
            }
          </>
      }
    </PageContent>
  );
});

export default MediaPropertySearch;
