import Localization from "./en.yml";

import TenantLocalization from "./pages/tenant-en.yml";
import MarketplaceLocalization from "./pages/marketplace-en.yml";
import SiteLocalization from "./pages/site-en.yml";
import ItemTemplateLocalization from "./pages/item-templates-en.yml";

Localization.pages = {
  tenant: TenantLocalization,
  marketplace: MarketplaceLocalization,
  site: SiteLocalization,
  item_template: ItemTemplateLocalization
};

export default Localization;
