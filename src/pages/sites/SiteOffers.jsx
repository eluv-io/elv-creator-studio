import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, siteStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {MarketplaceItemSelect} from "@/components/inputs/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";
import {Text} from "@mantine/core";

import {ListItemCategory} from "@/components/common/Misc.jsx";
import {SiteOfferSpec} from "@/specs/SiteSpecs.js";
import {MarketplaceSelect} from "@/components/inputs/ResourceSelection";

export const SiteOffer = observer(() => {
  const { siteId, offerId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};
  const offerIndex = info.offers?.findIndex(event => event.id === offerId);
  const offer = info.offers[offerIndex];

  if(!offer) {
    return (
      <div>
        Offer not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.site.form;
  const listPath = "/public/asset_metadata/info/offers";
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    path: UrlJoin(listPath, offerIndex.toString()),
    category: ListItemCategory({
      store: siteStore,
      objectId: siteId,
      listPath,
      id: offer.id,
      labelField: "title",
      l10n: l10n.categories.offer_label
    }),
    subcategory: l10n.categories.offer_details
  };

  return (
    <PageContent
      title={`${info?.name || "Site"} - ${l10n.categories.offers} - ${offer.title}`}
      section="site"
      backLink={UrlJoin("/sites", siteId, "offers")}
      useHistory
    >
      <Inputs.Hidden
        {...inputProps}
        {...l10n.offers.title}
        field="tenant_id"
        defaultValue={rootStore.tenantId}
      />
      <Inputs.UUID
        {...inputProps}
        {...l10n.offers.id}
        field="id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.offers.title}
        field="title"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.offers.ntp_id}
        field="ntp_id"
      />
      <Inputs.RichText
        {...inputProps}
        {...l10n.offers.description}
        field="description"
      />

      <MarketplaceSelect
        {...inputProps}
        {...l10n.offers.marketplace}
        field="marketplace"
        tenantSlugField="marketplace_tenant_slug"
        marketplaceIdField="marketplace_id"
        allowNone
      />

      {
        !offer.marketplace ? null :
          <MarketplaceItemSelect
            {...inputProps}
            {...l10n.offers.marketplace_item}
            marketplaceSlug={offer?.marketplace}
            field="sku"
            searchable
            clearable
          />
      }
    </PageContent>
  );
});

const SiteOffers = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = { store: siteStore, objectId: siteId };

  return (
    <PageContent
      title={`${info?.name || "Site"} - ${l10n.categories.offers}`}
      section="site"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.offers.offers}
        categoryFnParams={{fields: ["title", "id"], l10n: l10n.categories.offer_label}}
        path="/public/asset_metadata/info"
        field="offers"
        idField="id"
        columns={[
          {
            width: "30%",
            label: l10n.offers.offers.columns.title,
            field: "title"
          },
          {
            width: "30%",
            label: l10n.offers.offers.columns.marketplace,
            field: "marketplace",
            render: offer => <Text sx={{wordWrap: "anywhere"}}>{offer.marketplace || info?.marketplace_info?.marketplace_slug}</Text>
          },
          {
            width: "30%",
            label: l10n.offers.offers.columns.item,
            field: "sku"
          }
        ]}
        newItemSpec={SiteOfferSpec}
      />
    </PageContent>
  );
});

export default SiteOffers;
