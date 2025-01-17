import PageStyles from "Assets/stylesheets/media_properties/property-page.module.scss";
import {observer} from "mobx-react-lite";
import {mediaPropertyStore} from "Stores";
import {
  Modal as MantineModal,
  Center
} from "@mantine/core";

import {
  IconPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import {mediaPropertyStore as CSMediaPropertyStore, rootStore as CSRootStore} from "@/stores";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import UrlJoin from "url-join";
import {
  PageContainer,
} from "Components/properties/Common";
import {
  MediaPropertyHeroSection,
  MediaPropertySection,
  MediaPropertySectionContainer
} from "Components/properties/MediaPropertySection";
import {MediaPropertySectionSelectionModal} from "@/pages/media_properties/MediaPropertySections.jsx";

import {S} from "@/builder/CSSHelper.jsx";

//const S = (...classes) => classes.map(c => PageStyles[c] || "").join(" ");

export const MediaPropertyPageContent = observer(({mediaPropertyId, isMediaPage, page, className=""}) => {
  if(!mediaPropertyId || !page) {
    console.log("mediaPropertyId or page undefined.");
    return null; 
  }

  return (
    <div className={[S("page__sections"), className].join(" ")}>
      {
        page.layout.sections.map((sectionId, index) => {
          const section = mediaPropertyStore.MediaPropertySection({
            mediaPropertySlugOrId: mediaPropertyId,
            sectionSlugOrId: sectionId
          });

          if (!section) {
            console.log("section undefined.");
            return null;
          }

          if(section.type === "container") {
            return (
              <MediaPropertySectionContainer
                key={`section-${sectionId}`}
                section={section}
                sectionClassName={S("page__section")}
                isMediaPage={isMediaPage}
              />
            );
          } else if(section.type === "hero") {
            if(isMediaPage && index === 0) {
              // Exclude hero header on media page
              return null;
            }

            return (
              <MediaPropertyHeroSection
                key={`section-${sectionId}`}
                mediaPropertyId={mediaPropertyId}
                pageId={page.id}
                index={index}
                section={section}
              />
            );
          }

          return (
            <MediaPropertySection
              key={`section-${sectionId}`}
              mediaPropertyId={mediaPropertyId}
              pageId={page.id}
              sectionId={sectionId}
              isMediaPage={isMediaPage}
              index={index}
              className={S("page__section")}
            />
          );
        })
      }
      <AddSection 
          mediaPropertyId={mediaPropertyId}
          pageId={page.id}
          className={S("page__section")}
      />
    </div>
  );
});

const MediaPropertyPage = observer(({mediaPropertyId,page}) => {

  if(!mediaPropertyId || !page) { return null; }

  return (
    <PageContainer className={S("page", "property-page")}>
      <MediaPropertyPageContent mediaPropertyId={mediaPropertyId} page={page} />
    </PageContainer>
  );
});

const AddSection = observer(({mediaPropertyId, pageId, className=""}) => {
  const [openedEdit, editModal] = useDisclosure(false);
  console.log("AddSection ",mediaPropertyId);
  console.log("pageId ",pageId);

  if(!mediaPropertyId || !pageId) { 
    console.log("AddSection - no mediaPropertyId or pageId for params.");
    return null; 
  }

  const mediaProperty = CSMediaPropertyStore.mediaProperties[mediaPropertyId];

  if(!mediaProperty) { 
    console.log("AddSection - could not find mediaProperty");
    return null; 
  }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};
  const page = info.pages?.[pageId];
  console.log("Test ",pageId);

  if(!page) {
    return null;
  }

  const l10n = CSRootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: CSMediaPropertyStore,
    objectId: mediaPropertyId,
    category: CSMediaPropertyStore.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id: pageId, label: page.label}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/pages", pageId)
  };

  const excludedSectionIds = page.layout?.sections || [];

  return (
    <Center mt={40} w={"100%"} h={"100"} className={S("dashed")}>
      <MantineModal size="xl" opened={openedEdit} 
          onClose={()=>{
            editModal.close();
          }} 
          withCloseButton={false} 
          centered >
            
        <MediaPropertySectionSelectionModal
          mediaPropertyId={mediaPropertyId}
          excludedSectionIds={excludedSectionIds}
          Close={() => editModal.close()}
          Submit={sectionIds => {
            sectionIds.forEach(sectionId => {
              CSMediaPropertyStore.InsertListElement({
                ...inputProps,
                path: UrlJoin("/public/asset_metadata/info/pages", pageId, "layout"),
                subcategory: l10n.categories.sections,
                page: location.pathname,
                field: "sections",
                value: sectionId,
                label: info.sections[sectionId]?.label || sectionId
              });
            });

            editModal.close();
          }}
        />
      </MantineModal>
      
      <IconButton
        label={LocalizeString(CSRootStore.l10n.components.inputs.add, {item: "Section"})}
        size={60}
        w={"100%"}
        h={"100"}
        Icon={IconPlus}
        color="purple.7"
        onClick={() => {
          editModal.open();
        }}
      />
    </Center>
  );
});

export default MediaPropertyPage;
