import {editStore, rootStore} from "@/stores";
import UrlJoin from "url-join";

export const ExtractHashFromLink = link => {
  if(link?.["."]?.source) {
    return link["."]?.source;
  } else if(link?.["/"]) {
    return link["/"]?.split("/").find(token => token.startsWith("hq__"));
  }
};

export const ScaleImage = (url, width) => {
  if(!url) { return ""; }

  url = new URL(url);
  url.searchParams.set("width", width);

  return url.toString();
};

export const FabricUrl = ({libraryId, objectId, writeToken, versionHash, noWriteToken=false, path="", auth, resolve=true, width}) => {
  if(versionHash) {
    objectId = rootStore.utils.DecodeVersionHash(versionHash).objectId;
  } else {
    // Ensure library ID is loaded for this object
    rootStore.LibraryId({objectId});
    libraryId = libraryId || rootStore.libraryIds[objectId];
  }

  let url = new URL(
    rootStore.network === "main" ?
      "https://main.net955305.contentfabric.io" :
      "https://demov3.net955210.contentfabric.io"
  );

  if(!noWriteToken && editStore.writeInfo[objectId]) {
    writeToken = editStore.writeInfo[objectId].writeToken || writeToken;
    const fabricNodeUrl = editStore.writeInfo[objectId]?.fabricNodeUrl;

    if(!fabricNodeUrl) {
      rootStore.DebugLog({message: `No saved node found for ${writeToken}`, level: rootStore.logLevels.DEBUG_LEVEL_ERROR});
      return "";
    }

    url = new URL(fabricNodeUrl);
  }

  let urlPath = UrlJoin("s", rootStore.network);
  if(auth === "private") {
    urlPath = UrlJoin("t", rootStore.signedToken);
  }

  if(versionHash) {
    urlPath = UrlJoin(urlPath, "q", writeToken || versionHash, path);
  } else {
    urlPath = UrlJoin(urlPath, "qlibs", libraryId, "q", writeToken || objectId, path);
  }

  url.pathname = urlPath;

  if(resolve) {
    url.searchParams.set("resolve", "true");
  }

  if(width) {
    url.searchParams.set("width", width);
  }

  return url.toString();
};
