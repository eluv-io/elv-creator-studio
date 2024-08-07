import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {rootStore, mediaPropertyStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import Inputs from "@/components/inputs/Inputs";
import {Group, Stack, Title} from "@mantine/core";
import {MediaPropertyLoginConsentSpec} from "@/specs/MediaPropertySpecs.js";
import ColorOptions from "@/components/inputs/media_property/Components.jsx";

const LoginStyling = observer(() => {
  const { mediaPropertyId } = useParams();

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.login_settings,
    subcategory: l10n.categories.login_theme,
    path: "/public/asset_metadata/info/login/styling"
  };

  return (
    <>
      <Title order={5} mt={35} mb="md">
        { l10n.categories.login_theme }
      </Title>
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.login.styling.logos}
        fields={[
          { ...l10n.login.styling.logo, field: "logo" },
          { ...l10n.login.styling.powered_by_logo, field: "powered_by_logo" }
        ]}
      />
      <Inputs.ImageInput
        {...inputProps}
        {...l10n.login.styling.background_image}
        fields={[
          { ...l10n.login.styling.background_image_desktop, field: "background_image_desktop", aspectRatio: 16/9, baseSize: 135 },
          { ...l10n.login.styling.background_image_mobile, field: "background_image_mobile", aspectRatio: 1/2, baseSize: 135 }
        ]}
      />
      <Inputs.InputWrapper {...l10n.login.styling.text}>
        <Group noWrap>
          <Inputs.Color
            {...inputProps}
            {...l10n.login.styling.primary_text_color}
            field="primary_text_color"
          />
          <Inputs.Color
            {...inputProps}
            {...l10n.login.styling.secondary_text_color}
            field="secondary_text_color"
          />
          <Inputs.Color
            {...inputProps}
            {...l10n.login.styling.link_color}
            field="link_color"
          />
        </Group>
      </Inputs.InputWrapper>
      <Group maw={800} mb="md">
        <ColorOptions
          {...inputProps}
          {...l10n.login.styling.login_box}
          field="login_box"
          mb={0}
        />
        <ColorOptions
          {...inputProps}
          {...l10n.login.styling.sign_in_button}
          field="sign_in_button"
          mb={0}
        />
        <ColorOptions
          {...inputProps}
          {...l10n.login.styling.sign_up_button}
          field="sign_up_button"
          mb={0}
        />
        <ColorOptions
          {...inputProps}
          {...l10n.login.styling.inputs}
          field="inputs"
          mb={0}
        />
      </Group>
    </>
  );
});

const LoginTerms = observer(() => {
  const { mediaPropertyId } = useParams();

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.login_settings,
    subcategory: l10n.categories.login_terms,
    path: "/public/asset_metadata/info/login/terms"
  };

  return (
    <>
      <Title order={5} mt={35} mb="md">
        { l10n.categories.login_terms }
      </Title>
      <Inputs.RichText
        {...inputProps}
        {...l10n.login.terms.terms_and_conditions}
        field="terms"
      />
      <Inputs.InputWrapper
        {...inputProps}
        {...l10n.login.terms.terms_document}
      >
        <Stack mt="md" spacing={0}>
          <Inputs.Text
            {...inputProps}
            {...l10n.login.terms.terms_document_link_text}
            field="terms_document_link_text"
          />
          <Inputs.File
            {...inputProps}
            {...l10n.login.terms.terms_document_file}
            extensions={["pdf", "html"]}
            field="terms_document"
          />
        </Stack>
      </Inputs.InputWrapper>
    </>
  );
});

const LoginConsentOptions = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.login_settings,
    subcategory: l10n.categories.login_consent_options,
    path: "/public/asset_metadata/info/login/consent"
  };

  return (
    <>
      <Title order={5} mt={35} mb="md">
        { l10n.categories.login_consent_options }
      </Title>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.login.consent.require_consent}
        defaultValue={false}
        field="require_consent"
      />
      {
        !info.login?.consent?.require_consent ? null :
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.login.consent.default_consent}
            defaultValue={true}
            field="default_consent"
          />
      }
      <Inputs.List
        {...inputProps}
        {...l10n.login.consent.custom_consent_options}
        newItemSpec={MediaPropertyLoginConsentSpec}
        field="consent_options"
        fields={[
          { ...l10n.login.consent.key, InputComponent: Inputs.Text, field: "key" },
          { ...l10n.login.consent.initially_checked, InputComponent: Inputs.Checkbox, defaultValue: true, field: "initially_checked" },
          { ...l10n.login.consent.required, InputComponent: Inputs.Checkbox, defaultValue: false, field: "required" },
          { ...l10n.login.consent.message, InputComponent: Inputs.RichText, field: "message" },
        ]}
      />
    </>
  );
});

const FeatureSettings = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.domain_settings,
    subcategory: l10n.categories.feature_settings,
    path: "/public/asset_metadata/info/domain/features"
  };

  return (
    <>
      <Inputs.InputWrapper {...l10n.domain.features.features} maw={400}>
        <Stack mt="md" spacing="xs">
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.domain.features.discover}
            defaultValue={true}
            field="discover"
            componentProps={{mb: 0}}
          />
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.domain.features.secondary_marketplace}
            defaultValue={true}
            field="secondary_marketplace"
            componentProps={{mb: 0}}
          />
          <Inputs.Checkbox
            {...inputProps}
            {...l10n.domain.features.gifting}
            defaultValue={true}
            field="gifting"
            componentProps={{mb: 0}}
          />
        </Stack>
      </Inputs.InputWrapper>
    </>
  );
});

const MediaPropertyDomainSettings = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: mediaPropertyStore,
    objectId: mediaPropertyId,
    category: l10n.categories.domain_settings,
    path: "/public/asset_metadata/info/domain"
  };

  return (
    <PageContent
      title={`${info.name || mediaProperty.name || "Media Property"} - Custom Domain Settings`}
      section="mediaProperty"
      useHistory
    >
      <Inputs.Text
        {...inputProps}
        {...l10n.domain.custom_domain}
        field="custom_domain"
      />
      {
        !info.domain?.custom_domain ? null :
          <>
            <Title order={3} mt={50} mb="md">
              { l10n.categories.login_settings }
            </Title>
            <Inputs.Select
              {...inputProps}
              {...l10n.login.provider}
              category={l10n.categories.login_settings}
              path="/public/asset_metadata/info/login/settings"
              defaultValue="auth0"
              field="provider"
              options={[
                { label: "Auth0 (Deprecated)", value: "auth0" },
                { label: "Ory", value: "ory" }
              ]}
            />
            <Inputs.Checkbox
              {...inputProps}
              {...l10n.login.disable_registration}
              category={l10n.categories.login_settings}
              path="/public/asset_metadata/info/login/settings"
              defaultValue={false}
              field="disable_registration"
            />
            <LoginStyling />
            <LoginTerms />
            <LoginConsentOptions />

            <Title order={3} mt={50} mb="md">
              { l10n.categories.feature_settings }
            </Title>
            <FeatureSettings />
          </>
      }
    </PageContent>
  );
});

export default MediaPropertyDomainSettings;
