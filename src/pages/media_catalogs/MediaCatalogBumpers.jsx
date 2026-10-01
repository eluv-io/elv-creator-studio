import BumperStyles from "@/assets/stylesheets/modules/bumper.module.scss";

import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaCatalogStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import UrlJoin from "url-join";
import {Group, Title} from "@mantine/core";
import PermissionItemSelect from "@/components/inputs/permission_set/PermissionItemSelect.jsx";
import {MediaCatalogBumperOfferSpec} from "@/specs/MediaCatalogSpecs.js";
import Video from "@/components/common/Video.jsx";
import {EluvioPlayerParameters} from "@eluvio/elv-player-js/lib";
import {useState, useEffect} from "react";
import {IconPlayerPauseFilled, IconPlayerPlayFilled} from "@tabler/icons-react";
import {IconButton} from "@/components/common/Misc.jsx";

const S = (...classes) => classes.map(c => BumperStyles[c] || "").join(" ");

const BumperOfferPreview = observer(({offer, format, compact}) => {
  if(format === "details") {
    if(compact) {
      return (
        <div className={S("compact-offer")}>
          <div className={S("compact-offer__text")}>
            {
              !offer.display.subtitle ? null :
                <div className={S("compact-offer__subtitle")}>
                  { offer.display.subtitle }
                </div>
            }
            {
              !offer.display.title ? null :
                <div className={S("compact-offer__title")}>
                  { offer.display.title }
                </div>
            }
            {
              !offer.display.description ? null :
                <div className={S("compact-offer__description")}>
                  { offer.display.description }
                </div>
            }
          </div>
          <div className={S("compact-offer__action")}>
            {
              !offer.display.price ? null :
                <div className={S("compact-offer__price")}>
                  { offer.display.price }
                </div>
            }
            <button className={S("compact-offer__button", `compact-offer__button--${offer.display.button_variant}`)}>
              {offer.display.button_text}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={S("offer")}>
        {
          !offer.display.subtitle ? null :
            <div className={S("offer__subtitle")}>
              { offer.display.subtitle }
            </div>
        }
        {
          !offer.display.title ? null :
            <div className={S("offer__title")}>
              { offer.display.title }
            </div>
        }
        {
          !offer.display.price ? null :
            <div className={S("offer__price")}>
              { offer.display.price }
            </div>
        }
        {
          !offer.display.description ? null :
            <div className={S("offer__description")}>
              { offer.display.description }
            </div>
        }
        <div className={S("offer__spacer")} />
        <button className={S("offer__button", `offer__button--${offer.display.button_variant}`)}>
          {offer.display.button_text}
        </button>
      </div>
    );
  }

  return (
    <button className={S("offer-button")}>
      { offer.display.button_text }
    </button>
  );
});

const BumperPreview = observer(({bumper, mobile, playVideo}) => {
  const [player, setPlayer] = useState(undefined);

  const showCompactOffers = bumper.offers.format === "details" && bumper.offers.items.length > 2;

  const imageUrl = mobile ? bumper.image_mobile?.url : bumper.image?.url;
  const position = mobile ? bumper.offers?.position_mobile || "center" : bumper.offers?.position || "bottom_right";
  const showOfferTextBackground = mobile && bumper.offers.format === "button" && (bumper.offers.title || bumper.offers.subtitle);

  const videoLink = mobile ? bumper.video_mobile : bumper.video;
  const videoLinkInfo = mobile ? bumper.video_mobile && bumper.video_mobile_info : bumper.video && bumper.video_info;

  useEffect(() => {
    if(!player) { return; }

    playVideo ?
      player.controls.Play() :
      player.controls.Pause();
  }, [playVideo]);

  console.log("Render", mobile, player);

  return (
    <div className={S("bumper", mobile ? "bumper--mobile" : "", bumper.blur ? "bumper--blur" : "")}>
      {
        !imageUrl ? null :
          <div className={S("bumper__image-container")}>
            <img alt={bumper.image_alt} src={imageUrl} className={S("bumper__image")}/>
          </div>
      }
      {
        !videoLink ? null :
          <div className={S("bumper__video-container")}>
            <Video
              aspectRatio={mobile ? 9/16 : 16/9}
              videoLink={videoLink}
              videoLinkInfo={videoLinkInfo}
              className={S("bumper__video")}
              controls={{
                muted: EluvioPlayerParameters.muted.ON,
                autoplay: EluvioPlayerParameters.autoplay.OFF,
                controls: EluvioPlayerParameters.controls.OFF,
                loop: bumper.loop
              }}
              playerOptions={{
                capLevelToPlayerSize: true,
                showLoader: false,
                backgroundColor: "transparent",
              }}
              SetPlayer={setPlayer}
            />
          </div>
      }
      <div
        className={
          S(
            "bumper__content",
            `bumper__content--${position}`,
            showOfferTextBackground ? "bumper__content--with-offer-text" : ""
          )
        }
      >
        {
          (bumper.offers?.items || []).length === 0 ? null :
            <div
              className={
                S(
                  "bumper__offers",
                  `bumper__offers--${bumper.offers.format}`,
                  showCompactOffers ? "bumper__offers--compact" : ""
                )
              }
            >
              {
                !bumper.offers.title ? null :
                  <div className={S("bumper__offers-title")}>{bumper.offers.title}</div>
              }
              {
                !bumper.offers.subtitle ? null :
                  <div className={S("bumper__offers-subtitle")}>{bumper.offers.subtitle}</div>
              }
              <div className={S("bumper__offer-items")}>
                {
                  bumper.offers.items.map((offer, index) =>
                    <BumperOfferPreview
                      key={`offer-${index}`}
                      format={bumper.offers.format}
                      compact={showCompactOffers}
                      offer={offer}
                    />
                  )
                }
              </div>
              {
                !bumper.offers.bottom_text ? null :
                  <div className={S("bumper__offers-bottom-text")}>{bumper.offers.bottom_text}</div>
              }
            </div>
        }
      </div>
    </div>
  );
});

const BumperPreviews = observer(({bumper}) => {
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    setPlayVideo(false);
  }, [JSON.stringify(bumper)]);

  if(!bumper) { return; }

  return (
    <div>
      <Group mt={50} mb={20} align="center" position="apart" w={1310}>
        <div>
          <Title order={4} fw={500}>Preview</Title>
          <Title order={6} color="gray">Approximations for illustration, may appear different in use</Title>
        </div>
        <IconButton
          label={`${playVideo ? "Pause" : "Play"} Video`}
          Icon={playVideo ? IconPlayerPauseFilled : IconPlayerPlayFilled}
          color="purple.7"
          onClick={() => setPlayVideo(!playVideo)}
        />
      </Group>

      <div className={S("bumper-preview")}>
        <BumperPreview
          bumper={bumper}
          playVideo={playVideo}
        />
        <BumperPreview
          mobile
          bumper={bumper}
          playVideo={playVideo}
        />
      </div>
    </div>
  );
});

