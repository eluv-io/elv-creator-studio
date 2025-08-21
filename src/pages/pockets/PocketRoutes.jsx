import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "@/components/common/SectionLayout.jsx";
import {rootStore, pocketStore} from "@/stores";

import PocketList from "@/pages/pockets/PocketList.jsx";
import PocketOverview from "@/pages/pockets/PocketOverview.jsx";
import PocketGeneralSettings from "@/pages/pockets/PocketGeneralSettings.jsx";
import PocketMedia from "@/pages/pockets/PocketMedia.jsx";
import PocketMediaItem from "@/pages/pockets/PocketMediaItem.jsx";
import PocketSidebarSettings from "@/pages/pockets/PocketSidebarSettings.jsx";

const PocketRoutes = observer(({rootPath}) => {
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.pocket.nav.overview, path: "/pocket/:pocketId", Component: <PocketOverview /> },
    { navRoute: true, label: rootStore.l10n.pages.pocket.nav.general, path: "/pocket/:pocketId/general", Component: <PocketGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.pocket.nav.media, path: "/pocket/:pocketId/media", Component: <PocketMedia /> },
    { label: rootStore.l10n.pages.pocket.nav.media_item, path: "/pocket/:pocketId/media/:pocketMediaItemId", Component: <PocketMediaItem /> },
    { navRoute: true, label: rootStore.l10n.pages.pocket.nav.sidebar, path: "/pocket/:pocketId/sidebar", Component: <PocketSidebarSettings /> },
  ]
    .map(route => ({
      ...route,
      route: route.path.replace(rootPath, ""),
      PageTitle: params => pocketStore.pockets[params.pocketId]?.metadata?.public?.asset_metadata?.info?.name
    }));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout />}>
          <Route path="" element={<PocketList />} />
        </Route>
        <Route
          element={
            <SectionLayout
              backLink={({label: rootStore.l10n.pages.pocket.nav.list, path: "/pocket"})}
              links={routes}
              loadingMessage="Loading Pocket TV Property"
              Load={async ({pocketId}) => pocketId && pocketStore.LoadPocket({pocketId})}
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

export default PocketRoutes;
