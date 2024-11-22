import PageStyles from "Assets/stylesheets/media_properties/property-page.module.scss";

import React from "react";
import {observer} from "mobx-react-lite";
import {mediaPropertyStore} from "Stores";
import {Navigate, useResolvedPath} from "react-router-dom";
import { LogMessage } from "@eluvio/elv-client-js/src/LogMessage";
import {LogItem} from "@/helpers/Misc";
import {
  PageContainer,
} from "Components/properties/Common";
import {
  MediaPropertyHeroSection,
  MediaPropertySection,
  MediaPropertySectionContainer
} from "Components/properties/MediaPropertySection";

const S = (...classes) => classes.map(c => PageStyles[c] || "").join(" ");

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

          //LogItem(section);

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
              className={S("page__section")}
            />
          );
        })
      }
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

export default MediaPropertyPage;
