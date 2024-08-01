import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import FormTextAreaInput from "src/_common/components/form-elements/textarea/textareaInput";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { CRYPTO_SECRET_KEY, SOCKET_URL } from "src/_config";
import { MENU_OPERATIONS } from "src/_config/site_statics";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import { useNotificationsContext, useSendBird } from "src/hooks";
import useSocket from "use-socket.io-client";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface ShareYoutuveVideoProps {
  onClose: () => void;
  shouldShow: boolean;
  getParams: any;
  inviteForUsers: any;
  sender: any;
  // setVideoInviteAccept:any
}

interface ShareYoutubeVideoFormValues {
  url: string;
}

const shareYouTubeVideoSchema = yup.object().shape({
  url: yup.string().required("Url is required"),
});

export default function ShareYoutubeVideoPmModal({
  onClose,
  shouldShow,
  getParams,
  inviteForUsers,
  sender,
  // setVideoInviteAccept
}: ShareYoutuveVideoProps) {
  const pmWindowApi = usePmWindowApi();
  const [socket] = useSocket(SOCKET_URL, {
    autoConnect: false,
  });
  const { isAlert } = useNotificationsContext();
  const { pmId } = useParams<any>();
  const pm_id: number = parseInt(cryptr.decrypt(pmId));
  const { register, control, setValue, reset, handleSubmit, errors } =
    useForm<ShareYoutubeVideoFormValues>({
      resolver: yupResolver(shareYouTubeVideoSchema),
      defaultValues: {
        url: "",
      },
    });

  useEffect(() => {
    socket.connect();
  }, []);

  const onSubmit = (values: ShareYoutubeVideoFormValues) => {
    if (values.url !== "") {
      let url = values.url.trim();
      const urlRegex = /^(https?:\/\/)/i;

      if (!urlRegex.test(url)) {
        toast.error(
          'Invalid URL. Please make sure the URL starts with "http://" or "https://"'
        );
        return;
      }
      // setVideoInviteAccept(true);
      socket.emit("Invite", {
        type: "share",
        payload: {
          pm_id: pm_id,
          url,
          inviteForUsers,

          sender: { id: sender?.id, name: sender?.username },
        },
      });
      getParams(url);
      // localStorage.setItem("isSharing", sender?.id);
      // url = `<a href=${values?.url} target="_blank">${values?.url}</a>`;
      // sendMessageInRoom(url, "chat");
      // onClose();
    }
    // var params = {
    //     room_id: parseInt(cryptr.decrypt(roomId)),
    //     chat_body: values.message,
    //     to_user_id: fetchData.id,
    //     type: fetchData.type,
    //     keep_whisper_channel: whsiperMessageChannelOpen ? 1 : 0
    // }

    // groupCategoryApi.callPostChatInRoom(params, (message: string, resp: any) => {
    //     if (roomId && r_id) {
    //         getRoomDetails()
    //     }
    //     onClose(true)
    // }, (message: string) => {
    //     toast.error(message)
    // })
    return () => {
      socket.disconnect();
      // clearInterval(interval);
    };
  };

  const handleReset = (e: any) => {
    e.preventDefault();
    reset({
      url: "",
    });
  };

  return (
    <React.Fragment>
      <Modal
        show={shouldShow}
        backdrop="static"
        onHide={() => onClose()}
        keyboard={false}
        className="theme-custom-modal"
        dialogClassName="modal-dialog-scrollable"
        size={"lg"}
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <h2>Share Youtube Video</h2>
        </Modal.Header>
        <Modal.Body bsPrefix={"create-room"} className="modal-body pl-0 pr-0">
          <div className="manage-video-message-panel">
            <div className="row">
              <div className="col-sm-12">
                <div className="form-group">
                  <Controller
                    control={control}
                    name="url"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <FormTextAreaInput
                        name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        rows={2}
                        value={value}
                        inputRef={ref}
                        type="textarea"
                        error={errors.url}
                        placeholder="Type url here..."
                      />
                    )}
                  />
                </div>
                {/* <div className="custom-control custom-checkbox">
                                    
                                </div> */}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <div className="d-flex justify-content-between w-100">
            <div className="left-btns">
              <a
                href="#"
                onClick={(e) => handleReset(e)}
                className="btn theme-btn btn-default waves-effect"
              >
                Reset
              </a>
            </div>
            <div className="right-btns">
              <button
                type="button"
                className="btn theme-btn btn-danger waves-effect mr-2 "
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => onClose()}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                className="btn theme-btn btn-primary waves-effect"
              >
                {" "}
                Share
              </button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
