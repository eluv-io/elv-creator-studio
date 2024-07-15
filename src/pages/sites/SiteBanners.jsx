import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, siteStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceItemSelect} from "@/components/inputs/marketplace/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";
import {Image, Title} from "@mantine/core";

import {ListItemCategory} from "@/components/common/Misc.jsx";
import {SiteBannerSpec} from "@/specs/SiteSpecs.js";
import {MarketplaceSelect} from "@/components/inputs/ResourceSelection";

export const SiteBanner = observer(() => {
  const { siteId, bannerId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};
  let bannerCards = info?.main_page_banner_cards?.cards || [];
  let bannerCardIndex = bannerCards.findIndex(banner => banner.id === bannerId);
  let bannerImages = info?.main_page_banners || [];
  let bannerIndex = bannerImages.findIndex(banner => banner.id === bannerId);

  let banner, type, listPath, path;
  if(bannerCardIndex >= 0) {
    banner = bannerCards[bannerCardIndex];
    type = "card";
    listPath = "/public/asset_metadata/info/main_page_banner_cards/cards";
    path = UrlJoin(listPath, bannerCardIndex.toString());
  } else {
    banner = bannerImages[bannerIndex];
    type = "banner";
    listPath = "/public/asset_metadata/info/main_page_banners";
    path = UrlJoin(listPath, bannerIndex.toString());
  }

  if(!banner) {
    return (
      <div>
        Banner not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    path,
    category: ListItemCategory({
      store: siteStore,
      objectId: siteId,
      listPath,
      id: banner.id,
      labelField: "name",
      l10n: type === "card" ? l10n.categories.banner_card_label : l10n.categories.banner_image_label
    }),
    subcategory: l10n.categories.banner_settings
  };

  return (
    <PageContent
      title={`${info?.name || "Site"} - ${l10n.categories.banners} - ${banner.name || ""}`}
      section="site"
      backLink={UrlJoin("/sites", siteId, "banners")}
      useHistory
    >
      <Inputs.UUID
        {...inputProps}
        {...l10n.banner.id}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.banner.name}
        field="name"
      />

      <Inputs.Select
        {...inputProps}
        {...l10n.banner.type}
        field="type"
        options={[
          { label: "None", value: "image"},
          { label: "Open Marketplace", value: "marketplace"},
          { label: "Show Video", value: "video"},
          { label: "Open External Link", value: "link"}
        ]}
      />
      {
        banner.type !== "video" ? null :
          <Inputs.FabricBrowser
            {...inputProps}
            {...l10n.banner.video}
            field="video"
            previewable
          />
      }
      {
        banner.type !== "link" ? null :
          <Inputs.URL
            {...inputProps}
            {...l10n.banner.link}
            field="link"
          />
      }
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.banner.banner_image}
        altTextField="image_alt"
        fields={[
          { field: "image", ...l10n.banner.image },
          { field: "image_mobile", ...l10n.banner.image_mobile },
        ]}
      />
      {
        banner.type !== "marketplace" ? null :
          <>
            <MarketplaceSelect
              {...inputProps}
              {...l10n.banner.marketplace}
              field="marketplace"
              tenantSlugField="marketplace_tenant_slug"
              marketplaceIdField="marketplace_id"
              defaultFirst
            />
            {
              !banner.marketplace ? null :
                <>
                  <MarketplaceItemSelect
                    {...inputProps}
                    {...l10n.banner.marketplace_item}
                    marketplaceSlug={banner.marketplace}
                    field="sku"
                    searchable
                    clearable
                  />
                  {
                    !banner.sku ? null :
                      <>
                        <Inputs.Checkbox
                          {...inputProps}
                          {...l10n.banner.redirect_to_owned_item}
                          field="redirect_to_owned_item"
                          defaultValue={false}
                        />
                        {
                          !banner.redirect_to_owned_item ? null :
                            <Inputs.Select
                              {...inputProps}
                              {...l10n.post_login.redirect_page}
                              field="redirect_page"
                              defaultValue="item_details"
                              options={[
                                { label: "Item Details", value: "item_details" },
                                { label: "Media", value: "media" }
                              ]}
                            />
                        }
                      </>
                  }
                </>
            }
          </>
      }
    </PageContent>
  );
});

const SiteBanners = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = { store: siteStore, objectId: siteId };

  return (
    <PageContent
      title={`${info?.name || "Site"} - ${l10n.categories.banners}`}
      subtitle={l10n.banners.banners_description}
      section="site"
      useHistory
    >
      <Title order={3}>{l10n.categories.banner_cards}</Title>
      <Title order={6} mb="md" color="dimmed" maw={uiStore.inputWidthWide}>{l10n.banners.banner_cards_description}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.banners.banner_cards_header}
        subcategory={l10n.categories.banner_card_section_settings}
        path="/public/asset_metadata/info/main_page_banner_cards"
        field="header"
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.banners.banner_cards_background}
        subcategory={l10n.categories.banner_card_section_settings}
        path="/public/asset_metadata/info/main_page_banner_cards"
        fields={[
          { field: "background_image", aspectRatio: 16/9, baseSize: 135, ...l10n.banners.background_image_desktop },
          { field: "background_image_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.banners.background_image_mobile }
        ]}
      />

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.banners.banner_cards}
        categoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.banner_card_label}}
        path="/public/asset_metadata/info/main_page_banner_cards"
        field="cards"
        idField="id"
        columns={[
          {
            field: "image",
            width: "150px",
            render: item => (
              <Image
                src={(item?.image || item?.image_mobile)?.url}
                height={100}
                width={100}
                fit="contain"
                withPlaceholder
              />
            )
          },
          {
            label: l10n.banners.banners.columns.name,
            field: "name"
          },
          {
            label: l10n.banners.banners.columns.type,
            field: "type",
            width: "120px"
          },
        ]}
        newItemSpec={SiteBannerSpec}
      />

      <Title order={3} mt={50}>{l10n.categories.banners}</Title>
      <Title order={6} mb="md" color="dimmed" maw={uiStore.inputWidthWide}>{l10n.banners.banner_description}</Title>

      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.banners.banners}
        categoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.banner_image_label}}
        path="/public/asset_metadata/info"
        field="main_page_banners"
        idField="id"
        columns={[
          {
            field: "image",
            width: "150px",
            render: item => (
              <Image
                src={(item?.image || item?.image_mobile)?.url}
                height={100}
                width={100}
                fit="contain"
                withPlaceholder
              />
            )
          },
          {
            label: l10n.banners.banners.columns.name,
            field: "name"
          },
          {
            label: l10n.banners.banners.columns.type,
            field: "type",
            width: "120px"
          },
        ]}
        newItemSpec={SiteBannerSpec}
      />

    </PageContent>
  );
});

export default SiteBanners;
