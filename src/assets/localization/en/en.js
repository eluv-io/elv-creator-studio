import Localization from "./en.yml";

import TenantLocalization from "./pages/tenant-en.yml";
import MarketplaceLocalization from "./pages/marketplace-en.yml";
import SiteLocalization from "./pages/site-en.yml";
import ItemTemplateLocalization from "./pages/item-templates-en.yml";
import MediaLocalization from "./pages/media-en.yml";
import MediaCatalogLocalization from "./pages/media-catalog-en.yml";
import MediaPropertyLocalization from "./pages/media-property.en.yml";
import PermissionSetLocalization from "./pages/permission-set.yml";

Localization.pages = {
  tenant: TenantLocalization,
  marketplace: MarketplaceLocalization,
  site: SiteLocalization,
  item_template: ItemTemplateLocalization,
  media: MediaLocalization,
  media_catalog: MediaCatalogLocalization,
  media_property: MediaPropertyLocalization,
  permission_set: PermissionSetLocalization
};

export default Localization;
