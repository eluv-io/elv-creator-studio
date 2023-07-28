import {rootStore} from "Stores";
import UrlJoin from "url-join";

export const ExtractHashFromLink = link => {
  if(link?.["."]?.source) {
    return link["."]?.source;
  } else if(link?.["/"]) {
    return link["/"]?.split("/").find(token => token.startsWith("hq__"));
  }
};

export const FabricUrl = ({libraryId, objectId, versionHash, path="", auth}) => {
  const url = new URL(
    rootStore.network === "main" ?
      "https://main.net955305.contentfabric.io" :
      "https://demov3.net955210.contentfabric.io"
  );

  let urlPath = UrlJoin("s", rootStore.network);
  if(auth === "private") {
    urlPath = UrlJoin("t", rootStore.signedToken);
  }

  if(versionHash) {
    urlPath = UrlJoin(urlPath, "q", versionHash, path);
  } else {
    urlPath = UrlJoin(urlPath, "qlibs", libraryId, "q", objectId, path);
  }

  url.pathname = urlPath;

  return url.toString();
};
