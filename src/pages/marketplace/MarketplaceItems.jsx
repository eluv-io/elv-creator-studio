import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";
import UrlJoin from "url-join";
import {Group, Box, Title, Tooltip} from "@mantine/core";
import {ItemImage, LocalizeString} from "Components/common/Misc";
import {FormatDate, FormatUSD, ParseDate} from "Helpers/Misc.js";

import {MarketplaceItemSpec} from "Specs/MarketplaceSpecs.js";

import {IconCheck, IconX, IconClock} from "@tabler/icons-react";

export const MarketplaceItem = observer(() => {
  const { marketplaceId, sku } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};
  const itemIndex = info.items?.findIndex(item => item.sku === sku);
  const item = info.items[itemIndex];

  if(!item) {
    return (
      <div>
        Item not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin("/public/asset_metadata/info/items", itemIndex.toString()),
    category: l10n.categories.item
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Items - ${item.name}`}
      section="marketplace"
      backLink={UrlJoin("/marketplaces", marketplaceId, "items")}
      useHistory
    >
      <Title order={3} mt={50} mb="md">{l10n.categories.item_info}</Title>
      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.item.image}
        subcategory={l10n.categories.item_info}
        field="image"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.item.name}
        subcategory={l10n.categories.item_info}
        field="name"
      />
      <Inputs.UUID
        {...inputProps}
        {...l10n.item.sku}
        subcategory={l10n.categories.item_info}
        field="sku"
      />
      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.item.item_template}
        subcategory={l10n.categories.item_info}
        field="nft_template"
        previewable={item.nft_template?.nft?.playable}
        previewIsAnimation={!item.nft_template?.nft?.has_audio}
        GetImage={nft_template => nft_template?.nft?.image}
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.item.subtitle}
        subcategory={l10n.categories.item_info}
        field="subtitle"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.item.subtitle_2}
        subcategory={l10n.categories.item_info}
        field="subtitle2"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.item.description}
        subcategory={l10n.categories.item_info}
        field="description"
      />
      <Inputs.RichText
        {...inputProps}
        {...l10n.item.description_rich_text}
        subcategory={l10n.categories.item_info}
        field="description_rich_text"
      />

      <Inputs.List
        {...inputProps}
        {...l10n.item.tags}
        subcategory={l10n.categories.item_info}
        field="tags"
      />

      <Title order={3} mt={50} mb="md">{l10n.categories.item_display_options}</Title>

      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.item.video}
        subcategory={l10n.categories.item_display_options}
        field="video"
        previewable
      />

      {
        !item.video ? null :
          <>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.item.video_has_audio}
              subcategory={l10n.categories.item_display_options}
              field="video_has_audio"
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.item.play_on_storefront}
              subcategory={l10n.categories.item_display_options}
              field="play_on_storefront"
            />
          </>
      }

      <Inputs.Checkbox
        INVERTED
        {...inputProps}
        {...l10n.item.show_available_stock}
        subcategory={l10n.categories.item_display_options}
        field="hide_available"
      />

      <Title order={3} mt={50} mb="md">{l10n.categories.item_purchase_details}</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.item.available}
        subcategory={l10n.categories.item_purchase_details}
        field="for_sale"
      />
      {
        item.for_sale ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.item.viewable}
            subcategory={l10n.categories.item_purchase_details}
            field="viewable"
          />
      }

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.item.free}
        subcategory={l10n.categories.item_purchase_details}
        field="free"
      />

      {
        item.free ? null :
          <>
            <Inputs.Price
              {...inputProps}
              {...l10n.item.price}
              subcategory={l10n.categories.item_purchase_details}
              path={UrlJoin(inputProps.path, "price")}
              field="USD"
            />
            <Inputs.Integer
              {...inputProps}
              {...l10n.item.max_per_checkout}
              subcategory={l10n.categories.item_purchase_details}
              field="max_per_checkout"
            />
            <Inputs.Integer
              {...inputProps}
              {...l10n.item.max_per_user}
              subcategory={l10n.categories.item_purchase_details}
              field="max_per_user"
            />
          </>
      }

      <Inputs.Price
        {...inputProps}
        {...l10n.item.min_secondary_price}
        subcategory={l10n.categories.item_purchase_details}
        path={UrlJoin(inputProps.path, "min_secondary_price")}
        field="USD"
      />



      <Title order={3} mt={50} mb="md">{l10n.categories.item_availability}</Title>

      <Inputs.DateTime
        {...inputProps}
        {...l10n.item.available_at}
        subcategory={l10n.categories.item_availability}
        field="available_at"
      />
      <Inputs.DateTime
        {...inputProps}
        {...l10n.item.expires_at}
        subcategory={l10n.categories.item_availability}
        field="expires_at"
      />

      {
        !item.available_at ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.item.show_if_unreleased}
            subcategory={l10n.categories.item_availability}
            field="show_if_unreleased"
          />
      }

      {
        !item.available_at || !item.show_if_unreleased ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.item.viewable_if_unreleased}
            subcategory={l10n.categories.item_availability}
            field="viewable_if_unreleased"
          />
      }


      <Title order={3} mt={50} mb="md">{l10n.categories.item_permissions}</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.item.requires_permissions}
        subcategory={l10n.categories.item_permissions}
        field="requires_permissions"
      />

      {
        !item.requires_permissions ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.item.show_if_unauthorized}
            subcategory={l10n.categories.item_permissions}
            field="show_if_unauthorized"
          />
      }
      {
        !item.requires_permissions || !item.show_if_unauthorized ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.item.permission_message}
              subcategory={l10n.categories.item_permissions}
              field="permission_message"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.item.permission_description}
              subcategory={l10n.categories.item_permissions}
              field="permission_description"
            />
          </>
      }


      <Title order={3} mt={50} mb="md">{l10n.categories.item_analytics}</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.item.use_analytics}
        subcategory={l10n.categories.item_analytics}
        field="use_analytics"
      />

      {
        !item.use_analytics ? null :
          <>
            <Title order={5} mt={20} mb="md">{l10n.categories.item_page_view_analytics}</Title>
            <Inputs.Text
              {...inputProps}
              {...l10n.analytics.google_conversion_label}
              subcategory={l10n.categories.item_page_view_analytics}
              path={UrlJoin(inputProps.path, "page_view_analytics")}
              field="google_conversion_label"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.analytics.google_conversion_id}
              subcategory={l10n.categories.item_page_view_analytics}
              path={UrlJoin(inputProps.path, "page_view_analytics")}
              field="google_conversion_id"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.analytics.facebook_event_id}
              subcategory={l10n.categories.item_page_view_analytics}
              path={UrlJoin(inputProps.path, "page_view_analytics")}
              field="facebook_event_id"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.analytics.twitter_event_id}
              subcategory={l10n.categories.item_page_view_analytics}
              path={UrlJoin(inputProps.path, "page_view_analytics")}
              field="twitter_event_id"
            />
            <Title order={5} mt={40} mb="md">{l10n.categories.item_purchase_analytics}</Title>
            <Inputs.Text
              {...inputProps}
              {...l10n.analytics.google_conversion_label}
              subcategory={l10n.categories.item_purchase_analytics}
              path={UrlJoin(inputProps.path, "purchase_analytics")}
              field="google_conversion_label"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.analytics.google_conversion_id}
              subcategory={l10n.categories.item_purchase_analytics}
              path={UrlJoin(inputProps.path, "purchase_analytics")}
              field="google_conversion_id"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.analytics.facebook_event_id}
              subcategory={l10n.categories.item_purchase_analytics}
              path={UrlJoin(inputProps.path, "purchase_analytics")}
              field="facebook_event_id"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.analytics.twitter_event_id}
              subcategory={l10n.categories.item_purchase_analytics}
              path={UrlJoin(inputProps.path, "purchase_analytics")}
              field="twitter_event_id"
            />
          </>
      }
    </PageContent>
  );
});

const MarketplaceItems = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Items`}
      section="marketplace"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.items.items}
        category={l10n.categories.item}
        path="/public/asset_metadata/info"
        field="items"
        idField="sku"
        filterable
        Filter={({value, filter}) => value.name?.toLowerCase().includes(filter)}
        columns={[
          { field: "image", width: "80px", render: item => <ItemImage item={item} width={200} imageProps={{width: 50, height: 50, radius: "md"}} /> },
          { label: l10n.items.items.columns.name, field: "name", render: item => item.name || item.nft_template?.nft?.name },
          { label: l10n.items.items.columns.price, field: "price", width: "100px", render: item => item.free ? "Free" : FormatUSD(item.price.USD) },
          {
            label: l10n.items.items.columns.status,
            centered: true,
            field: "for_sale",
            width: "100px",
            render: item => {
              let status = l10n.items.status.available;
              let Icon = IconCheck;
              let color = "green";

              if(!item.for_sale) {
                status = l10n.items.status.not_for_sale;
                color = "red";
                Icon = IconX;
              } else if(item.available_at && ParseDate(item.available_at) > new Date()) {
                status = LocalizeString(l10n.items.status.unreleased, { date: FormatDate(item.available_at)});
                color = "yellow";
                Icon = IconClock;
              } else if(item.expires_at && ParseDate(item.expires_at) < new Date()) {
                status = LocalizeString(l10n.items.status.expired, { date: FormatDate(item.expires_at)});
                color = "red";
                Icon = IconClock;
              }

              return (
                <Group position="center">
                  <Tooltip label={status} events={{ hover: true, focus: true, touch: true }}>
                    <Box sx={theme => ({color: theme.colors[color][7] })}>
                      <Icon alt={status} />
                    </Box>
                  </Tooltip>
                </Group>
              );
            }
          }
        ]}
        newEntrySpec={MarketplaceItemSpec}
      />
    </PageContent>
  );
});

export default MarketplaceItems;
