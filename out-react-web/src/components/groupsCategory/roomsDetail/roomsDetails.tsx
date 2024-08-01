import React, { useEffect, useState, useContext } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import ChatWindowComponent from "../common/chatWindow";
import { toast } from "react-toastify";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import {
  useAppRoomDetailsSelector,
  useAppRoomOthersMemberModalOpen,
} from "src/_common/hooks/selectors/groupCategorySelector";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import RoomsDetailsUsersSidebarPage from "./roomsDetailsUsersSidebar";
import RoomSettingModal from "../roomsList/roomSettingModal/masterSettingModal";
import RoomAdminControlPanelModal from "./modal/adminControlPanelModal";
import OtherRoomMembers from "../roomsDetail/otherRoomMembers";
import PlayVideo from "../roomsDetail/playVideo";
import ViewProfileModal from "src/components/commonModals/viewProfileModal/viewProfileModal";
import AddToFavouriteFolderSelectionModal from "src/components/commonModals/addToFavouriteFolderSelectionModal/addToFavouriteFolderSelectionModal";
import { useParams } from "react-router";
import {
  useAppActiveRouteSelector,
  useAppRoomSettingModalOpen,
  useAppRoomAdminControlModalOpen,
  useAppRoomMembersLargeViewSelector,
} from "src/_common/hooks/selectors/groupCategorySelector";

import {
  CRYPTO_SECRET_KEY,
  HEADER_MENU_SELECTION_TYPE,
  getBooleanStatus,
  getSingularPluralString,
  getRoomTypeValidation,
  getSubscriptionColor,
  LOGIN_STORAGE,
} from "src/_config";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import InviteToRoomModal from "src/components/commonModals/inviteToRoomModal/inviteToRoomModal";
import { useFavouritesApi } from "src/_common/hooks/actions/favourites/appFavouritesApiHook";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import {
  useCallContext,
  useChatContext,
  useSendBird,
  useSendBirdCall,
} from "src/hooks";
import { GroupChannel, MessageFilter } from "@sendbird/chat/groupChannel";
import ShareWithOthersIMSModal from "src/components/commonModals/inviteToRoomModal/shareWithOthersIMSModal";
// import { MediaSettingsContext } from 'src/containers/groupsCategory/roomsDetail/roomsDetails';
// import { AntmediaContext } from 'src';
// import { SettingsContext } from 'src/containers/groupsCategory/roomsDetail/roomsDetails';

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

