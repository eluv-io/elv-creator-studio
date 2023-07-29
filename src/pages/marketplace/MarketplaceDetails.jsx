import {observer} from "mobx-react-lite";
import {marketplaceStore} from "Stores";
import {Container, Title} from "@mantine/core";
import AsyncWrapper from "Components/common/AsyncWrapper.jsx";
import {useParams} from "react-router-dom";
import {FileBrowserButton} from "../../components/common/FileBrowser.jsx";

const MarketplaceDetails = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info;

  return (
    <AsyncWrapper
      loadingMessage="Loading Marketplace"
      Load={async () => await marketplaceStore.LoadMarketplace({marketplaceId})}
    >
      <Container p="xl" fluid>
        <Title>{`Marketplaces > ${info?.branding?.name}`}</Title>
        <FileBrowserButton
          radius="md"
          fileBrowserProps={{
            title: "Browse Marketplace",
            objectId: marketplaceId,
            writeToken: marketplace?.writeToken,
            //multiple: true,
            Submit: (record) => console.log(record)
          }}
        >
          Test File Browser
        </FileBrowserButton>
      </Container>
    </AsyncWrapper>
  );
});

export default MarketplaceDetails;
