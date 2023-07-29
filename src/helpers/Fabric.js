import {rootStore} from "Stores";
import UrlJoin from "url-join";

export const ExtractHashFromLink = link => {
  if(link?.["."]?.source) {
    return link["."]?.source;
  } else if(link?.["/"]) {
    return link["/"]?.split("/").find(token => token.startsWith("hq__"));
  }
};

export const FabricUrl = ({libraryId, objectId, writeToken, versionHash, path="", auth}) => {
  const url = new URL(rootStore.fabricNodeUrl);

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
