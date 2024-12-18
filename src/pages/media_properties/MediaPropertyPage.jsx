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
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";

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
  const secondaryEnabled = info.domain?.features?.secondary_marketplace;

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
            {
              page.permissions?.page_permissions_behavior !== "show_purchase" ? null :
                <Inputs.Select
                  {...inputProps}
                  {...l10n.section_items.purchasable_item.secondary_market_purchase_option}
                  subcategory={l10n.categories.permissions}
                  path={UrlJoin(inputProps.path, "permissions")}
                  field="page_permissions_secondary_market_purchase_option"
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
      {
        page.permissions?.behavior !== "show_purchase" ? null :
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
            render: sectionId => (
              <Text>
                {
                  ["manual", "automatic"].includes(info.sections[sectionId]?.type) ?
                    info.sections[sectionId]?.display?.display_format?.capitalize() || "" :
                    info.sections[sectionId]?.type?.capitalize() || ""
                }
              </Text>
            ),
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
