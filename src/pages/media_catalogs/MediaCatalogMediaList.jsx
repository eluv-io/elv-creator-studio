import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Title} from "@mantine/core";
import UrlJoin from "url-join";
import {MediaCatalogCommonFields, MediaItemSubList} from "@/pages/media_catalogs/MediaCatalogCommon.jsx";

const MediaCatalogMediaList = observer(() => {
  const { mediaCatalogId, mediaListId } = useParams();

  const type = "media_lists";
  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const mediaItem = info[type]?.[mediaListId];

  if(!mediaItem) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories[type]} - ${mediaItem.label}`}
      backLink={UrlJoin("/media-catalogs", mediaCatalogId, "media-lists")}
      section="mediaCatalog"
      useHistory
    >
      <MediaCatalogCommonFields type={type} mediaId={mediaListId} />

      <Title order={3} mt={50} mb="md">{ l10n.categories.media }</Title>
      <MediaItemSubList type={type} mediaId={mediaListId} />
    </PageContent>
  );
});

export default MediaCatalogMediaList;
