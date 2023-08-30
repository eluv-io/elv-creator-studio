import {useLocation} from "react-router-dom";
import {useEffect} from "react";
import {ScrollTo} from "@/helpers/Misc.js";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    ScrollTo({top: 0, behavior: "auto"});
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
