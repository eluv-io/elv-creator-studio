import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import MarketplaceItemMultiselect from "@/components/inputs/MarketplaceItemInput.jsx";
import UrlJoin from "url-join";
import {Accordion, Group, Image, Title} from "@mantine/core";
import {ScaleImage} from "@/helpers/Fabric.js";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js";

import {MarketplaceCollectionSpec} from "@/specs/MarketplaceSpecs.js";
import {IconSettings} from "@tabler/icons-react";
import {ListItemCategory} from "@/components/common/Misc.jsx";

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

  const l10n = rootStore.l10n.pages.marketplace.form;
  const listPath = "/public/asset_metadata/info/collections";
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin(listPath, collectionIndex.toString()),
    category: ListItemCategory({
      store: marketplaceStore,
      objectId: marketplaceId,
      listPath,
      idField: "sku",
      id: collectionId,
      l10n: l10n.categories.collection_label
    })
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Collections - ${collection.name}`}
      section="marketplace"
      backLink={UrlJoin("/marketplaces", marketplaceId, "collections")}
      useHistory
    >
      <Title order={3} mt={50} mb="md">{ l10n.categories.collection_info }</Title>
      <Inputs.UUID
        {...inputProps}
        {...l10n.collection.id}
        subcategory={l10n.categories.collection_info}
        field="sku"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.collection.name}
        subcategory={l10n.categories.collection_info}
        field="name"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.collection.header}
        subcategory={l10n.categories.collection_info}
        field="collection_header"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.collection.description}
        subcategory={l10n.categories.collection_info}
        field="collection_subheader"
      />
      <MarketplaceItemMultiselect
        {...inputProps}
        {...l10n.collection.items}
        subcategory={l10n.categories.collection_items}
        field="items"
      />

      <Group align="top">
        <Inputs.ImageInput
          {...inputProps}
          {...l10n.collection.icon}
          subcategory={l10n.categories.collection_info}
          altTextField="collection_icon_alt"
          fields={[
            { field: "collection_icon" },
          ]}
        />
        <Inputs.ImageInput
          {...inputProps}
          {...l10n.collection.banner}
          subcategory={l10n.categories.collection_info}
          altTextField="collection_banner_alt"
          fields={[
            { field: "collection_banner" },
          ]}
        />
      </Group>

      <Title order={3} mt={50} mb="md">{ l10n.categories.collection_redemption }</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.collection.redeemable}
        subcategory={l10n.categories.collection_redemption}
        field="redeemable"
      />

      {
        !collection.redeemable ? null :
          <>
            <MarketplaceItemMultiselect
              {...inputProps}
              {...l10n.collection.rewards}
              subcategory={l10n.categories.collection_rewards}
              field="redeem_items"
            />

            <Accordion maw={600} variant="contained">
              <Accordion.Item value="default">
                <Accordion.Control icon={<IconSettings />}>
                  {l10n.collection.redemption_settings.label}
                </Accordion.Control>
                <Accordion.Panel>
                  <Inputs.Checkbox
                    {...inputProps}
                    {...l10n.collections.hide_info_when_redeeming}
                    subcategory={l10n.categories.collection_redemption}
                    field="hide_text"
                  />

                  <Inputs.FabricBrowser
                    {...inputProps}
                    {...l10n.collections.redeem_animation}
                    subcategory={l10n.categories.collection_redemption}
                    field="redeem_animation"
                    previewable
                    previewIsAnimation
                  />

                  <Inputs.FabricBrowser
                    {...inputProps}
                    {...l10n.collections.redeem_animation_mobile}
                    subcategory={l10n.categories.collection_redemption}
                    field="redeem_animation_mobile"
                    previewable
                    previewIsAnimation
                  />

                  <Inputs.FabricBrowser
                    {...inputProps}
                    {...l10n.collections.reveal_animation}
                    subcategory={l10n.categories.collection_redemption}
                    field="reveal_animation"
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
                    {...l10n.collections.reveal_animation_mobile}
                    subcategory={l10n.categories.collection_redemption}
                    field="reveal_animation_mobile"
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

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: "/public/asset_metadata/info/collections_info",
    category: l10n.categories.collections_page
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Collections`}
      section="marketplace"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.collections.collections}
        categoryFnParams={{fields: ["name", "sku"], l10n: l10n.categories.collection_label}}
        path="/public/asset_metadata/info"
        field="collections"
        idField="sku"
        columns={[
          {
            field: "image",
            width: "80px",
            render: (collection) => <Image src={ScaleImage(collection?.collection_icon?.url, 200)} width={50} height={50} radius="md" withPlaceholder />
          },
          { label: l10n.collections.collections.columns.title, field: "name" },
          { label: l10n.collections.collections.columns.items, field: "items", width: "80px", centered: true, render: collection => collection?.items?.length || "0" },
        ]}
        newItemSpec={MarketplaceCollectionSpec}
      />

      <Title order={3} mt={50} mb="md">{ l10n.categories.collections_page }</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.collections.header}
        field="header"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.collections.description}
        field="subheader"
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.collections.show_on_storefront}
        field="show_on_storefront"
      />

      <Group align="top">
        <Inputs.ImageInput
          {...inputProps}
          {...l10n.collections.icon}
          altTextField="icon_alt"
          fields={[
            { field: "icon" },
          ]}
        />
        <Inputs.ImageInput
          {...inputProps}
          {...l10n.collections.banner}
          altTextField="banner_alt"
          fields={[
            { field: "banner" },
          ]}
        />
      </Group>

      <Accordion mt="xs" maw={600} variant="contained">
        <Accordion.Item value="default">
          <Accordion.Control icon={<IconSettings />}>
            { l10n.collections.default_redemption_settings.label }
          </Accordion.Control>
          <Accordion.Panel>
            <Title m="sm" mt={0} order={6} color="dimmed">{ l10n.collections.default_redemption_settings.description }</Title>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.collections.hide_info_when_redeeming}
              subcategory={l10n.categories.default_collection_redemption}
              field="hide_text"
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.collections.redeem_animation}
              subcategory={l10n.categories.default_collection_redemption}
              field="redeem_animation"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.collections.redeem_animation_mobile}
              subcategory={l10n.categories.default_collection_redemption}
              field="redeem_animation_mobile"
              previewable
              previewIsAnimation
            />

            <Inputs.FabricBrowser
              {...inputProps}
              {...l10n.collections.reveal_animation}
              subcategory={l10n.categories.default_collection_redemption}
              field="reveal_animation"
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
              {...l10n.collections.reveal_animation_mobile}
              subcategory={l10n.categories.default_collection_redemption}
              field="reveal_animation_mobile"
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
