import CardStyle from "@/assets/stylesheets/modules/cards.module.scss";

import {useState} from "react";
import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Button, Group, Paper, Stack, Title} from "@mantine/core";
import ColorOptions from "@/components/inputs/media_property/Components.jsx";
import UrlJoin from "url-join";
import {ConvertColor} from "@/helpers/Misc.js";

import EluvioLogo from "@/assets/images/E Logo Dark Transparent.svg";

const S = (...classes) => classes.map(c => CardStyle[c] || "").join(" ");

const ThemeProperties = theme => {
  let css = {};
  let variants = [];

  const FormatColor = (hex, alpha) => {
    const {r, g, b, a} = ConvertColor({hex, alpha: typeof alpha === "number" ? alpha/100 : 1});

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  switch(theme.border_radius) {
    case "subtle":
      css["--border-radius"] = "5px";
      break;

    case "curved":
      css["--border-radius"] = "20px";
      break;

    default:
      css["--border-radius"] = 0;
      break;
  }

  css["--border-width"] = `${theme.border_width || 0}px`;

  css["--square-border-radius"] = "var(--border-radius)";
  if(theme.circularize) {
    css["--square-border-radius"] = "100%";
  }

  css["--border-color--active"] = theme.active.border_color || "#FFFFFF";
  css["--border-color--inactive"] = theme.inactive.border_color || "#FFFFFF";

  if(!theme.border_width) {
    css["--border-color--active"] = "transparent";
    css["--border-color--inactive"] = "transparent";
  }

  const activeBackground1 = FormatColor(
    theme.active.background_color || "#000000",
    theme.active.background_color_opacity
  );

  const activeBackground2 = FormatColor(
    theme.active.background_color_2 || "#000000",
    theme.active.background_color_2_opacity
  );

  const inactiveBackground1 = FormatColor(
    theme.inactive.background_color || "#000000",
    theme.inactive.background_color_opacity
  );

  const inactiveBackground2 = FormatColor(
    theme.inactive.background_color_2 || "#000000",
    theme.inactive.background_color_2_opacity
  );

  css["--background-color--active"] = activeBackground1;
  css["--background-color--inactive"] = inactiveBackground1;

  css["--background-color-2--active"] = theme.active.background_type === "gradient" ?
    activeBackground2 : activeBackground1;

  css["--background-color-2--inactive"] = theme.inactive.background_type === "gradient" ?
    inactiveBackground2 : inactiveBackground1;

  css["--background-gradient-angle--active"] = `${theme.active.background_gradient_angle || 0}deg`;
  css["--background-gradient-angle--inactive"] = `${theme.inactive.background_gradient_angle || 0}deg`;

  if(theme.effect) {
    variants.push(`effect-${theme.effect}`);
  }

  return {
    css,
    variants,
    mobileState: theme.mobile_state
  };
};

const Card = observer(({image, aspectRatio, mobile=false, variants=[], mobileState}) => {
  if(mobileState === "no-transition") {
    variants = [];
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={
        S(
          "card",
          `card--${aspectRatio}`,
          mobile ? "card--mobile" : "",
          mobile && mobileState === "active" ? "card--active" : "",
          ...variants.map(variant => `card--${variant}`)
        )
      }
    >
      <div className={S("card__image-container")}>
        <img src={image} alt="Logo Image" className={S("card__image")} />
      </div>
      <div className={S("card__text")}>
        <div className={S("card__title")}>Card Title</div>
        <div className={S("card__subtitle")}>Card Subtitle</div>
      </div>
    </div>
  );
});

const CardExamples = observer(({theme}) => {
  const {css, variants, mobileState} = ThemeProperties(theme);

  const [input, setInput] = useState(undefined);
  const [exampleImage, setExampleImage] = useState(EluvioLogo);

  return (
    <Stack spacing={0}>
      <Title order={3}>Preview</Title>
      <Title order={6} mb={20} color="gray">Approximations for illustration, may appear different on your site</Title>
      <Button onClick={() => input?.click()} w={300} color="gray" mx="auto" mb={10}>
        Choose Example Image
      </Button>
      <input
        ref={setInput}
        type="file"
        hidden
        accept="image/png, image/jpeg, image/svg+xml, image/webp, image/gif, image/png"
        onChange={event => setExampleImage(URL.createObjectURL(event.target.files[0]))}
      />
      <div style={{...css}} className={S("cards")}>
        <Card image={exampleImage} aspectRatio="landscape" variants={variants}/>
        <Card image={exampleImage} aspectRatio="square" variants={variants}/>
        <Card image={exampleImage} aspectRatio="portrait" variants={variants}/>
      </div>
      <div style={{...css}} className={S("cards", "cards--mobile")}>
        <Card mobile image={exampleImage} aspectRatio="landscape" variants={variants} mobileState={mobileState}/>
        <Card mobile image={exampleImage} aspectRatio="square" variants={variants} mobileState={mobileState}/>
        <Card mobile image={exampleImage} aspectRatio="portrait" variants={variants} mobileState={mobileState}/>
      </div>
    </Stack>
  );
});

export const MediaPropertyCardTheme = observer(() => {
  const {mediaPropertyId, cardThemeId} = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) {
    return null;
  }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info;
  const cardTheme = info?.styling?.card_themes?.[cardThemeId];

  if(!cardTheme) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: mediaPropertyStore.MediaPropertyCategory({
      category: "card_theme_label",
      mediaPropertyId,
      type: "styling/card_themes",
      id: cardThemeId,
      label: cardTheme.label
    }),
    path: UrlJoin("/public/asset_metadata/info/styling/card_themes", cardThemeId)
  };

  const TransitionableOptions = observer(({state}) => {
    return (
      <>
        <Inputs.Color
          {...inputProps}
          {...l10n.card_theme.border_color}
          path={UrlJoin(inputProps.path, state)}
          defaultValue="#FFFFFF"
          field="border_color"
        />
        <Inputs.Select
          {...inputProps}
          {...l10n.card_theme.background_type}
          path={UrlJoin(inputProps.path, state)}
          field="background_type"
          defaultValue="solid"
          options={[
            { label: "Solid", value: "solid" },
            { label: "Gradient", value: "gradient" },
          ]}
        />
        <Inputs.Color
          {...inputProps}
          {...l10n.card_theme.background_color}
          path={UrlJoin(inputProps.path, state)}
          defaultValue="#000000"
          field="background_color"
          withOpacity
        />
        {
          cardTheme[state]?.background_type !== "gradient" ? null :
            <>
              <Inputs.Color
                {...inputProps}
                {...l10n.card_theme.background_color_2}
                path={UrlJoin(inputProps.path, state)}
                defaultValue="#000000"
                field="background_color_2"
                withOpacity
              />
              <Inputs.Slider
                {...inputProps}
                {...l10n.card_theme.background_gradient_angle}
                path={UrlJoin(inputProps.path, state)}
                field="background_gradient_angle"
                defaultValue={0}
                min={0}
                max={360}
              />
            </>
        }
      </>
    );
  });

  return (
    <PageContent
      backLink={UrlJoin("/media-properties", mediaPropertyId, "theme")}
      title={`${info.name || mediaProperty.name || "MediaProperty"} - ${l10n.categories.card_themes} - ${cardTheme.label || ""}`}
      section="mediaProperty"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.common.label}
        field="label"
      />
      <Inputs.TextArea
        {...inputProps}
        {...l10n.common.description}
        field="description"
      />
      <Group mt={50} spacing={30} noWrap align="top">
        <div>
          <Stack spacing={0} maw={uiStore.inputWidth}>
            <Group grow>
              <Inputs.Select
                {...inputProps}
                {...l10n.card_theme.border_radius}
                field="border_radius"
                defaultValue="subtle"
                options={[
                  { label: "None", value: "none" },
                  { label: "Subtle", value: "subtle" },
                  { label: "Curved", value: "curved" }
                ]}
              />
              <Inputs.Slider
                {...inputProps}
                {...l10n.card_theme.border_width}
                field="border_width"
                defaultValue={0}
                min={0}
                max={10}
              />
            </Group>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.card_theme.circularize}
              field="circularize"
              defaultValue={false}
            />
            <Inputs.Select
              {...inputProps}
              {...l10n.card_theme.effect}
              field="effect"
              defaultValue="none"
              options={[
                { label: "None", value: "none" },
                { label: "Desaturate", value: "desaturate" },
                { label: "Desaturate Image", value: "desaturate-image" },
                { label: "Desaturate Background", value: "desaturate-background" }
              ]}
            />
            <Inputs.Select
              {...inputProps}
              {...l10n.card_theme.mobile_state}
              field="mobile_state"
              defaultValue="inactive"
              options={[
                { label: "Inactive", value: "inactive" },
                { label: "Inactive with Transition Effect Disabled", value: "no-transition" },
                { label: "Active", value: "active" }
              ]}
            />
          </Stack>
          <Group align="top" grow w={uiStore.inputWidth}>
            <Paper withBorder py={0} h="max-content" mt="md" w={uiStore.inputWidth}>
              <Stack spacing={0} p="md">
                <Title align="center" order={5}>Inactive</Title>
                <TransitionableOptions state="inactive" />
              </Stack>
            </Paper>
            <Paper withBorder py={0} h="max-content" mt="md" w={uiStore.inputWidth}>
              <Stack spacing={0} p="md">
                <Title align="center" order={5}>Active</Title>
                <TransitionableOptions state="active" />
              </Stack>
            </Paper>

          </Group>
        </div>
        <CardExamples theme={cardTheme} />
      </Group>
    </PageContent>
  );
});

