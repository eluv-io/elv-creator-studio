import {observer} from "mobx-react-lite";
import {marketplaceStore} from "Stores";
import {Container, Title, Button, Text} from "@mantine/core";
import AsyncWrapper from "Components/common/AsyncWrapper.jsx";
import {useParams} from "react-router-dom";
import {FileBrowserButton} from "../../components/common/FileBrowser.jsx";
import {FabricBrowserButton} from "../../components/common/FabricBrowser.jsx";
import {ActionInput, SimpleList} from "../../components/common/Inputs";
import {DndListHandle} from "../../components/common/ComponentTest.jsx";

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
        <FabricBrowserButton
          radius="md"
          fabricBrowserProps={{
            title: "Browse Fabric",
            Submit: (record) => console.log(record)
          }}
        >
          Test Fabric Browser
        </FabricBrowserButton>
        <ActionInput
          label="name"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="name"
        />
        <ActionInput
          label="description"
          type="textarea"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="description"
        />
        <ActionInput
          label="tabs -> listings"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding/tabs"
          field="listings"
        />
        <SimpleList
          label="Tags"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="tags"
          fieldLabel="Tag"
        />
      </Container>
    </AsyncWrapper>
  );
});

export default MarketplaceDetails;
