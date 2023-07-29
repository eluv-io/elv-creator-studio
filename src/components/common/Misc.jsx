import {Button} from "@mantine/core";
import {Link} from "react-router-dom";

export const LinkButton = (props) => {
  return <Button component={Link} {...props} />;
};

export const LocalizeString = (text="", variables={}, options={stringOnly: false}) => {
  let result = text
    .split(/{(\w+)}/)
    .filter(s => s)
    .map(token => typeof variables[token] !== "undefined" ? variables[token] : token);

  if(options.stringOnly) {
    return result.join("");
  }

  return (
    <>
      {result}
    </>
  );
};
