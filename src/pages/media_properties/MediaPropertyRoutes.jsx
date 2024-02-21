import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "@/components/common/SectionLayout.jsx";
import {rootStore, mediaPropertyStore} from "@/stores";
import MediaPropertyList from "@/pages/media_properties/MediaPropertyList.jsx";
import MediaPropertyOverview from "@/pages/media_properties/MediaPropertyOverview.jsx";

const MediaPropertyRoutes = observer(({rootPath}) => {
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.media_property.nav.overview, path: "/media-properties/:mediaPropertyId", Component: <MediaPropertyOverview /> },
  ]
    .map(route => ({
      ...route,
      route: route.path.replace(rootPath, ""),
      PageTitle: params => mediaPropertyStore.mediaProperties[params.mediaPropertyId]?.metadata?.public?.asset_metadata?.info?.name
    }));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout />}>
          <Route path="" element={<MediaPropertyList />} />
        </Route>
        <Route
          element={
            <SectionLayout
              backLink={({label: rootStore.l10n.pages.media_property.nav.list, path: "/media-properties"})}
              links={routes}
              loadingMessage="Loading Media Property"
              Load={async ({mediaPropertyId}) => mediaPropertyId && mediaPropertyStore.LoadMediaProperty({mediaPropertyId})}
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

export default MediaPropertyRoutes;
