import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";
import MarketplaceItemInput from "../../components/inputs/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";
import {Accordion, Group, Image, Title} from "@mantine/core";
import {ScaleImage} from "Helpers/Fabric.js";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";

import {MarketplaceCollectionSpec} from "Specs/MarketplaceSpecs.js";
import {IconSettings} from "@tabler/icons-react";

export const MarketplaceCollection = observer(() => {
  const { marketplaceId, collectionId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};
  const collectionIndex = info.collections?.findIndex(collection => collection.sku === collectionId);
  const collection = info.collections[collectionIndex];

  if(!collection) {
    return (
      <div>
        Collection not found
      </div>
    );
  }

  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin("/public/asset_metadata/info/collections", collectionIndex.toString())
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Collections - ${collection.name}`}
      section="marketplace"
      backLink={UrlJoin("/marketplaces", marketplaceId, "collections")}
      useHistory
    >
      <Title order={3} mt={50} mb="md">Collection Info</Title>
      <Inputs.UUID
        {...inputProps}
        field="sku"
        label="ID"
      />
      <Inputs.Text
        {...inputProps}
        field="name"
        label="Name"
      />
      <MarketplaceItemInput
        {...inputProps}
        label="Collection Items"
        field="items"
      />
      <Inputs.Text
        {...inputProps}
        field="collection_header"
        label="Header"
      />
      <Inputs.TextArea
        {...inputProps}
        field="collection_subheader"
        label="Description"
      />

      <Group align="top">
        <Inputs.ImageInput
          {...inputProps}
          label="Icon"
          altTextField="collection_icon_alt"
          fields={[
            { field: "collection_icon" },
          ]}
        />
        <Inputs.ImageInput
          {...inputProps}
          label="Banner"
          altTextField="collection_banner_alt"
          fields={[
            { field: "collection_banner" },
          ]}
        />
      </Group>

      <Title order={3} mt={50} mb="md">Collection Redemption</Title>

      <Inputs.Checkbox
        {...inputProps}
        field="redeemable"
        label="Collection Redeemable"
      />

      {
        !collection.redeemable ? null :
          <>
            <MarketplaceItemInput
              {...inputProps}
              label="Collection Rewards"
              field="redeem_items"
            />

            <Accordion mt={50} maw={600} variant="contained">
              <Accordion.Item value="photos">
                <Accordion.Control icon={<IconSettings />}>
                  Redemption Settings
                </Accordion.Control>
                <Accordion.Panel>
                  <Inputs.Checkbox
                    {...inputProps}
                    INVERTED
                    field="hide_text"
                    label="Show info when redeeming"
                  />

                  <Inputs.FabricBrowser
                    {...inputProps}
                    field="redeem_animation"
                    label="Redemption Animation"
                    previewable
                    previewIsAnimation
                  />

                  <Inputs.FabricBrowser
                    {...inputProps}
                    field="redeem_animation_mobile"
                    label="Redemption Animation (Mobile)"
                    previewable
                    previewIsAnimation
                  />

                  <Inputs.FabricBrowser
                    {...inputProps}
                    field="reveal_animation"
                    label="Reveal Animation"
                    previewable
                    previewOptions={{
                      muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
                      autoplay: EluvioPlayerParameters.autoplay.ON,
                      controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
                      loop: EluvioPlayerParameters.loop.OFF
                    }}
                  />

                  <Inputs.FabricBrowser
                    {...inputProps}
                    field="reveal_animation_mobile"
                    label="Reveal Animation (Mobile)"
                    previewable
                    previewOptions={{
                      muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
                      autoplay: EluvioPlayerParameters.autoplay.ON,
                      controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
                      loop: EluvioPlayerParameters.loop.OFF
                    }}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </>
      }
    </PageContent>
  );
});

const MarketplaceCollections = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: "/public/asset_metadata/info/collections_info"
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Collections`}
      section="marketplace"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        path="/public/asset_metadata/info"
        field="collections"
        fieldLabel="Collection"
        idField="sku"
        columns={[
          {
            field: "image",
            width: "80px",
            render: (collection) => <Image src={ScaleImage(collection?.collection_icon?.url, 200)} width={50} height={50} radius="md" withPlaceholder />
          },
          { label: "Title", field: "name" },
          { label: "Items", field: "items", width: "80px", centered: true, render: collection => collection?.items?.length || "0" },
        ]}
        newEntrySpec={MarketplaceCollectionSpec}
      />

      <Title order={3} mb="md">Collections Page</Title>

      <Inputs.Text
        {...inputProps}
        field="header"
        label="Header"
      />
      <Inputs.TextArea
        {...inputProps}
        field="subheader"
        label="Description"
      />

      <Inputs.Checkbox
        {...inputProps}
        field="show_on_storefront"
        label="Show Collections on Storefront"
      />

      <Group align="top">
        <Inputs.ImageInput
          {...inputProps}
          label="Icon"
          altTextField="icon_alt"
          fields={[
            { field: "icon" },
          ]}
        />
        <Inputs.ImageInput
          {...inputProps}
          label="Banner"
          altTextField="banner_alt"
          fields={[
            { field: "banner" },
          ]}
        />
      </Group>

      <Accordion mt="xs" maw={600} variant="contained">
        <Accordion.Item value="photos">
          <Accordion.Control icon={<IconSettings />}>
            Default Redemption Settings
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Checkbox
              {...inputProps}
              INVERTED
              field="hide_text"
              label="Show info when redeeming"
            />

            <Inputs.FabricBrowser
              {...inputProps}
              field="redeem_animation"
              label="Redemption Animation"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              field="redeem_animation_mobile"
              label="Redemption Animation (Mobile)"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              field="reveal_animation"
              label="Reveal Animation"
              previewable
              previewOptions={{
                muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
                autoplay: EluvioPlayerParameters.autoplay.ON,
                controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
                loop: EluvioPlayerParameters.loop.OFF
              }}
            />

            <Inputs.FabricBrowser
              {...inputProps}
              field="reveal_animation_mobile"
              label="Reveal Animation (Mobile)"
              previewable
              previewOptions={{
                muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
                autoplay: EluvioPlayerParameters.autoplay.ON,
                controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
                loop: EluvioPlayerParameters.loop.OFF
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </PageContent>
  );
});

export default MarketplaceCollections;
