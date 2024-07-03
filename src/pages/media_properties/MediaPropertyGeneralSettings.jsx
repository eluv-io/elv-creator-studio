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
        <Inputs.ImageInput
          {...inputProps}
          {...l10n.general.tv_header_logo}
          subcategory={l10n.categories.info}
          fields={[
            { field: "tv_header_logo", aspectRatio: 1 },
          ]}
        />
      </Group>

      <Title order={3} mt={50}  mb="md">{l10n.categories.permissions}</Title>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.require_login}
        subcategory={l10n.categories.permissions}
        field="require_login"
        defaultValue={false}
      />
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

      <Title order={3} mt={50}>{l10n.categories.media_sidebar}</Title>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.media_sidebar.show_media_sidebar}
        path={UrlJoin(inputProps.path, "media_sidebar")}
        subcategory={l10n.categories.media_sidebar}
        defaultValue={false}
        field="show_media_sidebar"
      />

      {
        !info?.media_sidebar?.show_media_sidebar ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.general.media_sidebar.sidebar_content}
              path={UrlJoin(inputProps.path, "media_sidebar")}
              subcategory={l10n.categories.media_sidebar}
              field="sidebar_content"
              defaultValue="current_section"
              options={[
                { label: "Current Section", value: "current_section" },
                { label: "Specific Section", value: "specific_section" },
                { label: "All Live Content", value: "live" }
              ]}
            />
            {
              info?.media_sidebar?.sidebar_content !== "current_section" ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.general.media_sidebar.default_sidebar_content}
                  path={UrlJoin(inputProps.path, "media_sidebar")}
                  subcategory={l10n.categories.media_sidebar}
                  field="default_sidebar_content"
                  defaultValue="none"
                  options={[
                    { label: "None", value: "none" },
                    { label: "Specific Section", value: "specific_section" },
                    { label: "All Live Content", value: "live" }
                  ]}
                />
            }
            {
              !(
                info?.media_sidebar?.sidebar_content === "specific_section" ||
                (
                  info?.media_sidebar?.sidebar_content === "current_section" &&
                  info?.media_sidebar?.default_sidebar_content === "specific_section"
                )
              ) ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.general.media_sidebar.sidebar_content_section_id}
                  path={UrlJoin(inputProps.path, "media_sidebar")}
                  subcategory={l10n.categories.media_sidebar}
                  field="sidebar_content_section_id"
                  defaultValue={Object.keys(info.sections || {})[0]}
                  options={
                    Object.keys(info.sections || {}).map(sectionId =>
                      ({label: info.sections[sectionId].label, value: sectionId})
                    )
                  }
                />
            }
          </>
      }

      <Title order={3} mt={50}>{l10n.categories.meta_tags}</Title>
      <Title order={6} fw={500} color="dimmed" maw={500} mb="md">{l10n.general.meta_tags.meta_tags_description}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.general.meta_tags.site_name}
        path={UrlJoin(inputProps.path, "meta_tags")}
        subcategory={l10n.categories.meta_tags}
        placeholder="Eluvio Media wallet"
        field="site_name"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.general.meta_tags.title}
        path={UrlJoin(inputProps.path, "meta_tags")}
        subcategory={l10n.categories.meta_tags}
        field="title"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.general.meta_tags.description}
        path={UrlJoin(inputProps.path, "meta_tags")}
        subcategory={l10n.categories.meta_tags}
        field="description"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.meta_tags.image}
        path={UrlJoin(inputProps.path, "meta_tags")}
        subcategory={l10n.categories.meta_tags}
        altTextField="image_alt"
        fields={[
          { field: "image", url: true, aspectRatio: 1.91 / 1}
        ]}
      />

      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.general.meta_tags.favicon}
        path={UrlJoin(inputProps.path, "meta_tags")}
        subcategory={l10n.categories.meta_tags}
        field="favicon"
        url
        aspectRatio={1}
        baseSize={125}
        fields={[
          { field: "favicon", url: true, aspectRatio: 1, baseSize: 25}
        ]}
      />

      <Title order={3} mt={50} mb="md">{l10n.categories.theme_settings}</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.theme.font}
        subcategory={l10n.categories.theme_settings}
        path="/public/asset_metadata/info/styling"
        defaultValue=""
        field="font"
        options={[
          { label: "Inter (Default)", value: "" },
          { label: "Custom Font", value: "custom" },
        ]}
      />
      {
        info?.styling?.font !== "custom" ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.theme.custom_font_declaration}
              subcategory={l10n.categories.theme_settings}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_font_declaration"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.theme.custom_title_font_declaration}
              subcategory={l10n.categories.theme_settings}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_title_font_declaration"
            />
            <Inputs.Code
              {...inputProps}
              {...l10n.theme.custom_font_definition}
              subcategory={l10n.categories.theme_settings}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_font_definition"
            />
          </>
      }
    </PageContent>
  );
});

export default MediaPropertyGeneralSettings;
