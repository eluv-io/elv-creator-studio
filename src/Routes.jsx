import {observer} from "mobx-react-lite";
import {BrowserRouter} from "react-router-dom";
import TenantRoutes from "@/pages/tenant/TenantRoutes.jsx";
import MarketplaceRoutes from "@/pages/marketplace/MarketplaceRoutes.jsx";
import ScrollToTop from "@/components/common/ScrollToTop.jsx";
import SiteRoutes from "@/pages/sites/SiteRoutes.jsx";
import ItemTemplateRoutes from "@/pages/item_templates/ItemTemplateRoutes.jsx";

const AppRoutes = observer(() => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <TenantRoutes rootPath="/" />
      <MarketplaceRoutes rootPath="/marketplaces/" />
      <SiteRoutes rootPath="/sites/" />
      <ItemTemplateRoutes rootPath="/item-templates/" />
    </BrowserRouter>
  );
});

export default AppRoutes;
