import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import axios from "axios";
import { store, persistor } from "./store";
import AppLoader from "./_common/components/elements/full-page-loader/appLoader";
import { ACTIONS, API_URL, APP_STAGE, STORAGE } from "./_config";
import { ToastContainer } from "react-toastify";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-contexify/dist/ReactContexify.css";
import {
  CallProvider,
  ChatProvider,
  NotificationProvider,
  FileContextProvider,
} from "./hooks";
// import { WebRTCAdaptor } from './antmedia/webrtc_adaptor';
// import { getUrlParameter } from './antmedia/fetch.stream';
// // import AntMedia from './components/AntmediaCall';

// // import { WebRTCAdaptor , getUrlParameter } from '@antmedia/webrtc_adaptor';
// // const ref = createRef<any>()
// var token = getUrlParameter("token");
// var publishStreamId = getUrlParameter("streamId");
// var playOnly = getUrlParameter("playOnly");
// var subscriberId = getUrlParameter("subscriberId");
// var subscriberCode = getUrlParameter("subscriberCode");
// var isPlaying = false;
// var fullScreenId = -1;

// if (playOnly == null) {
//   playOnly = false;
// }

// var roomOfStream = [];

// var roomTimerId: any = -1;

// function makeFullScreen(divId) {
//   if (fullScreenId == divId) {
//     document.getElementById(divId).classList.remove("selected");
//     document.getElementById(divId).classList.add("unselected");
//     fullScreenId = -1;
//   } else {
//     document.getElementsByClassName("publisher-content")[0].className =
//       "publisher-content chat-active fullscreen-layout";
//     if (fullScreenId != -1) {
//       document.getElementById(fullScreenId).classList.remove("selected");
//       document.getElementById(fullScreenId).classList.add("unselected");
//     }
//     document.getElementById(divId).classList.remove("unselected");
//     document.getElementById(divId).classList.add("selected");
//     fullScreenId = divId;
//   }
// }

// var pc_config = {
//   iceServers: [
//     {
//       urls: "stun:stun1.l.google.com:19302",
//     },
//   ],
// };

// var sdpConstraints = {
//   OfferToReceiveAudio: false,
//   OfferToReceiveVideo: false,
// };

// var videoQualityConstraints = {
//   video: {
//     width: { max: 320 },
//     height: { max: 240 },
//   }
// }

// var audioQualityConstraints = {
//   audio: {
//     noiseSuppression: true,
//     echoCancellation: true
//   }
// }

// var mediaConstraints = {
//   // setting constraints here breaks source switching on firefox.
//   video: videoQualityConstraints.video,
//   audio: audioQualityConstraints.audio,
// };

// let websocketURL = process.env.REACT_APP_WEBSOCKET_URL;
// let websocketURL = "wss://ams-4410.antmedia.cloud:5443/reactConferenceCall/websocket";
// let websocketURL = "wss://antmedia-testing.outrightalk.com/reactConferenceCall/websocket";

// if (!websocketURL) {
//   const appName = window.location.pathname.substring(
//     0,
//     window.location.pathname.lastIndexOf("/") + 1
//   );
//   const path =
//     window.location.hostname +
//     ":" +
//     window.location.port +
//     appName +
//     "websocket";
//   // websocketURL = "ws://" + path;
//   // websocketURL = "wss://media.outrightalk.com/WebRTCAppEE/websocket";
//   websocketURL = "wss://ams-4410.antmedia.cloud:5443/reactConferenceCall/websocket";

//   // if (window.location.protocol.startsWith("https")) {
//   //   websocketURL = "wss://" + path;
//   // }
// }
// let streamsList;

// const webRTCAdaptor: any = new WebRTCAdaptor({
//   websocket_url: websocketURL,
//   mediaConstraints: mediaConstraints,
//   peerconnection_config: pc_config,
//   sdp_constraints: sdpConstraints,
//   isPlayMode: playOnly,
//   debug: true,
//   callback: (info: any, obj: any) => {
//     console.log("INFO", info)
//     if (info === "initialized") {
//     } else if (info === "joinedTheRoom") {
//       console.log("joinedTheRoom")
//       var room = obj.ATTR_ROOM_NAME;
//       roomOfStream[obj.streamId] = room;