function RoomsDetailsPage({
  // myLocalData,
  //  participants,
  roomName,
}: any) {
  // const settings = useContext(SettingsContext);

  // const mediaSettings = useContext<any>(MediaSettingsContext)
  const commonApi = useCommonApi();
  const roomDetailsSelector = useAppRoomDetailsSelector();

  const groupCategoryAction = useAppGroupCategoryAction();
  const roomSettingModalOpenSelector = useAppRoomSettingModalOpen();
  const roomAdminControlModalOpenSelector = useAppRoomAdminControlModalOpen();
  const roomOthersMemberModalSelector = useAppRoomOthersMemberModalOpen();
  const { groupId, roomId } = useParams<any>();
  const groupCategoryApi = useGroupCategoryApi();
  const r_id: number = parseInt(cryptr.decrypt(roomId));
  const g_id: number = parseInt(cryptr.decrypt(groupId));
  const [roomMembers, setRoomMembers] = useState<any>();
  const fromRoute = useAppActiveRouteSelector();
  const [camOrVideoActive, setCamOrVideoActive] = useState<boolean>(false);
  const userSelector = useAppUserDetailsSelector();
  const roomMembersLargeViewSelector = useAppRoomMembersLargeViewSelector();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<number>();
  const [showInviteToRoomModal, setShowInviteToRoomModal] =
    useState<boolean>(false);
  const [shareWithOthersIMSModal, setShareWithOthersIMSModal] =
    useState<boolean>(false);
  const [isPlayVideoShow, setIsPlayVideoShow] = useState<boolean>(false);
  const userApi = useUserApi();
  const [roomTimeStamp, setRoomTimeStamp] = useState<any>();
  const [otherCamsOpenClose, setOtherCamsOpenClose] = useState<boolean>(false);
  const [playVideoOpenClose, setPlayVideoOpenClose] = useState<boolean>(false);

  const [folderSelectionModal, setFolderSelectionModal] =
    useState<boolean>(false);
  const [alert, setAlert] = useState<any>(null);
  const favouriteApi = useFavouritesApi();
  const { setVideoAccess, setAudioAccess } = useCallContext();

  const showOtherRoomMembers = () => {
    let camFound =
      roomDetailsSelector &&
      roomDetailsSelector.members &&
      roomDetailsSelector.members.length
        ? roomDetailsSelector.members.filter((x: any) => x.is_cemera == 1)
        : [];
    let videoFound =
      roomDetailsSelector &&
      roomDetailsSelector.members &&
      roomDetailsSelector.members.length
        ? roomDetailsSelector.members.filter(
            (x: any) => x.is_uploadvideo != null
          )
        : [];
    setOtherCamsOpenClose((prev) => !prev);
    if ((camFound && camFound.length) || (videoFound && videoFound.length)) {
      groupCategoryAction.showRoomOtherMembersModal(
        !roomOthersMemberModalSelector
      );
    }
  };

  const showPlayVideo = (e: any) => {
    e.preventDefault();
    setIsPlayVideoShow(!isPlayVideoShow);
    // setPlayVideoOpenClose(!playVideoOpenClose)
  };

  const toogleRoomFavouriteAddRemove = (e: any, status: boolean) => {
    e.preventDefault();
    switch (status) {
      case true:
        // removeAsFavourite()
        showRemoveFavouriteAlert();
        break;
      case false:
        // addAsFavourite()
        openFavouriteFolderSelectionModal();
        break;
      default:
        break;
    }
  };

  // const addAsFavourite = () => {
  //     const params = {
  //         room_id: r_id
  //     };
  //     groupCategoryApi.callAddAsFavourite(params, (message: string, resp: any) => {
  //         if (resp) {
  //             getRoomDetails()
  //         }
  //     }, (message: string) => {
  //         toast.error(message)
  //     })
  // }

  const getRoomFavouriteRoomList = () => {
    favouriteApi.callGetRommFavouriteFoldersList(
      (message: string, resp: any) => {
        if (resp) {
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const removeAsFavourite = () => {
    const params = {
      room_id: r_id,
    };
    groupCategoryApi.callRemoveFavourite(
      params,
      (message: string, resp: any) => {
        if (resp) {
          hideAlert();
          getRoomDetails();
          getRoomFavouriteRoomList();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getRoomDetails = () => {
    const params = {
      room_id: r_id,
    };
    groupCategoryApi.callGetRoomDetails(
      params,
      (message: string, resp: any) => {
        if (resp) {
          //Update Timestamp toogle Reducer data
          groupCategoryAction.roomChatTimestampToogle(
            getBooleanStatus(
              resp &&
                resp.user &&
                resp.user.room_user_settings &&
                resp.user.room_user_settings.timestamp
            )
          );
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  useEffect(() => {
    getRoomDetails();
    getAllChatFromRoom();
  }, [fromRoute]);

  //chat related code

  const getAllChatFromRoom = () => {
    const params = {
      room_id: r_id,
      download: false,
      isPM: false,
    };
    groupCategoryApi.callGetAllChatFromRoom(
      params,
      (message: string, resp: any) => {
        if (resp && resp.chatfile) {
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  const shareWithIms = (e: any) => {
    e.preventDefault();
    var dummy = document.createElement("input"),
      text = window.location.href;
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    toast.success("Url copied to Clipboard");
  };

  const { joinARoom, populateCurrentRoomChat } = useSendBird();
  const { startCall, endCall, onStartVideo, onStopVideo, onMute, onUnmute } =
    useSendBirdCall("group");
  const { currentRoomURL, currentSuperRoomURL } = useChatContext();
  const { currentCallMembers, openCall, remoteParticipants } = useCallContext();
  const [closedStreams, setClosedStreams] = useState<any>([]);
  function getClosedStreams(closedStreams: any) {
    setClosedStreams([...closedStreams]);
  }

  // useEffect(() => {
  //     roomMemberDataConstruct()
  //     // getAutoSaveStatus()
  // }, [roomDetailsSelector, mediaSettings.cam, participants, closedStreams])

  const getAutoSaveStatus = () => {
    if (
      roomDetailsSelector &&
      roomDetailsSelector.room &&
      roomDetailsSelector.room.id
    ) {
      var params = {
        room_id: roomDetailsSelector.room.id,
      };
      commonApi.callGetAutoSaveStatus(
        params,
        (message: string, resp: any) => {},
        (message: string) => {
          toast.error(message);
        }
      );
    } else {
      // toast.error('Room Id not found')
    }
  };

  const roomMemberDataConstruct = () => {
    // if (userSelector && roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length) {
    //     let roomMember = roomDetailsSelector.members;
    //     const newRoomData = roomMember.filter((x: any) => x.user_id != userSelector.id).map((obj: any, index: number) => {
    //         return {
    //             ...obj,
    //             videoStatus: 1,
    //             streamData: null,
    //             videoUrl: null,
    //         }
    //     })
    //     // console.log("roomDetails", "newRoomData", newRoomData)
    //     let finalArr: any = []
    //     console.log("otherRoomMembers", "newRoomData", newRoomData)
    //     console.log("otherRoomMembers", "mediaSettings.cam", mediaSettings.cam)
    //     console.log("otherRoomMembers", "mediaSettings.participants", mediaSettings.participants)
    //     newRoomData.forEach((member: any, index: any) => {
    //         // console.log("roomDetails", "member", member)
    //         // console.log("closed streams include", member.user_id, closedStreams.includes(member.user_id))
    //         if (!closedStreams.includes(member.user_id)) {
    //             let findAny = mediaSettings.cam.toReversed().find((ele: any) => ele.eventStreamId == member.video_stream_id && ele.isCameraOn == true)
    //             // console.log("roomDetails", "findAny", findAny)
    //             console.log("otherRoomMembers", "findAny", findAny)
    //             if (findAny) {
    //                 let findParticipantDetails = participants.toReversed().find((ele: any) => ele.id = findAny.eventStreamId)
    //                 // console.log("roomDetails", "findParticipantDetails", findParticipantDetails)
    //                 console.log("otherRoomMembers", "findParticipantDetails", findParticipantDetails)
    //                 if (findParticipantDetails) {
    //                     member.participant_id = findParticipantDetails.id
    //                     member.participant_track = findParticipantDetails.track
    //                     member.participant_name = findParticipantDetails.name
    //                     finalArr.push(member)
    //                 }
    //             }
    //         }
    //     })
    //     console.log("otherRoomMembers", "finalArr", finalArr)
    //     // console.log("roomDetails", "finalArr", finalArr)
    //     setRoomMembers(finalArr)
    // }
  };
  // useEffect(() => {
  //     // console.log('About Room Info', roomDetailsSelector);

  //     if (userSelector && roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length) {

  //         let findAny = mediaSettings.cam.filter((ele: any) => ele.eventStreamId != "localVideo" && ele.isCameraOn == true)

  //         if (findAny && findAny.length) {
  //             setCamOrVideoActive(true)
  //         } else {
  //             setCamOrVideoActive(false)
  //             setOtherCamsOpenClose(false)
  //         }

  //         // let camVideoFound = roomDetailsSelector && roomDetailsSelector.members && roomDetailsSelector.members.length ? roomDetailsSelector.members.filter((x: any) => x.user_id != userSelector.id && (x.is_cemera == 1 || x.is_uploadvideo != null)) : [];

  //         // if (camVideoFound && camVideoFound.length) {
  //         //     setCamOrVideoActive(true)
  //         // } else {
  //         //     setCamOrVideoActive(false)
  //         //     setOtherCamsOpenClose(false)
  //         // }

  //         let otherCamsOn = roomDetailsSelector.members.filter((x: any) => x.user_id != userSelector.id && (x.video_stream_id !== null));

  //         if (otherCamsOn && otherCamsOn.length) {
  //             setCamOrVideoActive(true)
  //             // setOtherCamsOpenClose(true);
  //         }
  //     }

  // }, [userSelector, roomDetailsSelector])

  //favourite Folder selectiom modal
  const openFavouriteFolderSelectionModal = () => {
    setFolderSelectionModal(true);
  };

  const closeFavouriteFolderSelectionModal = () => {
    if (folderSelectionModal) setFolderSelectionModal(false);
  };

  //Profile view modal
  const handleViewProfile = (e: any, id: any) => {
    e.preventDefault();
    setSelectedUserId(id);
    setShowModal(true);
  };

  const onModalClose = () => {
    setShowModal(false);
  };
  const handleShareWithOthersIMS = (e: any) => {
    e.preventDefault();
    setShareWithOthersIMSModal(true);
  };
  const handleInviteToRoom = (e: any) => {
    e.preventDefault();
    setShowInviteToRoomModal(true);
  };

  const inviteToRoom = (params: any) => {
    params.room_link = window.location.href;
    params.room_id=r_id;
    params.isVIP=roomDetailsSelector?.room?.room_category_id ==5 ? true :false;
    userApi.callInviteToRoom(
      params,
      (message: string, resp: any) => {
        setShowInviteToRoomModal(false);
        toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleLikeRoom = (e: any) => {
    e.preventDefault();
    const params = {
      room_id: r_id,
    };

    groupCategoryApi.callLikeRoom(
      params,
      (message: string, resp: any) => {
        getRoomDetails();
        toast.success(message);
      },
      (message: string) => {}
    );
    // groupCategoryApi.callRemoveLikeRoom(params, (message: string, resp: any) => {

    // }, (message: string) => {

    // })
  };

  const handleUnLikeRoom = (e: any) => {
    e.preventDefault();
    const params = {
      room_id: r_id,
    };

    groupCategoryApi.callRemoveLikeRoom(
      params,
      (message: string, resp: any) => {
        getRoomDetails();
      },
      (message: string) => {}
    );
  };

  const handlePlayVideoIsShow = () => {
    if (
      userSelector &&
      roomDetailsSelector &&
      roomDetailsSelector.play_video &&
      roomDetailsSelector.play_video.length
    ) {
      for (let i = 0; i < roomDetailsSelector.play_video.length; i++) {
        let found = roomDetailsSelector.play_video[i].users.filter(
          (x: any) => x.user_id == userSelector.id
        );
        if (found && found.length) {
          return false;
        }
      }
    }
    return true;
  };

  const handleClearMyChat = () => {
    // let params = {}
    // groupCategoryApi.callClearMyChat(params, (message: string, resp: any) => {
    //     toast.success(resp.message)
    // }, (message: string) => {
    //     toast.error(message)
    // })
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const showRemoveFavouriteAlert = () => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes"
        cancelBtnText="No"
        cancelBtnBsStyle="danger"
        confirmBtnBsStyle="success"
        allowEscape={false}
        closeOnClickOutside={false}
        title={`Remove Favourite`}
        onConfirm={() => removeAsFavourite()}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {`Are you sure you want to delete this room from your Favorites?`}
      </SweetAlert>
    );
  };

  useEffect(() => {
    if (!currentSuperRoomURL) return;
    let collection: any;
    (async () => {
      const room = (await joinARoom(
        currentSuperRoomURL,
        "group"
      )) as GroupChannel;

      const filter = new MessageFilter();
      const limit = 300;
      const startingPoint = Date.now();

      if (room) {
        collection = room?.createMessageCollection({
          filter,
          limit,
          startingPoint,
        });

        collection?.setMessageCollectionHandler({
          onChannelUpdated: async () => {
            await populateCurrentRoomChat("group");
          },
        });
      }
    })();

    return () => {
      if (collection) {
        collection.dispose();
      }
    };
  }, [currentSuperRoomURL]);

  useEffect(() => {
    //   onMute()
    //   onStopVideo()
    //   setAudioAccess(false)
    //   setVideoAccess(false)

    return () => {
      endCall();
    };
  }, []);

  const signInAs = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: userId,
    send_bird_user: { sb_access_token },
  } = signInAs ? JSON.parse(signInAs) : {
    id: null,
    send_bird_user: { sb_access_token: null }
  };;

  const currentMembersWithVideo = currentCallMembers
    .filter((mems) => {
      return mems?.isVideoEnabled && +mems?.user?.userId !== +userId;
    })
    .map((mems) => {
      return mems?.user.userId;
    });

  useEffect(() => {
    if (currentMembersWithVideo?.length <= 0) {
      setOtherCamsOpenClose(false);
    }
  }, [currentMembersWithVideo]);

  const handleGetParams = (selections: string[]) => {
    let action = "";
    if (selections.includes("email")) {
      action = "Email";
    } else if (selections.includes("facebook")) {
      action = "Facebook";
    } else if (selections.includes("twitter")) {
      action = "Twitter";
    } else if (selections.includes("google_talk")) {
      action = "GoogleTalk";
    }

    switch (action) {
      case "Email":
        setShareWithOthersIMSModal(false);
        setShowInviteToRoomModal(true);
        break;
      case "Facebook":
        setShareWithOthersIMSModal(false);
        window.open("https://www.facebook.com/", "_blank");
        break;
      case "Twitter":
        setShareWithOthersIMSModal(false);
        window.open("https://www.twitter.com/", "_blank");
        break;
      case "GoogleTalk":
        setShareWithOthersIMSModal(false);
        window.open("https://hangouts.google.com/", "_blank");
        break;
      default:
        setShareWithOthersIMSModal(false);
    }
  };

  return (
    <React.Fragment>
      {alert}
      <div className="col-sm-9">
        <div className="page-heading-panel d-flex justify-content-between">
          <h1
            style={{
              color: getSubscriptionColor(
                roomDetailsSelector && roomDetailsSelector.room
                  ? roomDetailsSelector.room
                  : null
              ),
            }}
          >
            {roomDetailsSelector &&
            roomDetailsSelector.room &&
            roomDetailsSelector.room.room_name
              ? roomDetailsSelector.room.room_name
              : ".."}
          </h1>
          <div className="d-flex two-video-btns">
            {getRoomTypeValidation(
              roomDetailsSelector &&
                roomDetailsSelector.room &&
                roomDetailsSelector.room.type
            ) ? (
              <div className="d-flex mr-2">
                <button
                  onClick={() => {
                    roomMemberDataConstruct();
                    // setOtherCamsOpenClose(prev => !prev)
                    showOtherRoomMembers();
                  }}
                  disabled={!openCall || currentMembersWithVideo.length === 0}
                  className={"mail-action-btn waves-effect other-online"}
                >
                  <i
                    className={
                      camOrVideoActive
                        ? "other-member-online-icon"
                        : "other-member-off-icon"
                    }
                  />
                  {otherCamsOpenClose ? "Close Cams" : "Open Cams"}
                  {/* Other Cams */}
                </button>
              </div>
            ) : null}
            <div className="d-flex">
              <button
                disabled={handlePlayVideoIsShow()}
                onClick={(e) => showPlayVideo(e)}
                className="mail-action-btn waves-effect other-online"
              >
                {/* <i className={camOrVideoActive ? "other-member-online-icon" : "other-member-off-icon"} /> */}
                {isPlayVideoShow && handlePlayVideoIsShow() === false
                  ? "Close Video"
                  : "Open Video"}
                {/* Play Video */}
              </button>
            </div>
          </div>
        </div>
        <div className="room-info-wrap dark-box-inner-small-padding">
          <div className="row">
            <div className="col-sm-7">
              <div className="room-info-left">
                <div className="room-img">
                  <img
                    src={
                      roomDetailsSelector &&
                      roomDetailsSelector.room &&
                      roomDetailsSelector.room.room_picture &&
                      roomDetailsSelector.room.room_picture.thumb
                        ? roomDetailsSelector.room.room_picture.thumb
                        : "/img/room-img.jpg"
                    }
                    alt="room"
                  />
                </div>
                <div className="room-info-left-wrap">
                  {roomDetailsSelector &&
                  roomDetailsSelector.room_owner &&
                  roomDetailsSelector.room_owner.user_id ? (
                    <div className="room-info-list">
                      {<img src="/img/user-icon.png" alt="owner" />}
                      <span>Owner : </span>
                      <a
                        href="#"
                        style={{
                          paddingLeft: "8px",
                          fontSize: "18px",
                        }}
                        onClick={(e) =>
                          handleViewProfile(
                            e,
                            roomDetailsSelector.room_owner.user_id
                          )
                        }
                      >
                        {roomDetailsSelector &&
                        roomDetailsSelector.room_owner &&
                        roomDetailsSelector.room_owner.details &&
                        roomDetailsSelector.room_owner.customize_nickname &&
                        roomDetailsSelector.room_owner.customize_nickname
                          .nickname
                          ? roomDetailsSelector.room_owner.customize_nickname
                              .nickname
                          : roomDetailsSelector.room_owner.details.username}
                        {roomDetailsSelector.room_owner.details &&
                          roomDetailsSelector.room_owner.details.user_badge &&
                          roomDetailsSelector.room_owner.details.user_badge
                            .current_badge &&
                          new Date(
                            roomDetailsSelector.room_owner.details.user_badge.expiry_date.replaceAll(
                              "-",
                              "/"
                            )
                          ).getTime() > new Date().getTime() && (
                            <img
                              src={
                                roomDetailsSelector.room_owner.details
                                  .user_badge.current_badge.icon.original
                              }
                              alt="badge"
                              style={{
                                marginLeft: "4px",
                                verticalAlign: "middle",
                                width: "12px",
                                height: "auto",
                              }}
                            />
                          )}
                      </a>
                    </div>
                  ) : null}

                  <div className="room-info-list">
                    <img src="/img/member-icon.png" alt="members" />
                    {roomDetailsSelector &&
                    roomDetailsSelector.members &&
                    roomDetailsSelector.members.length
                      ? roomDetailsSelector.members.length > 1
                        ? getSingularPluralString(
                            roomDetailsSelector.members.length,
                            "Member"
                          )
                        : getSingularPluralString(
                            roomDetailsSelector.members.length,
                            "Member"
                          )
                      : getSingularPluralString(1, "Member")}
                  </div>
                  <div className="room-info-list">
                    <img src="/img/webcam-icon.png" alt="webcam" />
                    {
                      // roomDetailsSelector && roomDetailsSelector.room && roomDetailsSelector.room.total_camera_on ?
                      //     (roomDetailsSelector.room.total_camera_on > 1 ? getSingularPluralString(roomDetailsSelector.room.total_camera_on, "Webcam") : getSingularPluralString(roomDetailsSelector.room.total_camera_on, "Webcam")) : getSingularPluralString(0, "Webcam")
                      roomDetailsSelector &&
                      roomDetailsSelector.members &&
                      roomDetailsSelector.members.length
                        ? roomDetailsSelector.members.filter(
                            (x: any) => x.is_cemera == 1
                          ).length
                        : 0
                    }{" "}
                    Webcam
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-5">
              <div className="room-info-right-wrap">
                <div className="room-info-list">
                  {roomDetailsSelector &&
                  roomDetailsSelector.room &&
                  roomDetailsSelector.room.is_like_count ? (
                    <>
                      <a href="#" onClick={(e) => handleUnLikeRoom(e)}>
                        <img src="/img/like-icon.png" alt="unlikes" />
                        Unlike
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="#" onClick={(e) => handleLikeRoom(e)}>
                        <img src="/img/unlike-icon.png" alt="likes" />
                        Like
                      </a>
                    </>
                  )}
                </div>
                <div className="room-info-list">
                  <a
                    href="#"
                    onClick={(e) =>
                      toogleRoomFavouriteAddRemove(
                        e,
                        getBooleanStatus(
                          roomDetailsSelector &&
                            roomDetailsSelector.room &&
                            roomDetailsSelector.room.is_favourite_count
                        )
                      )
                    }
                  >
                    {/* <img src="/img/add-fav-icon.png" alt="favourite" /> */}
                    {roomDetailsSelector &&
                    roomDetailsSelector.room &&
                    getBooleanStatus(
                      roomDetailsSelector.room.is_favourite_count
                    ) ? (
                      <>
                        <img src="/img/add-fav-icon.png" alt="favourite" />
                        Remove from favourite
                      </>
                    ) : (
                      <>
                        <img
                          src="/img/remove-favourite-icon.png"
                          alt="favourite"
                        />
                        Add to favourite
                      </>
                    )}
                  </a>
                </div>
                <div className="room-info-list">
                  <a
                    href="#"
                    // onClick={shareWithIms}
                    onClick={handleShareWithOthersIMS}
                  >
                    <img src="/img/share-icon.png" alt="share" />
                    Share with other IMs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* {
                    roomMembersLargeViewSelector && roomMembersLargeViewSelector.length ?
                        <OtherRoomMembersLargeView />
                        : null
                } */}

        <OtherRoomMembers
          otherCamsOpenClose={otherCamsOpenClose}
          // roomMembers={roomMembers && roomMembers.members && roomMembers.members.length ? roomMembers.members : []}
          // roomMembers={roomMembers && roomMembers.length ? roomMembers : []}
          // // myLocalData={myLocalData}
          // // participants={participants}
          // getClosedStreams={getClosedStreams}

          // roomMembers={roomMembers}
          // streams={streams.map((obj: any) => ({ ...obj, userId: obj && obj.name != "" ? JSON.parse(obj.name).id : null, username: obj && obj.name != "" ? JSON.parse(obj.name).username : null, roomId: obj && obj.name != "" ? JSON.parse(obj.name).roomId : null, videoStatus: 1 }))}
          // session={currentSession}
        />
        {isPlayVideoShow ? (
          <PlayVideo
            roomMembers={roomMembers && roomMembers.length ? roomMembers : []}
            isPlayVideoShow={isPlayVideoShow}
          />
        ) : null}

        {/* </div> */}

        <ChatWindowComponent
          fetchRoomDetailsData={roomDetailsSelector}
          roomId={r_id}
        />
      </div>

      <RoomsDetailsUsersSidebarPage
        onStartVideo={onStartVideo}
        onStopVideo={onStopVideo}
        onMute={onMute}
        onUnmute={onUnmute}
        fetchRoomDetailsData={roomDetailsSelector}
        // myLocalData={myLocalData}
        // participants={participants}
        roomName={roomName}
      />

      {roomSettingModalOpenSelector ? (
        <RoomSettingModal shouldShow={roomSettingModalOpenSelector} />
      ) : null}
      {roomAdminControlModalOpenSelector ? (
        <RoomAdminControlPanelModal
          shouldShow={roomAdminControlModalOpenSelector}
        />
      ) : null}

      {showModal && (
        <ViewProfileModal
          onClose={onModalClose}
          shouldShow={showModal}
          // userDetails={currentUser}
          userId={selectedUserId}
          addToContactList={() => {}}
          isAddedToContactList={true}
        />
      )}
      {shareWithOthersIMSModal && (
        <ShareWithOthersIMSModal
          shouldShow={shareWithOthersIMSModal}
          onClose={() => setShareWithOthersIMSModal(false)}
          getParams={handleGetParams}
        />
      )}
      {showInviteToRoomModal && (
        <InviteToRoomModal
          shouldShow={showInviteToRoomModal}
          onClose={() => setShowInviteToRoomModal(false)}
          getParams={inviteToRoom}
        />
      )}
      {folderSelectionModal && (
        <AddToFavouriteFolderSelectionModal
          onClose={closeFavouriteFolderSelectionModal}
          onSuccess={getRoomDetails}
          shouldShow={folderSelectionModal}
          roomId={r_id}
        />
      )}
    </React.Fragment>
  );
}

export default RoomsDetailsPage;
