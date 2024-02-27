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
    category: mediaPropertyStore.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id: pageId, name: page.name}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/pages", pageId)
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.layout}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.general}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.pages.name}
        field="name"
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
          { field: "background_image", ...l10n.pages.header.background_image_desktop },
          { field: "background_image_mobile", ...l10n.pages.header.background_image_mobile },
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
        GetName={sectionId => info.sections[sectionId]?.name}
        editable={false}
        AddItem={() => setShowSectionSelectionModal(true)}
        Actions={sectionId => [
          <IconButton
            key="link-button"
            label={LocalizeString(rootStore.l10n.components.inputs.navigate_to, {item: info.sections[sectionId]?.name || sectionId })}
            component={Link}
            to={UrlJoin("/media-properties/", mediaPropertyId, "sections", sectionId)}
            color="blue.5"
            Icon={IconExternalLink}
          />
        ]}
        columns={[
          {
            label: l10n.sections.name.label,
            field: "name",
            render: sectionId => <Text>{info.sections[sectionId]?.name || (!info.sections[sectionId] ? "<Deleted Section>" : sectionId)}</Text>
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
                  label: info.sections[sectionId]?.name || sectionId
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
