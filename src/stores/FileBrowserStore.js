 
import {flow, makeAutoObservable} from "mobx";
import {FabricUrl} from "../helpers/Fabric.js";
import UrlJoin from "url-join";

class FileBrowserStore {
  files = {};
  imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];
  libraryIds = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  LoadFiles = flow(function * ({objectId, writeToken}) {
    const libraryId = yield this.client.ContentObjectLibraryId({objectId});

    this.libraryIds[objectId] = libraryId;

    this.files[objectId] = (yield this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "files",
      produceLinkUrls: true
    })) || {};
  });

  FormatFiles({objectId, writeToken, directory={}, path}) {
    return Object.keys(directory)
      .map(filename => {
        if(filename === ".") { return; }

        const file = directory[filename];

        if(file?.["."]?.type === "directory") {
          return {
            type: "directory",
            name: filename
          };
        } else if(file?.["."]) {
          const ext = filename.includes(".") ? filename.split(".").slice(-1)[0].toLowerCase() : "";
          return {
            type: this.imageTypes.includes(ext) ? "image" : "file",
            name: filename,
            ext,
            url: FabricUrl({libraryId: this.libraryIds[objectId], objectId, writeToken, path: UrlJoin("files", path, filename), auth: "private"}),
            size: file["."].size,
            encrypted: file.encryption?.scheme !== "none"
          };
        }
      })
      .filter(file => file);
  }

  Directory({objectId, writeToken, path="/"}) {
    let directory = this.files[objectId] || {};

    path
      .replace(/^\//, "")
      .split("/")
      .filter(pathElement => pathElement)
      .forEach(pathElement => directory = directory?.[pathElement]);

    return this.FormatFiles({objectId, writeToken, path, directory});
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

export default FileBrowserStore;
