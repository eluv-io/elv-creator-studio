import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MediaPropertyAdvancedSearchOptionSpec} from "@/specs/MediaPropertySpecs.js";

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
      <Inputs.Select
        {...inputProps}
        {...l10n.general.search.secondary_filter}
        subcategory={l10n.categories.search}
        field="secondary_filter"
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
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.search.hide_if_unauthenticated}
        subcategory={l10n.categories.search}
        field="hide_if_unauthenticated"
        defaultValue={false}
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.search.enable_advanced_search}
        subcategory={l10n.categories.search}
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
                    { label: "Tags", value: "tags" },
                    { label: "Attribute", value: "attribute" },
                    { label: "Media Type", value: "media_type" },
                    { label: "Date", value: "date" }
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
                          { label: "Select", value: "select" },
                          { label: "Checkboxes", value: "checkboxes"}
                        ]}
                        field="tag_display"
                      />
                    </>
                }
              </>
            }
          />
      }
    </PageContent>
  );
});

export default MediaPropertySearch;
