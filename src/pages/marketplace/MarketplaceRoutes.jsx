import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "Components/common/SectionLayout.jsx";
import {rootStore, marketplaceStore} from "Stores";

import MarketplaceList from "./MarketplaceList.jsx";
import MarketplaceGeneralSettings from "./MarketplaceGeneralSettings.jsx";
import MarketplaceDetails from "./MarketplaceDetails.jsx";
import MarketplaceImages from "./MarketplaceImages";
import MarketplaceTheme from "./MarketplaceTheme";
import MarketplaceItems, {MarketplaceItem} from "./MarketplaceItems.jsx";
import MarketplaceCollections, {MarketplaceCollection} from "./MarketplaceCollections.jsx";
import MarketplaceVotingEvents, {MarketplaceVotingEvent} from "./MarketplaceVotingEvents.jsx";
import MarketplaceAnalytics from "./MarketplaceAnalytics";

const MarketplaceRoutes = observer(() => {
  const rootPath = "/marketplaces/";
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.marketplaces.nav.overview, path: "/marketplaces/:marketplaceId", Component: <MarketplaceDetails /> },
    { navRoute: true, label: rootStore.l10n.pages.marketplaces.nav.general, path: "/marketplaces/:marketplaceId/general", Component: <MarketplaceGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.marketplaces.nav.images, path: "/marketplaces/:marketplaceId/images", Component: <MarketplaceImages /> },
    { navRoute: true, label: rootStore.l10n.pages.marketplaces.nav.theme, path: "/marketplaces/:marketplaceId/theme", Component: <MarketplaceTheme /> },
    { navRoute: true, label: rootStore.l10n.pages.marketplaces.nav.items, path: "/marketplaces/:marketplaceId/items", Component: <MarketplaceItems /> },
    { label: rootStore.l10n.pages.marketplaces.nav.items, path: "/marketplaces/:marketplaceId/items/:sku", Component: <MarketplaceItem /> },
    { navRoute: true, label: rootStore.l10n.pages.marketplaces.nav.collections, path: "/marketplaces/:marketplaceId/collections", Component: <MarketplaceCollections /> },
    { label: rootStore.l10n.pages.marketplaces.nav.collections, path: "/marketplaces/:marketplaceId/collections/:collectionId", Component: <MarketplaceCollection /> },
    { navRoute: true, label: rootStore.l10n.pages.marketplaces.nav.voting_events, path: "/marketplaces/:marketplaceId/voting-events", Component: <MarketplaceVotingEvents /> },
    { label: rootStore.l10n.pages.marketplaces.nav.voting_events, path: "/marketplaces/:marketplaceId/voting-events/:votingEventId", Component: <MarketplaceVotingEvent /> },
    { navRoute: true, label: rootStore.l10n.pages.marketplaces.nav.analytics, path: "/marketplaces/:marketplaceId/analytics", Component: <MarketplaceAnalytics /> },
  ]
    .map(route => ({
      ...route,
      route: route.path.replace(rootPath, ""),
      // Display the marketplace name as the title
      PageTitle: params => marketplaceStore.marketplaces[params.marketplaceId]?.metadata?.public?.asset_metadata?.info?.branding?.name
    }));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout />}>
          <Route path="" element={<MarketplaceList />} />
        </Route>
        <Route
          element={
            <SectionLayout
              backLink={({label: rootStore.l10n.pages.marketplaces.nav.list, path: "/marketplaces"})}
              links={routes}
              loadingMessage="Loading Marketplace"
              Load={async ({marketplaceId}) => marketplaceId && marketplaceStore.LoadMarketplace({marketplaceId})}
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

export default MarketplaceRoutes;
