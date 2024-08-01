// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { ReactMic } from "react-mic";
import WaveSurfer from 'wavesurfer.js';
import { makeStyles } from "@material-ui/core/styles";
import MicIcon from "@material-ui/icons/Mic";
import IconButton from "@material-ui/core/IconButton";
import StopIcon from "@material-ui/icons/Stop";
import ReplayIcon from "@material-ui/icons/Replay";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import DoneIcon from "@material-ui/icons/Done";
import CancelIcon from "@material-ui/icons/Cancel";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import Grid from "@material-ui/core/Grid";
import { green, red, blue } from "@material-ui/core/colors";

// import "./microphone.css";

const useStyles = makeStyles(theme => ({
  icon: {
    height: 38,
    width: 38
  },
  reactmic: {
    width: "100%",
    height: 200
  },
  wavesurfer: {
    width: "100%",
  },
  flex: {
    flex: 1
  }
}));

export default function Microphone({ pushFile }) {
  const [record, setRecord] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [tempFile, setTempFile] = React.useState(null);

  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // const[devicePermission,setDevicePermission] = useState(false)
  const wavesurfer = useRef(null);

  useEffect(() => {
    if ((!tempFile)) return;

    wavesurfer.current = WaveSurfer.create({
      container: "#wavesurfer-id",
      waveColor: "grey",
      progressColor: "tomato",
      visualSetting: "frequencyBars",
      height: 140,
      cursorWidth: 1,
      cursorColor: "lightgrey",
      backgroundColor: "white",
      barWidth: 2,
      normalize: true,
      responsive: true,
      fillParent: true
    });

    wavesurfer.current.on("ready", () => {
      setPlayerReady(true);
    });

    const handleResize = wavesurfer.current.util.debounce(() => {
      wavesurfer.current.empty();
      wavesurfer.current.drawBuffer();
    }, 150);

    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    window.addEventListener("resize", handleResize, false);
  }, [open, tempFile]);

  useEffect(() => {
    if (tempFile) {
      wavesurfer.current.load(tempFile.blobURL);
      pushFile(tempFile);
    }
  }, [tempFile]);

  const togglePlayback = () => {
    if (!isPlaying) {
      wavesurfer.current.play();
    } else {
      wavesurfer.current.pause();
    }
  };
  const stopPlayback = () => wavesurfer.current.stop();

  async function getMediaStreamCustom() {
    try {
      let stream;
      stream = await window.navigator.mediaDevices.getUserMedia(
        { audio: true, video: false }
      );
      return true
    } catch (err) {
      return false
    }
  }

  // const handleDone = () => {
  //   if (tempFile) {
  //     pushFile(tempFile);
  //     setTempFile(null);
  //     setRecord(false);

  //   }
  // };


  const startRecording = () => {

    let promise = getMediaStreamCustom();

    promise.then(function (result) {
      if (result) {
        setTempFile(null);
        setRecord(true);
      }
      else {
        console.log('permission not accepted or not found any device')
      }
    });
  };


  const resetRecording = () => {
    setTempFile(null);
    setRecord(false);
    pushFile(null);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onData = recordedBlob => {
    //console.log("chunk of real-time data is: ", recordedBlob);
  };

  const onStop = recordedBlob => {
    setTempFile(recordedBlob);
  };

  const classes = useStyles();

  //   async function getMediaStreamCustom() {
  //     console.log('acquiring_media');
  //     try {
  //         let stream;
  //         stream = await window.navigator.mediaDevices.getUserMedia(
  //             { audio: true, video: false }
  //         );
  //         console.log('ready');
  //     } catch (err) {
  //         console.log('failed');
  //     }
  // }



  return (
    <>
      {tempFile ? (
        <div className={classes.wavesurfer} id="wavesurfer-id" />
      ) : (
        <ReactMic
          record={record}
          className={classes.reactmic}
          onStop={onStop}
          onData={onData}
          mimeType="audio/wav"
          strokeColor="lightgrey"
          backgroundColor="white"
        />
      )}
      {/* </DialogContent> */}
      {/* <DialogActions> */}
      <Grid container>
        {tempFile && (
          <Grid item container justify="center" xs={12}>
            {!isPlaying ? (
              <IconButton onClick={togglePlayback}>
                <PlayArrowIcon className={classes.icon} />
              </IconButton>
            ) : (
              <IconButton onClick={togglePlayback}>
                <PauseIcon className={classes.icon} />
              </IconButton>
            )}
            <IconButton onClick={stopPlayback}>
              <StopIcon className={classes.icon} />
            </IconButton>
          </Grid>
        )}
        <Grid item container justify="center" xs={12}>
          {!record && !tempFile && (
            <IconButton onClick={startRecording}>
              <FiberManualRecordIcon
                style={{ color: red[500] }}
                className={classes.icon}
              />
            </IconButton>
          )}

          {!record && tempFile && (
            <IconButton onClick={resetRecording}>
              <ReplayIcon className={classes.icon} />
            </IconButton>
          )}

          {record && (
            <IconButton onClick={stopRecording}>
              <StopIcon className={classes.icon} />
            </IconButton>
          )}

          {/* <IconButton onClick={handleDone}>
                <DoneIcon
                  style={tempFile && !record ? { color: green[500] } : {}}
                  className={classes.icon}
                />
              </IconButton> */}
          {/* <IconButton onClick={handleCancel}>
                <CancelIcon
                  style={tempFile && !record ? { color: red[500] } : {}}
                  className={classes.icon}
                />
              </IconButton> */}
        </Grid>
      </Grid>
    </>
  );
}