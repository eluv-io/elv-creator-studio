import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "@/components/common/SectionLayout.jsx";
import {rootStore, mediaCatalogStore} from "@/stores";

import MediaCatalogList from "./MediaCatalogList.jsx";
import MediaCatalogOverview from "@/pages/media_catalogs/MediaCatalogOverview.jsx";
import MediaCatalogGeneralSettings from "@/pages/media_catalogs/MediaCatalogGeneralSettings.jsx";
import MediaCatalogItems from "@/pages/media_catalogs/MediaCatalogItems.jsx";
import MediaCatalogMediaItem from "@/pages/media_catalogs/MediaCatalogMediaItem.jsx";
import MediaCatalogTags, {MediaCatalogAttribute} from "@/pages/media_catalogs/MediaCatalogTags.jsx";
import MediaCatalogMediaList from "@/pages/media_catalogs/MediaCatalogMediaList.jsx";
import MediaCatalogMediaCollection from "@/pages/media_catalogs/MediaCatalogMediaCollection.jsx";

const MediaCatalogRoutes = observer(({rootPath}) => {
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.overview, path: "/media-catalogs/:mediaCatalogId", Component: <MediaCatalogOverview /> },
    { navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.general, path: "/media-catalogs/:mediaCatalogId/general", Component: <MediaCatalogGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.tags, path: "/media-catalogs/:mediaCatalogId/tags", Component: <MediaCatalogTags /> },
    { label: rootStore.l10n.pages.media_catalog.nav.tags, path: "/media-catalogs/:mediaCatalogId/tags/:attributeId", Component: <MediaCatalogAttribute /> },
    { navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.media, path: "/media-catalogs/:mediaCatalogId/media", Component: <MediaCatalogItems type="media" /> },
    { label: rootStore.l10n.pages.media_catalog.nav.media, path: "/media-catalogs/:mediaCatalogId/media/:mediaItemId", Component: <MediaCatalogMediaItem /> },
    { label: rootStore.l10n.pages.media_catalog.nav.media, path: "/media-catalogs/:mediaCatalogId/media/:mediaItemId/gallery/:galleryItemId", Component: <MediaCatalogMediaItem /> },
    { navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.media_lists, path: "/media-catalogs/:mediaCatalogId/media-lists", Component: <MediaCatalogItems type="media_lists" /> },
    { label: rootStore.l10n.pages.media_catalog.nav.media_list, path: "/media-catalogs/:mediaCatalogId/media-lists/:mediaListId", Component: <MediaCatalogMediaList /> },
    { navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.media_collections, path: "/media-catalogs/:mediaCatalogId/media-collections", Component: <MediaCatalogItems type="media_collections" /> },
    { label: rootStore.l10n.pages.media_catalog.nav.media_collection, path: "/media-catalogs/:mediaCatalogId/media-collections/:mediaCollectionId", Component: <MediaCatalogMediaCollection /> },
  ]
    .map(route => ({
      ...route,
      route: route.path.replace(rootPath, ""),
      PageTitle: params => mediaCatalogStore.mediaCatalogs[params.mediaCatalogId]?.metadata?.public?.asset_metadata?.info?.name
    }));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout />}>
          <Route path="" element={<MediaCatalogList />} />
        </Route>
        <Route
          element={
            <SectionLayout
              backLink={({label: rootStore.l10n.pages.media_catalog.nav.list, path: "/media-catalogs"})}
              links={routes}
              loadingMessage="Loading Media Catalog"
              Load={async ({mediaCatalogId}) => mediaCatalogId && mediaCatalogStore.LoadMediaCatalog({mediaCatalogId})}
            />
          }
        >
          {
            routes.map(({path, route, Component}) =>
              <Route key={`route-${path}`} path={route} exact element={Component} />
            )
          }
        </Route>
      </Route>
    </Routes>
  );
});

export default MediaCatalogRoutes;
