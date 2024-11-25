import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "@/components/common/SectionLayout.jsx";
import {rootStore, mediaPropertyStore} from "@/stores";
import MediaPropertyList from "@/pages/media_properties/MediaPropertyList.jsx";
import MediaPropertyOverview from "@/pages/media_properties/MediaPropertyOverview.jsx";
import MediaPropertyBuilder from "@/pages/media_properties/builder/index.jsx";
import MediaPropertyGeneralSettings from "@/pages/media_properties/MediaPropertyGeneralSettings.jsx";
import MediaPropertyPage, {MediaPropertyPageAction} from "@/pages/media_properties/MediaPropertyPage.jsx";
import MediaPropertySections from "@/pages/media_properties/MediaPropertySections.jsx";
import MediaPropertyPages from "@/pages/media_properties/MediaPropertyPages.jsx";
import MediaPropertySection from "@/pages/media_properties/MediaPropertySection.jsx";
import MediaPropertySectionItem from "@/pages/media_properties/MediaPropertySectionItem.jsx";
import MediaPropertySearch from "@/pages/media_properties/MediaPropertySearch.jsx";
import MediaPropertyDomainSettings from "@/pages/media_properties/MediaPropertyDomainSettings.jsx";
import MediaPropertySectionHeroItem, {
  MediaPropertySectionHeroItemAction
} from "@/pages/media_properties/MediaPropertySectionHeroItem.jsx";
import MediaPropertyThemeSettings from "@/pages/media_properties/MediaPropertyThemeSettings.jsx";

const MediaPropertyRoutes = observer(({rootPath}) => {
  console.log("rootpath", rootPath);
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.media_property.nav.overview, path: "/media-properties/:mediaPropertyId", Component: <MediaPropertyOverview /> },
    { root: false, navRoute: true, label: rootStore.l10n.pages.media_property.nav.builder, path: "/media-properties/:mediaPropertyId/build", Component: <MediaPropertyBuilder basePath={rootPath}/> },
    { navRoute: true, label: rootStore.l10n.pages.media_property.nav.general, path: "/media-properties/:mediaPropertyId/general", Component: <MediaPropertyGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.media_property.nav.search, path: "/media-properties/:mediaPropertyId/search", Component: <MediaPropertySearch /> },
    { navRoute: true, label: rootStore.l10n.pages.media_property.nav.pages, path: "/media-properties/:mediaPropertyId/pages", Component: <MediaPropertyPages /> },
    { label: rootStore.l10n.pages.media_property.nav.page, path: "/media-properties/:mediaPropertyId/pages/:pageId", Component: <MediaPropertyPage /> },
    { label: rootStore.l10n.pages.media_property.nav.page, path: "/media-properties/:mediaPropertyId/pages/:pageId/actions/:actionId", Component: <MediaPropertyPageAction /> },
    { navRoute: true, label: rootStore.l10n.pages.media_property.nav.sections, path: "/media-properties/:mediaPropertyId/sections", Component: <MediaPropertySections /> },
    { label: rootStore.l10n.pages.media_property.nav.section, path: "/media-properties/:mediaPropertyId/sections/:sectionId", Component: <MediaPropertySection /> },
    { label: rootStore.l10n.pages.media_property.nav.section, path: "/media-properties/:mediaPropertyId/sections/:sectionId/hero_items/:heroItemId", Component: <MediaPropertySectionHeroItem /> },
    { label: rootStore.l10n.pages.media_property.nav.section, path: "/media-properties/:mediaPropertyId/sections/:sectionId/hero_items/:heroItemId/actions/:actionId", Component: <MediaPropertySectionHeroItemAction /> },
    { label: rootStore.l10n.pages.media_property.nav.section_item, path: "/media-properties/:mediaPropertyId/sections/:sectionId/content/:sectionItemId", Component: <MediaPropertySectionItem /> },
    { navRoute: true, label: rootStore.l10n.pages.media_property.nav.theme, path: "/media-properties/:mediaPropertyId/theme", Component: <MediaPropertyThemeSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.media_property.nav.domain, path: "/media-properties/:mediaPropertyId/domain", Component: <MediaPropertyDomainSettings /> },
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
