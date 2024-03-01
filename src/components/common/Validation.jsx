import {rootStore} from "@/stores";
import { validate as validateCSS } from "csstree-validator";

export const ValidateUrl = url => {
  try {
    if(!url) { return; }

    new URL(url);
  } catch(error) {
    return rootStore.l10n.components.inputs.validation.invalid_url;
  }
};

export const ValidateAddress = address => {
  try {
    if(!address) { return; }

    if(!rootStore.utils.ValidAddress(address)) {
      throw "Invalid Address";
    }
  } catch(error) {
    return rootStore.l10n.components.inputs.validation.invalid_address;
  }
};

export const ValidateSlug = slug => {
  if(slug && !/^[a-zA-Z0-9-]*$/.test(slug)) {
    return rootStore.l10n.components.inputs.validation.invalid_slug;
  }
};

export const Slugify = str =>
  (str || "")
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g,"")
    .replace(/-+/g, "-");

// Note - Unlike other validation functions, ValidateCSS returns additional results, not just the error message
export const ValidateCSS = css => {
  if(!css) { return; }

  const errors = validateCSS(css);

  if(errors.length === 0) { return; }

  return {
    errors,
    errorMessage: (
      <div>
        <div>Errors:</div>
        {
          errors.map((error, index) =>
            <div style={{margin: "10px 0 0 10px"}} key={`error-${index}`}>{`${error.message} at line ${error.line} column ${error.column}`}</div>
          )
        }
      </div>
    )
  };
};
