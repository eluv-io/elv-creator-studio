import {InitializeEluvioPlayer, EluvioPlayerParameters} from "@eluvio/elv-player-js/lib/index";
import {useRef, useEffect} from "react";
import {rootStore} from "@/stores";
import {observer} from "mobx-react-lite";
import {ExtractHashFromLink} from "@/helpers/Fabric.js";

const Video = observer(({videoLink, videoLinkInfo, videoHash, animation, playerOptions={}, aspectRatio=16/9, className=""}) => {
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

      playerPromise = InitializeEluvioPlayer(
        targetRef.current,
        {
          clientOptions: {
            client: rootStore.client
          },
          sourceOptions: {
            playoutParameters: {
              versionHash: videoHash || ExtractHashFromLink(videoLink),
              channel: videoLinkInfo.composition_key,
              clipStart: videoLinkInfo?.clip_start_time,
              clipEnd: videoLinkInfo?.clip_end_time
            }
          },
          playerOptions: {
            backgroundColor: "black",
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

  return <div style={{aspectRatio}} className={className} ref={targetRef} />;
});

export default Video;
