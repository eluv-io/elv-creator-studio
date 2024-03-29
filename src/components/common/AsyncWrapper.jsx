import {observer} from "mobx-react-lite";
import {useEffect, useState} from "react";
import {uiStore} from "@/stores";

const AsyncWrapper = observer(({children, loadingMessage, Load}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);

    const timeout = setTimeout(() => {
      // Give a bit of time for load to start before showing loader, in case load returns instantly
      uiStore.SetLoadingMessage(loadingMessage);
      uiStore.SetLoading(true);
    }, 100);

    Load()
      .finally(() => {
        uiStore.SetLoading(false);
        setLoaded(true);
        clearTimeout(timeout);
      });

  }, []);

  return !loaded ? null :
    typeof children === "function" ? children() : children;
});

export default AsyncWrapper;