export const BumperOffer = observer(({index}) => {
  const { mediaCatalogId, bumperId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const bumper = info.bumpers?.[bumperId];

  if(!bumper) { return null; }

  const offer = bumper.offers?.items?.[parseInt(index)];

  if(!offer) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({
      mediaCatalogId,
      type: "bumpers",
      category: "bumper_label",
      id: bumperId,
      titleField: "label"
    }),
    subcategory: l10n.categories.bumper_offer,
    path: UrlJoin("/public/asset_metadata/info/bumpers", bumperId, "offers", "items", index.toString())
  };

  return (
    <>
      <Inputs.Text
        {...l10n.common.label}
        {...inputProps}
        field="label"
      />

      <Title order={6} mt={15} mb="xs">
        { l10n.categories.display }
      </Title>
      {
        bumper.offers?.format !== "details" ? null :
          <>
            <Inputs.Text
              {...l10n.bumpers.offer.display.title}
              {...inputProps}
              path={UrlJoin(inputProps.path, "display")}
              field="title"
            />
            <Inputs.Text
              {...l10n.bumpers.offer.display.subtitle}
              {...inputProps}
              path={UrlJoin(inputProps.path, "display")}
              field="subtitle"
            />
            <Inputs.Text
              {...l10n.bumpers.offer.display.price}
              {...inputProps}
              path={UrlJoin(inputProps.path, "display")}
              field="price"
            />
            <Inputs.TextArea
              {...l10n.bumpers.offer.display.description}
              {...inputProps}
              path={UrlJoin(inputProps.path, "display")}
              field="description"
            />
            <Inputs.Select
              {...l10n.bumpers.offer.display.button_variant}
              {...inputProps}
              path={UrlJoin(inputProps.path, "display")}
              defaultValue="filled"
              field="button_variant"
              options={[
                { label: "Filled", value: "filled" },
                { label: "Outline", value: "outline" }
              ]}
            />
          </>
      }
      <Inputs.Text
        {...l10n.bumpers.offer.display.button_text}
        {...inputProps}
        path={UrlJoin(inputProps.path, "display")}
        field="button_text"
      />

      <Title order={6} mt={15} mb="xs">
        { l10n.categories.bumper_offer_action }
      </Title>
      <Inputs.Select
        {...l10n.bumpers.offer.behavior}
        {...inputProps}
        path={UrlJoin(inputProps.path, "action")}
        field="behavior"
        defaultValue="purchase"
        options={[
          {label: "Purchase", value: "purchase"},
          {label: "Continue", value: "continue"},
          {label: "Link", value: "link"}
        ]}
      />
      {
        offer.action?.behavior !== "purchase" ? null :
          <PermissionItemSelect
            permissionSetIds={info?.permission_sets}
            defaultFirst
            path={UrlJoin(inputProps.path, "action")}
            {...inputProps}
            {...l10n.bumpers.offer.action.permission_item_id}
            field="permission_item_id"
          />
      }
      {
        offer.action?.behavior !== "link" ? null :
          <Inputs.Text
            {...l10n.bumpers.offer.action.url}
            {...inputProps}
            path={UrlJoin(inputProps.path, "action")}
            field="url"
          />
      }
    </>
  );
});

