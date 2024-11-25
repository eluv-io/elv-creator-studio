import {observer} from "mobx-react-lite";
import {mediaPropertyStore} from "@/stores";
import {useParams, useLocation} from "react-router-dom";
import PageContent from "@/components/common/PageContent.jsx";
import { Paper, Title, Container} from "@mantine/core";
import  SectionList from "./SectionList";
import {LogItem} from "@/helpers/Misc";
import { LogMessage } from "@eluvio/elv-client-js/src/LogMessage";
import PageStyles from "./media-property-builder.module.scss";
import MediaPropertyPage from "@/wallet/components/properties/MediaPropertyPage";
import {rootStore} from "@/stores";
import * as Stores from "../wallet/stores";
import UrlJoin from "url-join";

const S = (...classes) => classes.map(c => PageStyles[c] || "").join(" ");

const Builder = observer(({basePath}) => {
  const { mediaPropertyId } = useParams();

  console.log("basePath: ", basePath);

  if(!basePath){
    return null;
  }

  const propertyPath = UrlJoin(basePath, "mediaPropertyId");

  const mediaProperty = mediaPropertyStore.mediaProperties[mediaPropertyId];
  if(!mediaProperty) { return null; }

  const info = mediaProperty?.metadata?.public?.asset_metadata?.info || {};

  const page = info.pages.main;

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
      <Container fluid className={S("property", "page")}>
        <MediaPropertyPage mediaPropertyId={mediaPropertyId} page={page} basePath={propertyPath}/>
      </Container>
    </PageContent>
  );
});

export default Builder;
