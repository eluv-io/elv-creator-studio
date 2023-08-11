import {Utils} from "@eluvio/elv-client-js";
import {rootStore} from "Stores";

export const Capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

export const SortTable = ({sortStatus, AdditionalCondition}) => {
  return (a, b) => {
    if(AdditionalCondition && typeof AdditionalCondition(a, b) !== "undefined") {
      return AdditionalCondition(a, b);
    }

    a = a[sortStatus.columnAccessor];
    b = b[sortStatus.columnAccessor];

    if(typeof a === "number") {
      a = a || 0;
      b = b || 0;
    } else {
      a = a?.toLowerCase?.() || a || "";
      b = b?.toLowerCase?.() || b || "";
    }

    return (a < b ? -1 : 1) * (sortStatus.direction === "asc" ? 1 : -1);
  };
};

export const ParseDate = date => {
  try {
    date = new Date(date);

    return date instanceof Date && !isNaN(date) ? date : undefined;
  // eslint-disable-next-line no-empty
  } catch(error) {}
};

export const DownloadFromUrl = async ({url, filename}) => {
  let element = document.createElement("a");
  element.href = url;
  element.download = filename;

  element.style.display = "none";
  element.target = "_blank";

  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
  window.URL.revokeObjectURL(url);
};

export const StorageHandler = ({
  get: ({type, key, json, b64}) => {
    try {
      const storage = type === "session" ? sessionStorage : localStorage;

      let value = storage.getItem(key);

      if(!value) { return; }

      if(b64) {
        value = Utils.FromB64(value);
      }

      if(json) {
        value = JSON.parse(value);
      }

      return value;
    } catch(error) {
      rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_INFO});
    }
  },
  set: ({type, key, value, json, b64}) => {
    try {
      const storage = type === "session" ? sessionStorage : localStorage;

      if(json) {
        value = JSON.stringify(value);
      }

      if(b64) {
        value = Utils.B64(value);
      }

      storage.setItem(key, value);
    } catch(error) {
      rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_INFO});
    }
  },
  remove: ({type, key}) => {
    try {
      const storage = type === "session" ? sessionStorage : localStorage;

      storage.removeItem(key);
    } catch(error) {
      rootStore.DebugLog({message: error, level: rootStore.logLevels.DEBUG_LEVEL_INFO});
    }
  }
});

export const ScrollTo = ({top=0, target, behavior="smooth"}) => {
  if(target) {
    top = target.getBoundingClientRect().top + window.scrollY + top;
  }

  // Mobile has a bug that prevents scroll top from working
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.scrollTo(0, top);
  } else {
    window.scrollTo({top, behavior});
  }
};
