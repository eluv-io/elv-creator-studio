import PropertySectionStyles from "Assets/stylesheets/media_properties/property-section.module.scss";
import BuilderInputsStyles from "./builder-inputs.module.scss";
import PageStyles from "Assets/stylesheets/media_properties/property-page.module.scss";

export const S = (...classes) => classes.map(c => 
  PageStyles[c] || 
  PropertySectionStyles[c] ||
  BuilderInputsStyles[c] ||
  "").join(" ");