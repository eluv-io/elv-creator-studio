import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore} from "Stores";
import PageContent from "Components/common/PageContent.jsx";
import Inputs from "Components/inputs/Inputs";
import {Group, Title} from "@mantine/core";
import UrlJoin from "url-join";

const MarketplaceLoginCustomization = observer(() => {
  const { marketplaceId } = useParams();

  const marketplace = marketplaceStore.marketplaces[marketplaceId];

  const info = marketplace?.metadata?.public?.asset_metadata?.info || {};

  const inputProps = {
    store: marketplaceStore,
    objectId: marketplaceId,
    path: "/public/asset_metadata/info/login_customization"
  };

  return (
    <PageContent
      title={`${info.branding?.name || "Marketplace"} - Login Customization`}
      section="marketplace"
      useHistory
    >
      <Title order={6} mb="xl" color="dimmed">Note: Login customization does not apply when your marketplace is accessed via the global marketplace</Title>

      <Title order={3} mt="xl" mb="xl">Login Theme</Title>

      <Group align="top">
        <Inputs.ImageInput
          {...inputProps}
          label="Logo"
          altTextField="logo_alt"
          fields={[
            { field: "logo", label: "Logo" },
          ]}
        />

        <Inputs.ImageInput
          {...inputProps}
          label="Login Background"
          fields={[
            { field: "background", label: "Background (Desktop)" },
            { field: "background_mobile", label: "Background (Mobile)" },
          ]}
        />
      </Group>

      <Inputs.Checkbox
        {...inputProps}
        field="large_logo_mode"
        label="Increase Logo Size"
        description="Make your logo image larger in proportion to the login box"
      />

      <Inputs.InputWrapper label="Log In Button">
        <Inputs.Color
          {...inputProps}
          path="/public/asset_metadata/info/login_customization/log_in_button/text_color"
          field="color"
          label="Text Color"
        />
        <Inputs.Color
          {...inputProps}
          path="/public/asset_metadata/info/login_customization/log_in_button/background_color"
          field="color"
          label="Background Color"
        />
        <Inputs.Color
          {...inputProps}
          path="/public/asset_metadata/info/login_customization/log_in_button/border_color"
          field="color"
          label="Border Color"
        />
      </Inputs.InputWrapper>

      <Inputs.InputWrapper label="Sign Up Button">
        <Inputs.Color
          {...inputProps}
          path="/public/asset_metadata/info/login_customization/sign_up_button/text_color"
          field="color"
          label="Text Color"
        />
        <Inputs.Color
          {...inputProps}
          path="/public/asset_metadata/info/login_customization/sign_up_button/background_color"
          field="color"
          label="Background Color"
        />
        <Inputs.Color
          {...inputProps}
          path="/public/asset_metadata/info/login_customization/sign_up_button/border_color"
          field="color"
          label="Border Color"
        />
      </Inputs.InputWrapper>

      <Inputs.Checkbox
        {...inputProps}
        INVERTED
        field="disable_third_party"
        label="Allow Third Party Login"
        description="Allow users to log in with Google or Apple accounts"
      />

      <Inputs.Checkbox
        {...inputProps}
        field="require_email_verification"
        defaultValue={true}
        label="Require Email Verification"
      />



      <Title order={3} mt="xl" mb="md">Terms and User Consent</Title>
      <Title order={5} mb="xl">User Data Sharing</Title>

      <Inputs.Checkbox
        {...inputProps}
        field="require_consent"
        label="Require User Consent to Collect Information"
        description="By default, logging in to your marketplace will result in the user's information being shared with you. By checking this box, the user will be able to opt out of sharing their data via a checkbox on the login screen."
      />

      {
        !info?.login_customization?.require_consent ? null :
          <Inputs.Checkbox
            {...inputProps}
            field="default_consent"
            label="Consent by Default"
            defaultValue={true}
          />
      }


      <Title order={5} mt="xl" mb="xl">Custom Consent Options</Title>

      <Inputs.Checkbox
        {...inputProps}
        path={UrlJoin(inputProps.path, "custom_consent")}
        field="enabled"
        label="Customize User Consent"
        description="Define additional conditions for the user to consent to prior to logging in"
      />

      {
        !info?.login_customization?.custom_consent?.enabled ? null :
          <>
            <Inputs.Select
              {...inputProps}
              path={UrlJoin(inputProps.path, "custom_consent")}
              field="type"
              label="Consent Presentation"
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
                    path={UrlJoin(inputProps.path, "custom_consent")}
                    field="consent_modal_header"
                    label="Consent Form Header"
                  />
                  <Inputs.Text
                    {...inputProps}
                    path={UrlJoin(inputProps.path, "custom_consent")}
                    field="button_text"
                    label="Consent Form Accept Button Text"
                    description="Default: 'I Accept'"
                  />
                </>
            }

            <Inputs.List
              {...inputProps}
              path={UrlJoin(inputProps.path, "custom_consent")}
              field="options"
              label="Consent Options"
              fieldLabel="Consent Option"
              fields={[
                { InputComponent: Inputs.Text, field: "key", label: "Profile Metadata Key", description: "Define the key to which the user's consent choice will be saved" },
                { InputComponent: Inputs.Checkbox, field: "required", label: "Required", description: "If specified, the user will not be allowed to proceed unless they consent to these conditions" },
                { InputComponent: Inputs.Checkbox, field: "initially_checked", label: "Consent Initially Checked" },
                { InputComponent: Inputs.RichText, field: "message", label: "Description", description: "Describe the conditions to which the user is consenting" }
              ]}
            />
          </>
      }

    </PageContent>
  );
});

export default MarketplaceLoginCustomization;
