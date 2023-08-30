import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, marketplaceStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Group, Title} from "@mantine/core";
import UrlJoin from "url-join";
import {MarketplaceLoginConsentOption} from "@/specs/MarketplaceSpecs.js";

const MarketplaceLoginCustomization = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.marketplace.form;
  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: "/public/asset_metadata/info/login_customization",
    category: l10n.categories.login_customization
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Login Customization`}
      section="marketplace"
      useHistory
    >
      <Title order={6} color="dimmed">{ l10n.login.note }</Title>

      <Title order={3} mt="xl" mb="xl">{ l10n.categories.login_theme }</Title>

      <Group align="top">
        <Inputs.ImageInput
          {...inputProps}
          {...l10n.login.logo}
          subcategory={l10n.categories.login_theme}
          altTextField="logo_alt"
          fields={[
            { field: "logo", label: "Logo" },
          ]}
        />

        <Inputs.ImageInput
          {...inputProps}
          {...l10n.login.background}
          subcategory={l10n.categories.login_theme}
          fields={[
            { field: "background", ...l10n.login.background_desktop },
            { field: "background_mobile", ...l10n.login.background_mobile },
          ]}
        />
      </Group>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.login.increase_logo_size}
        subcategory={l10n.categories.login_theme}
        field="large_logo_mode"
      />

      <Inputs.InputWrapper {...l10n.login.log_in_button}>
        <Inputs.Color
          {...inputProps}
          {...l10n.login.text_color}
          subcategory={l10n.categories.login_theme}
          path="/public/asset_metadata/info/login_customization/log_in_button/text_color"
          field="color"
        />
        <Inputs.Color
          {...inputProps}
          {...l10n.login.background_color}
          subcategory={l10n.categories.login_theme}
          path="/public/asset_metadata/info/login_customization/log_in_button/background_color"
          field="color"
        />
        <Inputs.Color
          {...inputProps}
          {...l10n.login.border_color}
          subcategory={l10n.categories.login_theme}
          path="/public/asset_metadata/info/login_customization/log_in_button/border_color"
          field="color"
        />
      </Inputs.InputWrapper>

      <Inputs.InputWrapper {...l10n.login.sign_up_button}>
        <Inputs.Color
          {...inputProps}
          {...l10n.login.text_color}
          subcategory={l10n.categories.login_theme}
          path="/public/asset_metadata/info/login_customization/sign_up_button/text_color"
          field="color"
        />
        <Inputs.Color
          {...inputProps}
          {...l10n.login.background_color}
          subcategory={l10n.categories.login_theme}
          path="/public/asset_metadata/info/login_customization/sign_up_button/background_color"
          field="color"
        />
        <Inputs.Color
          {...inputProps}
          {...l10n.login.border_color}
          subcategory={l10n.categories.login_theme}
          path="/public/asset_metadata/info/login_customization/sign_up_button/border_color"
          field="color"
        />
      </Inputs.InputWrapper>

      <Inputs.Checkbox
        INVERTED
        {...inputProps}
        {...l10n.login.allow_third_party}
        subcategory={l10n.categories.login_theme}
        field="disable_third_party"
      />

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.login.require_email_verification}
        subcategory={l10n.categories.login_theme}
        field="require_email_verification"
        defaultValue={true}
      />



      <Title order={3} mt="xl" mb="md">{l10n.categories.terms_and_consent}</Title>
      <Title order={5} mb="xl">{l10n.login.subheaders.user_data_sharing}</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.login.require_user_consent}
        subcategory={l10n.categories.terms_and_consent}
        field="require_consent"
      />

      {
        !info?.login_customization?.require_consent ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.login.consent_by_default}
            subcategory={l10n.categories.terms_and_consent}
            field="default_consent"
            defaultValue={true}
          />
      }


      <Title order={5} mt="xl" mb="xl">{l10n.login.subheaders.custom_consent_options}</Title>

      <Inputs.Checkbox
        {...inputProps}
        {...l10n.login.customize_user_consent}
        subcategory={l10n.categories.terms_and_consent}
        path={UrlJoin(inputProps.path, "custom_consent")}
        field="enabled"
      />

      {
        !info?.login_customization?.custom_consent?.enabled ? null :
          <>
            <Inputs.Select
              {...inputProps}
              {...l10n.login.consent_presentation}
              subcategory={l10n.categories.terms_and_consent}
              path={UrlJoin(inputProps.path, "custom_consent")}
              field="type"
              options={[
                { label: "Checkboxes on Login Page", value: "Checkboxes" },
                { label: "Post-login Form", value: "Modal" }
              ]}
            />

            {
              info.login_customization.custom_consent.type !== "Modal" ? null :
                <>
                  <Inputs.Text
                    {...inputProps}
                    {...l10n.login.consent_modal_header}
                    subcategory={l10n.categories.terms_and_consent}
                    path={UrlJoin(inputProps.path, "custom_consent")}
                    field="consent_modal_header"
                  />
                  <Inputs.Text
                    {...inputProps}
                    {...l10n.login.consent_form_button_text}
                    subcategory={l10n.categories.terms_and_consent}
                    path={UrlJoin(inputProps.path, "custom_consent")}
                    field="button_text"
                    description="Default: 'I Accept'"
                  />
                </>
            }

            <Inputs.List
              {...inputProps}
              {...l10n.login.consent_options}
              subcategory={l10n.categories.terms_and_consent}
              path={UrlJoin(inputProps.path, "custom_consent")}
              field="options"
              newItemSpec={MarketplaceLoginConsentOption}
              fields={[
                { InputComponent: Inputs.Text, field: "key", ...l10n.login.profile_metadata_key },
                { InputComponent: Inputs.Checkbox, field: "required", ...l10n.login.required },
                { InputComponent: Inputs.Checkbox, field: "initially_checked", ...l10n.login.initially_checked },
                { InputComponent: Inputs.RichText, field: "message", ...l10n.login.description }
              ]}
            />
          </>
      }

    </PageContent>
  );
});

export default MarketplaceLoginCustomization;
