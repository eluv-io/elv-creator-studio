import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, pocketStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import ColorOptions from "@/components/inputs/media_property/Components.jsx";
import {Group, Title} from "@mantine/core";

const PocketThemeSettings = observer(() => {
  const { pocketId } = useParams();

  const pocket = pocketStore.pockets[pocketId];

  if(!pocket) { return null; }

  const info = pocket?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.pocket.form;
  const inputProps = {
    store: pocketStore,
    objectId: pocketId,
    category: l10n.categories.theme,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || pocket.name || "Pocket TV Property"} - Theme Settings`}
      section="pocket"
      useHistory
    >
      <ColorOptions
        {...inputProps}
        {...l10n.theme.button_style}
        allowGradient
        allowBorderWidth
        info={info?.styling?.button_style || {}}
        path="/public/asset_metadata/info/styling"
        field="button_style"
        placeholders={{
          background_color: "#FFFFFF",
          background_color_2: "#FFFFFF",
          background_type: "solid",
          background_gradient_angle: 0,
          border_color: "#FFFFFF",
          text_color: "#000000",
          border_radius: 5
        }}
      />
      <Inputs.Select
        {...inputProps}
        {...l10n.theme.font}
        subcategory={l10n.categories.theme}
        path="/public/asset_metadata/info/styling"
        defaultValue=""
        field="font"
        options={[
          { label: "Montserrat (Default)", value: "" },
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
      <Title order={3} mt={50} mb="md">
        { l10n.categories.login_settings }
      </Title>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.login.use_oauth_login}
        category={l10n.categories.login_settings}
        path="/public/asset_metadata/info/login/settings"
        defaultValue={false}
        field="use_oauth_login"
      />
      {
        !info?.login?.settings?.use_oauth_login ? null :
          <>
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.login.disable_registration}
              category={l10n.categories.login_settings}
              path="/public/asset_metadata/info/login/settings"
              defaultValue={false}
              field="disable_registration"
            />
            {
              info.login?.settings?.disable_registration ? null :
                <Inputs.Checkbox
                  {...inputProps}
                  {...l10n.login.disable_third_party_login}
                  category={l10n.categories.login_settings}
                  path="/public/asset_metadata/info/login/settings"
                  defaultValue={false}
                  field="disable_third_party_login"
                />
            }
            <Inputs.ImageInput
              {...inputProps}
              {...l10n.login.styling.images}
              path="/public/asset_metadata/info/login/styling"
              componentProps={{maw: uiStore.inputWidthWide}}
              fields={[
                { ...l10n.login.styling.logo, field: "logo" },
                { ...l10n.login.styling.background_image_desktop, field: "background_image_desktop", aspectRatio: 16/9, baseSize: 115 },
                { ...l10n.login.styling.background_image_mobile, field: "background_image_mobile", aspectRatio: 1/2, baseSize: 115 },
              ]}
            />
            <Inputs.Color
              {...inputProps}
              {...l10n.login.styling.link_color}
              placeholder="#a2bfef"
              category={l10n.categories.login_settings}
              path="/public/asset_metadata/info/login/styling"
              field="link_color"
            />
            <Group align="top">
              <ColorOptions
                {...inputProps}
                {...l10n.login.styling.sign_in_button}
                allowGradient
                allowBorderWidth
                info={info?.login?.styling?.sign_in_button || {}}
                path="/public/asset_metadata/info/login/styling"
                field="sign_in_button"
                placeholders={{
                  background_color: "#FFFFFF",
                  background_color_2: "#FFFFFF",
                  background_type: "solid",
                  background_gradient_angle: 0,
                  border_color: "#FFFFFF",
                  text_color: "#000000",
                  border_radius: 5,
                  border_width: 0
                }}
              />
              <ColorOptions
                {...inputProps}
                {...l10n.login.styling.sign_up_button}
                allowGradient
                allowBorderWidth
                info={info?.login?.styling?.sign_up_button || {}}
                path="/public/asset_metadata/info/login/styling"
                field="sign_up_button"
                placeholders={{
                  background_color: "#FFFFFF",
                  background_color_2: "#FFFFFF",
                  background_type: "solid",
                  background_gradient_angle: 0,
                  border_color: "#FFFFFF",
                  text_color: "#000000",
                  border_radius: 5,
                  border_width: 0
                }}
              />
            </Group>

          </>
      }
    </PageContent>
  );
});

export default PocketThemeSettings;
