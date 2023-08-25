import {rootStore} from "Stores";
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
