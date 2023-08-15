import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import {Group} from "@mantine/core";
import Inputs from "Components/inputs/Inputs";

const MarketplaceImages = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Images`}
      section="marketplace"
      useHistory
    >
      <Inputs.ImageInput
        label="Marketplace Card Images"
        path="/public/asset_metadata/info/branding"
        altTextField="card_banner_alt"
        fields={[
          { field: "card_banner_front", label: "Card Banner (Front)" },
          { field: "card_banner_back", label: "Card Banner (Back)" },
        ]}
        {...inputProps}
      />

      <Inputs.ImageInput
        label="App Background"
        path="/public/asset_metadata/info/branding"
        fields={[
          { field: "background", label: "Background (Desktop)" },
          { field: "background_mobile", label: "Background (Mobile)" },
        ]}
        {...inputProps}
      />

      <Group align="top">
        <Inputs.ImageInput
          label="Header Logo"
          path="/public/asset_metadata/info/branding"
          altTextField="header_logo_alt"
          fields={[
            { field: "header_logo" },
          ]}
          {...inputProps}
        />
        <Inputs.ImageInput
          label="Header Image"
          path="/public/asset_metadata/info/branding"
          altTextField="header_image_alt"
          fields={[
            { field: "header_image" },
          ]}
          {...inputProps}
        />
      </Group>
    </PageContent>
  );
});

export default MarketplaceImages;
