import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "Components/common/SectionLayout.jsx";
import {marketplaceStore} from "Stores";

import MarketplaceList from "./MarketplaceList.jsx";
import MarketplaceDetails from "./MarketplaceDetails.jsx";

const MarketplaceRoutes = observer(() => {
  const rootPath = "/marketplaces/";
  const routes = [
    { label: "Marketplace Details", path: "/marketplaces/:marketplaceId", Component: <MarketplaceDetails /> },
    { label: "Marketplace Details 2", path: "/marketplaces/:marketplaceId/2", Component: <MarketplaceDetails /> }
  ]
    .map(route => ({...route, route: route.path.replace(rootPath, "")}));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout />}>
          <Route path="" element={<MarketplaceList />} />
        </Route>
        <Route
          element={
            <SectionLayout
              backLink={({label: "Marketplace List", path: "/marketplaces"})}
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
