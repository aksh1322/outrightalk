import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import Microphone from './audioComponents/Microphone/Microphone';
import AudioPlayer from './audioComponents/AudioPlayer/AudioPlayer';
import { Grid } from '@material-ui/core';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import './audio.css'
const mimeType = "audio/webm";

const AudioVideoSettingSchema = yup.object().shape({
  audio_hotkey: yup.object().when('enable_audio_hotkey', {
    is: true,
    then: (fieldSchema: any) => fieldSchema.required('Field is required'),
  }).nullable(),
  audio_hotkey_char: yup.string().when('enable_audio_hotkey', {
    is: true,
    then: (fieldSchema: any) => fieldSchema.required('Field is required'),
  }).nullable()
})

function AudioSetting() {

  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(AudioVideoSettingSchema),
    defaultValues: {
      enable_audio_hotkey: false,
      audio_hotkey: '',
      audio_hotkey_char: '',
    },
  })
  const preference = useUserPreferenceApi();
  const preferenceSelector = useAppUserPreferencesSelector()
  const toast = useToaster()

  const onSubmit = (values: any) => {
    let params = {
      enable_audio_hotkey: values.enable_audio_hotkey ? 1 : 0,
      audio_hotkey: values.enable_audio_hotkey && values.audio_hotkey && values.audio_hotkey.value ? values.audio_hotkey.value : null,
      audio_hotkey_char: values.enable_audio_hotkey && values.audio_hotkey_char ? values.audio_hotkey_char.toUpperCase() : null
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

        if (preferenceSelector.list[i].field_type_details == "checkbox") {
          let val = parseInt(preferenceSelector.list[i].val) ? true : false;
          setValue(preferenceSelector.list[i].key, val)
        }

        if (preferenceSelector.list[i].field_type_details == "select") {
          let found = preferenceSelector.list[i].field_options.filter((x: any) => x.key == preferenceSelector.list[i].val)
          if (found && found.length) {
            let val = parseInt(preferenceSelector.list[i].val) ? { label: found[0].val, value: found[0].key } : null;
            setValue(preferenceSelector.list[i].key, val)
          }
        }

        if (preferenceSelector.list[i].field_type_details == "text") {
          let val = preferenceSelector.list[i].val;
          setValue(preferenceSelector.list[i].key, val)
        }


      }
    }
  }, [preferenceSelector])

  // useEffect(() => {
  //   let params = {
  //     tab: 'audio_setup'
  //   }
  //   preference.callGetUserPreference(params, (message: string, resp: any) => {
  //   }, (message: string) => {
  //     toast.error(message)
  //   })

  // }, [])

  const [files, setFiles] = useState([null]);

  const pushFile = (file: any) => {
    // setFiles([...files, file]);
    setFiles([file]);
  };

  const [device, setDevice] = useState<any>(null);
  const [devices, setDevices] = useState([]);

  const handleDevices = useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }: any) => kind === "audioinput")),
    [setDevices]
  );

  React.useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },
    [handleDevices]
  );

  console.log("devices", devices)

  const [permission, setPermission] = useState(false);


  const mediaRecorder = useRef<any>(null);

  const [recordingStatus, setRecordingStatus] = useState("inactive");

  const [stream, setStream] = useState<any>(null);

  const [audio, setAudio] = useState(null);

  const [audioChunks, setAudioChunks] = useState([]);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const mediaStream: any = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: {
              exact: device
            }
          },
          video: false,
        });
        console.log(mediaStream)
        setPermission(true);
        setStream(mediaStream);
      } catch (err: any) {
        console.log("err", err)
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    setRecordingStatus("recording");
    const media = new MediaRecorder(stream, { type: mimeType });

    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localAudioChunks: any = [];

    mediaRecorder.current.ondataavailable = (event: any) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      const audioUrl: any = URL.createObjectURL(audioBlob);

      setAudio(audioUrl);

      setAudioChunks([]);
    };
  };
  console.log("DEVICE", device)

  useEffect(() => {
    if (device) {
      getMicrophonePermission()
    }
  }, [device])
  return (
    <React.Fragment>

      <h3>Microphone</h3>

      {
        <FormControl fullWidth className='w-50'>
          <InputLabel id="demo-simple-select-label-audio">Select Device</InputLabel>
          <Select
            style={{
              backgroundColor: "white",
            }}
            labelId="demo-simple-select-label-audio"
            id="demo-simple-select-audio"
            // value={age}
            label="Select Device"
            onChange={(e) => {
              setDevice(e.target.value)

            }}
            autoWidth
          >
            <MenuItem value={""} disabled><em>Select Device</em></MenuItem>

            {devices.map((ele: any) => {
              return (
                <MenuItem value={ele.deviceId} >{ele.label || `Device-` + ele.deviceId}</MenuItem>
              )
            })}
          </Select>
        </FormControl>

      }

      {device && (
        <>
          {/* <Microphone pushFile={pushFile} />
          <Grid container direction="column" spacing={3}>
            {files.map((file, index) => (
              <Grid key={index} item>
                <AudioPlayer file={file} />
              </Grid>
            ))}
          </Grid> */}

          <div className="audio-controls">
            {/* {!permission ? ( */}
            {/* <button onClick={getMicrophonePermission} type="button">
              Get Microphone
            </button> */}
            {/* ) : null} */}
            {permission && recordingStatus === "inactive" ? (
              <button type="button" className="btn theme-btn btn-primary mr-2 waves-effect" onClick={startRecording} >
                Start Recording
              </button>
            ) : null}

            {recordingStatus == "recording" && <h4 style={{ color: "Red" }}>Recording...</h4>}

          </div>
          {audio ? (
            <div className="audio-player">
              <audio src={audio} controls></audio>
            </div>
          ) : null}

          {recordingStatus === "recording" ? (
            <button type="button" className="btn theme-btn btn-default waves-effect" onClick={stopRecording}>
              Stop Recording
            </button>
          ) : null}
        </>
      )}

      {/* Audio setup
      <br />
      Recording control
      <br />
      Playback Display-Record-Stop-Play
      <br /> */}
      <br />

      <p className='hotk'>HotKey</p>
      <br />
      The HotKey is a keyboard button or a combination of keys with Ctrl,Alt or shift that may press in order to speak into the microphone

      <form className="form-horizontal audio_sec" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox">
            <Controller
              control={control}
              name="enable_audio_hotkey"
              render={({ onChange, onBlur, value, name, ref }) => (
                <CheckboxInput
                  name={name}
                  onChange={onChange}
                  classname="custom-control-input"
                  onBlur={onBlur}
                  value={value}
                  id="audio-hot-key"
                  inputRef={ref}
                  label="Default HotKey"
                  error={errors.enable_audio_hotkey}
                />
              )}
            />
          </div>
        </div>
        <div className="row">
          {preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
            field.field_type_details === 'select' && field.key === 'audio_hotkey' ?
              <div className="form-group col-md-6">
                <div className="select-wrap">
                  <div className="w-100">
                    <Controller
                      control={control}
                      name="audio_hotkey"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          dark={true}
                          options={field && field.field_options && field.field_options.length ? field.field_options.map((c: any) => ({
                            value: String(c.key),
                            label: c.val,
                          })) : []}
                          error={errors.audio_hotkey}
                          placeholder="Select"
                        />
                      )}
                    />
                  </div>
                </div>
              </div> : null
          ) : null}

          {preferenceSelector && preferenceSelector.list && preferenceSelector.list.length ? preferenceSelector.list.map((field: any, index: number) =>
            field.field_type_details === 'text' && field.key === 'audio_hotkey_char' ?
              <div className="form-group col-md-6">
                <div className="select-wrap">
                  <div className="w-100 capital-txt">
                    <Controller
                      control={control}
                      name="audio_hotkey_char"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <FormTextInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          type="text"
                          error={errors.audio_hotkey_char}
                          placeholder="Hot Key Char"
                        />
                      )}
                    />
                  </div>
                </div>
              </div> : null
          ) : null}
        </div>


        Enable it to choose another key or combination of keys.

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

export default AudioSetting
