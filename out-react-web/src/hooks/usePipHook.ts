import React, { useCallback, useEffect } from "react";
import { closePIP, isInPIP, openPIP } from "src/_config/PipUtils";

interface Options {
  autoPIP: boolean;
}

const defaultOptions: Options = {
  autoPIP: true
};

interface Value {
  enablePIP: () => Promise<void>;
  disablePIP: () => Promise<void>;
  togglePIP: () => Promise<void>;
}

const usePIP = (
  videoElement: React.RefObject<HTMLVideoElement>,
  options = defaultOptions
): Value => {
  const disablePIP = useCallback(async () => {
    await closePIP(videoElement.current).catch(console.warn);
  }, [videoElement]);

  const enablePIP = useCallback(async () => {
    await openPIP(videoElement.current).catch(console.warn);
  }, [videoElement]);

  const handleVisibility = useCallback(async () => {
    if (document.visibilityState === "visible") await disablePIP();
    else await enablePIP();
  }, [disablePIP, enablePIP]);

  const togglePIP = useCallback(async () => {
    if (isInPIP()) await disablePIP();
    else await enablePIP();
  }, [enablePIP, disablePIP]);

  useEffect(() => {
    if (!options.autoPIP) return;
    const video = videoElement.current;

    if (video && "autoPictureInPicture" in video)
      // @ts-ignore
      video.autoPictureInPicture = true;

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [options.autoPIP, videoElement, handleVisibility]);

  return {
    enablePIP,
    disablePIP,
    togglePIP
  };
};

export default usePIP;
