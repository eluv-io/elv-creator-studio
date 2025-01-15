import { useState } from "react";
import {observer} from "mobx-react-lite";
import {mediaPropertyStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import PageStyles from "./media-property-builder.module.scss";
import MediaPropertyPage from "@/wallet/components/properties/MediaPropertyPage";
import UrlJoin from "url-join";

import {default as CSMediaPropertyPage} from "@/pages/media_properties/MediaPropertyPage.jsx" ;
import {
  Select, 
  Container, 
  Flex, 
  Button, 
  Modal as MantineModal
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const S = (...classes) => classes.map(c => PageStyles[c] || "").join(" ");

const Builder = observer(({basePath}) => {
  const { mediaPropertyId } = useParams();
  const [value, setValue] = useState("ppge187QRk4oGNTPB1NF4HZswe");
  const [openedEdit, editModal] = useDisclosure(false);

  const pageId = value;

  console.log("basePath: ", basePath);

  if(!basePath){
    return null;
  }

  const propertyPath = UrlJoin(basePath, "mediaPropertyId");

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];
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

    //LogItem(section);
  }
  //LogItem(sections);

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
          data={[{ value: "ppge187QRk4oGNTPB1NF4HZswe", label: "Main Page" },
            { value: "ppgeKvByXHSsMAtAhqyXUnDJqi", label: "No Access Page" }
          ]}
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
      </Flex>

      <Container fluid className={S("property", "page")}>
        <MediaPropertyPage mediaPropertyId={mediaPropertyId} page={page} basePath={propertyPath}/>
      </Container>
    </PageContent>
  );
});

export default Builder;
