import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "@/components/common/SectionLayout.jsx";
import {rootStore, siteStore} from "@/stores";

import SiteList from "./SiteList.jsx";
import SiteOverview from "./SiteOverview.jsx";
import SiteGeneralSettings from "./SiteGeneralSettings.jsx";
import SiteHero from "./SiteHero.jsx";
import SiteBanners from "./SiteBanners.jsx";
import SiteTheme from "./SiteTheme.jsx";
import SiteOffers from "./SiteOffers.jsx";
import SiteFAQ from "./SiteFAQ.jsx";
import SiteSearch from "./SiteSearch.jsx";

const SiteRoutes = observer(({rootPath}) => {
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.site.nav.overview, path: "/sites/:siteId", Component: <SiteOverview /> },
    { navRoute: true, label: rootStore.l10n.pages.site.nav.general, path: "/sites/:siteId/general", Component: <SiteGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.site.nav.hero, path: "/sites/:siteId/hero", Component: <SiteHero /> },
    { navRoute: true, label: rootStore.l10n.pages.site.nav.banners, path: "/sites/:siteId/banners", Component: <SiteBanners /> },
    { navRoute: true, label: rootStore.l10n.pages.site.nav.theme, path: "/sites/:siteId/theme", Component: <SiteTheme /> },
    { navRoute: true, label: rootStore.l10n.pages.site.nav.offers, path: "/sites/:siteId/offers", Component: <SiteOffers /> },
    { navRoute: true, label: rootStore.l10n.pages.site.nav.faq, path: "/sites/:siteId/faq", Component: <SiteFAQ /> },
    { navRoute: true, label: rootStore.l10n.pages.site.nav.analytics, path: "/sites/:siteId/analytics", Component: <SiteSearch /> }
  ]
    .map(route => ({
      ...route,
      route: route.path.replace(rootPath, ""),
      // Display the site name as the title
      PageTitle: params =>
        siteStore.sites[params.siteId]?.metadata?.public?.asset_metadata?.info?.name ||
        siteStore.allSites?.find(site => site.objectId === params.siteId)?.name
    }));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout />}>
          <Route path="" element={<SiteList />} />
        </Route>
        <Route
          element={
            <SectionLayout
              backLink={({label: rootStore.l10n.pages.site.nav.list, path: "/sites"})}
              links={routes}
              loadingMessage="Loading Site"
              Load={async ({siteId}) => siteId && siteStore.LoadSite({siteId})}
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

export default SiteRoutes;
