import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, mediaCatalogStore, permissionSetStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceMultiselect} from "@/components/inputs/ResourceSelection.jsx";
import {Slugify} from "@/components/common/Validation.jsx";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {MediaPropertyFooterItemSpec} from "@/specs/MediaPropertySpecs.js";
import {LocalizeString} from "@/components/common/Misc.jsx";

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

  const secondaryEnabled = info.domain?.features?.secondary_marketplace;

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

      <Inputs.ImageInput
        {...inputProps}
        label="Images"
        componentProps={{maw: uiStore.inputWidthWide}}
        subcategory={l10n.categories.info}
        fields={[
          { field: "header_logo", aspectRatio: 1, ...l10n.general.header_logo },
          { field: "tv_header_logo", aspectRatio: 1, ...l10n.general.tv_header_logo },
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.qr_background}
        subcategory={l10n.categories.info}
        maw={400}
        miw={400}
        componentProps={{maw: 490}}
        fields={[
          {field: "qr_background", aspectRatio: 16/9 }
        ]}
      />


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
              {...l10n.general.property_permissions_behavior}
              subcategory={l10n.categories.permissions}
              path={UrlJoin(inputProps.path, "permissions")}
              field="property_permissions_behavior"
              defaultValue="show_alternate_page"
              options={[
                { label: "Show Alternate Page", value: "show_alternate_page" },
                { label: "Show Purchase Options", value: "show_purchase" }
              ]}
            />
            {
              info?.permissions?.property_permissions_behavior !== "show_alternate_page" ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.general.alternate_page}
                  subcategory={l10n.categories.permissions}
                  path={UrlJoin(inputProps.path, "permissions")}
                  field="property_permissions_alternate_page_id"
                  options={[
                    ...Object.keys(info.pages || {})
                      .filter(pageId => pageId !== "main")
                      .map(pageId => ({
                        label: info.pages[pageId].label,
                        value: pageId
                      }))
                  ]}
                />
            }
            {
              info.permissions?.property_permissions_behavior !== "show_purchase" ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.section_items.purchasable_item.secondary_market_purchase_option}
                  subcategory={l10n.categories.permissions}
                  path={UrlJoin(inputProps.path, "permissions")}
                  field="property_permissions_secondary_market_purchase_option"
                  defaultValue=""
                  disabled={!secondaryEnabled}
                  options={[
                    { label: "None", value: "" },
                    { label: "Show", value: "show" },
                    { label: "Show if Out of Stock", value: "out_of_stock" },
                    { label: "Secondary Only", value: "only" }
                  ]}
                />
            }
          </>
      }


      <Inputs.Select
        {...inputProps}
        {...l10n.general.search_permissions_behavior}
        subcategory={l10n.categories.permissions}
        path={UrlJoin(inputProps.path, "permissions")}
        field="search_permissions_behavior"
        defaultValue="hide"
        options={[
          ...Object.keys(mediaPropertyStore.PERMISSION_BEHAVIORS).map(key => ({
            label: mediaPropertyStore.PERMISSION_BEHAVIORS[key],
            value: key
          })),
          { label: "Show Alternate Page", value: "show_alternate_page" }
        ]}
      />
      {
        info?.permissions?.search_permissions_behavior !== "show_alternate_page" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.general.alternate_page}
            subcategory={l10n.categories.permissions}
            path={UrlJoin(inputProps.path, "permissions")}
            field="search_permissions_alternate_page_id"
            options={[
              ...Object.keys(info.pages || {})
                .filter(pageId => pageId !== "main")
                .map(pageId => ({
                  label: info.pages[pageId].label,
                  value: pageId
                }))
            ]}
          />
      }
      {
        info.permissions?.search_permissions_behavior !== "show_purchase" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.section_items.purchasable_item.secondary_market_purchase_option}
            subcategory={l10n.categories.permissions}
            path={UrlJoin(inputProps.path, "permissions")}
            field="search_permissions_secondary_market_purchase_option"
            defaultValue=""
            disabled={!secondaryEnabled}
            options={[
              { label: "None", value: "" },
              { label: "Show", value: "show" },
              { label: "Show if Out of Stock", value: "out_of_stock" },
              { label: "Secondary Only", value: "only" }
            ]}
          />
      }

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
          })),
          { label: "Show Alternate Page", value: "show_alternate_page" }
        ]}
      />

      {
        info.permissions?.behavior !== "show_alternate_page" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.general.alternate_page}
            subcategory={l10n.categories.permissions}
            path={UrlJoin(inputProps.path, "permissions")}
            field="alternate_page_id"
            options={[
              { label: "(Property Main Page)", value: "main" },
              ...Object.keys(info.pages || {})
                .map(pageId => ({
                  label: info.pages[pageId].label,
                  value: pageId
                }))
            ]}
          />
      }
      {
        info.permissions?.behavior !== "show_purchase" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.section_items.purchasable_item.secondary_market_purchase_option}
            subcategory={l10n.categories.permissions}
            path={UrlJoin(inputProps.path, "permissions")}
            field="secondary_market_purchase_option"
            defaultValue=""
            disabled={!secondaryEnabled}
            options={[
              { label: "None", value: "" },
              { label: "Show", value: "show" },
              { label: "Show if Out of Stock", value: "out_of_stock" },
              { label: "Secondary Only", value: "only" }
            ]}
          />
      }


      <Title order={3} mt={50}  mb="md">{l10n.categories.main_page_display}</Title>

      <Inputs.ImageInput
        {...inputProps}
        componentProps={{maw: uiStore.inputWidthWide}}
        subcategory={l10n.categories.main_page_display}
        fields={[
          { field: "image", aspectRatio: 2/3, ...l10n.general.image },
          { field: "image_tv", aspectRatio: 16/9, ...l10n.general.image_tv },
        ]}
      />


      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.general.video}
        subcategory={l10n.categories.main_page_display}
        field="video"
        previewable
        previewIsAnimation
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.show_on_main_page}
        subcategory={l10n.categories.main_page_display}
        field="show_on_main_page"
        defaultValue={false}
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.general.show_on_main_page_tv}
        subcategory={l10n.categories.main_page_display}
        field="show_on_main_page_tv"
        defaultValue={false}
      />

      {
        !info.show_on_main_page ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.general.parent_property}
              subcategory={l10n.categories.main_page_display}
              field="parent_property"
              options={
                [
                  { label: "None", value: "" },
                  ...(
                    mediaPropertyStore.allMediaProperties.map(mediaProperty => ({
                      label: mediaProperty.name,
                      value: mediaProperty.objectId
                    }))
                      .filter(({value}) => value !== mediaPropertyId)
                  )
                ]}
            />
            <Inputs.URL
              {...inputProps}
              {...l10n.general.main_page_url}
              subcategory={l10n.categories.main_page_display}
              field="main_page_url"
            />
          </>
      }

      <Title order={3} mt={50} mb="md">{l10n.categories.footer}</Title>

      <Inputs.List
        {...inputProps}
        {...l10n.general.footer_items.footer_items}
        path="/public/asset_metadata/info/footer"
        field="items"
        idField="id"
        newItemSpec={MediaPropertyFooterItemSpec}
        showBottomAddButton
        subcategoryFnParams={{fields: ["label", "text", "id"], l10n: l10n.categories.footer_item_label}}
        renderItem={({item, ...props}) => {
          const subcategory = () => LocalizeString(l10n.categories.footer_item_label, { label: item.label });

          return (
            <>
              <Inputs.UUID
                {...props}
                {...l10n.general.footer_items.id}
                hidden
                subcategory={subcategory}
                field="id"
              />
              <Inputs.Text
                {...props}
                {...l10n.general.footer_items.label}
                subcategory={subcategory}
                field="label"
              />
              <Inputs.Text
                {...props}
                {...l10n.general.footer_items.text}
                subcategory={subcategory}
                field="text"
              />

              <Inputs.Select
                {...props}
                {...l10n.general.footer_items.type}
                subcategory={subcategory}
                field="type"
                defaultValue="link"
                options={[
                  { label: l10n.general.footer_items.types.link, value: "link" },
                  { label: l10n.general.footer_items.types.image, value: "image" },
                  { label: l10n.general.footer_items.types.rich_text, value: "rich_text" },
                  { label: l10n.general.footer_items.types.html, value: "html" },
                ]}
              />
              {
                item.type !== "link" ? null :
                  <Inputs.URL
                    {...props}
                    {...l10n.general.footer_items.link_url}
                    subcategory={subcategory}
                    field="url"
                  />
              }

              {
                item.type !== "image" ? null :
                  <Inputs.ImageInput
                    {...props}
                    {...l10n.general.footer_items.image}
                    subcategory={subcategory}
                    altTextField="image_alt"
                    fields={[
                      { field: "image" },
                    ]}
                  />
              }

              {
                item.type !== "rich_text" ? null :
                  <Inputs.RichText
                    {...props}
                    {...l10n.general.footer_items.content_rich_text}
                    subcategory={subcategory}
                    field="content_rich_text"
                    componentPropsVisible={{w: uiStore.inputWidth}}
                  />
              }

              {
                item.type !== "html" ? null :
                  <Inputs.File
                    {...props}
                    {...l10n.general.footer_items.content_html}
                    subcategory={subcategory}
                    field="content_html"
                    extensions={["html"]}
                  />
              }
            </>
          );
        }}
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.general.footer_text}
        path="/public/asset_metadata/info/footer"
        subcategory={l10n.categories.footer}
        field="rich_text"
      />


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
        horizontal
        aspectRatio={1}
        baseSize={125}
        fields={[
          { field: "favicon", url: true, aspectRatio: 1, baseSize: 25}
        ]}
      />
    </PageContent>
  );
});

export default MediaPropertyGeneralSettings;
