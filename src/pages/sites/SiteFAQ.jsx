import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import {marketplaceStore, rootStore, siteStore, tenantStore} from "@/stores";
import PageContent from "@/components/common/PageContent.jsx";
import {Accordion, Title} from "@mantine/core";
import Inputs from "@/components/inputs/Inputs";

import {IconSettings} from "@tabler/icons-react";
import {ListItemCategory} from "@/components/common/Misc.jsx";

const SiteFAQ = observer(() => {
  const { siteId } = useParams();

  const site = siteStore.sites[siteId];

  const info = site?.metadata?.public?.asset_metadata?.info || {};

  const l10n = rootStore.l10n.pages.site.form;
  const inputProps = {
    store: siteStore,
    objectId: siteId,
    category: l10n.categories.general,
    path: "/public/asset_metadata/info"
  };

  return (
    <PageContent
      title={`${info.name || site.name || "Site"} - ${l10n.categories.faq}`}
      section="site"
      useHistory
    >
      <Title order={3} my="md">{ l10n.categories.faq }</Title>
      <Inputs.Checkbox
        {...inputProps}
        {...l10n.faq.show_faq}
        field="show_faq"
        defaultValue={false}
      />
      <Inputs.Text
        {...inputProps}
        {...l10n.faq.faq_title}
        field="faq_title"
      />
      <Inputs.List
        {...inputProps}
        {...l10n.faq.faq_title}
        fieldLabel={l10n.faq.question.label}
        field="faq"
        renderItem={({item, ...props}) => {
          props.category = ListItemCategory({
            store: siteStore,
            objectId: siteId,
            listPath: "/public/asset_metadata/info/faq",
            idField: "id",
            id: item.id,
            labelField: "index",
            l10n: l10n.categories.faq_label
          });

          return (
            <>
              <Inputs.UUID
                {...props}
                {...l10n.faq.key}
                hidden
                field="id"
              />
              <Inputs.Text
                {...props}
                {...l10n.faq.key}
                field="key"
              />
              <Inputs.Select
                {...props}
                {...l10n.faq.type}
                field="type"
                options={[
                  { label: l10n.faq.question.label, value: "" },
                  { label: l10n.faq.header.label, value: "header" }
                ]}
              />
              {
                item.type === "header" ?
                  <Inputs.Text
                    {...props}
                    {...l10n.faq.header}
                    field="header"
                  /> :
                  <>
                    <Inputs.Text
                      {...props}
                      {...l10n.faq.question}
                      field="question"
                    />
                    <Inputs.RichText
                      {...props}
                      {...l10n.faq.answer}
                      field="answer"
                    />
                  </>
              }
            </>
          );
        }}
      />
    </PageContent>
  );
});

export default SiteFAQ;