//       publishStreamId = obj.streamId;

//       webRTCAdaptor.handleSetMyObj(obj);
//       // streamDetailsList = obj.streamList;

//       webRTCAdaptor.handlePublish(
//         obj.streamId,
//         token,
//         subscriberId,
//         subscriberCode
//       );

//       roomTimerId = setInterval(() => {
//         webRTCAdaptor.handleRoomInfo(publishStreamId);
//       }, 5000);
//     } else if (info == "newStreamAvailable") {
//       webRTCAdaptor.handlePlayVideo(obj, publishStreamId);
//     } else if (info === "publish_started") {
//       //stream is being published
//       webRTCAdaptor.handleRoomInfo(publishStreamId);
//     } else if (info === "publish_finished") {
//       //stream is being finished
//     } else if (info === "screen_share_stopped") {
//       webRTCAdaptor.handleScreenshareNotFromPlatform();
//     } else if (info === "browser_screen_share_supported") {
//     } else if (info === "leavedFromRoom") {
//       room = obj.ATTR_ROOM_NAME;
//       if (roomTimerId !== null) {
//         clearInterval(roomTimerId);
//       }
//     } else if (info === "closed") {
//       if (typeof obj !== "undefined") {
//       }
//     } else if (info === "play_finished") {
//       isPlaying = false;
//     } else if (info === "streamInformation") {
//       webRTCAdaptor.handleStreamInformation(obj);
//     } else if (info === "screen_share_started") {
//       webRTCAdaptor.screenShareOnNotification();
//     } else if (info === "roomInformation") {
//       var tempList = [...obj.streams];
//       tempList.push("!" + publishStreamId);
//       webRTCAdaptor.handleRoomEvents(obj);
//       if (!isPlaying) {
//         webRTCAdaptor.handlePlay(token, tempList);
//         isPlaying = true;
//       }
//       //Lastly updates the current streamlist with the fetched one.
//     } else if (info == "data_channel_opened") {
//       setInterval(() => {
//         webRTCAdaptor.updateStatus(obj);
//       }, 2000);

//       // isDataChannelOpen = true;
//     } else if (info == "data_channel_closed") {
//       // isDataChannelOpen = false;

//     } else if (info == "data_received") {
//       try {
//         webRTCAdaptor.handleNotificationEvent(obj);
//       } catch (e) { }
//     } else if (info == "available_devices") {
//       webRTCAdaptor.devices = obj;
//     } else if (info == "debugInfo") {
//       webRTCAdaptor.handleDebugInfo(obj.debugInfo);
//     }
//     else if (info == "ice_connection_state_changed") {
//       console.log("iceConnectionState Changed: ", JSON.stringify(obj))
//       var iceState = obj.state;
//       if (iceState == null || iceState == "failed" || iceState == "disconnected") {
//         // alert("!! Connection closed. Please rejoin the meeting");
//       }
//     }
//   },
//   callbackError: function (error: any, message: any) {
//     console.log("error---", error)
//     console.log("message---", message)
//     //some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
//     if (error.indexOf("publishTimeoutError") != -1 && roomTimerId != null) {
//       clearInterval(roomTimerId);
//     }

