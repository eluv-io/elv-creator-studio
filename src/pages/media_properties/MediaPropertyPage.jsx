import {observer} from "mobx-react-lite";
import {Link, useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import {Button, Text} from "@mantine/core";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs, {Confirm} from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {useState} from "react";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import {IconExternalLink} from "@tabler/icons-react";
import {MediaPropertySectionSelectionModal} from "@/pages/media_properties/MediaPropertySections.jsx";
import {ValidateSlug} from "@/components/common/Validation.jsx";
import {MediaPropertyPageActionSpec, MediaPropertySectionItemPurchaseItemSpec} from "@/specs/MediaPropertySpecs.js";
import ColorOptions from "@/components/inputs/media_property/Components";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {MediaItemCard} from "@/components/common/MediaCatalog.jsx";
import {Input as MantineInput} from "@mantine/core";
import {MediaCatalogItemSelectionModal} from "@/components/inputs/media_catalog/MediaCatalogItemTable.jsx";
import {MarketplaceSelect} from "@/components/inputs/ResourceSelection.jsx";
import {MarketplaceItemSelect} from "@/components/inputs/marketplace/MarketplaceItemInput.jsx";

const PageActionConditions = {
  "always": "Always",
  "authorized": "User has permissions",
  "unauthorized": "User is signed in but lacks permissions",
  "authenticated": "User is signed in",
  "unauthenticated": "User is not signed in",
  "unauthenticated_or_unauthorized": "User is not signed in or lacks permissions",
};

const PageActionBehaviors = {
  "sign_in": "Sign In",
  "show_purchase": "Show Purchase Options",
  "video": "Show Video",
  "media_link": "Go to Media",
  "link": "Link to URL"
};

const ActionBehaviorConfiguration = observer(({inputProps, info, action}) => {
  const l10n = rootStore.l10n.pages.media_property.form;
  const [showMediaSelectionModal, setShowMediaSelectionModal] = useState(false);

  const selectedMediaItem = mediaPropertyStore.GetMediaItem({mediaItemId: action.media_id});

  switch(action.behavior) {
    case "show_purchase":
      return (
        <Inputs.List
          {...inputProps}
          {...l10n.section_items.purchasable_items}
          newItemSpec={MediaPropertySectionItemPurchaseItemSpec}
          field="items"
          maw="100%"
          renderItem={props => {
            return (
              <>
                <Inputs.UUID
                  {...props}
                  hidden
                  field="id"
                />
                <PermissionItemSelect
                  {...l10n.section_items.purchasable_item.permission_item_id}
                  {...props}
                  defaultValue=""
                  field="permission_item_id"
                  permissionSetIds={info?.permission_sets}
                />
                {
                  props.item.permission_item_id ? null :
                    <>
                      <Inputs.Text
                        {...props}
                        {...l10n.section_items.purchasable_item.title}
                        subcategory={l10n.categories.purchase_item}
                        field="title"
                      />
                      <Inputs.Text
                        {...props}
                        {...l10n.section_items.purchasable_item.subtitle}
                        subcategory={l10n.categories.purchase_item}
                        field="subtitle"
                      />
                      <Inputs.TextArea
                        {...props}
                        {...l10n.section_items.purchasable_item.description}
                        subcategory={l10n.categories.purchase_item}
                        field="description"
                      />
                      <MarketplaceSelect
                        {...props}
                        {...l10n.section_items.purchasable_item.marketplace}
                        subcategory={l10n.categories.purchase_item}
                        path={UrlJoin(props.path, "/marketplace")}
                        field="marketplace_slug"
                        defaultFirst
                      />
                      <MarketplaceItemSelect
                        {...props}
                        {...l10n.section_items.purchasable_item.marketplace_sku}
                        subcategory={l10n.categories.purchase_item}
                        marketplaceSlug={props.item?.marketplace?.marketplace_slug}
                        field="marketplace_sku"
                        componentProps={{
                          withBorder: false,
                          p: 0,
                          pt: 0,
                          pb: 0,
                          mb:0
                        }}
                      />
                    </>
                }
                <Inputs.Checkbox
                  {...props}
                  {...l10n.section_items.purchasable_item.use_item_image}
                  INVERTED
                  defaultValue={false}
                  subcategory={l10n.categories.purchase_item}
                  field="use_custom_image"
                />
                {
                  !props.item.use_custom_image ? null :
                    <Inputs.ImageInput
                      {...props}
                      {...l10n.section_items.purchasable_item.image}
                      subcategory={l10n.categories.purchase_item}
                      fields={[
                        {field: "image"}
                      ]}
                    />
                }
              </>
            );
          }}
        />
      );
    case "video":
      return (
        <Inputs.FabricBrowser
          {...inputProps}
          {...l10n.actions.video}
          autoUpdate={false}
          field="video"
          previewable
        />
      );
    case "media_link":
      return (
        <>
          <MantineInput.Wrapper
            disabled
            {...l10n.actions.media_item}
          >
            <Button my="xs" variant="outline" onClick={() => setShowMediaSelectionModal(true)}>
              { l10n.section_items.select_media.label }
            </Button>
            {
              !selectedMediaItem ? null :
                <MediaItemCard
                  key={`media-item-${selectedMediaItem.id}`}
                  mediaItem={selectedMediaItem}
                  imageSize={50}
                  withLink
                />
            }
          </MantineInput.Wrapper>
          {
            !showMediaSelectionModal ? null :
              <MediaCatalogItemSelectionModal
                multiple={false}
                allowTypeSelection
                mediaCatalogIds={info.media_catalogs || []}
                Close={() => setShowMediaSelectionModal(false)}
                Submit={(mediaItemIds) => {
                  mediaPropertyStore.SetMetadata({
                    ...inputProps,
                    ...l10n.actions.media_item,
                    page: location.pathname,
                    field: "media_id",
                    value: mediaItemIds?.[0] || "",
                  });
                }}
              />
          }
        </>
      );
    case "link":
      return (
        <Inputs.URL
          {...inputProps}
          {...l10n.actions.url}
          field="url"
        />
      );
    default:
      return null;
  }
});

export const MediaPropertyPageAction = observer(() => {
  const { mediaPropertyId, pageId, actionId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const page = info.pages?.[pageId];

  if(!page) {
    return null;
  }

  const actionIndex = page?.actions?.findIndex(action => action.id === actionId);
  const action = page?.actions[actionIndex];

  if(!action) {
    return null;
  }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id: pageId, label: page.label}),
    subcategory: () => LocalizeString(l10n.categories.page_action_label, { label: action.label }),
    path: UrlJoin("/public/asset_metadata/info/pages", pageId, "actions", actionIndex.toString())
  };

  return (
    <PageContent
      backLink={UrlJoin("/media-properties", mediaPropertyId, "pages", pageId)}
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${page.label || ""} - Actions - ${action.label || ""}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.actions.sections.general}</Title>
      <Inputs.Text
        {...inputProps}
        {...l10n.pages.label}
        field="label"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.pages.description}
        field="description"
      />

      <Title order={3} mt={50} mb="md">{l10n.actions.sections.visibility}</Title>
      <Inputs.Select
        {...inputProps}
        {...l10n.actions.visibility}
        defaultValue="always"
        field="visibility"
        options={
          Object.keys(PageActionConditions).map(key => ({label: PageActionConditions[key], value: key}))
        }
      />
      {
        !["authorized", "unauthorized", "unauthenticated_or_unauthorized"].includes(action.visibility) ? null :
          <PermissionItemSelect
            multiple
            {...inputProps}
            {...l10n.actions.permissions}
            permissionSetIds={info.permission_sets}
            subcategory={l10n.categories.permissions}
            field="permissions"
          />
      }

      <Title order={3} mt={50} mb="md">{l10n.actions.sections.behavior}</Title>
      <Inputs.Select
        {...inputProps}
        {...l10n.actions.behavior}
        defaultValue="sign_in"
        field="behavior"
        options={
          Object.keys(PageActionBehaviors).map(key => ({label: PageActionBehaviors[key], value: key}))
        }
      />
      <ActionBehaviorConfiguration
        inputProps={inputProps}
        action={action}
        info={info}
      />

      <Title order={3} mt={50} mb="md">{l10n.actions.sections.button}</Title>
      <ColorOptions
        field="button"
        includeTextField
        includeIcon
        defaultValues={{
          background_color: "#FFFFFF",
          text_color: "#000000",
          border_radius: 5
        }}
        {...l10n.actions.button}
        {...inputProps}
      />
    </PageContent>
  );

});

