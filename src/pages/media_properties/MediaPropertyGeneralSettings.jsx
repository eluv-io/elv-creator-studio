import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, mediaCatalogStore, permissionSetStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceMultiselect} from "@/components/inputs/ResourceSelection.jsx";
import {Slugify} from "@/components/common/Validation.jsx";
import {Accordion, Title} from "@mantine/core";
import UrlJoin from "url-join";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {MediaPropertyFooterItemSpec, MediaPropertySubpropertySpec, MediaPropertyFAQSpec} from "@/specs/MediaPropertySpecs.js";
import {LocalizeString} from "@/components/common/Misc.jsx";
import CountryCodesList from "country-codes-list";
import LanguageCodes from "@/assets/localization/LanguageCodes.js";

const currencies = CountryCodesList.customList("currencyCode", "{currencyNameEn}");
Object.keys(currencies).forEach(currencyCode => {
  if(!currencyCode || !currencies[currencyCode]) {
    delete currencies[currencyCode];
  }
});

const FAQForm = observer(({index}) => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.general,
    subcategory: l10n.categories.faq,
    path: "/public/asset_metadata/info/faq"
  };

  if(typeof index !== "undefined") {
    inputProps.path = UrlJoin(inputProps.path, "additional", index.toString());
  }

  return (
    <>
      {
        typeof index === "undefined" ? null :
          <Inputs.Text
            {...inputProps}
            {...l10n.general.faq.slug}
            field="slug"
          />
      }
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.faq.header_image}
        localizable
        componentProps={{
          maw: "100%"
        }}
        altTextField="header_image_alt"
        fields={[
          { ...l10n.general.faq.header_image, field: "header_image", aspectRatio: 2, baseSize: 100},
          { ...l10n.general.faq.header_image_mobile, field: "header_image_mobile", aspectRatio: 2, baseSize: 100}
        ]}
      />
      <Inputs.Color
        {...inputProps}
        {...l10n.general.faq.background_color}
        field="background_color"
      />
      <Inputs.Color
        {...inputProps}
        {...l10n.general.faq.header_text_color}
        field="header_text_color"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.general.faq.title}
        localizable
        field="title"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.general.faq.description}
        localizable
        field="description"
      />
      <Inputs.List
        {...inputProps}
        {...l10n.general.faq.questions}
        localizable
        maw="100%"
        w="100%"
        field="questions"
        fields={[
          { field: "question", InputComponent: Inputs.Text, ...l10n.general.faq.question },
          { field: "answer", InputComponent: Inputs.RichText, ...l10n.general.faq.answer },
          {
            field: "video",
            InputComponent: Inputs.FabricBrowser,
            previewable: true,
            ...l10n.general.faq.video
          },
          {
            field: "images",
            InputComponent: Inputs.List,
            ...l10n.general.faq.images,
            fields: [
              {
                ...l10n.general.faq.image_position,
                InputComponent: Inputs.Select,
                field: "position",
                defaultValue: "inside",
                options: [
                  { label: "Before", value: "before" },
                  { label: "Inside", value: "inside" },
                  { label: "After", value: "after" }
                ]
              },
              {
                ...l10n.general.faq.image_link,
                InputComponent: Inputs.URL,
                field: "link"
              },
              {
                ...l10n.general.faq.image,
                InputComponent: Inputs.ImageInput,
                altTextField: "image_alt",
                fields: [
                  { baseSize: 100, field: "image", aspectRatio: 2, ...l10n.general.faq.image_desktop },
                  { baseSize: 100, field: "image_mobile", aspectRatio: 2, ...l10n.general.faq.image_mobile }
                ]
              }
            ]
          }
        ]}
      />
    </>
  );
});

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
        localizable
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

      <Inputs.Select
        {...inputProps}
        {...l10n.general.currency}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info"
        field="currency"
        defaultValue="USD"
        searchable
        options={
          Object.keys(currencies)
            .sort((a, b) => currencies[a] > currencies[b] ? 1 : -1)
            .map(currencyCode => ({
              label: `${currencies[currencyCode]} (${currencyCode})`,
              value: currencyCode
            }))
        }
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.general.language}
        searchable
        defaultValue="en"
        subcategory={l10n.categories.info}
        field="language"
        options={
          Object.keys(LanguageCodes).map(key => ({
            label: `[${key}] - ${LanguageCodes[key]}`,
            value: key
          }))
        }
      />

      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.general.localizations}
        searchable
        subcategory={l10n.categories.info}
        field="localizations"
        options={
          Object.keys(LanguageCodes).map(key => ({
            label: `[${key}] - ${LanguageCodes[key]}`,
            value: key
          }))
        }
      />

      <Inputs.Password
        {...inputProps}
        {...l10n.general.preview_password}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info"
        field="preview_password_digest"
      />

      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.general.image}
        componentProps={{maw: uiStore.inputWidthWide}}
        subcategory={l10n.categories.info}
        aspectRatio={2/3}
        localizable
        field="image"
      />

      <Inputs.ImageInput
        {...inputProps}
        label="Header Logo"
        localizable
        componentProps={{maw: uiStore.inputWidthWide}}
        subcategory={l10n.categories.info}
        fields={[
          { field: "header_logo", aspectRatio: 1, ...l10n.general.header_logo },
          { field: "tv_header_logo", aspectRatio: 1, ...l10n.general.tv_header_logo },
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.start_screen}
        componentProps={{maw: uiStore.inputWidthWide}}
        subcategory={l10n.categories.info}
        localizable
        fields={[
          { field: "start_screen_background", aspectRatio: 16/9, ...l10n.general.start_screen_background },
          { field: "start_screen_logo", aspectRatio: 1, ...l10n.general.start_screen_logo },
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

      <Inputs.Select
        {...inputProps}
        {...l10n.general.permission_items_unauthorized_permissions_behavior}
        subcategory={l10n.categories.permissions}
        path={UrlJoin(inputProps.path, "permissions")}
        field="permission_items_unauthorized_permissions_behavior"
        defaultValue=""
        options={[
          { label: "Default (Use Content Permission Behavior)", value: "", },
          ...Object.keys(mediaPropertyStore.PERMISSION_BEHAVIORS)
            .filter(key => key !== "show_purchase")
            .map(key => ({
              label: mediaPropertyStore.PERMISSION_BEHAVIORS[key],
              value: key
            })),
          { label: "Show Alternate Page", value: "show_alternate_page" }
        ]}
      />
      {
        info?.permissions?.permission_items_unauthorized_permissions_behavior !== "show_alternate_page" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.general.permission_items_unauthorized_alternate_page}
            subcategory={l10n.categories.permissions}
            path={UrlJoin(inputProps.path, "permissions")}
            field="permission_items_unauthorized_alternate_page_id"
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


      <Title order={3} mt={50}  mb="md">{l10n.categories.additional_settings}</Title>

      <Accordion maw={uiStore.inputWidthExtraWide} variant="contained">
        <Accordion.Item value="subproperties">
          <Accordion.Control>
            { l10n.categories.subproperties }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.MultiSelect
              {...inputProps}
              {...l10n.general.subproperties.subproperties}
              subcategory={l10n.categories.subproperties}
              field="subproperties"
              options={
                mediaPropertyStore.allMediaProperties.map(mediaProperty => ({
                  label: mediaProperty.name,
                  value: mediaProperty.objectId
                }))
                  .filter(({value}) => value !== mediaPropertyId)
              }
            />
            {
              !info.subproperties || info.subproperties.length <= 0 ? null :
              <>
                <Inputs.Checkbox
                  {...inputProps}
                  {...l10n.general.subproperties.show_property_selection}
                  subcategory={l10n.categories.subproperties}
                  field="show_property_selection"
                  defaultValue={false}
                />

                {
                  !info.show_property_selection ? null :
                    <Inputs.List
                      {...inputProps}
                      {...l10n.general.subproperties.property_selection}
                      maw={uiStore.inputWidthWide}
                      subcategory={l10n.categories.subproperties}
                      field="property_selection"
                      newItemSpec={MediaPropertySubpropertySpec}
                      renderItem={props => (
                        <>
                          <Inputs.Select
                            {...props}
                            {...l10n.general.subproperties.property}
                            field="property_id"
                            options={
                              (mediaPropertyStore.allMediaProperties || []).map(mediaProperty => ({
                                label: mediaProperty.name,
                                value: mediaProperty.objectId
                              }))
                                .filter(({value}) => {
                                  const index = info.property_selection?.findIndex(({property_id}) => property_id === value);
                                  return (mediaPropertyId === value || info.subproperties.includes(value)) && (index < 0 || index === props.index);
                                })
                            }
                          />
                          <Inputs.Text
                            {...props}
                            {...l10n.general.subproperties.title}
                            field="title"
                          />
                          <Inputs.ImageInput
                            {...props}
                            {...l10n.general.images}
                            fields={[
                              {...l10n.general.subproperties.icon, field: "icon", aspectRatio: 1, baseSize: 100},
                              {...l10n.general.subproperties.logo, field: "logo", aspectRatio: 16/9, baseSize: 100},
                              {...l10n.general.subproperties.tile, field: "tile", aspectRatio: 16/9, baseSize: 100}
                            ]}
                          />
                          {
                            props.item?.property_id === mediaPropertyId ? null :
                              <PermissionItemSelect
                                multiple
                                {...props}
                                {...l10n.general.subproperties.permissions}
                                permissionSetIds={info.permission_sets}
                                field="permission_item_ids"
                              />
                          }
                        </>
                      )}
                    />
                }
              </>
            }
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="main_page_display">
          <Accordion.Control>
            { l10n.categories.main_page_display }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.ImageInput
              {...inputProps}
              localizable
              componentProps={{maw: uiStore.inputWidthWide}}
              subcategory={l10n.categories.main_page_display}
              fields={[
                { field: "image", aspectRatio: 2/3, ...l10n.general.image },
                { field: "image_tv", aspectRatio: 16/9, ...l10n.general.image_tv },
              ]}
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
                    localizable
                  />
                </>
            }

          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="footer">
          <Accordion.Control>
            { l10n.categories.footer }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.InputWrapper
              {...l10n.general.social_links}
            >
              <Inputs.URL
                componentProps={{mt:10}}
                {...inputProps}
                {...l10n.general.social_links.options.facebook}
                subcategory={l10n.categories.social_links}
                localizable
                path="/public/asset_metadata/info/footer/social_links"
                field="facebook"
              />
              <Inputs.URL
                {...inputProps}
                {...l10n.general.social_links.options.instagram}
                subcategory={l10n.categories.social_links}
                localizable
                path="/public/asset_metadata/info/footer/social_links"
                field="instagram"
              />
              <Inputs.URL
                {...inputProps}
                {...l10n.general.social_links.options.tiktok}
                subcategory={l10n.categories.social_links}
                localizable
                path="/public/asset_metadata/info/footer/social_links"
                field="tiktok"
              />
              <Inputs.URL
                {...inputProps}
                {...l10n.general.social_links.options.x}
                subcategory={l10n.categories.social_links}
                localizable
                path="/public/asset_metadata/info/footer/social_links"
                field="x"
              />
              <Inputs.URL
                {...inputProps}
                {...l10n.general.social_links.options.linkedin}
                subcategory={l10n.categories.social_links}
                localizable
                path="/public/asset_metadata/info/footer/social_links"
                field="linkedin"
              />
              <Inputs.URL
                {...inputProps}
                {...l10n.general.social_links.options.bluesky}
                subcategory={l10n.categories.social_links}
                localizable
                path="/public/asset_metadata/info/footer/social_links"
                field="bluesky"
              />

            </Inputs.InputWrapper>

            <Inputs.List
              {...inputProps}
              {...l10n.general.footer_items.footer_items}
              path="/public/asset_metadata/info/footer"
              field="items"
              idField="id"
              newItemSpec={MediaPropertyFooterItemSpec}
              showBottomAddButton={info.footer?.items?.length > 0}
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
                      {...l10n.general.footer_items.text}
                      localizable
                      subcategory={subcategory}
                      field="text"
                    />

                    <Inputs.SingleImageInput
                      {...props}
                      {...l10n.general.footer_items.link_image}
                      localizable
                      aspectRatio={2}
                      baseSize={80}
                      p="md"
                      horizontal
                      subcategory={subcategory}
                      field="link_image"
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
                        { label: l10n.general.footer_items.types.faq, value: "faq" }
                      ]}
                    />
                    {
                      item.type !== "link" ? null :
                        <Inputs.URL
                          {...props}
                          {...l10n.general.footer_items.link_url}
                          localizable
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
                          localizable
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
                          localizable
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
                          localizable
                          subcategory={subcategory}
                          field="content_html"
                          extensions={["html"]}
                        />
                    }
                    {
                      item.type !== "faq" ? null :
                        <Inputs.Text
                          {...props}
                          {...l10n.general.footer_items.faq_slug}
                          localizable
                          subcategory={subcategory}
                          field="faq_slug"
                        />
                    }
                  </>
                );
              }}
            />
            <Inputs.RichText
              {...inputProps}
              {...l10n.general.footer_text}
              localizable
              path="/public/asset_metadata/info/footer"
              subcategory={l10n.categories.footer}
              field="rich_text"
            />
            <Inputs.URL
              {...inputProps}
              {...l10n.general.support_url}
              localizable
              path="/public/asset_metadata/info/footer"
              subcategory={l10n.categories.footer}
              field="support_url"
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="faq">
          <Accordion.Control>
            { l10n.categories.faq }
            <Title order={6} fw={500} maw={uiStore.inputWidth} color="dimmed">{l10n.general.faq.faq_description}</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <FAQForm />

            <Inputs.List
              {...inputProps}
              {...l10n.general.faq.additional_pages}
              path="/public/asset_metadata/info/faq"
              field="additional"
              subcategory={l10n.categories.faq}
              newItemSpec={MediaPropertyFAQSpec}
              renderItem={({index}) => <FAQForm index={index} />}
            />

          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="meta_tags">
          <Accordion.Control>
            { l10n.categories.meta_tags }
            <Title mt={5} order={6} fw={500} color="dimmed" maw={uiStore.inputWidth}>{l10n.general.meta_tags.meta_tags_description}</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Text
              {...inputProps}
              {...l10n.general.meta_tags.site_name}
              localizable
              path={UrlJoin(inputProps.path, "meta_tags")}
              subcategory={l10n.categories.meta_tags}
              placeholder="Eluvio Media wallet"
              field="site_name"
            />

            <Inputs.Text
              {...inputProps}
              {...l10n.general.meta_tags.title}
              localizable
              path={UrlJoin(inputProps.path, "meta_tags")}
              subcategory={l10n.categories.meta_tags}
              field="title"
            />

            <Inputs.TextArea
              {...inputProps}
              {...l10n.general.meta_tags.description}
              localizable
              path={UrlJoin(inputProps.path, "meta_tags")}
              subcategory={l10n.categories.meta_tags}
              field="description"
            />

            <Inputs.ImageInput
              {...inputProps}
              {...l10n.general.meta_tags.image}
              localizable
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
              localizable
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
          </Accordion.Panel>
        </Accordion.Item>
         <Accordion.Item value="analytics">
          <Accordion.Control>
            { l10n.categories.analytics }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.List
              {...inputProps}
              {...l10n.analytics.analytics_ids}
              subcategory={l10n.categories.analytics}
              path="/public/asset_metadata/info"
              field="analytics_ids"
              fields={[
                {
                  ...l10n.analytics.label,
                  InputComponent: Inputs.Text,
                  field: "label",
                },
                {
                  ...l10n.analytics.analytics_type,
                  InputComponent: Inputs.Select,
                  field: "type",
                  options: [
                    { label: "Google Analytics ID", value: "google_analytics_id"},
                    { label: "Google Tag Manager ID", value: "google_tag_manager_id"},
                    { label: "Meta Pixel ID", value: "meta_pixel_id"},
                    { label: "X Pixel ID", value: "twitter_pixel_id"},
                    { label: "App Nexus Segment ID", value: "app_nexus_segment_id"}
                  ]
                },
                {
                  ...l10n.analytics.id,
                  InputComponent: Inputs.Text,
                  field: "id",
                  label: "ID"
                }
              ]}
            />
          </Accordion.Panel>
         </Accordion.Item>
      </Accordion>
    </PageContent>
  );
});

export default MediaPropertyGeneralSettings;
