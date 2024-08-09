import UrlJoin from "url-join";
import {CompareSemVer, GenerateUUID} from "@/helpers/Misc.js";
import {toJS} from "mobx";
import {MediaPropertyHeroItemSpec, MediaPropertyHeroSectionSpec} from "@/specs/MediaPropertySpecs.js";
import Clone from "lodash/clone";

// Remove page IDs from slugs in newly created properties
export const V1_0_3 = ({mediaPropertyId, mediaProperty, store}) => {
  const version = "1.0.3";
  const pages = mediaProperty.metadata.public.asset_metadata.info.pages || {};

  // Find page with slug that is a page ID
  const pageIdsToClear = Object.keys(pages).filter(pageId =>
    pages[pages[pageId]?.slug]
  );

  store.ApplyMigration({
    version,
    objectId: mediaPropertyId,
    label: "Remove page ID from page slug field",
    Apply: ({Set}) => {
      pageIdsToClear.forEach(pageId =>
        Set(
          UrlJoin("/public/asset_metadata/info/pages", pageId, "slug"),
          ""
        )
      );
    },
    Write: async (objectParams) => {
      await Promise.all(
        pageIdsToClear.map(async pageId =>
          await store.client.ReplaceMetadata({
            ...objectParams,
            metadataSubtree: UrlJoin("/public/asset_metadata/info/pages", pageId, "slug"),
            metadata: ""
          })
        )
      );
    }
  });
};

// Page headers -> hero sections
export const V1_0_2 = ({mediaPropertyId, mediaProperty, store}) => {
  const version = "1.0.2";
  const pages = mediaProperty.metadata.public.asset_metadata.info.pages || {};
  let newPageSections = {};
  let newPageSectionsList = {};

  Object.keys(pages).forEach(pageId => {
    if(pageId === "main") { return; }

    const page = pages[pageId];
    const heroSectionId = `${store.ID_PREFIXES["section_hero"]}${GenerateUUID()}`;

    const heroSection = Clone(MediaPropertyHeroSectionSpec);
    heroSection.id = heroSectionId;
    heroSection.label = `${page.label} Header`;
    heroSection.allow_overlap = true;

    const heroItem = Clone(MediaPropertyHeroItemSpec);
    heroItem.id = `${store.ID_PREFIXES["section_hero_item"]}${GenerateUUID()}`;
    heroItem.label = "Page Header";
    heroItem.display = { ...toJS(heroItem.display), ...toJS(page.layout) };
    heroItem.actions = [ ...(toJS(page.actions) || []) ];

    heroSection.hero_items = [ heroItem ];

    newPageSections[pageId] = toJS(heroSection);
    newPageSectionsList[pageId] = [ heroSectionId, ...(page.layout.sections || []) ];
  });

  store.ApplyMigration({
    version,
    objectId: mediaPropertyId,
    label: "Convert page headers into hero sections",
    Apply: ({Set}) => {
      Object.keys(newPageSections).forEach(pageId => {
        // Add section to sections list
        Set(
          UrlJoin("/public/asset_metadata/info/sections", newPageSections[pageId].id),
          newPageSections[pageId]
        );

        // Set hero section as first section
        Set(
          UrlJoin("/public/asset_metadata/info/pages", pageId, "layout", "sections"),
          newPageSectionsList[pageId]
        );
      });
    },
    Write: async (objectParams) => {
      await Promise.all(
        Object.keys(newPageSections).map(async pageId => {
          await store.client.ReplaceMetadata({
            ...objectParams,
            metadataSubtree: UrlJoin("/public/asset_metadata/info/sections", newPageSections[pageId].id),
            metadata: newPageSections[pageId]
          });

          await store.client.ReplaceMetadata({
            ...objectParams,
            metadataSubtree: UrlJoin("/public/asset_metadata/info/pages", pageId, "layout", "sections"),
            metadata: newPageSectionsList[pageId]
          });
        })
      );
    }
  });
};

// Page IDs + main page swap
export const V1_0_1 = ({mediaPropertyId, mediaProperty, store}) => {
  const version = "1.0.1";

  const mainPage = mediaProperty.metadata.public.asset_metadata.info.pages.main;
  const mainPageId = `${store.ID_PREFIXES["page"]}${GenerateUUID()}`;

  store.ApplyMigration({
    version,
    objectId: mediaPropertyId,
    label: "Update main handling",
    Apply: ({Set}) => {
      Set(
        UrlJoin("/public/asset_metadata/info/pages", mainPageId),
        {
          ...mainPage,
          id: mainPageId,
          slug: ""
        }
      );
      Set("/public/asset_metadata/info/page_ids", { main: mainPageId });
    },
    Write: async (objectParams) => {
      await store.client.ReplaceMetadata({
        ...objectParams,
        metadataSubtree: UrlJoin("/public/asset_metadata/info/pages", mainPageId),
        metadata: {
          ...toJS(mainPage),
          id: mainPageId,
          slug: ""
        }
      });

      await store.client.ReplaceMetadata({
        ...objectParams,
        metadataSubtree: "/public/asset_metadata/info/page_ids",
        metadata: { main: mainPageId }
      });
    }
  });
};

export const Migrations = {
  "1.0.1": V1_0_1,
  "1.0.2": V1_0_2,
  "1.0.3": V1_0_3
};

export const latestVersion = Object.keys(Migrations).sort(CompareSemVer).reverse()[0];
