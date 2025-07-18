import {observer} from "mobx-react-lite";
import {Route, Routes} from "react-router-dom";
import SectionLayout from "@/components/common/SectionLayout.jsx";
import {rootStore, itemTemplateStore} from "@/stores";

import ItemTemplateList from "./ItemTemplateList.jsx";
import ItemTemplateOverview from "./ItemTemplateOverview.jsx";
import ItemTemplateGeneralSettings from "./ItemTemplateGeneralSettings.jsx";
import ItemTemplateSettings from "@/pages/item_templates/ItemTemplateSettings.jsx";
import ItemTemplatePrimaryMedia from "@/pages/item_templates/ItemTemplatePrimaryMedia.jsx";
import ItemTemplateRedeemableOffers, {
  ItemTemplateRedeemableOffer
} from "@/pages/item_templates/ItemTemplateRedeemableOffers.jsx";
import ItemTemplateMediaItem from "@/pages/item_templates/ItemTemplateMediaItem.jsx";

const ItemTemplateRoutes = observer(({rootPath}) => {
  const routes = [
    { root: true, navRoute: true, label: rootStore.l10n.pages.item_template.nav.overview, path: "/item-templates/:itemTemplateId", Component: <ItemTemplateOverview /> },
    { navRoute: true, label: rootStore.l10n.pages.item_template.nav.general, path: "/item-templates/:itemTemplateId/general", Component: <ItemTemplateGeneralSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.item_template.nav.settings, path: "/item-templates/:itemTemplateId/settings", Component: <ItemTemplateSettings /> },
    { navRoute: true, label: rootStore.l10n.pages.item_template.nav.primary_media, path: "/item-templates/:itemTemplateId/primary_media", Component: <ItemTemplatePrimaryMedia /> },
    { label: rootStore.l10n.pages.item_template.nav.additional_media, path: "/item-templates/:itemTemplateId/general/list/:mediaId", Component: <ItemTemplateMediaItem containerType="list" /> },
    { label: rootStore.l10n.pages.item_template.nav.additional_media, path: "/item-templates/:itemTemplateId/general/list/:mediaId/gallery/:galleryItemId", Component: <ItemTemplateMediaItem containerType="list" galleryItem /> },
    { label: rootStore.l10n.pages.item_template.nav.additional_media, path: "/item-templates/:itemTemplateId/general/featured/:mediaId", Component: <ItemTemplateMediaItem containerType="featured" /> },
    { label: rootStore.l10n.pages.item_template.nav.additional_media, path: "/item-templates/:itemTemplateId/general/featured/:mediaId/gallery/:galleryItemId", Component: <ItemTemplateMediaItem containerType="featured" galleryItem /> },
    { label: rootStore.l10n.pages.item_template.nav.additional_media, path: "/item-templates/:itemTemplateId/general/:sectionId/:collectionId/:mediaId", Component: <ItemTemplateMediaItem containerType="collection" /> },
    { label: rootStore.l10n.pages.item_template.nav.additional_media, path: "/item-templates/:itemTemplateId/general/:sectionId/:collectionId/:mediaId/gallery/:galleryItemId", Component: <ItemTemplateMediaItem containerType="collection" galleryItem /> },
    { navRoute: true, label: rootStore.l10n.pages.item_template.nav.redeemable_offers, path: "/item-templates/:itemTemplateId/redeemable_offers", Component: <ItemTemplateRedeemableOffers /> },
    { label: rootStore.l10n.pages.item_template.nav.redeemable_offers, path: "/item-templates/:itemTemplateId/redeemable_offers/:redeemableOfferId", Component: <ItemTemplateRedeemableOffer /> },
  ]
    .map(route => ({
      ...route,
      route: route.path.replace(rootPath, ""),
      // Display the template name in the title
      PageTitle: params =>
        itemTemplateStore.itemTemplates[params.itemTemplateId]?.metadata?.public?.asset_metadata?.nft?.name ||
        itemTemplateStore.allItemTemplates?.find(itemTemplate => itemTemplate.objectId === params.itemTemplateId)?.name
    }));

  return (
    <Routes>
      <Route path={rootPath}>
        <Route element={<SectionLayout />}>
          <Route path="" element={<ItemTemplateList />} />
        </Route>
        <Route
          element={
            <SectionLayout
              backLink={({label: rootStore.l10n.pages.item_template.nav.list, path: "/item-templates"})}
              links={routes}
              loadingMessage="Loading Item Template"
              Load={async ({itemTemplateId}) => itemTemplateId && itemTemplateStore.LoadItemTemplate({itemTemplateId})}
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

export default ItemTemplateRoutes;
