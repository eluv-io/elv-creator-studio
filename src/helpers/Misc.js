import SharedStyles from "@/assets/stylesheets/modules/shared.module.scss";

import {Utils} from "@eluvio/elv-client-js";
import {rootStore} from "@/stores";
import {v4 as UUID, parse as UUIDParse} from "uuid";
import DayJS from "dayjs";

export const JoinClassNames = (...cs) => cs.map(c => c || "").join(" ");

export const CreateModuleClassMatcher = (...modules) => {
  modules = [...modules, SharedStyles];

  return (...classes) => JoinClassNames(
    ...(classes.map(c => {
      return modules
        .map(m => m?.[c])
        .filter(c => c)
        .join(" ");
    }))
  );
};

String.prototype.capitalize =
  function() {
    return this.replace(/_/g, " ").replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

export const GenerateUUID = () => rootStore.utils.B58(UUIDParse(UUID()));

export const FormatUSD = usd => typeof usd === "undefined" || usd === "" ? "" :
  new Intl.NumberFormat(navigator.language || "en-US", { style: "currency", currency: "USD"}).format(usd);

export const FormatPriceString = (prices={}) => {
  let currency = "USD";
  let price = prices.USD;
  if(typeof price !== "number") {
    currency = Object.keys(prices).find(currencyCode => prices[currencyCode]);
    price = prices[currency];
  }

  if(typeof price === "undefined" || isNaN(price)) {
    return "";
  }

  return new Intl.NumberFormat(navigator.language || "en-US", {
    style: "currency",
    currency
  }).format(price.toString());
};

export const SortTable = ({sortStatus, AdditionalCondition}) => {
  return (a, b) => {
    if(AdditionalCondition && typeof AdditionalCondition(a, b) !== "undefined") {
      return AdditionalCondition(a, b);
    }

    if(sortStatus.columnAccessor.includes(".")) {
      const [root, accessor] = sortStatus.columnAccessor.split(".");
      a = a[root]?.[accessor];
      b = b[root]?.[accessor];
    } else {
      a = a[sortStatus.columnAccessor];
      b = b[sortStatus.columnAccessor];
    }

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

export const FormatDate = (date, {time=true}={}) => {
  date = ParseDate(date);

  if(!date) { return ""; }

  return DayJS(date).format(time ? "LLL ZZ" : "LL ZZ");
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

export const ScrollTo = ({top=0, target, container, behavior="smooth"}) => {
  if(target) {
    top = target.getBoundingClientRect().top + window.scrollY + top;
  }

  // Mobile has a bug that prevents scroll top from working
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    (container || window).scrollTo(0, top);
  } else {
    (container || window).scrollTo({top, behavior});
  }
};

export const CompareSemVer = (a, b) => {
  const [a1, a2, a3] = a.split(".");
  const [b1, b2, b3] = b.split(".");

  if(parseInt(a1 || 0) === parseInt(b1 || 0)) {
    if(parseInt(a2 || 0) === parseInt(b2 || 0)) {
      return parseInt(a3 || 0) - parseInt(b3 || 0);
    }

    return parseInt(a2 || 0) - parseInt(b2 || 0);
  }

  return parseInt(a1 || 0) - parseInt(b1 || 0);
};