const MediaPropertyPage = observer(() => {
  const [showSectionSelectionModal, setShowSectionSelectionModal] = useState(false);
  const { mediaPropertyId, pageId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const page = info.pages?.[pageId];

  if(!page) {
    return null;
  }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id: pageId, label: page.label}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/pages", pageId)
  };

  return (
    <PageContent
      backLink={UrlJoin("/media-properties", mediaPropertyId, "pages")}
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.pages} - ${page.label || ""}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.general}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.common.id}
        disabled
        field="id"
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.common.slug}
        field="slug"
        Validate={ValidateSlug}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.pages.label}
        field="label"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.pages.description}
        field="description"
      />

      {
        info.page_ids.main === pageId ?
          <Text italic fz="xs">This is the main page for this property</Text> :
          <Button
            onClick={async () => {
              await Confirm({
                title: LocalizeString(l10n.action_labels.set_main_page, {label: page.label}),
                text: LocalizeString(l10n.action_labels.set_main_page_confirm, {label: page.label}),
                onConfirm: () => mediaPropertyStore.SetPropertyPageSlug({mediaPropertyId, pageId, slug: "main"})
              });
            }}
          >
            { l10n.action_labels.set_main_page }
          </Button>
      }

      <Title order={3} mb="md" mt={50}>{l10n.categories.permissions}</Title>

      <PermissionItemSelect
        multiple
        {...inputProps}
        {...l10n.pages.page_permissions}
        permissionSetIds={info.permission_sets}
        path={UrlJoin(inputProps.path, "permissions")}
        subcategory={l10n.categories.permissions}
        defaultValue=""
        field="page_permissions"
      />
      {
        (page.permissions?.page_permissions || []).length === 0 ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.pages.page_permission_behavior}
              subcategory={l10n.categories.permissions}
              path={UrlJoin(inputProps.path, "permissions")}
              field="page_permissions_behavior"
              defaultValue="show_alternate_page"
              options={[
                { label: "Show Alternate Page", value: "show_alternate_page" },
                { label: "Show Purchase Options", value: "show_purchase" }
              ]}
            />
            {
              page?.permissions?.page_permissions_behavior !== "show_alternate_page" ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.pages.page_permission_alternate_page}
                  subcategory={l10n.categories.permissions}
                  path={UrlJoin(inputProps.path, "permissions")}
                  field="page_permissions_alternate_page_id"
                  options={[
                    ...Object.keys(info.pages || {})
                      .filter(pageId => pageId !== "main" && pageId !== page.id)
                      .map(pageId => ({
                        label: info.pages[pageId].label,
                        value: pageId
                      }))
                  ]}
                />
            }
          </>
      }

      <Inputs.Select
        {...inputProps}
        {...l10n.pages.permission_behavior}
        subcategory={l10n.categories.permissions}
        defaultValue=""
        path={UrlJoin(inputProps.path, "permissions")}
        field="behavior"
        options={[
          { label: "Default", value: "" },
          ...Object.keys(mediaPropertyStore.PERMISSION_BEHAVIORS).map(key => ({
            label: mediaPropertyStore.PERMISSION_BEHAVIORS[key],
            value: key
          })),
          { label: "Show Alternate Page", value: "show_alternate_page"}
        ]}
      />

      {
        page.permissions?.behavior !== "show_alternate_page" ? null :
          <Inputs.Select
            {...inputProps}
            {...l10n.general.alternate_page}
            subcategory={l10n.categories.permissions}
            path={UrlJoin(inputProps.path, "permissions")}
            field="alternate_page_id"
            options={[
              { label: "(Property Main Page)", value: "main" },
              ...Object.keys(info.pages || {})
                .filter(pageId => pageId !== "main" && pageId !== page.id)
                .map(pageId => ({
                  label: info.pages[pageId].label,
                  value: pageId
                }))
            ]}
          />
      }


      <Title order={3} mb="md" mt={50}>{l10n.categories.page_header}</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.pages.header.position}
        defaultValue="Left"
        subcategory={l10n.categories.page_header}
        path={UrlJoin("/public/asset_metadata/info/pages", pageId, "layout")}
        field="position"
        options={["Left", "Center", "Right"]}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.pages.header.title}
        subcategory={l10n.categories.page_header}
        path={UrlJoin("/public/asset_metadata/info/pages", pageId, "layout")}
        field="title"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.pages.header.description}
        subcategory={l10n.categories.page_header}
        path={UrlJoin("/public/asset_metadata/info/pages", pageId, "layout")}
        field="description"
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.pages.header.description_rich_text}
        subcategory={l10n.categories.page_header}
        path={UrlJoin("/public/asset_metadata/info/pages", pageId, "layout")}
        field="description_rich_text"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.pages.header.logo}
        subcategory={l10n.categories.page_header}
        path={UrlJoin("/public/asset_metadata/info/pages", pageId, "layout")}
        fields={[
          { field: "logo" }
        ]}
        altTextField="logo_alt"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.pages.header.background_image}
        subcategory={l10n.categories.page_header}
        path={UrlJoin("/public/asset_metadata/info/pages", pageId, "layout")}
        fields={[
          { field: "background_image", ...l10n.pages.header.background_image_desktop, aspectRatio: 16/9, baseSize: 125 },
          { field: "background_image_mobile", ...l10n.pages.header.background_image_mobile, aspectRatio: 2/3, baseSize: 125 },
        ]}
      />

      <Title order={3} mb="md" mt={50}>{l10n.categories.page_actions}</Title>
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.pages.actions}
        subcategory={l10n.categories.page_actions}
        path={UrlJoin("/public/asset_metadata/info/pages", pageId)}
        routePath="actions"
        newItemSpec={MediaPropertyPageActionSpec}
        field="actions"
        idField="id"
        GetName={action => action.label || "Action"}
        columns={[
          {
            label: l10n.actions.label.label,
            field: "label"
          },
          {
            label: l10n.actions.visibility.label,
            field: "visibility",
            render: action => <Text>{PageActionConditions[action?.visibility || ""]}</Text>
          }
        ]}
      />

      <Title order={3} mb="md" mt={50}>{l10n.categories.sections}</Title>

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.pages.sections}
        subcategory={l10n.categories.sections}
        path={UrlJoin("/public/asset_metadata/info/pages", pageId, "layout")}
        field="sections"
        idField="."
        GetName={sectionId => info.sections[sectionId]?.label}
        editable={false}
        AddItem={() => setShowSectionSelectionModal(true)}
        Actions={sectionId => [
          <IconButton
            key="link-button"
            label={LocalizeString(rootStore.l10n.components.inputs.navigate_to, {item: info.sections[sectionId]?.label || sectionId })}
            component={Link}
            to={UrlJoin("/media-properties/", mediaPropertyId, "sections", sectionId)}
            color="purple.6"
            Icon={IconExternalLink}
          />
        ]}
        columns={[
          {
            label: l10n.sections.label.label,
            field: "label",
            render: sectionId => <Text>{info.sections[sectionId]?.label || (!info.sections[sectionId] ? "<Deleted Section>" : sectionId)}</Text>
          },
          {
            label: l10n.sections.type.label,
            field: "type",
            render: sectionId => <Text>{info.sections[sectionId]?.type?.capitalize() || ""}</Text>,
            width: 175
          },
          {
            label: l10n.sections.display.display_format.label,
            field: "display_format",
            render: sectionId => <Text>{info.sections[sectionId]?.display?.display_format?.capitalize() || ""}</Text>,
            width: 175
          }
        ]}
      />

      {
        !showSectionSelectionModal ? null :
          <MediaPropertySectionSelectionModal
            mediaPropertyId={mediaPropertyId}
            excludedSectionIds={page.layout?.sections || []}
            Close={() => setShowSectionSelectionModal(false)}
            Submit={sectionIds => {
              sectionIds.forEach(sectionId => {
                mediaPropertyStore.InsertListElement({
                  ...inputProps,
                  path: UrlJoin("/public/asset_metadata/info/pages", pageId, "layout"),
                  subcategory: l10n.categories.sections,
                  page: location.pathname,
                  field: "sections",
                  value: sectionId,
                  label: info.sections[sectionId]?.label || sectionId
                });
              });

              setShowSectionSelectionModal(false);
            }}
          />
      }
    </PageContent>
  );
});

export default MediaPropertyPage;
