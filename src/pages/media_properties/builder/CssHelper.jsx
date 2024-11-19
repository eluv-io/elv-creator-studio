import SectionStyles from "./SectionList.module.css";
import PageStyles from "./media-property-builder.module.scss";
import BuilderInputsStyles from "./builder-inputs.module.scss";

export const S = (...classes) => classes.map(c => 
  PageStyles[c] || 
  SectionStyles[c] || 
  BuilderInputsStyles[c] ||
  "").join(" ");