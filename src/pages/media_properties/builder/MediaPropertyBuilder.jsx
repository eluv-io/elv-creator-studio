import {observer} from "mobx-react-lite";
import {mediaPropertyStore, uiStore} from "@/stores";
import {useParams} from "react-router-dom";
import { useHover, useDisclosure } from "@mantine/hooks";
import {IconButton, LocalizeString} from "@/components/common/Misc.jsx";
import {useEffect, useState} from "react";
import MediaPropertySection from "@/pages/media_properties/MediaPropertySection.jsx";
import PageContent from "@/components/common/PageContent.jsx";
import  SectionList from "./SectionList";
import {LogItem} from "@/helpers/Misc";
import { LogMessage } from "@eluvio/elv-client-js/src/LogMessage";
import PageStyles from "./media-property-builder.module.scss";
import {
  Button,
  Modal,
  Container,
  Flex
} from "@mantine/core";

const S = (...classes) => classes.map(c => PageStyles[c] || "").join(" ");

const MediaPropertyBuilder= observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];
  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const page = info.pages.main;
  //LogItem(page.sections);

  if(!page || !page.layout.sections){
    LogMessage({message:"page or page sections undefined."});
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
      <Container fluid className={S("property", "page")}>
        <SectionList mediaPropertyId={mediaPropertyId} sections={sections}/>
      </Container>
    </PageContent>
  );
});

export const MediaPropertySectionModal = observer((mediaPropertyId, sectionId) => {
  const [opened, { open, close }] = useDisclosure(false);
  console.log("MediaPropertySectionModal");

  return (
    <div className={S("builder-input-container")}>
        <Modal size="xl" opened={opened} onClose={()=>{close();}} withCloseButton={false} centered >
          <Flex
              gap="md"
              direction="column"
            >
              <MediaPropertySection mediaPropertyId={mediaPropertyId} sectionId={sectionId} />
            </Flex>
        </Modal>
    </div>
  );
});

export default MediaPropertyBuilder;

