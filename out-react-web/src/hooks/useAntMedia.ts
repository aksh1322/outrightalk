import { reject } from 'lodash';
import { resolve } from 'path';
import { initiateWebrtc } from '../ant_media_adaptor/webrtc_object';

let webRTCPublisherAdaptor: any = null;
let webRTCAudienceAdaptor: any = null;

const useAntMediaHook = () => {

    const onStartPlaying = async (streamId: string, stopStreamFun: any) => {
        webRTCAudienceAdaptor = initiateWebrtc(
            "wss://media.outrightalk.com/WebRTCAppEE/websocket",
            `.remoteVideo-${streamId}`,
            streamId,
            null,
            stopStreamFun
        )
    }

    const publishVideo = async (streamId: string, stream: any) => {
        webRTCPublisherAdaptor = initiateWebrtc(
            "wss://media.outrightalk.com/WebRTCAppEE/websocket",
            "#myVideo",
            streamId,
            stream,
            null
        )
    }

    const stopPublishing = (streamId: string) => {
        webRTCPublisherAdaptor.stop(streamId)
    }


    const enableDisableMic = (mute: any) => {
        if (mute == 1) {
            webRTCPublisherAdaptor.muteLocalMic()
        }
        else {
            webRTCPublisherAdaptor.unmuteLocalMic()
        }
    }

    return {
        onStartPlaying,
        publishVideo,
        stopPublishing,
        enableDisableMic
    }
}

export default useAntMediaHook;