import React, { useEffect, useRef, useState } from "react";
import { LOGIN_STORAGE, getNameInitials } from "src/_config";
import { useCallContext } from "src/hooks";
import ReactDOM from "react-dom";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
type Props = {};

const SinglePmUser = ({ user, userColor, newData,showProfilePic }: any) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { nickname, userId, plainProfileUrl } = user;

  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [isProfileCheck, setIsProfileCheck] =
    useState<boolean>(false);
  const { currentCallMembers } = useCallContext();
  const preferenceSelector = useAppUserPreferencesSelector();
  const userSelector = useAppUserDetailsSelector();

  const value: any = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: signedInUserId,
    send_bird_user: { sb_access_token: signedInUserToken },
  } = value ? JSON.parse(value) :  {
    id: null,
    send_bird_user: { sb_access_token: null },
  };

  useEffect(() => {
    function handleLoadedData() {
      setShowVideo(true);
    }
    function handleSuspend() {
      setShowVideo(false);
    }

    videoRef.current?.addEventListener("loadeddata", handleLoadedData);
    videoRef.current?.addEventListener("suspend", handleSuspend);

    return () => {
      videoRef.current?.removeEventListener("loadeddata", handleLoadedData);
      videoRef.current?.removeEventListener("suspend", handleSuspend);
    };
  }, []);

  useEffect(() => {
    if (
      currentCallMembers.map((mems) => mems?.user.nickname).includes(nickname)
    )
      return;
    setShowVideo(false);
  }, [currentCallMembers]);

  // useEffect(() => {
  //   let profileCheck = preferenceSelector?.list.filter(
  //     (x: any) => x.key == "not_display_profile_pic_pm"
  //   );
  //   if (profileCheck && profileCheck?.length) {
  //     if (parseInt(profileCheck[0]?.val) == 1) {
  //       setIsProfileCheck(false);
  //     } else {
  //       setIsProfileCheck(true);
  //     }
  //   }

  // }, [preferenceSelector]);


  return (
    <div className="room-box room-box-div">
      {/* <div id={'subscriber-' + otherUser.user_id}> */}
      <div
        style={{ display: showVideo ? "none" : "flex" }}
        id={"subscriber-" + nickname}
      >
        {((plainProfileUrl !== "") && (signedInUserId == newData?.user_id || (signedInUserId != newData?.user_id &&  newData?.user_info?.profile_display_preference?.val=="0"))) ? (
          <img src={plainProfileUrl} />
        ) : (
          <p className="room-box-span">{getNameInitials(nickname)}</p>
        )}
      </div>
      <video
        style={{ display: showVideo ? "block" : "none" }}
        ref={videoRef}
        autoPlay
        id={`memberVideoBox-${userId}`}
        muted={+userId === +signedInUserId}
      ></video>
      <div className="room-box-name" style={{ color: userColor }}>
        {nickname}
      </div>
    </div>
  );
};

export default SinglePmUser;
