import {observer} from "mobx-react-lite";
import {BrowserRouter} from "react-router-dom";
import TenantRoutes from "Pages/tenant/TenantRoutes.jsx";
import MarketplaceRoutes from "Pages/marketplace/MarketplaceRoutes.jsx";
import ScrollToTop from "Components/common/ScrollToTop.jsx";

const AppRoutes = observer(() => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <TenantRoutes rootPath="/" />
      <MarketplaceRoutes rootPath="/marketplaces/" />
    </BrowserRouter>
  );
});

export default AppRoutes;
