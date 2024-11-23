import {observer} from "mobx-react-lite";
import {mediaPropertyStore} from "@/stores";
import {useParams} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import { Paper, Title, Container} from "@mantine/core";
import  SectionList from "./SectionList";
import {LogItem} from "@/helpers/Misc";
import { LogMessage } from "@eluvio/elv-client-js/src/LogMessage";
import PageStyles from "./media-property-builder.module.scss";
import MediaPropertyPage from "@/wallet/components/properties/MediaPropertyPage";
import * as Stores from "../wallet/stores";

const S = (...classes) => classes.map(c => PageStyles[c] || "").join(" ");

const Builder = observer(() => {
  const { mediaPropertyId } = useParams();

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];
  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const page = info.pages.main;

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
        <MediaPropertyPage mediaPropertyId={mediaPropertyId} page={page}/>
      </Container>
    </PageContent>
  );
});

export default Builder;
