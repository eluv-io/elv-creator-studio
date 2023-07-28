import {Utils} from "@eluvio/elv-client-js";

export const Capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

export const StorageHandler = ({type, mode, key, value, json, b64}) => {
  try {
    const storage = type === "session" ? sessionStorage : localStorage;

    if(mode === "remove") {
      storage.removeItem(key);
    } else if(mode === "set") {
      if(json) {
        value = JSON.stringify(value);
      }

      if(b64) {
        value = Utils.B64(value);
      }

      storage.setItem(key, value);
    } else {
      value = storage.getItem(key);

      if(!value) { return; }

      if(b64) {
        value = Utils.FromB64(value);
      }

      if(json) {
        value = JSON.parse(value);
      }

      return value;
    }
  } catch(error) {
    // eslint-disable-next-line no-console
    console.warn(`Unable to save to ${type}Storage`);
  }
};
