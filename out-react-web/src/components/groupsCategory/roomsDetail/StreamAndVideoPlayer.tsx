import React, { useEffect, useRef, useState } from "react";
import { LocalParticipant, RemoteParticipant } from "sendbird-calls";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { getNameInitials, getSubscriptionColor } from "src/_config";
import { useCallContext } from "src/hooks";

const StreamAndVideoPlayer = ({
  member,
  currentMembersWithVideo,
}: {
  member: RemoteParticipant | LocalParticipant;
  currentMembersWithVideo: string[];
}) => {
  const userApi = useUserApi();
  const userSelector = useAppUserDetailsSelector();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [enableView, setEnableView] = useState<boolean>(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const {
    currentCallMembers,
    disabledViews,
    setDisabledViews,
    currentCallRoomId,
  } = useCallContext();

  const { userId, nickname } = member.user;

  function handleDisableView() {
    setEnableView(false);
    setDisabledViews((prev) => {
      if (!prev) return prev;
      if (currentCallRoomId.length <= 0) return prev;
      if (prev[currentCallRoomId]?.includes(userId)) return prev;
      if (!prev[currentCallRoomId]) {
        return { ...prev, [currentCallRoomId]: [userId] };
      }
      return {
        ...prev,
        [currentCallRoomId]: [...prev[currentCallRoomId], userId],
      };
    });
  }

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
      videoRef.current?.removeEventListener("suspend", handleSuspend);

      if (timerId) {
        clearTimeout(timerId); // Clear the timer when unmounting
      }
    };
  }, []);
  useEffect(() => {
    if (showVideo && enableView) {
      if (userSelector?.is_subscribed === null) {
        const timer = setTimeout(() => {          
          setEnableView(false);
          setShowVideo(false);
        }, 14000);
        setTimerId(timer);
        return () => clearTimeout(timer);
      }
    }
  }, [showVideo, enableView]);

  const hidden = !currentMembersWithVideo?.includes(`${userId}`);

  return (
    <>
      <div
        className={`new-video-box-for-remote-users ${hidden ? "hidden" : ""}`}
      >
        {!enableView && (
          <div className="d-flex h-100">
            <a
              href="#"
              onClick={(e) => {
                // handleCloseWebCam(e, members.user_id)
                // setShowVideoPlayer(false);
              }}
              className="close-large-box other-cams-hidden"
            >
              <img src="/img/close-icon.png" alt="" />
            </a>
            <img
              className={"force-banner-show"}
              src={"/img/no-image-webcam.png"}
              alt=""
            />
            <button
              onClick={() => {
                setEnableView(true);
                // if (
                //   roomDetailsSelector &&
                //   roomDetailsSelector.user &&
                //   videoPlayerCount <= videoPlayLimit
                // ) {
                //   // onStartPlaying(`${members.video_stream_id}`, stopWebStream);
                //   setShowVideoPlayer(true)
                //   handleStaticVideoPlay(members.user_id, members.is_cemera, members.is_uploadvideo)
                // }
              }}
              // className={`btn-utw "btn-utw-large" : "btn-utw-small"
              className={`btn-utw btn-utw-large mt-auto mb-5`}
              type="button"
              // disabled={members.is_cemera || members.is_uploadvideo ? false : true}
            >
              {/* {videoPlayerCount <= videoPlayLimit ? "Enable Video" : "Upgrade Now"} */}
              {"Enable Video"}
            </button>
          </div>
        )}
        <video
          style={{ display: showVideo && enableView ? "block" : "none" }}
          ref={videoRef}
          autoPlay
          id={`memberVideoBox-${userId}`}
        ></video>

        {enableView && (
          <button className="cross" onClick={handleDisableView}>
            x
          </button>
        )}
        <div className="footer">
          <span className="name">{member?.user.nickname}</span>
          {enableView && (
            <span onClick={() => {}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M3 21V15H5V17.6L8.1 14.5L9.5 15.9L6.4 19H9V21H3ZM15 21V19H17.6L14.5 15.9L15.9 14.5L19 17.6V15H21V21H15ZM8.1 9.5L5 6.4V9H3V3H9V5H6.4L9.5 8.1L8.1 9.5ZM15.9 9.5L14.5 8.1L17.6 5H15V3H21V9H19V6.4L15.9 9.5Z"
                  fill="white"
                />
              </svg>
            </span>
          )}
        </div>
      </div>
    </>
  );
  return (
    <div
      className={
        true
          ? `large-video-box  ${
              true ? "large-video-large-box" : "large-video-small-box"
            }`
          : "other-cams-hidden"
      }
      id={"subscriber-" + member.user.userId}
    >
      <>
        <a
          href="#"
          onClick={(e) => {}}
          className="close-large-box other-cams-hidden"
          id={"videoclose-" + member.user.userId}
        >
          <img src="/img/close-icon.png" alt="" />
        </a>
        <img
          className={"force-banner-show"}
          src={"/img/no-image-webcam.png"}
          alt=""
          id={"img-" + member.user.userId}
        />
        <button
          onClick={() => {}}
          className={`btn-utw ${
            true && true ? "btn-utw-large" : "btn-utw-small"
          }`}
          id={"btn-" + member.user.userId}
          type="button"
          //   disabled={member.is_cemera || member.is_uploadvideo ? false : true}
        >
          PLACEHOLDER
          {/* {videoPlayerCount <= videoPlayLimit ? "Enable Video" : "Upgrade Now"} */}
        </button>
      </>
      {/* <video className={`remoteVideo-${members.video_stream_id}`} style={{display: showVideoPlayer ? 'block' : 'none'}} autoPlay disablePictureInPicture></video>                 */}
      {/* <VideoCard
                id={id}
                track={track}
                autoPlay
                name={name}
                style={{ display: showVideoPlayer ? 'block' : 'none' }}
                disablePictureInPicture
            /> */}
      <div
        className={`large-video-box-name ${
          true && true
            ? "large-video-box-large-name"
            : "large-video-box-small-name"
        }`}
      >
        <span
          style={{
            color: "yellow",
          }}
        >
          {member.user && member.user.nickname}
          DS
        </span>
        <span>
          {true &&
            (true ? (
              // (largeViewAccess && largeView) ?
              <span onClick={() => {}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M9 9V3H7V5.59L3.91 2.5L2.5 3.91L5.59 7H3V9H9ZM21 9V7H18.41L21.5 3.91L20.09 2.5L17 5.59V3H15V9H21ZM3 15V17H5.59L2.5 20.09L3.91 21.5L7 18.41V21H9V15H3ZM15 15V21H17V18.41L20.09 21.5L21.5 20.09L18.41 17H21V15H15Z"
                    fill="white"
                  />
                </svg>
              </span>
            ) : (
              <span onClick={() => {}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M3 21V15H5V17.6L8.1 14.5L9.5 15.9L6.4 19H9V21H3ZM15 21V19H17.6L14.5 15.9L15.9 14.5L19 17.6V15H21V21H15ZM8.1 9.5L5 6.4V9H3V3H9V5H6.4L9.5 8.1L8.1 9.5ZM15.9 9.5L14.5 8.1L17.6 5H15V3H21V9H19V6.4L15.9 9.5Z"
                    fill="white"
                  />
                </svg>
              </span>
            ))}
        </span>
      </div>
    </div>
  );
};

export default StreamAndVideoPlayer;
