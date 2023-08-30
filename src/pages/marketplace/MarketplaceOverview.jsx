import {observer} from "mobx-react-lite";
import {marketplaceStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";

const MarketplaceOverview = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info;

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Overview`}
      section="marketplace"
      useHistory
    >
    </PageContent>
  );
});

export default MarketplaceOverview;
