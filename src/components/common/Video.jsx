import EluvioPlayer, {EluvioPlayerParameters} from "@eluvio/elv-player-js";
import {useRef, useEffect} from "react";
import {rootStore} from "Stores";
import {observer} from "mobx-react-lite";
import {ExtractHashFromLink} from "Helpers/Fabric.js";

const Video = observer(({videoLink, videoHash, playerOptions={}, className=""}) => {
  const targetRef = useRef();

  useEffect(() => {
    if(!targetRef || !targetRef.current) { return; }

    let playerPromise;
    const timeout = setTimeout(() => {
      playerPromise = new EluvioPlayer(
        targetRef.current,
        {
          clientOptions: {
            client: rootStore.client
          },
          sourceOptions: {
            playoutParameters: {
              versionHash: videoHash || ExtractHashFromLink(videoLink)
            }
          },
          playerOptions: {
            watermark: EluvioPlayerParameters.watermark.OFF,
            muted: EluvioPlayerParameters.muted.OFF,
            autoplay: EluvioPlayerParameters.autoplay.OFF,
            controls: EluvioPlayerParameters.controls.AUTO_HIDE,
            ...playerOptions
          },
        }
      );
    }, 50);

    return async () => {
      clearTimeout(timeout);

      if(!playerPromise) { return; }

      const player = await playerPromise;
      player.Destroy();
    };
  }, [targetRef, videoLink, videoHash, playerOptions]);

  return <div className={className} ref={targetRef} />;
});

export default Video;
