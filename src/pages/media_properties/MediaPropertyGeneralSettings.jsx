import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, mediaCatalogStore, permissionSetStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceMultiselect} from "@/components/inputs/ResourceSelection.jsx";
import {Slugify} from "@/components/common/Validation.jsx";
import {Group, Title} from "@mantine/core";
import UrlJoin from "url-join";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {MediaPropertyAdvancedSearchOptionSpec} from "@/specs/MediaPropertySpecs.js";

const MediaPropertyGeneralSettings = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/info"
  };

  const attributes = mediaPropertyStore.GetMediaPropertyAttributes({mediaPropertyId});
  const tags = mediaPropertyStore.GetMediaPropertyTags({mediaPropertyId});

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "Media Property"} - General`}
      section="mediaProperty"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.general.slug}
        defaultValue={Slugify(info.name)}
        disabled
        subcategory={l10n.categories.info}
        field="slug"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        subcategory={l10n.categories.info}
        field="name"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.title}
        subcategory={l10n.categories.info}
        field="title"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.page_title}
        subcategory={l10n.categories.info}
        field="page_title"
      />

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.general.media_catalogs}
        subcategory={l10n.general.media_catalogs.label}
        field="media_catalogs"
        options={
          mediaCatalogStore.allMediaCatalogs.map(mediaCatalog => ({
            label: mediaCatalog.name,
            value: mediaCatalog.objectId
          }))
        }
      />

      <MarketplaceMultiselect
        {...inputProps}
        {...l10n.general.associated_marketplaces}
        subcategory={l10n.general.associated_marketplaces.label}
        field="associated_marketplaces"
        tenantSlugField="tenant_slug"
        marketplaceIdField="marketplace_id"
      />

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.general.subproperties}
        subcategory={l10n.general.subproperties.label}
        field="subproperties"
        options={
          mediaPropertyStore.allMediaProperties.map(mediaProperty => ({
            label: mediaProperty.name,
            value: mediaProperty.objectId
          }))
            .filter(({value}) => value !== mediaPropertyId)
        }
      />

      <Group align="start">
        <Inputs.ImageInput
          {...inputProps}
          {...l10n.general.image}
          subcategory={l10n.categories.info}
          fields={[
            { field: "image", aspectRatio: 2/3 },
          ]}
        />
        <Inputs.ImageInput
          {...inputProps}
          {...l10n.general.header_logo}
          subcategory={l10n.categories.info}
          fields={[
            { field: "header_logo", aspectRatio: 1 },
          ]}
        />
      </Group>

      <Title order={3} mt={50} mb="md">{l10n.categories.permissions}</Title>
      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.general.permission_sets}
        subcategory={l10n.categories.permissions}
        field="permission_sets"
        options={
          (permissionSetStore.allPermissionSets || []).map(permissionSet => ({
            label: permissionSet.name,
            value: permissionSet.objectId
          }))
        }
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.general.permission_behavior}
        subcategory={l10n.categories.permissions}
        defaultValue="hide"
        path={UrlJoin(inputProps.path, "permissions")}
        field="behavior"
        options={[
          ...Object.keys(mediaPropertyStore.PERMISSION_BEHAVIORS).map(key => ({
            label: mediaPropertyStore.PERMISSION_BEHAVIORS[key],
            value: key
          }))
        ]}
      />
      <PermissionItemSelect
        multiple
        {...inputProps}
        {...l10n.general.property_permissions}
        permissionSetIds={info.permission_sets}
        path={UrlJoin(inputProps.path, "permissions")}
        subcategory={l10n.categories.permissions}
        defaultValue=""
        field="property_permissions"
      />
      {
        (info.permissions?.property_permissions || []).length === 0 ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.general.property_permission_behavior}
              subcategory={l10n.categories.permissions}
              path={UrlJoin(inputProps.path, "permissions")}
              field="property_permissions_behavior"
              defaultValue="show_purchase"
              options={[
                { label: "Show Purchase Options", value: "show_purchase" },
                { label: "Show Alternate Page", value: "show_alternate_page" }
              ]}
            />
            {
              info?.permissions?.property_permissions_behavior !== "show_alternate_page" ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.general.alternate_page}
                  subcategory={l10n.categories.permissions}
                  path={UrlJoin(inputProps.path, "permissions")}
                  field="alternate_page_id"
                  options={Object.keys(info.pages || {}).map(pageId => ({
                    label: info.pages[pageId].label,
                    value: pageId
                  }))}
                />
            }
          </>
      }

      <Title order={3} mt={50} mb="md">{l10n.categories.search}</Title>
      <Inputs.Select
        {...inputProps}
        {...l10n.general.search.category_attribute}
        path={UrlJoin(inputProps.path, "search")}
        subcategory={l10n.categories.search}
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
        field="category_attribute"
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.general.search.primary_attribute}
        subcategory={l10n.categories.search}
        searchable
        defaultValue=""
        path={UrlJoin(inputProps.path, "search")}
        options={[
          {label: "None", value: ""},
          {label: "Media Type", value: "__media-type"},
          ...(Object.keys(attributes).map(attributeId => ({
            label: attributes[attributeId].title || "Attribute",
            value: attributeId
          })))
        ]}
        field="primary_attribute"
      />
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.search.enable_advanced_search}
        path={UrlJoin(inputProps.path, "search")}
        subcategory={l10n.categories.search}
        defaultValue={false}
        field="enable_advanced_search"
      />
      {
        !info.search?.enable_advanced_search ? null :
          <Inputs.List
            {...inputProps}
            {...l10n.general.search.advanced_search_options}
            path={UrlJoin(inputProps.path, "search")}
            subcategory={l10n.categories.search}
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

export default MediaPropertyGeneralSettings;
