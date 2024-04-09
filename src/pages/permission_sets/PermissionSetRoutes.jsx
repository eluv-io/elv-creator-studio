import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "@/components/common/SectionLayout.jsx";
import {rootStore, permissionSetStore} from "@/stores";
import PermissionSetList from "@/pages/permission_sets/PermissionSetList.jsx";
import PermissionSetOverview from "@/pages/permission_sets/PermissionSetOverview.jsx";
import PermissionSetGeneralSettings from "@/pages/permission_sets/PermissionSetGeneralSettings.jsx";
import PermissionSetPermissionItems from "@/pages/permission_sets/PermissionSetPermissionItems.jsx";
import PermissionSetPermissionItem from "@/pages/permission_sets/PermissionSetPermissionItem.jsx";

const PermissionSetRoutes = observer(({rootPath}) => {
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.permission_set.nav.overview, path: "/permission-sets/:permissionSetId", Component: <PermissionSetOverview /> },
    { navRoute: true, label: rootStore.l10n.pages.permission_set.nav.general, path: "/permission-sets/:permissionSetId/general", Component: <PermissionSetGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.permission_set.nav.permission_items, path: "/permission-sets/:permissionSetId/permission-items", Component: <PermissionSetPermissionItems /> },
    { label: rootStore.l10n.pages.permission_set.nav.permission_item, path: "/permission-sets/:permissionSetId/permission-items/:permissionItemId", Component: <PermissionSetPermissionItem /> },
  ]
    .map(route => ({
      ...route,
      route: route.path.replace(rootPath, ""),
      PageTitle: params => permissionSetStore.permissionSets[params.permissionSetId]?.metadata?.public?.asset_metadata?.info?.name
    }));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout />}>
          <Route path="" element={<PermissionSetList />} />
        </Route>
        <Route
          element={
            <SectionLayout
              backLink={({label: rootStore.l10n.pages.permission_set.nav.list, path: "/permission-sets"})}
              links={routes}
              loadingMessage="Loading Permission Set"
              Load={async ({permissionSetId}) => permissionSetId && permissionSetStore.LoadPermissionSet({permissionSetId})}
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

export default PermissionSetRoutes;
