import {flow, makeAutoObservable, runInAction} from "mobx";
import {FabricUrl} from "@/helpers/Fabric.js";
import UrlJoin from "url-join";
import {DownloadFromUrl} from "@/helpers/Misc";

class FileBrowserStore {
  files = {};
  objectNames = {};
  imageTypes = ["gif", "jpg", "jpeg", "png", "svg", "webp"];

  activeUploadJobs = {};
  uploadStatus = {};

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Retrieve contents of the specified directory
  Directory({objectId, path="/"}) {
    let directory = this.files[objectId] || {};

    path
      .replace(/^\//, "")
      .split("/")
      .filter(pathElement => pathElement)
      .forEach(pathElement => directory = directory?.[pathElement]);

    const libraryId = this.rootStore.libraryIds[objectId];
    const writeToken = this.rootStore.editStore.writeInfo[objectId]?.writeToken;

    // Transform from fabric file metadata
    return Object.keys(directory)
      .map(filename => {
        if(filename === ".") { return; }

        const file = directory[filename];

        if(file?.["."]?.type === "directory") {
          return {
            objectId,
            type: "directory",
            filename,
            fullPath: UrlJoin(path, filename)
          };
        } else if(file?.["."]) {
          const ext = filename.includes(".") ? filename.split(".").slice(-1)[0].toLowerCase() : "";
          return {
            objectId,
            type: this.imageTypes.includes(ext) ? "image" : "file",
            filename,
            fullPath: UrlJoin(path, filename),
            ext,
            url: FabricUrl({libraryId, objectId, writeToken, path: UrlJoin("files", path, filename), auth: "private"}),
            size: file["."].size,
            encrypted: file["."].encryption?.scheme === "cgck"
          };
        }
      })
      .filter(file => file);
  }

  LoadFiles = flow(function * ({objectId}) {
    const libraryId = yield this.rootStore.LibraryId({objectId});
    const writeToken = this.rootStore.editStore.writeInfo[objectId]?.writeToken;

    const metadata = (yield this.client.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken,
      metadataSubtree: "/",
      select: [
        "files",
        "public/name"
      ],
      produceLinkUrls: true
    })) || {};

    this.files[objectId] = metadata.files;
    this.objectNames[objectId] = metadata.public?.name || objectId;
  });

  CreateDirectory = flow(function * ({objectId, path, filename}) {
    const libraryId = yield this.rootStore.LibraryId({objectId});
    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId});

    yield this.client.CreateFileDirectories({
      libraryId,
      objectId,
      writeToken,
      filePaths: [UrlJoin(path, filename)]
    });

    yield this.LoadFiles({objectId});
  });

  RenameFile = flow(function * ({objectId, path, filename, newFilename}) {
    const libraryId = yield this.rootStore.LibraryId({objectId});
    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId});

    yield this.client.MoveFiles({
      libraryId,
      objectId,
      writeToken,
      filePaths: [{
        path: UrlJoin(path, filename),
        to: UrlJoin(path, newFilename)
      }]
    });

    yield this.LoadFiles({objectId});
  });

  DeleteFile = flow(function * ({objectId, path, filename}) {
    const libraryId = yield this.rootStore.LibraryId({objectId});
    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId});

    yield this.client.DeleteFiles({
      libraryId,
      objectId,
      writeToken,
      filePaths: [
        UrlJoin(path, filename)
      ]
    });

    yield this.LoadFiles({objectId});
  });

  UploadFiles = flow(function * ({objectId, files}) {
    const libraryId = yield this.rootStore.LibraryId({objectId});
    const writeToken = yield this.rootStore.editStore.InitializeWrite({objectId});

    this.activeUploadJobs[objectId] = (this.activeUploadJobs[objectId] || 0) + 1;

    try {
      yield this.client.UploadFiles({
        objectId,
        libraryId,
        writeToken,
        fileInfo: files,
        callback: uploadStatus => runInAction(() => {
          this.uploadStatus[objectId] = {
            ...(this.uploadStatus[objectId] || {}),
            ...uploadStatus
          };
        })
      });

      yield this.LoadFiles({objectId});
    } catch(error) {
      this.DebugLog({message: error, level: this.logLevels.DEBUG_LEVEL_ERROR});
    } finally {
      this.activeUploadJobs[objectId] -= 1;
    }
  });

  async DownloadEncryptedFile({objectId, path, filename, callback}) {
    try {
      const libraryId = await this.rootStore.LibraryId({objectId});
      const writeToken = await this.rootStore.editStore.InitializeWrite({objectId});

      const blob = await this.client.DownloadFile({
        libraryId,
        objectId,
        writeToken,
        filePath: UrlJoin(path, filename),
        format: "blob",
        callback
      });

      await DownloadFromUrl({
        url: window.URL.createObjectURL(blob),
        filename
      });
    } catch(error) {
      this.DebugLog({message: "Download failed", error, level: this.logLevels.DEBUG_LEVEL_ERROR});
    }
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
