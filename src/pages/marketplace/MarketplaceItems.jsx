import {observer} from "mobx-react-lite";
import {useEffect} from "react";
import {Link, useParams} from "react-router-dom";
import {rootStore, marketplaceStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs, {Confirm} from "@/components/inputs/Inputs";
import UrlJoin from "url-join";
import {Button, Group, Title, Text} from "@mantine/core";
import {IconButton, ItemImage, ListItemCategory, LocalizeString, TooltipIcon} from "@/components/common/Misc";
import {FormatDate, FormatPriceString, ParseDate} from "@/helpers/Misc.js";

import {MarketplaceItemSpec} from "@/specs/MarketplaceSpecs.js";

import {IconCircleCheck, IconX, IconClock, IconTemplate, IconLink} from "@tabler/icons-react";
import {ExtractHashFromLink} from "@/helpers/Fabric.js";

export const MarketplaceItem = observer(() => {
  const { marketplaceId, sku } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};
  const itemIndex = info.items?.findIndex(item => item.sku === sku);
  const item = info.items[itemIndex];
  const itemTemplateHash = ExtractHashFromLink(item?.nft_template);
  const itemTemplateId = itemTemplateHash && rootStore.utils.DecodeVersionHash(itemTemplateHash)?.objectId;
  const itemTemplateMetadata = marketplaceStore[itemTemplateHash];

  useEffect(() => {
    if(itemTemplateHash && !itemTemplateMetadata) {
      marketplaceStore.LoadItemTemplateMetadata({itemTemplateHash});
    }
  }, []);

  if(!item) {
    return (
      <div>
        Item not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.marketplace.form;
  const listPath = "/public/asset_metadata/info/items";
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: UrlJoin(listPath, itemIndex.toString()),
    category: ListItemCategory({
      store: marketplaceStore,
      objectId: marketplaceId,
      listPath,
      idField: "sku",
      id: sku,
      l10n: l10n.categories.item_label
    })
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
        customLabel={
          !itemTemplateId ? null :
            <Group align="center" spacing="xs">
              <IconButton
                label={l10n.item.item_template.view_template}
                color="purple.6"
                component={Link}
                to={UrlJoin("/item-templates", itemTemplateId)}
                Icon={IconTemplate}
              />
              { l10n.item.item_template.label }
            </Group>
        }
        subcategory={l10n.categories.item_info}
        field="nft_template"
        previewable={itemTemplateMetadata?.nft?.playable}
        previewIsAnimation={!itemTemplateMetadata?.nft?.has_audio}
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
            {
              (info.currencies || []).map(currencyCode =>
                <Inputs.Price
                  key={`price-${currencyCode}`}
                  {...inputProps}
                  label={LocalizeString(l10n.item.price_currency.label, {currencyCode})}
                  subcategory={l10n.categories.item_purchase_details}
                  path={UrlJoin(inputProps.path, "price")}
                  field={currencyCode}
                />
              )
            }
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.item.subscription}
              defaultValue={false}
              subcategory={l10n.categories.item_purchase_details}
              field="is_subscription"
            />
            {
              !item.is_subscription ? null :
                <>
                  <Inputs.Integer
                    {...inputProps}
                    {...l10n.item.subscription_period}
                    defaultValue={1}
                    max={12}
                    subcategory={l10n.categories.item_purchase_details}
                    field="subscription_period"
                  />
                  <Inputs.Date
                    {...inputProps}
                    {...l10n.item.subscription_start_time}
                    subcategory={l10n.categories.item_purchase_details}
                    field="subscription_start_time"
                  />
                  <Inputs.Date
                    {...inputProps}
                    {...l10n.item.subscription_end_time}
                    subcategory={l10n.categories.item_purchase_details}
                    field="subscription_end_time"
                  />
                </>
            }
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

      <Inputs.List
        {...inputProps}
        {...l10n.item.discount_codes}
        subcategory={l10n.categories.discount_codes}
        field="discount_codes"
        renderItem={props =>
          <>
            <Inputs.Text
              {...props}
              {...l10n.common.label}
              field="label"
            />
            <Inputs.Password
              {...props}
              {...l10n.item.discount_code}
              field="code"
            />
            <Inputs.Number
              {...props}
              {...l10n.item.discount_percent}
              field="percent"
            />
            {
              props.item.percent ? null :
                <Inputs.InputWrapper
                  {...l10n.item.discount_price}
                >
                  {["USD", ...(info.currencies || [])].map(currencyCode =>
                    <Inputs.Price
                      key={`price-${currencyCode}`}
                      {...inputProps}
                      componentProps={{
                        mt: "sm",
                        max: item.price?.[currencyCode]
                      }}
                      label={LocalizeString(l10n.item.price_currency.label, {currencyCode})}
                      path={UrlJoin(props.path, "price")}
                      field={currencyCode}
                    />
                  )}
                </Inputs.InputWrapper>
            }
            {
              !item.is_subscription ? null :
                <Inputs.Number
                  {...props}
                  {...l10n.item.discount_periods}
                  field="periods"
                />

            }
          </>
        }
        fields={[
          { field: "code", InputComponent: Inputs.Text, ...l10n.item.discount_code },
          { field: "percent", InputComponent: Inputs.Number, min: 1, max: 99, ...l10n.item.discount_code_percentage, defaultValue: 10 },

        ]}
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

  useEffect(() => {
    marketplaceStore.LoadMarketplaceItemStatus({marketplaceId});
  }, []);

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = { store: marketplaceStore, objectId: marketplaceId };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Items`}
      section="marketplace"
      useHistory
      titleContent={
        <Button
          label={l10n.items.update_links}
          Icon={IconLink}
          color="blue.6"
          onClick={() => {
            Confirm({
              text: l10n.items.update_links_confirm,
              onConfirm: () => {
                info.items.forEach((item, index) =>
                  marketplaceStore.SetLink({
                    ...l10n.item.item_template,
                    store: marketplaceStore,
                    objectId: marketplaceId,
                    category: ListItemCategory({
                      store: marketplaceStore,
                      objectId: marketplaceId,
                      listPath: "/public/asset_metadata/info/items",
                      idField: "sku",
                      id: item.sku,
                      l10n: l10n.categories.item_label
                    }),
                    subcategory: l10n.categories.item_info,
                    page: location.pathname,
                    path: UrlJoin("/public/asset_metadata/info/items", index.toString()),
                    field: "nft_template",
                    linkHash: ExtractHashFromLink(item.nft_template)
                  })
                );

                setTimeout(() => marketplaceStore.LoadMarketplaceItemStatus({marketplaceId}), 1000);
              }
            });
          }}
        >
          { l10n.items.update_links_button }
        </Button>
      }
    >
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.items.items}
        categoryFnParams={{fields: ["name", "sku"], l10n: l10n.categories.item_label}}
        path="/public/asset_metadata/info"
        field="items"
        idField="sku"
        filterable
        filterId="marketplaceItems"
        filterKey={marketplaceId}
        Filter={({value, filter}) =>
          value.name?.toLowerCase().includes(filter.toLowerCase()) ||
          value.sku?.toLowerCase().includes(filter.toLowerCase())
        }
        newItemSpec={MarketplaceItemSpec}
        Actions={(item, index) =>
          <IconButton
            variant="transparent"
            disabled={!item.nft_template || item.isLatestTemplate}
            label={LocalizeString(l10n.item.update_link, {label: item.name || item.label})}
            Icon={IconLink}
            color="blue.6"
            onClick={() => {
              Confirm({
                text: LocalizeString(l10n.item.update_link_confirm, {label: item.name || item.label}),
                onConfirm: () => marketplaceStore.SetLink({
                  ...l10n.item.item_template,
                  store: marketplaceStore,
                  objectId: marketplaceId,
                  category: ListItemCategory({
                    store: marketplaceStore,
                    objectId: marketplaceId,
                    listPath: "/public/asset_metadata/info/items",
                    idField: "sku",
                    id: item.sku,
                    l10n: l10n.categories.item_label
                  }),
                  subcategory: l10n.categories.item_info,
                  page: location.pathname,
                  path: UrlJoin("/public/asset_metadata/info/items", index.toString()),
                  field: "nft_template",
                  linkHash: ExtractHashFromLink(item.nft_template)
                })
              });
            }}
          />
        }
        columns={[
          {
            label: l10n.items.items.columns.name,
            field: "name",
            render: item => (
              <Group noWrap>
                <ItemImage marketplaceId={marketplaceId} item={item} scale={200} width={60} height={60} radius="xs" />
                <Text>{item.name}</Text>
              </Group>
            )
          },
          {
            label: l10n.items.items.columns.price,
            field: "price",
            width: "100px",
            render: item => item.free ? "Free" : FormatPriceString(item.price)
          },
          {
            label: l10n.items.items.columns.status,
            centered: true,
            field: "for_sale",
            width: "120px",
            render: item => {
              let status = l10n.items.status.available;
              let Icon = IconCircleCheck;
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

              return <TooltipIcon size={25} label={status} Icon={Icon} color={color} />;
            }
          }
        ]}
      />
    </PageContent>
  );
});

export default MarketplaceItems;
