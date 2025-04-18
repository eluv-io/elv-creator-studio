import {observer} from "mobx-react-lite";
import {useState} from "react";
import {rootStore, tenantStore, uiStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Accordion, Select, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";
import UrlJoin from "url-join";

import CodeTemplate from "@/assets/email_templates/CodeTemplate.html?raw";
import LinkTemplate from "@/assets/email_templates/LinkTemplate.html?raw";
import ShareTemplate from "@/assets/email_templates/ShareTemplate.html?raw";
import PurchaseReceiptTemplate from "@/assets/email_templates/PurchaseReceiptTemplate.html?raw";

const defaultButtonColor = "#393939";

const EmailPreview = observer(() => {
  const [preview, setPreview] = useState("");
  const tenant = tenantStore.latestTenant;

  const l10n = rootStore.l10n.pages.tenant.form;
  const info = tenant?.metadata?.public?.asset_metadata?.info || {};
  const commonSettings = info?.email_template_settings?.common || {};

  let html, defaults, settings;
  switch(preview) {
    case "welcome_email":
      settings = info.email_template_settings?.welcome_email || {};
      defaults = l10n.email_templates.defaults.welcome_email;
      html = LinkTemplate;
      break;
    case "email_verification":
      settings = info.email_template_settings?.email_verification || {};
      defaults = l10n.email_templates.defaults.email_verification;
      html = LinkTemplate;
      break;
    case "password_reset":
      settings = info.email_template_settings?.password_reset || {};
      defaults = l10n.email_templates.defaults.password_reset;
      html = CodeTemplate;
      break;
    case "invite":
      settings = info.email_template_settings?.invite || {};
      defaults = l10n.email_templates.defaults.invite;
      html = LinkTemplate;
      break;
    case "purchase_receipt":
      settings = info.email_template_settings?.purchase_receipt || {};
      defaults = l10n.email_templates.defaults.purchase_receipt;
      html = PurchaseReceiptTemplate;
      break;
    case "share":
      settings = info.email_template_settings?.share || {};
      defaults = l10n.email_templates.defaults.share;
      html = ShareTemplate;

      defaults.stream_button_color = commonSettings.button_color || defaultButtonColor;
      defaults.download_button_color = commonSettings.button_color || defaultButtonColor;

      break;
  }

  if(html) {
    html = html.replaceAll("{{banner_image_url}}", settings.share_banner_image || commonSettings.banner_image || defaults.banner_image);
    html = html.replaceAll("{{title_color}}", commonSettings.title_color || "#000000");
    html = html.replaceAll("{{button_color}}", commonSettings.button_color || defaultButtonColor);
    html = html.replaceAll("{{copyright}}", commonSettings.copyright || l10n.email_templates.defaults.common.copyright);
    html = html.replaceAll("{{year}}", new Date().getFullYear());

    Object.keys(defaults).forEach(key =>
      html = html.replaceAll(`{{${key}}}`, settings[key] || defaults[key])
    );
  }

  return (
    <>
      <Select
        maw={uiStore.inputWidthNarrow}
        mb="md"
        value={preview}
        onChange={value => setPreview(value)}
        data={[
          { label: "<Select Email Template>", value: ""},
          { label: "Welcome Email", value: "welcome_email"},
          { label: "Email Verification", value: "email_verification"},
          { label: "Password Reset", value: "password_reset"},
          { label: "Invite", value: "invite"},
          { label: "Share", value: "share"},
          { label: "Purchase Receipt", value: "purchase_receipt"}
        ]}
      />
      {
        !preview ? null :
          <div
            style={{
              display: "flex",
              overflow: "hidden",
              margin: 0,
              padding: 0,
              resize: "both",
              height: 800,
              width: 800
            }}
          >
            <iframe
              srcDoc={html}
              style={{
                flexGrow: 1,
                margin: 0,
                padding: 0,
                border: 0
              }}
            />
          </div>
      }
    </>
  );
});

const TenantGeneralSettings = observer(() => {
  const tenant = tenantStore.latestTenant;

  const info = tenant?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.tenant.form;
  const inputProps = {
    store: tenantStore,
    objectId: tenantStore.tenantObjectId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/info/email_template_settings"
  };

  return (
    <PageContent
      title={`${info?.name || "Tenant"} - ${l10n.categories.email_templates}`}
      section="tenant"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.email_templates_common }</Title>

      <Inputs.Text
        {...inputProps}
        {...l10n.email_templates.from}
        componentProps={{maw: uiStore.inputWidthNarrow}}
        path={UrlJoin(inputProps.path, "common")}
        subcategory={l10n.categories.email_templates_common}
        placeholder={l10n.email_templates.defaults.common.from}
        field="from"
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.email_templates.copyright}
        componentProps={{maw: uiStore.inputWidthNarrow}}
        path={UrlJoin(inputProps.path, "common")}
        subcategory={l10n.categories.email_templates_common}
        placeholder={l10n.email_templates.defaults.common.copyright}
        field="copyright"
      />

      <Inputs.InputWrapper {...l10n.email_templates.colors} maw={uiStore.inputWidthNarrow}>
        <Inputs.Color
          {...inputProps}
          {...l10n.email_templates.title_color}
          path={UrlJoin(inputProps.path, "common")}
          subcategory={l10n.categories.email_templates_common}
          defaultValue="#000000"
          defaultOnBlankString
          field="title_color"
        />
        <Inputs.Color
          {...inputProps}
          {...l10n.email_templates.button_color}
          path={UrlJoin(inputProps.path, "common")}
          subcategory={l10n.categories.email_templates_common}
          defaultValue={defaultButtonColor}
          defaultOnBlankString
          field="button_color"
        />
      </Inputs.InputWrapper>

      <Inputs.SingleImageInput
        {...inputProps}
        {...l10n.email_templates.banner_image}
        url
        aspectRatio={3}
        maw={400}
        baseSize={115}
        path={UrlJoin(inputProps.path, "common")}
        subcategory={l10n.categories.email_templates_common}
        field="banner_image"
      />


      <Title order={3} mt={50} mb="md">{ l10n.categories.email_template_settings }</Title>

      <Accordion maw={uiStore.inputWidth} variant="contained">
        <Accordion.Item value="welcome_email_template">
          <Accordion.Control>
            { l10n.categories.welcome_email_template }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subject}
              path={UrlJoin(inputProps.path, "welcome_email")}
              subcategory={l10n.categories.welcome_email_template}
              placeholder={l10n.email_templates.defaults.welcome_email.subject || ""}
              field="subject"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.title}
              path={UrlJoin(inputProps.path, "welcome_email")}
              subcategory={l10n.categories.welcome_email_template}
              placeholder={l10n.email_templates.defaults.welcome_email.title || ""}
              field="title"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subtitle}
              path={UrlJoin(inputProps.path, "welcome_email")}
              subcategory={l10n.categories.welcome_email_template}
              placeholder={l10n.email_templates.defaults.welcome_email.subtitle || ""}
              field="subtitle"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.text}
              path={UrlJoin(inputProps.path, "welcome_email")}
              subcategory={l10n.categories.welcome_email_template}
              placeholder={l10n.email_templates.defaults.welcome_email.text || ""}
              field="text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.button_text}
              path={UrlJoin(inputProps.path, "welcome_email")}
              subcategory={l10n.categories.welcome_email_template}
              placeholder={l10n.email_templates.defaults.welcome_email.button_text || ""}
              field="button_text"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.secondary_text}
              path={UrlJoin(inputProps.path, "welcome_email")}
              subcategory={l10n.categories.welcome_email_template}
              placeholder={l10n.email_templates.defaults.welcome_email.secondary_text || ""}
              field="secondary_text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.preheader}
              path={UrlJoin(inputProps.path, "welcome_email")}
              subcategory={l10n.categories.welcome_email_template}
              placeholder={l10n.email_templates.defaults.welcome_email.preheader || ""}
              field="preheader"
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="email_verification_template">
          <Accordion.Control>
            { l10n.categories.email_verification_template }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subject}
              path={UrlJoin(inputProps.path, "email_verification")}
              subcategory={l10n.categories.email_verification_template}
              placeholder={l10n.email_templates.defaults.email_verification.subject || ""}
              field="subject"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.title}
              path={UrlJoin(inputProps.path, "email_verification")}
              subcategory={l10n.categories.email_verification_template}
              placeholder={l10n.email_templates.defaults.email_verification.title || ""}
              field="title"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subtitle}
              path={UrlJoin(inputProps.path, "email_verification")}
              subcategory={l10n.categories.email_verification_template}
              placeholder={l10n.email_templates.defaults.email_verification.subtitle || ""}
              field="subtitle"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.text}
              path={UrlJoin(inputProps.path, "email_verification")}
              subcategory={l10n.categories.email_verification_template}
              placeholder={l10n.email_templates.defaults.email_verification.text || ""}
              field="text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.button_text}
              path={UrlJoin(inputProps.path, "email_verification")}
              subcategory={l10n.categories.email_verification_template}
              placeholder={l10n.email_templates.defaults.email_verification.button_text || ""}
              field="button_text"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.secondary_text}
              path={UrlJoin(inputProps.path, "email_verification")}
              subcategory={l10n.categories.email_verification_template}
              placeholder={l10n.email_templates.defaults.email_verification.secondary_text || ""}
              field="secondary_text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.preheader}
              path={UrlJoin(inputProps.path, "email_verification")}
              subcategory={l10n.categories.email_verification_template}
              placeholder={l10n.email_templates.defaults.email_verification.preheader || ""}
              field="preheader"
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="password_reset_template">
          <Accordion.Control>
            { l10n.categories.password_reset_template }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subject}
              path={UrlJoin(inputProps.path, "password_reset")}
              subcategory={l10n.categories.password_reset_template}
              placeholder={l10n.email_templates.defaults.password_reset.subject || ""}
              field="subject"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.title}
              path={UrlJoin(inputProps.path, "password_reset")}
              subcategory={l10n.categories.password_reset_template}
              placeholder={l10n.email_templates.defaults.password_reset.title || ""}
              field="title"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subtitle}
              path={UrlJoin(inputProps.path, "password_reset")}
              subcategory={l10n.categories.password_reset_template}
              placeholder={l10n.email_templates.defaults.password_reset.subtitle || ""}
              field="subtitle"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.text}
              path={UrlJoin(inputProps.path, "password_reset")}
              subcategory={l10n.categories.password_reset_template}
              placeholder={l10n.email_templates.defaults.password_reset.text || ""}
              field="text"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.secondary_text}
              path={UrlJoin(inputProps.path, "password_reset")}
              subcategory={l10n.categories.password_reset_template}
              placeholder={l10n.email_templates.defaults.password_reset.secondary_text || ""}
              field="secondary_text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.preheader}
              path={UrlJoin(inputProps.path, "password_reset")}
              subcategory={l10n.categories.password_reset_template}
              placeholder={l10n.email_templates.defaults.password_reset.preheader || ""}
              field="preheader"
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="invite_template">
          <Accordion.Control>
            { l10n.categories.invite_template }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subject}
              path={UrlJoin(inputProps.path, "invite")}
              subcategory={l10n.categories.invite_template}
              placeholder={l10n.email_templates.defaults.invite.subject || ""}
              field="subject"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.title}
              path={UrlJoin(inputProps.path, "invite")}
              subcategory={l10n.categories.invite_template}
              placeholder={l10n.email_templates.defaults.invite.title || ""}
              field="title"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subtitle}
              path={UrlJoin(inputProps.path, "invite")}
              subcategory={l10n.categories.invite_template}
              placeholder={l10n.email_templates.defaults.invite.subtitle || ""}
              field="subtitle"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.text}
              path={UrlJoin(inputProps.path, "invite")}
              subcategory={l10n.categories.invite_template}
              placeholder={l10n.email_templates.defaults.invite.text || ""}
              field="text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.button_text}
              path={UrlJoin(inputProps.path, "invite")}
              subcategory={l10n.categories.invite_template}
              placeholder={l10n.email_templates.defaults.invite.button_text || ""}
              field="button_text"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.secondary_text}
              path={UrlJoin(inputProps.path, "invite")}
              subcategory={l10n.categories.invite_template}
              placeholder={l10n.email_templates.defaults.invite.secondary_text || ""}
              field="secondary_text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.preheader}
              path={UrlJoin(inputProps.path, "invite")}
              subcategory={l10n.categories.invite_template}
              placeholder={l10n.email_templates.defaults.invite.preheader || ""}
              field="preheader"
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="share_template">
          <Accordion.Control>
            { l10n.categories.share_template }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subject}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={l10n.email_templates.defaults.share.subject || ""}
              field="subject"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.title}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={l10n.email_templates.defaults.share.title || ""}
              field="title"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subtitle}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={l10n.email_templates.defaults.share.subtitle || ""}
              field="subtitle"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.text}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={l10n.email_templates.defaults.share.text || ""}
              field="text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.stream_button_text}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={l10n.email_templates.defaults.share.stream_button_text || ""}
              field="stream_button_text"
            />
            <Inputs.Color
              {...inputProps}
              {...l10n.email_templates.stream_button_color}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={info?.email_template_settings?.common?.button_color || defaultButtonColor}
              field="stream_button_color"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.download_button_text}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={l10n.email_templates.defaults.share.download_button_text || ""}
              field="download_button_text"
            />
            <Inputs.Color
              {...inputProps}
              {...l10n.email_templates.download_button_color}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={info?.email_template_settings?.common?.button_color || defaultButtonColor}
              field="download_button_color"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.secondary_text}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={l10n.email_templates.defaults.share.secondary_text || ""}
              field="secondary_text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.preheader}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              placeholder={l10n.email_templates.defaults.share.preheader || ""}
              field="preheader"
            />

            <Inputs.SingleImageInput
              {...inputProps}
              {...l10n.email_templates.share_banner_image}
              path={UrlJoin(inputProps.path, "share")}
              subcategory={l10n.categories.share_template}
              url
              aspectRatio={3}
              maw={400}
              baseSize={115}
              field="share_banner_image"
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="purchase_receipt">
          <Accordion.Control>
            { l10n.categories.purchase_receipt_template }
          </Accordion.Control>
          <Accordion.Panel>
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subject}
              path={UrlJoin(inputProps.path, "purchase_receipt")}
              subcategory={l10n.categories.purchase_receipt_template}
              placeholder={l10n.email_templates.defaults.purchase_receipt.subject || ""}
              field="subject"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.title}
              path={UrlJoin(inputProps.path, "purchase_receipt")}
              subcategory={l10n.categories.purchase_receipt_template}
              placeholder={l10n.email_templates.defaults.purchase_receipt.title || ""}
              field="title"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.subtitle}
              path={UrlJoin(inputProps.path, "purchase_receipt")}
              subcategory={l10n.categories.purchase_receipt_template}
              placeholder={l10n.email_templates.defaults.purchase_receipt.subtitle || ""}
              field="subtitle"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.text}
              path={UrlJoin(inputProps.path, "purchase_receipt")}
              subcategory={l10n.categories.purchase_receipt_template}
              placeholder={l10n.email_templates.defaults.purchase_receipt.text || ""}
              field="text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.button_text}
              path={UrlJoin(inputProps.path, "purchase_receipt")}
              subcategory={l10n.categories.purchase_receipt_template}
              placeholder={l10n.email_templates.defaults.purchase_receipt.button_text || ""}
              field="button_text"
            />
            <Inputs.TextArea
              {...inputProps}
              {...l10n.email_templates.secondary_text}
              path={UrlJoin(inputProps.path, "purchase_receipt")}
              subcategory={l10n.categories.purchase_receipt_template}
              placeholder={l10n.email_templates.defaults.purchase_receipt.secondary_text || ""}
              field="secondary_text"
            />
            <Inputs.Text
              {...inputProps}
              {...l10n.email_templates.preheader}
              path={UrlJoin(inputProps.path, "purchase_receipt")}
              subcategory={l10n.categories.purchase_receipt_template}
              placeholder={l10n.email_templates.defaults.purchase_receipt.preheader || ""}
              field="preheader"
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Title order={3} mt={50} mb="md">{ l10n.categories.preview_email_template }</Title>
      <EmailPreview />
    </PageContent>
  );
});

export default TenantGeneralSettings;
