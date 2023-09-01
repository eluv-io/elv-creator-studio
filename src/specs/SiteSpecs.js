// NOTE: Default value only applies when field is undefined, not ""

export const SiteAdditionalMarketplaceSpec = {
  "tenant_slug": undefined,
  "marketplace_slug": undefined,
  "default_store_page": "Storefront",
  "hidden": false
};

export const SiteOfferSpec = {
  id: undefined,
  tenant_id: undefined,
  title: "<New Offer>",
  description: "",
  ntp_id: "",
  marketplace: undefined,
  sku: undefined
};

export const SiteBannerSpec = {
  id: undefined,
  name: "<New Banner>",
  image: undefined,
  image_mobile: undefined,
  type: "image",
  video: undefined,
  marketplace: undefined,
  sku: undefined,
  link: undefined,
  drop_uuid: undefined
};