export const MediaCatalogBumper = observer(() => {
  const { mediaCatalogId, bumperId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const bumper = info.bumpers?.[bumperId];

  if(!bumper) { return null; }

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: mediaCatalogStore.MediaItemCategory({
      mediaCatalogId,
      type: "bumpers",
      category: "bumper_label",
      id: bumperId,
      titleField: "label"
    }),
    path: UrlJoin("/public/asset_metadata/info/bumpers", bumperId)
  };

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.bumpers}`}
      section="mediaCatalog"
      backLink={UrlJoin("/media-catalogs", mediaCatalogId, "bumpers")}
      useHistory
    >
      <Inputs.Text
        {...l10n.common.id}
        {...inputProps}
        field="id"
        disabled
      />
      <Inputs.Text
        {...l10n.common.label}
        {...inputProps}
        field="label"
      />
      <Inputs.Select
        {...l10n.bumpers.category}
        {...inputProps}
        field="category"
        defaultValue="bumper"
        options={[
          {label: "Ad", value: "ad"},
          {label: "Bumper", value: "bumper"},
          {label: "Offer", value: "offer"},
        ]}
      />
      <Inputs.MultiSelect
        {...inputProps}
        {...l10n.bumpers.tags}
        subcategory={l10n.categories.tags}
        disabled={(info.tags || []).length === 0}
        field="tags"
        searchable
        options={info.tags || []}
      />
      <Inputs.URL
        {...l10n.bumpers.url}
        {...inputProps}
        field="url"
      />

      <Title order={5} mt={35} mb="xs">
        { l10n.categories.display }
      </Title>
      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.bumpers.video}
        subcategory={l10n.categories.display}
        field="video"
        fabricBrowserProps={{
          video: true,
          allowCompositions: true,
          allowClips: true
        }}
        previewable
        previewOptions={{
          controls: false,
          autoplay: true
        }}
      />
      <Inputs.FabricBrowser
        {...inputProps}
        {...l10n.bumpers.video_mobile}
        subcategory={l10n.categories.display}
        field="video_mobile"
        fabricBrowserProps={{
          video: true,
          allowCompositions: true,
          allowClips: true
        }}
        previewable
        previewOptions={{
          controls: false,
          autoplay: true
        }}
      />
      {
        !bumper.video && !bumper.video_mobile ? null :
          <Inputs.Checkbox
            {...l10n.bumpers.loop}
            {...inputProps}
            subcategory={l10n.categories.display}
            defaultValue={false}
            field="loop"
          />
      }

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.bumpers.images}
        subcategory={l10n.categories.display}
        componentProps={{w: uiStore.inputWidthWide}}
        altTextField="image_alt"
        fields={[
          { field: "image", aspectRatio: 16/9, baseSize: 140, ...l10n.bumpers.image },
          { field: "image_mobile", aspectRatio: 9/16, baseSize: 150, ...l10n.bumpers.image_mobile },
        ]}
      />
      <Inputs.Checkbox
        {...l10n.bumpers.blur}
        {...inputProps}
        defaultValue={false}
        subcategory={l10n.categories.display}
        field="blur"
      />
      <Inputs.Integer
        {...l10n.bumpers.duration}
        {...inputProps}
        subcategory={l10n.categories.display}
        defaultValue={8}
        min={0}
        max={60}
        field="duration"
      />

      <Title order={5} mt={35} mb="xs">
        { l10n.categories.bumper_offers }
      </Title>
      <Inputs.Text
        {...l10n.bumpers.offers.title}
        {...inputProps}
        subcategory={l10n.categories.bumper_offers}
        path={UrlJoin(inputProps.path, "offers")}
        field="title"
      />
      <Inputs.Text
        {...l10n.bumpers.offers.subtitle}
        {...inputProps}
        subcategory={l10n.categories.bumper_offers}
        path={UrlJoin(inputProps.path, "offers")}
        field="subtitle"
      />
      <Inputs.Text
        {...l10n.bumpers.offers.bottom_text}
        {...inputProps}
        subcategory={l10n.categories.bumper_offers}
        path={UrlJoin(inputProps.path, "offers")}
        field="bottom_text"
      />
      <Inputs.Select
        {...l10n.bumpers.offers.format}
        {...inputProps}
        path={UrlJoin(inputProps.path, "offers")}
        field="format"
        defaultValue="button"
        options={[
          {label: "Button", value: "button"},
          {label: "Details", value: "details"}
        ]}
      />
      <Inputs.Select
        {...l10n.bumpers.offers.position}
        {...inputProps}
        subcategory={l10n.categories.bumper_offers}
        path={UrlJoin(inputProps.path, "offers")}
        field="position"
        defaultValue="bottom_right"
        options={[
          { label: "Top Left", value: "top_left" },
          { label: "Top", value: "top" },
          { label: "Top Right", value: "top_right" },
          { label: "Center", value: "center" },
          { label: "Bottom Left", value: "bottom_left" },
          { label: "Bottom", value: "bottom" },
          { label: "Bottom Right", value: "bottom_right" }
        ]}
      />
      <Inputs.Select
        {...l10n.bumpers.offers.position_mobile}
        {...inputProps}
        subcategory={l10n.categories.bumper_offers}
        path={UrlJoin(inputProps.path, "offers")}
        field="position_mobile"
        defaultValue="center"
        options={[
          { label: "Top", value: "top" },
          { label: "Center", value: "center" },
          { label: "Bottom", value: "bottom" }
        ]}
      />
      <Inputs.List
        {...l10n.bumpers.offers.items}
        {...inputProps}
        subcategory={l10n.categories.bumper_offers}
        path={UrlJoin(inputProps.path, "offers")}
        newItemSpec={MediaCatalogBumperOfferSpec}
        field="items"
        renderItem={({index}) =>
          <BumperOffer index={index} />
        }
      />
      <BumperPreviews key={JSON.stringify(bumper)} bumper={bumper} />
    </PageContent>
  );
});

const MediaCatalogBumpers = observer(() => {
  const { mediaCatalogId } = useParams();

  const mediaCatalog = mediaCatalogStore.mediaCatalogs[mediaCatalogId];

  if(!mediaCatalog) { return null; }

  const info = mediaCatalog?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_catalog.form;
  const inputProps = {
    store: mediaCatalogStore,
    objectId: mediaCatalogId,
    category: l10n.categories.bumpers,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || mediaCatalog.name || "MediaCatalog"} - ${l10n.categories.bumpers}`}
      section="mediaCatalog"
      useHistory
    >
      <Inputs.ReferenceTable
        {...inputProps}
        {...l10n.bumpers.bumpers}
        field="bumpers"
        nameField="label"
        filterable
        filterFields={["label", "category"]}
        CopyItem={({item}) => mediaCatalogStore.CreateBumper({
          mediaCatalogId,
          copyBumperId: item.id
        })}
        AddItem={() => mediaCatalogStore.CreateBumper({mediaCatalogId})}
        columns={[
          {
            accessor: "label",
            sortable: true,
            title: l10n.common.label.label,
          },
          {
            accessor: "category",
            sortable: true,
            title: l10n.bumpers.category.label,
            render: item => item?.category?.capitalize() || "",
          },
          {
            accessor: "tags",
            title: l10n.bumpers.tags.label,
            width: 200,
            render: item => item?.tags?.join(", ")
          }
        ]}
      />
    </PageContent>
  );
});

export default MediaCatalogBumpers;