const MediaPropertyThemeSettings = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.theme_settings,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "Media Property"} - ${l10n.categories.theme_settings}`}
      section="mediaProperty"
      useHistory
    >
      <Title order={3} mb="md">{l10n.categories.card_themes}</Title>

      <Inputs.ReferenceTable
        {...inputProps}
        {...l10n.card_themes}
        path="/public/asset_metadata/info/styling"
        field="card_themes"
        routePath="card_themes"
        nameField="label"
        filterable
        filterFields={["label", "description"]}
        AddItem={() => mediaPropertyStore.CreateCardTheme({mediaPropertyId})}
        CopyItem={({id}) => mediaPropertyStore.CreateCardTheme({mediaPropertyId, copyId: id})}
        columns={[
          {
            accessor: "label",
            sortable: true,
            title: l10n.common.label.label
          },
          {
            accessor: "description",
            title: l10n.common.description.label
          }
        ]}
      />

      <Title order={3} mb="md">{l10n.categories.theme}</Title>
      <Inputs.Select
        {...inputProps}
        {...l10n.theme.font}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        defaultValue=""
        field="font"
        options={[
          { label: "Inter (Default)", value: "" },
          { label: "Custom Font", value: "custom" },
        ]}
      />
      {
        info?.styling?.font !== "custom" ? null :
          <>
            <Inputs.Text
              {...inputProps}
              {...l10n.theme.custom_font_declaration}
              subcategory={l10n.categories.theme}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_font_declaration"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.theme.custom_title_font_declaration}
              subcategory={l10n.categories.theme}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_title_font_declaration"
            />
            <Inputs.Code
              {...inputProps}
              {...l10n.theme.custom_font_definition}
              subcategory={l10n.categories.theme}
              path="/public/asset_metadata/info/styling"
              language="css"
              field="custom_font_definition"
            />
          </>
      }
      <ColorOptions
        {...inputProps}
        {...l10n.theme.button_style}
        info={info?.styling?.button_style || {}}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        field="button_style"
        placeholders={{
          background_color: "#FFFFFF",
          border_color: "#FFFFFF",
          text_color: "#000000",
          border_radius: 5
        }}
      />
      <Inputs.Color
        {...inputProps}
        {...l10n.theme.filter_color}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        defaultValue="#FFFFFF"
        field="filter_color"
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.theme.filter_style}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        defaultValue="rounded"
        field="filter_style"
        options={[
          { label: "Rounded", value: "rounded" },
          { label: "Squared", value: "squared" },
          { label: "Alternating", value: "alternating" }
        ]}
      />
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.countdown_background}
        subcategory={l10n.categories.theme}
        fields={[
          { field: "countdown_background_desktop", aspectRatio: 16/9, baseSize: 135, ...l10n.general.countdown_background_desktop },
          { field: "countdown_background_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.general.countdown_background_mobile }
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.profile_background}
        subcategory={l10n.categories.user_profile}
        path="/public/asset_metadata/info/styling/profile"
        fields={[
          { field: "background_image", aspectRatio: 16/9, baseSize: 135, ...l10n.general.profile_background_desktop },
          { field: "background_image_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.general.profile_background_mobile }
        ]}
      />

      <Inputs.ImageInput
        {...inputProps}
        {...l10n.general.countdown_background}
        subcategory={l10n.categories.media_sidebar}
        fields={[
          { field: "countdown_background_desktop", aspectRatio: 16/9, baseSize: 135, ...l10n.general.countdown_background_desktop },
          { field: "countdown_background_mobile", aspectRatio: 1/2, baseSize: 135, ...l10n.general.countdown_background_mobile }
        ]}
      />
    </PageContent>
  );
});

export default MediaPropertyThemeSettings;
