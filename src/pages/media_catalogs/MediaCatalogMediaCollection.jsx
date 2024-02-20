import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import UrlJoin from "url-join";
import MediaItemSharedItemFields from "@/pages/media_catalogs/MediaItemSharedItemFields.jsx";

const MediaCatalogMediaCollection = observer(() => {
  const { mediaCatalogId, mediaCollectionId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const mediaItem = info.media_collections?.[mediaCollectionId];

  if(!mediaItem) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({type: "media_collections", mediaCatalogId, id: mediaCollectionId}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/media_collections/", mediaCollectionId)
  };

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.media_collections} - ${mediaItem.title}`}
      backLink={UrlJoin("/media-catalogs", mediaCatalogId, "media_collections")}
      section="mediaCatalog"
      useHistory
    >
      <MediaItemSharedItemFields l10n={l10n} inputProps={inputProps} type="media_collections" />

      <Title order={3} mt={50} mb="md">{ l10n.categories.media }</Title>
    </PageContent>
  );
});

export default MediaCatalogMediaCollection;
