import React, { useEffect, useRef, useState } from "react";
import { FileType } from "../../../interfaces/models/file";
import { Form } from "react-bootstrap";
import ImagePicker from "../../elements/imagePicker/imagePicker";
import { useToaster } from "../../../hooks/actions/common/appToasterHook";
import { useCommonApi } from "../../../hooks/actions/commonApiCall/appCommonApiCallHook";
import { useUserApi } from "../../../hooks/actions/user/appUserApiHook";
import "../form-elem.css";
import { STATIC_URL } from "../../../../_config";
import { getNameInitials } from "../../../../_config/functions";
import { usePrevious } from "../../../hooks/custom/usePrevious";
import { useAppUserDetailsSelector } from "../../../hooks/selectors/userSelector";
import { useSendBird } from "../../../../hooks/useSendBird";
interface ImageUploadInputProps {
  value: number | undefined;
  onChange: (...args: any) => void;
  onBlur: () => void;
  name: string;
  inputRef: any;
  error?: any;
  id?: string;
  text?: string;
  type?: "admin";
  disabled?: boolean;
}

function ImageUploadInput({
  value,
  name,
  error,
  onChange,
  onBlur,
  inputRef,
  id,
  type,
  text,
  disabled,
}: ImageUploadInputProps) {
  /**
   * const
   */
  const commonApi = useCommonApi();
  const userApi = useUserApi();
  const toast = useToaster();
  const [fileDetails, setFileDetails] = useState<FileType | null>(null);
  const previousValue = usePrevious<number | undefined>(value);
  const hiddenFileInput = useRef<any>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const userSelector = useAppUserDetailsSelector();
  const [userAvatar, setUserAvatar] = useState<any>(null);
  const { updateProfileUrl } = useSendBird();
  /**
   * effects
   */
  useEffect(() => {
    if (userSelector && userSelector.avatar && userSelector.avatar.thumb) {
      setUserAvatar(userSelector.avatar.thumb);
    }
  }, [value, type]);

  /**
   * functions
   */

  // const handleClick = (e: React.MouseEvent) => {
  //   // hiddenFileInput.current.click();
  //   e.preventDefault();
  //   if (hiddenFileInput && hiddenFileInput.current) {
  //     hiddenFileInput.current?.click();
  //     setShowCropModal(true)
  //   }
  // };
  const uploadNewImage = (
    fd: FormData,
    onSuccess: () => {},
    onError: () => {}
  ) => {
    userApi.callUpdateAvatar(
      fd,
      async (message: string, data: any) => {
        console.log("callUpdateAvatar====>uploadNewImage", data);
        toast.success(message);
        if (
          data &&
          data.details &&
          data.details.user &&
          Object.keys(data.details.user).length
        ) {
          onChange(data.details.user);
        }
        onSuccess();
        if (
          data &&
          data.details &&
          data.details.user &&
          data.details.user.avatar &&
          data.details.user.username
        ) {
          await updateProfileUrl(
            data.details.user.username,
            data.details.user.avatar.thumb
          );
        }
      },
      (message: string) => {
        toast.error(message);
        onError();
      }
    );
  };
  /**
   * render functions
   */
  return (
    <React.Fragment>
      <div className="text-center image-upload-area">
        {text ? <div className="upload-text">{text}</div> : null}

        <div className="pro-img-wrap">
          <div className="pro-img">
            {userAvatar ? (
              <img className="avatar" src={userAvatar} alt="Profile Avatar" />
            ) : userSelector &&
              userSelector.full_name &&
              userSelector.full_name.trim() != "" ? (
              <span>{getNameInitials(userSelector.full_name)}</span>
            ) : (
              <span>{getNameInitials(userSelector?.username)}</span>
            )}
            {/* <img src={userAvatar ? userAvatar : STATIC_URL.USER.AVATAR} className="avatar" alt="avatar" /> */}
          </div>
          <a className="">
            <ImagePicker
              shape={"round"}
              onUploadImage={uploadNewImage}
              disabled={disabled}
            />
          </a>
          {/* <input type="file"
            ref={hiddenFileInput}
            style={{ display: 'none' }}
          /> */}
        </div>
      </div>
      {error && error.message ? (
        <>
          <Form.Control.Feedback type="invalid">
            {error.message}
          </Form.Control.Feedback>
        </>
      ) : null}
    </React.Fragment>
  );
}

export default ImageUploadInput;
