import {Button} from "@mantine/core";
import {Link} from "react-router-dom";

export const LinkButton = (props) => {
  return <Button component={Link} {...props} />;
};