//     var errorMessage = JSON.stringify(error);
//     if (typeof message != "undefined") {
//       errorMessage = message;
//     }
//     errorMessage = JSON.stringify(error);
//     if (error.indexOf("NotFoundError") != -1) {
//       errorMessage =
//         "Camera or Mic are not found or not allowed in your device.";
//       // alert(errorMessage);
//     } else if (
//       error.indexOf("NotReadableError") != -1 ||
//       error.indexOf("TrackStartError") != -1
//     ) {
//       errorMessage =
//         "Camera or Mic is being used by some other process that does not not allow these devices to be read.";
//       // alert(errorMessage);
//     } else if (
//       error.indexOf("OverconstrainedError") != -1 ||
//       error.indexOf("ConstraintNotSatisfiedError") != -1
//     ) {
//       errorMessage =
//         "There is no device found that fits your video and audio constraints. You may change video and audio constraints.";
//       // alert(errorMessage);
//     } else if (
//       error.indexOf("NotAllowedError") != -1 ||
//       error.indexOf("PermissionDeniedError") != -1
//     ) {
//       errorMessage = "You are not allowed to access camera and mic.";
//       webRTCAdaptor.handleScreenshareNotFromPlatform();
//     } else if (error.indexOf("TypeError") != -1) {
//       errorMessage = "Video/Audio is required.";
//       webRTCAdaptor.mediaManager.getDevices();
//     } else if (error.indexOf("UnsecureContext") != -1) {
//       errorMessage =
//         "Fatal Error: Browser cannot access camera and mic because of unsecure context. Please install SSL and access via https";
//     } else if (error.indexOf("WebSocketNotSupported") != -1) {
//       errorMessage = "Fatal Error: WebSocket not supported in this browser";
//     } else if (error.indexOf("no_stream_exist") != -1) {
//       //TODO: removeRemoteVideo(error.streamId);
//     } else if (error.indexOf("data_channel_error") != -1) {
//       errorMessage = "There was a error during data channel communication";
//     } else if (error.indexOf("ScreenSharePermissionDenied") != -1) {
//       errorMessage = "You are not allowed to access screen share";
//       webRTCAdaptor.handleScreenshareNotFromPlatform();
//     } else if (error.indexOf("WebSocketNotConnected") != -1) {
//       errorMessage = "WebSocket Connection is disconnected.";
//     }

//     // alert(errorMessage);
//   },
// });

// function getWindowLocation() {
//   document.getElementById("locationHref").value = window.location.href;
// }

// function copyWindowLocation() {
//   var copyText = document.getElementById("locationHref");

//   /* Select the text field */
//   copyText.select();
//   copyText.setSelectionRange(0, 99999); /* For mobile devices */

//   /* Copy the text inside the text field */
//   document.execCommand("copy");
// }

// window.getWindowLocation = getWindowLocation;
// window.copyWindowLocation = copyWindowLocation;
// window.makeFullScreen = makeFullScreen;

// export const AntmediaContext = React.createContext(webRTCAdaptor);

function Render() {
  // const handleFullScreen = (e: any) => {
  //   if (e.target?.id === "meeting-gallery") {
  //     if (!document.fullscreenElement) {
  //       document.documentElement.requestFullscreen();
  //     } else {
  //       document.exitFullscreen();
  //     }
  //   }
  // };

  // React.useEffect(() => {
  //   window.addEventListener("dblclick", handleFullScreen);

  //   // cleanup this component
  //   return () => {
  //     window.removeEventListener("dblclick", handleFullScreen);
  //   };
  // }, []);

  ReactDOM.render(
    <React.Fragment>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <React.Fragment>
            <AppLoader />
            <div id="my-full-page">
              {/* <AntmediaContext.Provider value={webRTCAdaptor}> */}
              <CallProvider>
                <NotificationProvider>
                  <FileContextProvider>
                    <App />
                  </FileContextProvider>
                </NotificationProvider>
              </CallProvider>
              {/* </AntmediaContext.Provider> */}
            </div>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </React.Fragment>
        </PersistGate>
      </Provider>
    </React.Fragment>,
    document.getElementById("root")
  );
}

function Loader() {
  ReactDOM.render(
    <React.Fragment>
      <div className="loader-container">
        <div className="loader-base">
          <div className="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </React.Fragment>,
    document.getElementById("root")
  );
}

const usertoken = localStorage.getItem(STORAGE);
if (usertoken) {
  try {
    Loader();
    axios({
      method: "GET",
      url: API_URL.USER.DETAILS,
      headers: {
        Authorization: `Bearer ${usertoken}`,
      },
    })
      .then((success) => {
        store.dispatch({
          type: ACTIONS.USER.ME,
          payload: success.data.data.user,
        });
        Render();
      })
      .catch((error) => {
        console.log("error---", error);
        localStorage.removeItem(STORAGE);
        store.dispatch({
          type: ACTIONS.USER.LOGOUT,
        });
        Render();
      });
  } catch (e) {
    console.log("e---", e);

    localStorage.removeItem(STORAGE);
    Render();
  }
} else {
  Render();
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
if (APP_STAGE === "prod") {
  serviceWorker.register();
} else {
  serviceWorker.unregister();
}
