import {editStore, rootStore} from "Stores";
import UrlJoin from "url-join";

export const ExtractHashFromLink = link => {
  if(link?.["."]?.source) {
    return link["."]?.source;
  } else if(link?.["/"]) {
    return link["/"]?.split("/").find(token => token.startsWith("hq__"));
  }
};

export const FabricUrl = ({libraryId, objectId, writeToken, versionHash, path="", auth}) => {
  if(versionHash) {
    objectId = rootStore.utils.DecodeVersionHash(versionHash).objectId;
  }

  let url = new URL(
    rootStore.network === "main" ?
      "https://main.net955305.contentfabric.io" :
      "https://demov3.net955210.contentfabric.io"
  );

  if(editStore.writeInfo[objectId]) {
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

  return url.toString();
};
