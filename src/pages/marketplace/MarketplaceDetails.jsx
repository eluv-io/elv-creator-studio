import {observer} from "mobx-react-lite";
import {marketplaceStore} from "Stores";
import {Container, Title, Button, Text} from "@mantine/core";
import AsyncWrapper from "Components/common/AsyncWrapper.jsx";
import {useParams} from "react-router-dom";
import {FileBrowserButton} from "../../components/common/FileBrowser.jsx";
import {FabricBrowserButton} from "../../components/common/FabricBrowser.jsx";
import Inputs from "Components/common/Inputs";
import UndoRedo from "../../components/common/UndoRedo.jsx";

const MarketplaceDetails = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info;

  return (
    <AsyncWrapper
      loadingMessage="Loading Marketplace"
      Load={async () => await marketplaceStore.LoadMarketplace({marketplaceId})}
    >
      <UndoRedo store={marketplaceStore} objectId={marketplaceId} />
      <Container p="xl" m={0}>
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
        <Inputs.Input
          label="name"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="name"
        />
        <Inputs.Input
          label="description"
          type="textarea"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="description"
        />
        <Inputs.Input
          label="tabs -> listings"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding/tabs"
          field="listings"
        />
        <Inputs.SimpleList
          label="Tags"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="tags"
          fieldLabel="Tag"
        />


        <Inputs.SingleImageInput
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="card_banner_front"
          label="Card Banner (Front)"
        />
        <Inputs.SingleImageInput
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="card_banner_back"
          label="Card Banner (Back)"
        />

        <Inputs.ImageInput
          label="Marketplace Card Images"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          altTextField="card_banner_alt"
          fields={[
            { field: "card_banner_front", label: "Card Banner (Front)" },
            //{ field: "card_banner_back", label: "Card Banner (Back)" },
          ]}
        />
      </Container>
    </AsyncWrapper>
  );
});

export default MarketplaceDetails;
