import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import MediaItemSharedItemFields, {MediaItemSubList} from "@/pages/media_catalogs/MediaItemSharedItemFields.jsx";

const MediaCatalogMediaList = observer(() => {
  const { mediaCatalogId, mediaCollectionId } = useParams();

  const type = "media_collections";
  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const mediaItem = info[type]?.[mediaCollectionId];

  if(!mediaItem) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories[type]} - ${mediaItem.title}`}
      backLink={UrlJoin("/media-catalogs", mediaCatalogId, type)}
      section="mediaCatalog"
      useHistory
    >
      <MediaItemSharedItemFields type={type} mediaId={mediaCollectionId} />

      <Title order={3} mt={50} mb="md">{ l10n.categories.media_lists }</Title>
      <MediaItemSubList type={type} mediaId={mediaCollectionId} />
    </PageContent>
  );
});

export default MediaCatalogMediaList;
