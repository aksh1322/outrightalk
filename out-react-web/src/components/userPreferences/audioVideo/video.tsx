import React, { useEffect, useCallback, useRef, useState } from 'react'
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import Webcam from "react-webcam";
import './audio.css'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
const mimeType = 'video/webm; codecs="opus,vp8"';


const AudioVideoSettingSchema = yup.object().shape({
  // audio_hotkey: yup.object().when('enable_audio_hotkey', {
  //   is: true,
  //   then: (fieldSchema: any) => fieldSchema.required('Field is required'),
  // }).nullable(),
  // video_hotkey: yup.object().when('enable_video_hotkey', {
  //   is: true,
  //   then: (fieldSchema: any) => fieldSchema.required('Field is required'),
  // }).nullable()
})

function VideoSetting() {

  const { register, setValue, handleSubmit } = useForm<any>({
    resolver: yupResolver(AudioVideoSettingSchema),
    defaultValues: {
      video_setup_join_room: false,
      video_setup_automatic_receive_video: false,
      video_setup_show_i_have_webcam_to: false,
    },
  })
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()

  const onSubmit = (values: any) => {
    let params = {
      video_setup_join_room: values.video_setup_join_room ? values.video_setup_join_room : null,
      video_setup_automatic_receive_video: values.video_setup_automatic_receive_video ? values.video_setup_automatic_receive_video : null,
      video_setup_show_i_have_webcam_to: values.video_setup_show_i_have_webcam_to ? values.video_setup_show_i_have_webcam_to : null,

    }
    preference.callSaveUserPreference(params, (message: string, resp: any) => {
      toast.success(message)
    }, (message: string) => {
      toast.error(message)
    })
  }

  useEffect(() => {
    if (preferenceSelector && preferenceSelector.list) {
      for (let i = 0; i < preferenceSelector.list.length; i++) {
        if (preferenceSelector.list[i].field_type_details === "radio") {
          let val = parseInt(preferenceSelector.list[i].val) ? preferenceSelector.list[i].val : null;
          setValue(preferenceSelector.list[i].key, val)
        }
      }
    }
  }, [preferenceSelector])

  // useEffect(() => {
  //   let params = {
  //     tab: 'video_setup'
  //   }
  //   preference.callGetUserPreference(params, (message: string, resp: any) => {
  //   }, (message: string) => {
  //     toast.error(message)
  //   })

  // }, [])





  // const webcamRef = useRef<any>(null);
  // const mediaRecorderRef = useRef<any>(null);
  // const [capturing, setCapturing] = useState(false);
  // const [recordedChunks, setRecordedChunks] = useState([]);
  // const [recording, setRecording] = useState(false)
  // const handleStartCaptureClick = useCallback(() => {
  //   setCapturing(true);
  //   mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
  //     mimeType: "video/webm"
  //   });
  //   mediaRecorderRef.current.addEventListener(
  //     "dataavailable",
  //     handleDataAvailable
  //   );
  //   mediaRecorderRef.current.start();
  // }, [webcamRef, setCapturing, mediaRecorderRef]);

  // const handleDataAvailable = useCallback(
  //   ({ data }) => {
  //     if (data.size > 0) {
  //       setRecordedChunks((prev) => prev.concat(data));
  //     }
  //   },
  //   [setRecordedChunks]
  // );

  // const handleStopCaptureClick = useCallback(() => {
  //   mediaRecorderRef.current.stop();
  //   setCapturing(false);
  // }, [mediaRecorderRef, webcamRef, setCapturing]);



  // const handlePlay = useCallback(() => {
  //   if (recordedChunks.length) {
  //     const blob = new Blob(recordedChunks, {
  //       type: "video/webm"
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const video: any = document.getElementById("video-replay");
  //     video.src = url
  //     // const a = document.createElement("a");
  //     // document.body.appendChild(a);
  //     // a.style = "display: none";
  //     // a.href = url;
  //     // a.download = "react-webcam-stream-capture.webm";
  //     // a.click();
  //     // window.URL.revokeObjectURL(url);
  //     // setRecordedChunks([]);
  //   }
  // }, [recordedChunks]);

  // useEffect(() => {
  //   if (recordedChunks.length > 0 && !recording) {
  //     handlePlay()
  //   }
  // }, [recordedChunks, recording])





  const [permission, setPermission] = useState(false);

  const mediaRecorder = useRef<any>(null);

  const liveVideoFeed = useRef<any>(null);

  const [recordingStatus, setRecordingStatus] = useState("inactive");

  const [stream, setStream] = useState<any>(null);

  const [recordedVideo, setRecordedVideo] = useState(null);

  const [videoChunks, setVideoChunks] = useState([]);

  const getCameraPermission = async () => {
    setRecordedVideo(null);
    //get video and audio permissions and then stream the result media stream to the videoSrc variable
    if ("MediaRecorder" in window) {
      try {
        const videoConstraints = {
          audio: false,
          video: {
            deviceId: {
              exact: device
            }
          },
        };
        // console.log("videoConstraints", videoConstraints.video)
        // const audioConstraints = { audio: true };

        // create audio and video streams separately
        // const audioStream = await navigator.mediaDevices.getUserMedia(
        //   audioConstraints
        // );
        const videoStream = await navigator.mediaDevices.getUserMedia(
          videoConstraints
        );

        setPermission(true);

        //combine both audio and video streams

        const combinedStream: any = new MediaStream([
          ...videoStream.getVideoTracks(),
          // ...audioStream.getAudioTracks(),
        ]);

        setStream(combinedStream);

        //set videostream to live feed player
        liveVideoFeed.current.srcObject = videoStream;
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    setRecordingStatus("recording");

    const media = new MediaRecorder(stream, { mimeType });

    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localVideoChunks: any = [];

    mediaRecorder.current.ondataavailable = (event: any) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localVideoChunks.push(event.data);
    };

    setVideoChunks(localVideoChunks);
  };

  const stopRecording = () => {
    // setPermission(false);
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: mimeType });
      const videoUrl: any = URL.createObjectURL(videoBlob);

      setRecordedVideo(videoUrl);

      setVideoChunks([]);
    };
  };


  const [device, setDevice] = useState<any>(null);
  const [devices, setDevices] = useState([]);

  const handleDevices = useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }: any) => kind === "videoinput")),
    [setDevices]
  );

  React.useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },
    [handleDevices]
  );

  // console.log("device", device)

  useEffect(() => {
    if (device) {
      getCameraPermission()
    }
  }, [device])

  // console.log('videosetup', "permission", permission)
  // console.log('videosetup', "recordingStatus", recordingStatus)
  // console.log('videosetup', "recordedVideo", recordedVideo)

  return (
    <React.Fragment>
      <div className="col-sm-12">
        <div className="row">
          <p>Select your cam</p>
          {/* <p>Video Setup, </p>
          <p>Webcam settings, default will show up</p> */}
        </div>
      </div>

      {
        <FormControl fullWidth className='w-50'>
          <InputLabel id="demo-simple-select-label">Select Device</InputLabel>
          <Select
            style={{
              backgroundColor: "white",
            }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            // value={age}
            label="Select Device"
            onChange={(e) => setDevice(e.target.value)}
            autoWidth
          >
            <MenuItem value={""}><em>Select Device</em></MenuItem>

            {devices.map((ele: any) => {
              return (
                <MenuItem value={ele.deviceId} >{ele.label}</MenuItem>
              )
            })}
          </Select>
        </FormControl>

      }

      {/* <>
        {devices.map((device: any, key) => (
          <div>
            <Webcam audio={false} videoConstraints={{ deviceId: device.deviceId }} />
            {device.label || `Device ${key + 1}`}
          </div>

        ))}
      </> */}
      {
        device && (
          // <>
          //   <Webcam audio={false} ref={webcamRef} height="400" width="500" style={recording ? { display: "block" } : { display: "none" }} videoConstraints={{ deviceId: device.deviceId }} />

          //  <p className='device-label'>{device.label || `Device ${device.deviceId} ` } </p> 
          //   {recordedChunks.length > 0 && <video id="video-replay" height="400" width="500" controls />}
          //   {capturing ? (
          //     <button type="button" className="btn theme-btn btn-default waves-effect stop-capture" onClick={() => {
          //       setRecording(false)
          //       handleStopCaptureClick()
          //     }}>Stop Capture</button>
          //   ) : (
          //     <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect start-capture" onClick={() => {
          //       setRecordedChunks([])
          //       setRecording(true)
          //       handleStartCaptureClick()
          //     }}>Start Capture</button>
          //   )}
          // </>


          <div className='col-md-6'>
            <div className="video-controls">
            {/* {!permission ? ( */}
            {/* <button onClick={getCameraPermission} type="button">
              Get Camera
            </button> */}
            {/* ) : null} */}

            {!recordedVideo ? (
              <>
                <video ref={liveVideoFeed} autoPlay className="live-player"></video>
              </>
            ) : null}
            {recordedVideo ? (
              <div className="recorded-player">
                <video className="recorded" src={recordedVideo} controls></video>
              </div>
            ) : null}

            {recordingStatus == "recording" && <h4 style={{color: "Red"}}>Recording...</h4>}


            {permission && recordingStatus === "inactive" ? (
              <button className="btn theme-btn btn-primary mr-2 waves-effect" onClick={() => {
                setRecordedVideo(null)
                getCameraPermission()
                startRecording()
              }} type="button">
                Start Recording
              </button>
            ) : null}
            {recordingStatus === "recording" ? (
              <button className="btn theme-btn btn-default waves-effect" onClick={stopRecording} type="button">
                Stop Recording
              </button>
            ) : null}
          </div>
          </div>

        )
      }

      {/* {recordedChunks.length > 0 && (
          <button onClick={handlePlay}>Play</button>
        )} */}

      <form className="form-horizontal video_sec" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox cus-div">
            {
              preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
                field.field_type_details === 'radio' && field.key === 'video_setup_join_room' ?
                  <div key={index} className="form-group">
                    <label>{field.field_label ? field.field_label : 'When i join a room:'}</label>
                    <div className="d-flex">
                      {
                        field && field.field_options && field.field_options.length ? field.field_options.map((op: any, ind: number) =>
                          <div key={ind} className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox mr-3">
                            <input type="radio"
                              name={field.key} className="custom-control-input"
                              id={field.key + '-' + op.key} value={op.key} ref={register}
                            />
                            <label className="custom-control-label"
                              htmlFor={field.key + '-' + op.key}>
                              {op.val}
                            </label>
                          </div>) : <span className="no-option">no option found</span>
                      }
                    </div>
                  </div>
                  :
                  field.field_type_details === 'radio' && field.key === 'video_setup_automatic_receive_video' ?
                    <div key={index} className="form-group">
                      <label>{field.field_label ? field.field_label : 'Automatically Receive video from'}</label>
                      <div className="d-flex">
                        {
                          field && field.field_options && field.field_options.length ? field.field_options.map((op: any, ind: number) =>
                            <div key={ind} className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox mr-3">
                              <input type="radio"
                                name={field.key} className="custom-control-input"
                                id={field.key + '-' + op.key} value={op.key} ref={register}
                              />
                              <label className="custom-control-label"
                                htmlFor={field.key + '-' + op.key}>
                                {op.val}
                              </label>
                            </div>) : <span className="no-option">no option found</span>
                        }
                      </div>
                    </div>
                    :
                    field.field_type_details === 'radio' && field.key === 'video_setup_show_i_have_webcam_to' ?
                      <div key={index} className="form-group">
                        <label>{field.field_label ? field.field_label : 'Show that I have webcam to'}</label>
                        <div className="d-flex">
                          {
                            field && field.field_options && field.field_options.length ? field.field_options.map((op: any, ind: number) =>
                              <div key={ind} className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox mr-3">
                                <input type="radio"
                                  name={field.key} className="custom-control-input"
                                  id={field.key + '-' + op.key} value={op.key} ref={register}
                                />
                                <label className="custom-control-label"
                                  htmlFor={field.key + '-' + op.key}>
                                  {op.val}
                                </label>
                              </div>) : <span className="no-option">no option found</span>
                          }
                        </div>
                      </div> : null
              ) : null
            }
          </div>
        </div>
        <div className="form-group">
          <div className="d-flex mt-5">
            <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Apply</button>
            <button type="button" className="btn theme-btn btn-default waves-effect">Cancel</button>
          </div>
        </div>
      </form>

    </React.Fragment >
  )
}

export default VideoSetting
