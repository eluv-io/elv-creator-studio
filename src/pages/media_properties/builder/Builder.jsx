import { useState } from "react";
import {observer} from "mobx-react-lite";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import MediaPropertyPage from "@/wallet/components/properties/MediaPropertyPage";
import UrlJoin from "url-join";
import {S} from "./CssHelper.jsx";

import {mediaPropertyStore as CSMediaPropertyStore, rootStore as CSRootStore} from "@/stores";

import {default as CSMediaPropertyPage} from "@/pages/media_properties/MediaPropertyPage.jsx" ;
import {default as CSMediaPropertySection} from "@/pages/media_properties/MediaPropertySection.jsx" ;

import {CreateSectionForm} from "@/pages/media_properties/MediaPropertySections.jsx";

import {
  Select, 
  Container, 
  Flex, 
  Button, 
  Modal as MantineModal
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const Builder = observer(({basePath}) => {

  const { mediaPropertyId } = useParams();

  const [openedEdit, editModal] = useDisclosure(false);
  const [openedNewSection, newSectionModal] = useDisclosure(false);
  const [openedEditSection, editSectionModal] = useDisclosure(false);

  const [sectionId, setSectionId] = useState("");



  if(!basePath){
    return null;
  }

  //Getting pages to display in pull down switcher
  const field = "pages";
  const path = "/public/asset_metadata/info";
  const excludedKeys = ["main"];
  const pagesMap = CSMediaPropertyStore.GetMetadata({objectId:mediaPropertyId, path, field}) || {};
  const pagesValues = Object.keys(pagesMap)
    .filter(key => !excludedKeys.includes(key))
    .map(key => {
      var page = pagesMap[key];
      page.value = page.id;
      return page;
    });

  const defaultPageId = pagesValues[0]?.id || "";

  const [value, setValue] = useState(defaultPageId);
  const pageId = value;

  const propertyPath = UrlJoin(basePath, "mediaPropertyId");

  const mediaProperty = CSMediaPropertyStore.mediaProperties[mediaPropertyId];
  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  var page = info.pages?.[pageId];

  if(!page) {
    page = info.pages.main;
  }

  if(!page || !page.layout.sections){
    return;
  }

  let sections = [];

  for(const sectionId of page.layout.sections) {
    const section = info.sections?.[sectionId];

    if(!section) {continue;}
    sections.push(section);
  }

  const pageSectionPath = UrlJoin("/media-properties", pageId, "section");
  const l10n = CSRootStore.l10n.pages.media_property.form;
  const inputProps = {
    store: CSMediaPropertyStore,
    objectId: mediaPropertyId,
    category: CSMediaPropertyStore.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id: pageId, label: page.label}),
    subcategory: l10n.categories.general,
    path: UrlJoin("/public/asset_metadata/info/pages", pageId)
  };

  return (
    <PageContent >
      <MantineModal size="xl" opened={openedEdit} 
          onClose={()=>{
            editModal.close();
          }} 
          withCloseButton={false} 
          centered >
          <CSMediaPropertyPage mediaPropertyId={mediaPropertyId} pageId={pageId} options={{showBacklink:false}}/>
      </MantineModal>

      <MantineModal size="xl" opened={openedNewSection} 
          onClose={()=>{
            newSectionModal.close();
          }} 
          withCloseButton={true} 
          centered >
            <CreateSectionForm
              Create={async ({label, type}) => {
                const id = CSMediaPropertyStore.CreateSection({
                  label,
                  type,
                  page: pageSectionPath,
                  mediaPropertyId,
                });

                setSectionId(id);
                newSectionModal.close();
                editSectionModal.open();
                return id;
              }}
            />
      </MantineModal>

      <MantineModal size="xl" opened={openedEditSection} 
          onClose={()=>{
            CSMediaPropertyStore.InsertListElement({
              ...inputProps,
              path: UrlJoin("/public/asset_metadata/info/pages", pageId, "layout"),
              subcategory: l10n.categories.sections,
              page: location.pathname,
              field: "sections",
              value: sectionId,
              label: info.sections[sectionId]?.label || sectionId
            });

            editSectionModal.close();
          }} 
          withCloseButton={false} 
          centered >
            <CSMediaPropertySection mediaPropertyId={mediaPropertyId} sectionId={sectionId} options={{showBacklink:false}}/>
        </MantineModal>

      <Flex
        mih={50}
        p={10}
        bg="rgba(0, 0, 0, 0.1)"
        gap="md"
        justify="flex-start"
        align="center"
        direction="row"
        wrap="wrap"
        className={S("toolbar")}>

        <Select
          data={pagesValues}
          value={value}
          onChange={setValue}
          className={S("page-select")}
        />

        <Button 
          className={S("toolbar__button")}
          onClick={
            ()=>{
              editModal.open();
            }
          }
        >
          {"Edit Page"}
        </Button>

        <Button 
          className={S("toolbar__button")}
          onClick={
            ()=>{
              newSectionModal.open();
            }
          }
        >
          {"New Section"}
        </Button>

      </Flex>

      <Container fluid className={S("property", "page")}>
        <MediaPropertyPage mediaPropertyId={mediaPropertyId} page={page} basePath={propertyPath}/>
      </Container>
    </PageContent>
  );
});

export default Builder;
