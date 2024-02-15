import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "@/components/common/SectionLayout.jsx";
import {rootStore, mediaCatalogStore} from "@/stores";

import MediaCatalogList from "./MediaCatalogList.jsx";
import MediaCatalogOverview from "@/pages/media_catalogs/MediaCatalogOverview.jsx";
import MediaCatalogGeneralSettings from "@/pages/media_catalogs/MediaCatalogGeneralSettings.jsx";
import MediaCatalogMediaList from "@/pages/media_catalogs/MediaCatalogMediaList.jsx";

const MediaCatalogRoutes = observer(({rootPath}) => {
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.overview, path: "/media-catalogs/:mediaCatalogId", Component: <MediaCatalogOverview /> },
    { navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.general, path: "/media-catalogs/:mediaCatalogId/general", Component: <MediaCatalogGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.media_catalog.nav.media, path: "/media-catalogs/:mediaCatalogId/media", Component: <MediaCatalogMediaList /> },
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
