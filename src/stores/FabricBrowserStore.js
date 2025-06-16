import {flow, makeAutoObservable} from "mobx";

class FabricBrowserStore {
  libraries = {};
  objects = {};
  objectDetails = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }


  ParseRat(rat) {
    if(!rat) { return 0; }

    rat = rat.toString();

    if(rat.includes("/")) {
      return parseInt(rat.split("/")[0]) / parseInt(rat.split("/")[1]);
    }

    return parseInt(rat);
  }

  FormatDuration(duration) {
    if(!duration) { return; }

    duration = this.ParseRat(duration);

    let hours = Math.floor(Math.max(0, duration) / 60 / 60) % 24;
    let minutes = Math.floor(Math.max(0, duration) / 60 % 60);
    let seconds = Math.ceil(Math.max(duration, 0) % 60);

    return [hours, minutes, seconds]
      .map(t => (!t || isNaN(t) ? "" : t.toString()).padStart(2, "0"))
      .join(":");
  }

  LoadLibraries = flow(function * () {
    const libraryIds = yield this.client.ContentLibraries();

    // Find properties library
    let libraries = {...this.libraries};
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
  });

  LoadObjectDetails = flow(function * ({libraryId, objectId}) {
    if(!this.objectDetails[objectId]) {
      libraryId = libraryId || (yield this.client.ContentObjectLibraryId({objectId}));
      const metadata = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        select: [
          "public/name",
          "channel",
          "clips",
          "offerings/*/media_struct/duration_rat"
        ]
      });

      const offering = metadata?.offerings?.default ?
        "default" :
        Object.keys(metadata?.offerings || {})[0];

      let duration = metadata?.offerings?.[offering]?.media_struct?.duration_rat;

      let isVideo;
      if(duration) {
        isVideo = true;
        duration = this.FormatDuration(duration);
      }

      let hasCompositions = Object.keys(metadata?.channel?.offerings || {}).length > 0;
      let hasClips = !!Object.keys(metadata?.clips?.metadata_tags || {})
        .find(category => metadata.clips.metadata_tags[category]?.tags?.length > 0);

      let compositions = [];
      if(hasCompositions) {
        compositions = Object.keys(metadata.channel?.offerings || {})?.map(compositionKey => {
          return {
            id: `composition-${compositionKey}`,
            type: "composition",
            source: "Composition",
            libraryId,
            objectId,
            compositionKey,
            name: metadata.channel?.offerings[compositionKey]?.display_name || compositionKey,
            duration: this.FormatDuration(
              (metadata.channel?.offerings[compositionKey]?.items || [])
                .map(item => this.ParseRat(item.slice_end_rat) - this.ParseRat(item.slice_start_rat))
                .reduce((a, b) => a + b, 0)
            )
          };
        });
      }

      let clips = [];
      if(hasClips) {
        Object.keys(metadata.clips?.metadata_tags || {}).forEach(trackKey => {
          (metadata.clips.metadata_tags[trackKey]?.tags || []).forEach((tag, index) =>
            clips.push({
              id: `clip-${trackKey}-${index}`,
              type: "clip",
              source: metadata.clips.metadata_tags[trackKey]?.label || trackKey,
              libraryId,
              objectId,
              trackKey,
              name: tag.text,
              startTime: tag.start_time / 1000,
              endTime: tag.end_time / 1000,
              duration: this.FormatDuration(tag.end_time / 1000 - (tag.start_time || 0) / 1000)
            })
          );
        });
      }

      this.objectDetails[objectId] = {
        libraryId,
        objectId,
        name: metadata?.public?.name || objectId,
        isVideo,
        duration,
        hasCompositions,
        compositions,
        hasClips,
        clips
      };
    }

    return this.objectDetails[objectId];
  });

  LoadObjects = flow(function * ({libraryId, sortStatus, filter, page, perPage}) {
    this.objects[libraryId] = [];

    const { contents, paging } = yield this.client.ContentObjects({
      libraryId,
      filterOptions: {
        start: (page-1) * perPage,
        limit: perPage,
        select: [
          "public/name",
          "public/display_image",
          "public/asset_metadata/title",
          "public/asset_metadata/display_title"
        ],
        sort: "public/name",
        sortDesc: sortStatus?.direction !== "asc",
        filter: !filter ? undefined :
          {
            key: "public/name",
            type: "cnt",
            filter
          }
      }
    });

    const objects = yield Promise.all(
      contents
        .filter(result => result?.versions?.length > 0)
        .map(async result => {
          const object = result.versions[0];

          return {
            libraryId,
            objectId: object.id,
            versionHash: object.hash,
            name:
            //object.meta?.public?.asset_metadata?.display_title ||
            //object.meta?.public?.asset_metadata?.title ||
            object.meta?.public?.name,
            metadata: object.meta,
            ...(await this.LoadObjectDetails({libraryId, objectId: object.id}))
          };
        })
    );

    this.objects[libraryId] = {
      paging,
      objects
    };

    return {
      objects,
      paging
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
