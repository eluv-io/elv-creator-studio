import {flow, makeAutoObservable} from "mobx";
import {AddActions} from "@/stores/helpers/Actions.js";
import {
  MediaPropertyPageSpec,
  MediaPropertySectionAutomaticSpec,
  MediaPropertySectionManualSpec,
  MediaPropertySpec
} from "@/specs/MediaPropertySpecs.js";
import {GenerateUUID} from "@/helpers/Misc.js";
import UrlJoin from "url-join";
import {LocalizeString} from "@/components/common/Misc.jsx";

class MediaPropertyStore {
  allMediaProperties;
  mediaProperties = {};

  ID_PREFIXES = {
    "property": "prop",
    "section_manual": "pscm",
    "section_automatic": "psca",
    "page": "ppge",
  };

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeAutoObservable(this);
  }

  CreateMediaProperty = flow(function * ({name="New Media Property"}) {
    const libraryId = this.rootStore.tenantInfo.propertiesLibraryId;
    const response = yield this.client.CreateAndFinalizeContentObject({
      libraryId,
      options: {
        type: this.rootStore.typeInfo.mediaProperty
      },
      callback: async ({objectId, writeToken}) => {
        const id = `${this.ID_PREFIXES["property"]}${objectId.replace("iq__", "")}`;
        await this.client.ReplaceMetadata({
          libraryId,
          objectId,
          writeToken,
          metadata: {
            public: {
              name: `Media Property - ${name}`,
              asset_metadata: {
                info: {
                  ...MediaPropertySpec,
                  id,
                  name
                }
              }
            }
          }
        });

        await this.client.SetPermission({objectId, writeToken, permission: "listable"});
      }
    });

    const objectId = response.id;

    yield Promise.all([
      this.UpdateDatabaseRecord({objectId}),
      this.LoadMediaProperty({mediaPropertyId: objectId}),
    ]);

    yield this.LoadMediaProperties(true);

    return objectId;
  });

  LoadMediaProperties = flow(function * (force=false) {
    if(this.allMediaProperties && !force) { return; }

    this.allMediaProperties = yield this.rootStore.databaseStore.GetCollection({collection: "mediaProperties"});
  });

  LoadMediaProperty = flow(function * ({mediaPropertyId, force=false}) {
    if(this.mediaProperties[mediaPropertyId] && !force) { return; }

    yield this.LoadMediaProperties();

    const info = this.allMediaProperties.find(mediaProperty => mediaProperty.objectId === mediaPropertyId);

    const libraryId = yield this.rootStore.LibraryId({objectId: mediaPropertyId});

    yield this.rootStore.mediaCatalogStore.LoadMediaCatalogs();

    this.mediaProperties[mediaPropertyId] = {
      ...info,
      metadata: {
        public: (yield this.client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId: mediaPropertyId,
          metadataSubtree: "public",
          resolveLinks: true,
          linkDepthLimit: 1,
          resolveIgnoreErrors: true,
          resolveIncludeSource: true,
          produceLinkUrls: true
        }))
      }
    };
  });

  CreatePage({page, mediaPropertyId, name}) {
    let id = `${this.ID_PREFIXES["page"]}${GenerateUUID()}`;

    const spec = MediaPropertyPageSpec;
    spec.id = id;
    spec.name = name || spec.name;

    this.AddField({
      objectId: mediaPropertyId,
      page,
      path: "/public/asset_metadata/info/pages",
      field: id,
      value: spec,
      category: this.MediaPropertyCategory({category: "page_label", mediaPropertyId, type: "pages", id, name: spec.name}),
      label: name
    });

    return id;
  }

  CreateSection({page, mediaPropertyId, type="manual", name}) {
    let id = `${this.ID_PREFIXES[`section_${type}`]}${GenerateUUID()}`;

    const spec = type === "manual" ? MediaPropertySectionManualSpec : MediaPropertySectionAutomaticSpec;

    spec.id = id;
    spec.name = name || spec.name;

    this.AddField({
      objectId: mediaPropertyId,
      page,
      path: "/public/asset_metadata/info/sections",
      field: id,
      value: spec,
      category: this.MediaPropertyCategory({category: "section_label", mediaPropertyId, type: "sections", id, name: spec.name}),
      label: name
    });

    return id;
  }

  MediaPropertyCategory({category, type="sections", mediaPropertyId, id, name}) {
    return () => {
      name = this.GetMetadata({objectId: mediaPropertyId, path: UrlJoin("/public/asset_metadata/info", type, id), field: "name"}) || name;

      return LocalizeString(this.rootStore.l10n.pages.media_property.form.categories[category], { label: name });
    };
  }

  Reload = flow(function * ({objectId}) {
    yield this.LoadMediaProperty({mediaPropertyId: objectId, force: true});
  });

  UpdateDatabaseRecord = flow(function * ({objectId}) {
    yield this.rootStore.databaseStore.SaveMediaProperty({mediaPropertyId: objectId});
  });

  DeployedHash({environment, mediaPropertyId}) {
    return this.rootStore.tenantStore[`tenant${environment.capitalize()}`]?.mediaProperties?.[mediaPropertyId]?.versionHash;
  }

  get client() {
    return this.rootStore.client;
  }

  get utils() {
    return this.rootStore.utils;
  }

  get l10n() {
    return this.rootStore.l10n;
  }

  get logLevels() {
    return this.rootStore.logLevels;
  }

  DebugLog() {
    this.rootStore.DebugLog(...arguments);
  }
}

AddActions(MediaPropertyStore, "mediaProperties");

export default MediaPropertyStore;

