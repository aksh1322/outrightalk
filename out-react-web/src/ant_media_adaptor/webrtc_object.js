import async from 'react-select/async';
import WebRTCAdaptor from './webrtc_adaptor';

export const initiateWebrtc = (url, id, streamId, stream = null, stopStreamFun = null) => {
    let videoId = id === '#myVideo' ? 'localVideoId' : 'remoteVideoId';

    return new WebRTCAdaptor({
        mediaConstraints: {
            video: true,
            audio: true
        },
        streamName: streamId,
        token: 'token',
        peerconnection_config: {
            'iceServers': [{
                'urls': 'stun:stun.l.google.com:19302'
            }]
        },
        sdp_constraints: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        },
        [videoId]: id,
        isPlayMode: true,
        isShow:true,
        debug: true,
        websocket_url: url,
        candidateTypes: ["tcp", "udp"],
        callback: async function (info, obj) {
            if (info === "initialized") {
                console.log("initialized");
                if(stream){
                    obj.publish(streamId, "token", stream)
                } else {
                    obj.play(streamId, "token");
                }
            } else if (info === "play_started") {
                //joined the stream
                console.log("play started");


            } else if (info === "play_finished") {
                // leaved the stream
                console.log("play finished", obj);
                // if(stopStreamFun) stopStreamFun(obj.streamId);
            } else if (info === "closed") {
                //console.log("Connection closed");
                if (typeof obj != "undefined") {
                    console.log("Connecton closed: "
                        + JSON.stringify(obj));
                }
            } else if (info === "streamInformation") {


            } else if (info === "ice_connection_state_changed") {
                console.log("iceConnectionState Changed: ", JSON.stringify(obj));
            } else if (info === "updated_stats") {
                //obj is the PeerStats which has fields
                //averageIncomingBitrate - kbits/sec
                //currentIncomingBitrate - kbits/sec
                //packetsLost - total number of packet lost
                //fractionLost - fraction of packet lost
                console.log("Average incoming kbits/sec: " + obj.averageIncomingBitrate
                    + " Current incoming kbits/sec: " + obj.currentIncomingBitrate
                    + " packetLost: " + obj.packetsLost
                    + " fractionLost: " + obj.fractionLost
                    + " audio level: " + obj.audioLevel);

            } else if (info === "data_received") {
                console.log("Data received: " + obj.event.data + " type: " + obj.event.type + " for stream: " + obj.streamId);
            } else if (info === "bitrateMeasurement") {
                console.log(info + " notification received");

                console.log(obj);
            } else {
                // console.log(info + " notification received");
            }
            return info;
        },
        callbackError: async function (error) {
            //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError

            console.log("error callback: " + JSON.stringify(error));
        }
    })
}