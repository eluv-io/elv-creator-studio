import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Title} from "@mantine/core";

const MediaPropertyLayout = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.layout,
    path: "/public/asset_metadata/info/layout"
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.layout}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.header}</Title>

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.header.logo}
        subcategory={l10n.categories.header}
        fields={[
          { field: "logo" }
        ]}
      />

      <Inputs.Text
        {...inputProps}
        {...l10n.header.title}
        subcategory={l10n.categories.header}
        field="title"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.header.description}
        subcategory={l10n.categories.header}
        field="description"
      />

      <Inputs.RichText
        {...inputProps}
        {...l10n.header.description_rich_text}
        subcategory={l10n.categories.header}
        field="description_rich_text"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.header.background_image}
        subcategory={l10n.categories.header}
        fields={[
          { field: "background_image", ...l10n.header.background_image_desktop },
          { field: "background_image_mobile", ...l10n.header.background_image_mobile },
        ]}
      />

    </PageContent>
  );
});

export default MediaPropertyLayout;
