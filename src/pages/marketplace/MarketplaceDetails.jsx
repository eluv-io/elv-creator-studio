import {observer} from "mobx-react-lite";
import {marketplaceStore} from "Stores";
import {Container, Title} from "@mantine/core";
import {useParams} from "react-router-dom";
import {FileBrowserButton} from "../../components/common/FileBrowser.jsx";
import {FabricBrowserButton} from "../../components/common/FabricBrowser.jsx";
import Inputs from "Components/common/Inputs";
import HistoryButtons from "../../components/common/HistoryButtons.jsx";

const MarketplaceDetails = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info;

  return (
    <div>
      <HistoryButtons store={marketplaceStore} objectId={marketplaceId} />
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
        <Inputs.Text
          componentProps={{description: "Test Description"}}
          label="name"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="name"
          clearable
        />
        <Inputs.TextArea
          componentProps={{description: "Test Description"}}
          label="description"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="description"
          clearable
        />
        <Inputs.Text
          label="tabs -> listings"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding/tabs"
          field="listings"
        />

        <Inputs.UUID
          label="UUID"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding/"
          field="uuid"
        />

        <Inputs.RichText
          label="rich text"
          description="rich text description"
          hint="rich text description"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/items/9"
          field="description_rich_text"
        />

        <Inputs.Integer
          label="price integer"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/items/0/price"
          field="USD"
          clearable
        />
        <Inputs.Number
          label="price number"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/items/0/price"
          field="USD"
          step={0.01}
          precision={2}
          componentProps={{description: "Test Description"}}
          clearable
        />

        <Inputs.DateTime
          label="release date"
          description="release date description"
          hint="release date description"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/items/28"
          field="available_at"
        />

        <Inputs.Date
          label="exp date"
          description="release date description"
          hint="release date description"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/items/28"
          field="expires_at"
        />

        <Inputs.UUID
          label="SKU"
          description="release date description"
          hint="release date description"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/items/28"
          field="sku"
        />


        <Inputs.Text
          label="Default text"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          defaultValue="Some default text"
          field="default_text"
        />

        <Inputs.Text
          label="Default text"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="default_text2"
        />

        <Inputs.Number
          label="Default number"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          defaultValue={123}
          field="default_number"
        />

        <Inputs.Checkbox
          label="Show on Global Marketplace"
          description="asd qwe something global marketplace"
          hint="asd qwe something global marketplace"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="show"
        />

        <Inputs.Checkbox
          label="Default false"
          description="asd qwe something global marketplace"
          hint="asd qwe something global marketplace"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="default_false"
        />


        <Inputs.Checkbox
          label="Default true"
          //description="asd qwe something global marketplace"
          hint="asd qwe something global marketplace"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="default_true"
          defaultValue={true}
        />

        <Inputs.MultiSelect
          label="Tags"
          description="Tags description"
          hint="tags hint"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="tags"
          fieldLabel="Tag"
          clearable
          options={[
            "Movies",
            "TV",
            "Music",
            "Software"
          ]}
        />


        <Inputs.Password
          label="Password"
          description="password description"
          hint="tags description"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info"
          field="preview_password_digest"
        />

        <Inputs.SimpleList
          label="Tags"
          description="tags description"
          hint="tags description"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          field="tags"
          fieldLabel="Tag"
        />


        <Inputs.ImageInput
          label="Marketplace Card Images"
          description={"marketplace card images"}
          hint="marketplace card images"
          store={marketplaceStore}
          objectId={marketplaceId}
          path="/public/asset_metadata/info/branding"
          altTextField="card_banner_alt"
          fields={[
            { field: "card_banner_front", label: "Card Banner (Front)" },
            { field: "card_banner_back", label: "Card Banner (Back)" },
          ]}
        />
      </Container>
    </div>
  );
});

export default MarketplaceDetails;
