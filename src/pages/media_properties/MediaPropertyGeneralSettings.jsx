import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceMultiselect} from "@/components/inputs/ResourceSelection.jsx";
import {Slugify} from "@/components/common/Validation.jsx";
import {Group} from "@mantine/core";

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
      title={`${info.name || mediaProperty.name || "MediaProperty"} - General`}
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
    </PageContent>
  );
});

export default MediaPropertyGeneralSettings;
