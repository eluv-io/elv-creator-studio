import {flow, makeAutoObservable} from "mobx";

class FabricBrowserStore {
  libraries = {};
  objects = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  LoadLibraries = flow(function * () {
    this.rootStore.DebugTimeStart({key: "Load Libraries"});

    const libraryIds = yield this.client.ContentLibraries();

    // Find properties library
    let libraries = {};
    yield Promise.all(
      libraryIds.map(async libraryId => {
        if(this.libraries[libraryId]) { return; }

        try {
          const metadata = await this.client.ContentObjectMetadata({
            libraryId,
            objectId: libraryId.replace("ilib", "iq__"),
            metadataSubtree: "public"
          });

          libraries[libraryId] = {
            libraryId,
            name: metadata?.name || libraryId,
            metadata: {
              public: metadata
            }
          };
        } catch(error) {
          this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_ERROR});
        }
      })
    );

    this.libraries = libraries;

    this.rootStore.DebugTimeEnd({key: "Load Libraries"});
  });

  LoadObjects = flow(function * ({libraryId, sortStatus, filter}) {
    this.objects[libraryId] = [];

    const { contents, paging } = yield this.client.ContentObjects({
      libraryId,
      filterOptions: {
        limit: 1000,
        select: [
          "public/name",
          "public/display_image",
          "public/asset_metadata/title",
          "public/asset_metadata/display_title"
        ],
        sort: "public/name",
        sortDesc: sortStatus !== "asc",
        filter: !filter ? undefined :
          {
            key: "public/name",
            type: "cnt",
            filter
          }
      }
    });

    const objects = contents
      .filter(result => result?.versions?.length > 0)
      .map(result => {
        const object = result.versions[0];

        return {
          libraryId,
          objectId: object.id,
          versionHash: object.hash,
          name:
            //object.meta?.public?.asset_metadata?.display_title ||
            //object.meta?.public?.asset_metadata?.title ||
            object.meta?.public?.name,
          metadata: object.meta
        };
      });

    this.objects[libraryId] = {
      paging,
      objects
    };
  });

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

export default FabricBrowserStore;
