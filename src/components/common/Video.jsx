import EluvioPlayer, {EluvioPlayerParameters} from "@eluvio/elv-player-js";
import {useRef, useEffect} from "react";
import {rootStore} from "@/stores";
import {observer} from "mobx-react-lite";
import {ExtractHashFromLink} from "@/helpers/Fabric.js";

const Video = observer(({videoLink, videoHash, animation, playerOptions={}, className=""}) => {
  const targetRef = useRef();

  useEffect(() => {
    if(!targetRef || !targetRef.current) { return; }

    let playerPromise;
    const timeout = setTimeout(() => {
      let controls;
      if(animation) {
        controls = {
          muted: EluvioPlayerParameters.muted.ON,
          autoplay: EluvioPlayerParameters.autoplay.ON,
          controls: EluvioPlayerParameters.controls.OFF,
          loop: EluvioPlayerParameters.loop.ON
        };
      } else {
        controls = {
          muted: EluvioPlayerParameters.muted.OFF,
          autoplay: EluvioPlayerParameters.autoplay.OFF,
          controls: EluvioPlayerParameters.controls.AUTO_HIDE
        };
      }

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
            ...controls,
            ...playerOptions
          },
        }
      );
    }, 250);

    return async () => {
      clearTimeout(timeout);

      if(!playerPromise) { return; }

      const player = await playerPromise;
      player.Destroy();
    };
  }, [targetRef, videoLink, videoHash, playerOptions, animation]);

  return <div className={className} ref={targetRef} />;
});

export default Video;
