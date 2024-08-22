import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, itemTemplateStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {IconCircleCheck, IconClock} from "@tabler/icons-react";
import {FormatDate, ParseDate} from "@/helpers/Misc.js";
import {ListItemCategory, LocalizeString, TooltipIcon} from "@/components/common/Misc.jsx";
import {Group, Image, Text, Title} from "@mantine/core";
import {ItemTemplateRedeemableOfferSpec} from "@/specs/ItemTemplateSpecs.js";
import UrlJoin from "url-join";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js/lib/index";
import {ScaleImage} from "@/helpers/Fabric";

export const ItemTemplateRedeemableOffer = observer(() => {
  const { itemTemplateId, redeemableOfferId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];

  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};
  const redeemableOfferIndex = info.redeemable_offers?.findIndex(offer => offer.id === redeemableOfferId);
  const redeemableOffer = info.redeemable_offers?.[redeemableOfferIndex];

  if(!redeemableOffer) {
    return (
      <div>
        Redeemable Offer not found
      </div>
    );
  }

  const l10n = rootStore.l10n.pages.item_template.form;
  const listPath = "/public/asset_metadata/nft/redeemable_offers";
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    path: UrlJoin(listPath, redeemableOfferIndex.toString()),
    category: ListItemCategory({
      store: itemTemplateStore,
      objectId: itemTemplateId,
      listPath,
      id: redeemableOfferId,
      labelField: "name",
      l10n: l10n.categories.redeemable_offer_label
    }),
    subcategory: l10n.categories.redeemable_offer_details
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.redeemable_offers} - ${redeemableOffer.name}`}
      section="itemTemplate"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.redeemable_offer_details}</Title>

      <Group h="max-content">
        <Inputs.SingleImageInput
          {...inputProps}
          {...l10n.redeemable_offers.image}
          field="image"
          h="100%"
        />
        <Inputs.SingleImageInput
          {...inputProps}
          {...l10n.redeemable_offers.poster_image}
          field="poster_image"
        />
      </Group>
      <Inputs.UUID
        {...inputProps}
        {...l10n.redeemable_offers.offer_id}
        field="offer_id"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.redeemable_offers.title}
        field="name"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.redeemable_offers.subtitle}
        field="subtitle"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.redeemable_offers.description_text}
        field="description_text"
      />
      <Inputs.RichText
        {...inputProps}
        {...l10n.redeemable_offers.description}
        field="description"
      />
      <Inputs.DateTime
        {...inputProps}
        {...l10n.redeemable_offers.release_date}
        field="available_at"
      />
      <Inputs.DateTime
        {...inputProps}
        {...l10n.redeemable_offers.expiration_date}
        field="expires_at"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.redeemable_offers.style_variant}
        field="style"
      />
      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.redeemable_offers.animation}
        field="animation"
        previewable
        previewIsAnimation
      />

      <Inputs.List
        {...inputProps}
        {...l10n.redeemable_offers.tags}
        narrow
        idField="id"
        field="tags"
        fields={[
          { field: "id", InputComponent: Inputs.UUID, hidden: true, ...l10n.common.id },
          { field: "key", InputComponent: Inputs.Text, ...l10n.redeemable_offers.key },
          { field: "value", InputComponent: Inputs.Text, ...l10n.redeemable_offers.value },
        ]}
      />

      <Title order={3} mt={50} mb="md">{l10n.categories.redeemable_offer_visibility}</Title>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.redeemable_offers.hidden}
        subcategory={l10n.categories.redeemable_offer_visibility}
        path={UrlJoin(inputProps.path, "visibility")}
        field="hide"
        defaultValue={false}
      />
      {
        redeemableOffer?.visibility?.hide ? null :
          <>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.redeemable_offers.featured}
              subcategory={l10n.categories.redeemable_offer_visibility}
              path={UrlJoin(inputProps.path, "visibility")}
              field="featured"
              defaultValue={false}
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.redeemable_offers.hide_if_unreleased}
              subcategory={l10n.categories.redeemable_offer_visibility}
              path={UrlJoin(inputProps.path, "visibility")}
              field="hide_if_unreleased"
              defaultValue={false}
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.redeemable_offers.hide_if_expired}
              subcategory={l10n.categories.redeemable_offer_visibility}
              path={UrlJoin(inputProps.path, "visibility")}
              field="hide_if_expired"
              defaultValue={false}
            />
          </>
      }

      <Title order={3} mt={50} mb="md">{l10n.categories.redeemable_offer_redemption_settings}</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.redeemable_offers.results_header}
        subcategory={l10n.categories.redeemable_offer_redemption_settings}
        field="results_header"
      />

      <Inputs.TextArea
        {...inputProps}
        {...l10n.redeemable_offers.results_message}
        subcategory={l10n.categories.redeemable_offer_redemption_settings}
        field="results_message"
      />

      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.redeemable_offers.redeem_animation}
        subcategory={l10n.categories.redeemable_offer_redemption_settings}
        field="redeem_animation"
        previewable
        previewOptions={{
          muted: EluvioPlayerParameters.muted.OFF_IF_POSSIBLE,
          autoplay: EluvioPlayerParameters.autoplay.ON,
          controls: EluvioPlayerParameters.controls.OFF_WITH_VOLUME_TOGGLE,
          loop: EluvioPlayerParameters.loop[redeemableOffer.redeem_animation_loop ? "ON" : "OFF"]
        }}
      />

      {
        !redeemableOffer.redeem_animation ? null :
          <>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.redeemable_offers.redeem_animation_loop}
              subcategory={l10n.categories.redeemable_offer_redemption_settings}
              field="redeem_animation_loop"
              defaultValue={true}
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.redeemable_offers.require_redeem_animation}
              subcategory={l10n.categories.redeemable_offer_redemption_settings}
              field="require_redeem_animation"
              defaultValue={false}
            />
          </>
      }
    </PageContent>
  );
});

const ItemTemplateRedeemableOffers = observer(() => {
  const { itemTemplateId } = useParams();

  const itemTemplate = itemTemplateStore.itemTemplates[itemTemplateId];

  const info = itemTemplate?.metadata?.public?.asset_metadata?.nft || {};

  const l10n = rootStore.l10n.pages.item_template.form;
  const inputProps = {
    store: itemTemplateStore,
    objectId: itemTemplateId,
    category: l10n.categories.primary_media,
    path: "/public/asset_metadata/nft/redeemable_offers"
  };

  return (
    <PageContent
      title={`${info.display_name || itemTemplate.display_name || "Item Template"} - ${l10n.categories.redeemable_offers}`}
      section="itemTemplate"
      useHistory
    >
      <Inputs.CollectionTable
        {...inputProps}
        {...l10n.redeemable_offers.redeemable_offers}
        categoryFnParams={{fields: ["name", "id"], l10n: l10n.categories.redeemable_offer_label}}
        path="/public/asset_metadata/nft"
        field="redeemable_offers"
        idField="id"
        columns={[
          {
            label: l10n.redeemable_offers.redeemable_offers.columns.name,
            field: "name",
            render: redeemableOffer => (
              <Group noWrap>
                <Image
                  width={60}
                  height={60}
                  fit="contain"
                  src={ScaleImage(redeemableOffer.image?.url, 400)}
                  alt={redeemableOffer.name}
                  withPlaceholder
                />
                <Text>{redeemableOffer.name || redeemableOffer.id}</Text>
              </Group>
            )
          },
          {
            label: l10n.redeemable_offers.redeemable_offers.columns.status,
            centered: true,
            field: "status",
            width: "120px",
            render: redeemableOffer => {
              let status = l10n.redeemable_offers.redeemable_offers.status.available;
              let Icon = IconCircleCheck;
              let color = "green";

              if(redeemableOffer.available_at && ParseDate(redeemableOffer.available_at) > new Date()) {
                status = LocalizeString(l10n.redeemable_offers.redeemable_offers.status.unreleased, { date: FormatDate(redeemableOffer.available_at)});
                color = "yellow";
                Icon = IconClock;
              } else if(redeemableOffer.expires_at && ParseDate(redeemableOffer.expires_at) < new Date()) {
                status = LocalizeString(l10n.redeemable_offers.redeemable_offers.status.expired, { date: FormatDate(redeemableOffer.expires_at)});
                color = "red";
                Icon = IconClock;
              }

              return <TooltipIcon size={25} label={status} Icon={Icon} color={color} />;
            }
          }
        ]}
        newItemSpec={ItemTemplateRedeemableOfferSpec}
      />
    </PageContent>
  );
});

export default ItemTemplateRedeemableOffers;
