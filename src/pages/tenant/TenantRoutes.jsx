import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "Components/common/SectionLayout.jsx";
import {rootStore, tenantStore} from "Stores";

import TenantOverview from "./TenantOverview.jsx";
import TenantGeneralSettings from "./TenantGeneralSettings.jsx";
import TenantTheme from "./TenantTheme.jsx";

const TenantRoutes = observer(({rootPath}) => {
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.tenant.nav.overview, path: "/", Component: <TenantOverview /> },
    { navRoute: true, label: rootStore.l10n.pages.tenant.nav.general, path: "/general", Component: <TenantGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.tenant.nav.theme, path: "/theme", Component: <TenantTheme /> },
  ]
    .map(route => ({
      ...route,
      route: route.path.replace(rootPath, ""),
      // Display the tenant name in the title
      PageTitle: () => tenantStore.latestTenant.metadata?.public?.asset_metadata?.info?.name
    }));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout links={routes} />}>
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

export default TenantRoutes;
