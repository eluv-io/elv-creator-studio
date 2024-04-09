import {observer} from "mobx-react-lite";
import {Link, useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import {Text} from "@mantine/core";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
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
        disabled={page.slug === "main"}
        hidden={page.slug === "main"}
        defaultValue={page.slug === "main" ? "main" : ""}
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

      <Title order={3} mb="md" mt={50}>{l10n.categories.permissions}</Title>

      <Inputs.Select
        {...inputProps}
        {...l10n.pages.permission_behavior}
        subcategory={l10n.categories.permissions}
        defaultValue="default"
        path={UrlJoin(inputProps.path, "permissions")}
        field="behavior"
        options={[
          { label: "Default", value: "default" },
          ...Object.keys(mediaPropertyStore.PERMISSION_BEHAVIORS).map(key => ({
            label: mediaPropertyStore.PERMISSION_BEHAVIORS[key],
            value: key
          })),
          { label: "Show Alternate Page", value: "show_alternate_page" }
        ]}
      />
      {
        page?.permissions?.behavior !== "show_alternate_page" ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.general.alternate_page}
              subcategory={l10n.categories.permissions}
              path={UrlJoin(inputProps.path, "permissions")}
              field="alternate_page"
              options={Object.keys(info.pages || {})
                .filter(id => id !== pageId)
                .map(pageId => ({
                label: info.pages[pageId].label,
                value: pageId
              }))}
            />
            <PermissionItemSelect
              multiple
              permissionSetIds={info.permission_sets || []}
              {...inputProps}
              {...l10n.general.required_permissions}
              subcategory={l10n.categories.permissions}
              path={UrlJoin(inputProps.path, "permissions")}
              field="required_permissions"
            />
          </>
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
