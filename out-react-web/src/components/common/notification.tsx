import React, { useEffect, useState } from "react";
import { useAppInstanceInvitedUsers } from "src/_common/hooks/selectors/notificationSelector";
import { useAppNotificationAction } from "src/_common/hooks/actions/notification/appNotificationActionHook";
import { useNotificationApi } from "src/_common/hooks/actions/notification/appNotificationApiHook";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { toast } from "react-toastify";
import moment from "moment";
import {
  API_BASE_URL,
  CHAT_DATE_TIME_FORMAT,
  CRYPTO_SECRET_KEY,
  getBooleanStatus,
  getNameInitials,
  LOGIN_STORAGE,
  NOTIFICATION_TYPE,
} from "src/_config";
import { useHistory, useParams } from "react-router";
import { RemoveSingleNotification } from "src/_common/interfaces/ApiReqRes";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { useNotificationsContext } from "src/hooks";
import { useAppUserPreferencesSelector } from "src/_common/hooks/selectors/userPreferenceSelector";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { useCallContext } from "src/hooks";
import axios from "axios";
import { useAppPmWindowDetails } from "src/_common/hooks/selectors/pmWindowSelector";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

export default function Notification() {
  const commonApi = useCommonApi();
  const {
    pmNotificationType,
    setPmNotificationType,
    setIsPmAlert,
    pmRemoveUserNotification,
    setIsAlert,
    setIsRoomAlert,
  } = useNotificationsContext();
  const { openCall, openAudioCall, microphoneState } = useCallContext();
  const { groupId, roomId } = useParams<any>();
  const history = useHistory();
  const notificationAction = useAppNotificationAction();
  const pmWindowAction = useAppPmWindowAction();
  const notificationAPi = useNotificationApi();
  const groupCategoryApi = useGroupCategoryApi();
  const pmWindowApi = usePmWindowApi();
  const notificationSelector = useAppInstanceInvitedUsers();
  const [notifications, setNotifications] = useState(notificationSelector);
  
  
  const [showHideNotificationPanel, setShowHideNotificationPanel] =
    useState<boolean>(false);
  const preferenceSelector = useAppUserPreferencesSelector();
  // const userSelector = useAppUserDetailsSelector();
  const userSelector = useAppPmWindowDetails();


  // Redirect user to dashboard when removed from a PM
  useEffect(() => {
    if (pmRemoveUserNotification) {
      history.push("/dashboard");
    }
  }, [pmRemoveUserNotification]);

  useEffect(() => {
    if (pmNotificationType) {
      const { alerts_and_sounds } = userSelector || {};
      const {
        receive_private_message_alert,
        disable_sounds,
        always_play_sound,
        customize_sound_incoming_pm,
        customize_sound_incoming_pm_file_id,
        customized_sounds,
        not_play_sound_on_call_pm,
        not_play_sound_on_mic_chat_room,
      } = alerts_and_sounds || {};

      if (disable_sounds == 1) {
        return;
      }
      if ((openCall || openAudioCall) && not_play_sound_on_call_pm == 1) {
        return;
      }
      if (microphoneState && not_play_sound_on_mic_chat_room == 1) {
        return;
      }
      if (always_play_sound == 1 && receive_private_message_alert == 1) {
        let sound = null;
        if (customize_sound_incoming_pm == 0) {
          const audio = customized_sounds?.find(
            (x: any) => x?.user_id == 0 && x?.is_default == 1
          );
          sound = new Audio(audio?.sound?.original);
        } else if (customize_sound_incoming_pm == 1) {
          const audio = customized_sounds?.find(
            (x: any) => customize_sound_incoming_pm_file_id == x?.id
          );
          sound = new Audio(audio?.sound?.original);
        }

        if (sound) {
          sound.play().catch((error) => {
            console.error("Error playing sound:", error);
          });
        }
        setPmNotificationType(false);
      }
    }
  }, [
    pmNotificationType,
    userSelector,
    openCall,
    openAudioCall,
    microphoneState,
  ]);

  const handleRemoveSingleNotification = (e: any, id: number) => {
    if (e) {
      e.preventDefault();
    }
    const params: RemoveSingleNotification = {
      record_id: id,
    };
    notificationAPi.callRemoveSingleNotification(
      params,
      (message: string, resp: any) => {
        if (resp) {
          notificationAction.removeSingleNotification(id);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getAllNotifications = () => {
    notificationAPi.callGetAllNotifications(
      (message: string, resp: any) => {
        if (resp) {
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  // Accept Join Room Invitation
  const handleAcceptJoinInvitation = async (
    notificationId: number,
    g_id: number,
    r_id: number
  ) => {
    setIsRoomAlert(false);
    handleRemoveSingleNotification(null, notificationId);
    const groupId = cryptr.encrypt(g_id);
    const roomId = cryptr.encrypt(r_id);
    history.replace("");
    history.push(`${groupId}/${roomId}/room-details`);
    localStorage.setItem("isAdminlock", "true");
  };

  // const handleRemoveUserRedirectToDashboard =(
  //   notificationId: number
  // ) => {
  //   history.replace("");
  //   history.push("/dashboard");
  // }

  const [visibleNotifications, setVisibleNotifications] = useState<{ [key: number]: boolean }>({});


  const handleAcceptRejectJoinPmInvitation = (
    notificationId: number,
    pm_id: number,
    accepted: boolean
  ) => {
    setIsPmAlert(false);
    let params = {
      pm_id: pm_id,
      accepted: accepted,
    };

    // Mark the notification as visible
    setVisibleNotifications((prevState) => ({ ...prevState, [notificationId]: true }));
  
    pmWindowApi.callAddMemberIntoPmWindow(
      params,
      (message: string, resp: any) => {
        if (resp) {
          setTimeout(() => {
            // handleRemoveSingleNotification(null, +notificationId);
            const pmId = cryptr.encrypt(pm_id);
            pmWindowAction.fromRouteHandler(pmId);
            history.push(`/pm/${pmId}`);
          }, 2000);
        } else {
          toast.error(message);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );

    // Remove the notification after 10 seconds
    setTimeout(() => {
      handleRemoveSingleNotification(null, notificationId);
      setVisibleNotifications((prevState) => {
        const newState = { ...prevState };
        delete newState[notificationId];
        return newState;
      });
    }, 10000);
  };

  const handleAcceptRejectGiftInvitation = async (
    notificationId: number,
    notificationEntityId: string,
    notification_for: string,
    accepted: boolean
  ) => {
    setIsAlert(false);
    handleRemoveSingleNotification(null, notificationId);
    let URL: any;
    switch (notification_for) {
      case "subscription":
        URL = API_BASE_URL + "subscription/accept/gift";
        break;
      case "sticker":
        URL = API_BASE_URL + "stickers/accept/gift";
        break;
      case "virtual_credit_gift":
        URL = API_BASE_URL + "virtual/gift/credit/accept";
        break;

      default:
        break;
    }
    
    if (URL) {
      const token = JSON.parse(
        localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_TOKEN) as string
      );

      try {
        const response = await axios.post(URL, {
          invitation_id: notificationEntityId, 
          accepted: accepted,
        }, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status == 200) {
          const data = response.data;
          toast.success(data.message);
          setTimeout(() => {
            // setIsAlert(false);
            handleRemoveSingleNotification(null, +notificationId);
            if (!roomId && !groupId) {
              window.location.reload();
            }
          }, 2000); 
        } else {
          toast.error("Failed to accept gift.");
        }
      } catch (error) {
        toast.error("An error occurred while processing the request.");
      }
    }
  };
  //   const formData: FormData = new FormData();

  //   formData.append("invitation_id", notificationEntityId);
  //   formData.append("accepted", String(accepted));
  //   const token = JSON.parse(
  //     localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_TOKEN) as string
  //   );
    
  //   const resp = await fetch(URL, {
  //     method: "POST",
  //     body: formData,
  //     headers: {
  //       Accept: "application/json",
  //       authorization: `Bearer ${token}`,
  //     },
  //   });
  //   const data = await resp.json();
  //   if (data?.status == 200) {
  //     toast.success(data?.message);
  //     handleRemoveSingleNotification(null, +notificationId);
  //     if (!roomId && !groupId) {
  //       window.location.reload();
  //     }
  //   } else {
  //     toast.error(data?.message);
  //   }
  // };

  const handleAcceptSharedPoints = (
    notificationId: number,
    share_point_id: number
  ) => {
    let params = {
      share_point_id: share_point_id,
    };
    commonApi.callAcceptPoints(
      params,
      (message: string, resp: any) => {
        toast.success(resp.message);
        handleRemoveSingleNotification(null, notificationId);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleRejectSharedPoints = (
    notificationId: number,
    share_point_id: number
  ) => {
    let params = {
      share_point_id: share_point_id,
    };
    commonApi.callRejectPoints(
      params,
      (message: string, resp: any) => {
        handleRemoveSingleNotification(null, notificationId);
        toast.success(resp.message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleNotificationPanelToggle = () => {
    setShowHideNotificationPanel(!showHideNotificationPanel);
  };

  const handleAcceptRejectPmAudioVideoNotification = (
    notificationId: number,
    entityId: number,
    type: string
  ) => {
    if (type === "accept") {
      let params = {
        pm_id: entityId,
        type: type,
      };
      pmWindowApi.callPmCallAcceptReject(
        params,
        (message: string, resp: any) => {
          if (resp) {
            // handleRemoveSingleNotification(null, notificationId)
            notificationAction.removeSingleNotification(notificationId);
            const pmId = cryptr.encrypt(entityId);
            // history.replace('')
            history.push(`/pm/${pmId}`);
          }
        },
        (message: string) => {
          toast.error(message);
        }
      );
    } else {
      let params = {
        pm_id: entityId,
        type: type,
      };
      pmWindowApi.callPmCallAcceptReject(
        params,
        (message: string, resp: any) => {
          if (resp) {
            // handleRemoveSingleNotification(null, notificationId)
            notificationAction.removeSingleNotification(notificationId);
          }
        },
        (message: string) => {
          toast.error(message);
        }
      );
      // handleRemoveSingleNotification(null, notificationId)
    }
  };

  const handleRedirectToPm = (e: any, entityId: number) => {
    e && e.preventDefault();
    const params = {
      pm_id: entityId,
    };
    pmWindowApi.callReadPm(
      params,
      (message: string, resp: any) => {
        if (resp) {
          const pmId = cryptr.encrypt(entityId);
          console.log("pmId<><><><><><><><><>", pmId);
          
          pmWindowAction.fromRouteHandler(entityId);
          // history.replace('')
          history.push(`/pm/${pmId}`);

          const currentPmId = userSelector?.id
          if(currentPmId === entityId) {
            console.log("currentPmId>>>>>>>>>>>>>>>>>>", currentPmId);
            console.log("entityId>>>>>>>>>>>>>>>>>>>>",entityId);
            
            
            // Filter out PM notifications from the notificationSelector state
          const updatedNotifications = notificationSelector.filter(
            (notification: any) => notification.type !== NOTIFICATION_TYPE.PM_NOTIFICATION
          );
          setNotifications(updatedNotifications);
          }
          
        } else {
          toast.error(message);
        }
      },
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
  };
 
  useEffect(() => {
    getAllNotifications();
  }, []);

  // console.log("notification selector-------------->", notificationSelector);
  

  return (
    <React.Fragment>
      <div>
        <button
          type="button"
          className="btn header-item noti-icon waves-effect"
          onClick={handleNotificationPanelToggle}
        >
          <i className="bx bx-bell bx-tada"></i>
          <span className="badge badge-danger badge-pill">
            {notificationSelector && notificationSelector.length
              ? notificationSelector.length
              : null}
          </span>
        </button>
        {showHideNotificationPanel ? (
          <div className="notificattion_bar">
            {notificationSelector && notificationSelector.length ? (
              notificationSelector.map((x: any, index: number) => (
                <div className="all_notify" key={index}>
                  <div
                    className="close-sec"
                    onClick={(e) => handleRemoveSingleNotification(null, x.id)}
                  >
                    <i className="far fa-times-circle"></i>
                  </div>
                  <div className="inner_notify">
                    {/* <img className="mr-3 rounded-circle avatar-xs" src="https://outrighttalkbackend.s3.us-west-2.amazonaws.com/assets/u/1631118932965650600.jpg" alt="sunhax"></img> */}
                    <div className="media-body">
                      <h6 className="mt-0 mb-1">
                        {/* {x.message} */}

                        {NOTIFICATION_TYPE.PM_NOTIFICATION === x.type ? (
                          <>
                            {/* <a
                              href="#"
                              onClick={(e) =>
                                handleRedirectToPm(e, x.entity_id)
                              }
                            >
                              {x.message}
                            </a> */}
                            {/* {(() => {
                              console.log("userSelector=============><><><><><><><><><><>",userSelector);

                              console.log("x.entity_id=============><><><><><><><><><><>",x.entity_id);
                              
                              const currentPmId1 = userSelector?.id;
                              console.log("currentPmId=======><><><><>>>>><", currentPmId1);
                              
                              if (currentPmId1 === x.entity_id) {

                                // setPmNotificationType(false);
                                // setIsPmAlert(false);
                              }
                            
                              return ( */}
                                <a
                                  href="#"
                                  onClick={(e) => handleRedirectToPm(e, x.entity_id)}
                                >
                                  {x.message}
                                </a>
                            {/*    );
                             })()} */}
                          </>
                        ) : (
                          x.message
                        )}
                      </h6>
                      <div className="font-size-12 text-muted">
                      <p className="mb-0">
                          <i className="mdi mdi-clock-outline"></i>
                          <span>
                            {/* {moment(
                              x.formated_date,
                              "DD-MMMM-YYYY hh:mm a"
                            ).format(
                              CHAT_DATE_TIME_FORMAT.DISPLAY_DATE_WITH_TIME
                            )} */}
                            {/* { moment.utc(x.formated_date).local().format('DD-MM-YYYY HH:mm ')} */}
                            {(() => {
                              // Remove ordinal suffix (th, st, nd, rd) from the day
                              const cleanDate = x.formated_date.replace(
                                /(\d+)(th|st|nd|rd)/,
                                "$1"
                              );

                              // Parse the cleaned date string and format it to local time
                              const formattedLocalDate = moment
                                .utc(cleanDate, "D MMMM, YYYY h:mm a")
                                .local()
                                .format("DD-MM-YYYY HH:mm");

                              return formattedLocalDate;
                            })()}
                          </span>
                        </p>
                      </div>
                      {/* <p>{x.type}</p> */}

                      {NOTIFICATION_TYPE.INVITE === x.type ? (
                        <div className="btns-two-wrap">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleAcceptJoinInvitation(
                                x.id,
                                x.group_id,
                                x.entity_id
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              {
                                handleRemoveSingleNotification(null, x.id)
                                setIsRoomAlert(false);
                              }
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}

                      {NOTIFICATION_TYPE.GIFT === x.type ? (
                        <div className="btns-two-wrap">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleAcceptRejectGiftInvitation(
                                x.id,
                                x.entity_id,
                                x.notification_for,
                                true
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => 
                              handleAcceptRejectGiftInvitation(
                                x.id,
                                x.entity_id,
                                x.notification_for,
                                false
                              )
                              // setIsAlert(false);
                              // handleRemoveSingleNotification(null, x.id);
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}

                      {NOTIFICATION_TYPE.SHARE_POINTS_NOTIFICATION ===
                      x.type ? (
                        <div className="btns-two-wrap">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleAcceptSharedPoints(x.id, x.entity_id)
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleRejectSharedPoints(x.id, x.entity_id)
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}

                      {NOTIFICATION_TYPE.PM_AUDIO_VIDEO_NOTIFICATION ===
                      x.type ? (
                        <div className="btns-two-wrap">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleAcceptRejectPmAudioVideoNotification(
                                x.id,
                                x.entity_id,
                                "accept"
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleAcceptRejectPmAudioVideoNotification(
                                x.id,
                                x.entity_id,
                                "reject"
                              )
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}

                      {/* {NOTIFICATION_TYPE.PM_REMOVE === x.type} */}

                      {NOTIFICATION_TYPE.PM_INVITE === x.type && visibleNotifications[x.id] ? (
                        <div className="btns-two-wrap">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleAcceptRejectJoinPmInvitation(
                                x.id,
                                x.entity_id,
                                true
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleAcceptRejectJoinPmInvitation(
                                x.id,
                                x.entity_id,
                                false
                              )
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="notificattion_bar">
                <div className="all_notify">
                  <div className="inner_notify">
                    <div className="media-body">No notification found</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
}
