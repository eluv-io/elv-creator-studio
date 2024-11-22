import {observer} from "mobx-react-lite";
import {mediaPropertyStore, uiStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import { Paper, Title, Container} from "@mantine/core";
import  SectionList from "./SectionList";
import {LogItem} from "@/helpers/Misc";
import { LogMessage } from "@eluvio/elv-client-js/src/LogMessage";
import PageStyles from "./media-property-builder.module.scss";

const S = (...classes) => classes.map(c => PageStyles[c] || "").join(" ");

const MediaPropertyBuilder= observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];
  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const metadata = mediaProperty.metadata.public.asset_metadata;
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

export default MediaPropertyBuilder;

