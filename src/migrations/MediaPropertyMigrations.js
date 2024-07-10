import UrlJoin from "url-join";
import {CompareSemVer, GenerateUUID} from "@/helpers/Misc.js";
import {toJS} from "mobx";

export const V1_0_1 = ({mediaPropertyId, mediaProperty, store}) => {
  const version = "1.0.1";

  const mainPage = mediaProperty.metadata.public.asset_metadata.info.pages.main;
  const mainPageId = `${store.ID_PREFIXES["page"]}${GenerateUUID()}`;

  store.ApplyMigration({
    version,
    objectId: mediaPropertyId,
    label: mediaProperty.name,
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
  "1.0.1": V1_0_1
};

export const latestVersion = Object.keys(Migrations).sort(CompareSemVer).reverse()[0];
