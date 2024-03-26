import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {GenerateUUID} from "@/helpers/Misc.js";

const MediaCatalogGeneralSettings = observer(() => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - General`}
      section="mediaCatalog"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.common.name}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info"
        field="name"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        subcategory={l10n.categories.info}
        path="/public/asset_metadata/info"
        field="description"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.common.image}
        subcategory={l10n.categories.info}
        fields={[
          { field: "image", ...l10n.common.image },
        ]}
      />
    </PageContent>
  );
});

export default MediaCatalogGeneralSettings;
