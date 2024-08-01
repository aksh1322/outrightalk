import React, { useEffect, useState } from "react";
import { Menu, Item, Separator, Submenu } from "react-contexify";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import {
  CRYPTO_SECRET_KEY,
  getBooleanStatus,
  MENU_OPERATIONS,
  SOCKET_URL,
} from "src/_config";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { toast } from "react-toastify";
import { useAppRoomDetailsSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { useAppActivePmsRouteSelector, useAppPmWindowDetails, usePmTimeStampSelector } from "src/_common/hooks/selectors/pmWindowSelector";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import { useChatContext } from "src/hooks"
import useSocket from "use-socket.io-client";
// import GlobalFunction from "src/components/groupsCategory/common/chatWindow.tsx"
// import { colorHook } from "./";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const SettingContextMenu = (props: any) => {
  // const [saveDefault,setSaveDefault]=useState<boolean>(false)
  const { groupId, roomId } = useParams<any>();
  const { pmId } = useParams<any>();
  // const pm_id:any = parseInt(cryptr.decrypt(pmId));
  // const pm_id: number = parseInt(cryptr.decrypt(pmId));
  const [showtimestamp, setShowtimeStamp] = useState<any>([]);
  const CheckTimeStamp = usePmTimeStampSelector();
  const groupCategoryAction = useAppGroupCategoryAction();
  const pmWindowAction = useAppPmWindowAction();
  const pmWindowDetailsSelector = useAppPmWindowDetails();
  const pmWindowApi = usePmWindowApi();
  const groupCategoryApi = useGroupCategoryApi();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const fromRoute = useAppActivePmsRouteSelector();
  const [socket] = useSocket(SOCKET_URL, {
    autoConnect: false,
  });
  const [isSorted,setIsSorted]=useState<boolean>(false)
  const handleItemClick = (e: any) => { };

  const { setSuperRoomSettings, sortNicknameAlphabetically, setSortNicknameAlphabetically, sortAutoScrollTextChat, setSortAutoScrollTextChat} = useChatContext()

  const getRoomDetails = () => {
    const params = {
      room_id: parseInt(cryptr.decrypt(roomId)),
    };
    groupCategoryApi.callGetRoomDetails(
      params,
      (message: string, resp: any) => {
        if (resp) {
          setSuperRoomSettings(resp.user.room_user_settings)

        }
        if (resp && resp.list && resp.list.length) {

        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  useEffect(() => {
    setShowtimeStamp(CheckTimeStamp)
  }, [CheckTimeStamp])
  //Room User Settings menu
  const handleRoomSettings = (operation: string) => {
    const params = {
      room_id: parseInt(cryptr.decrypt(roomId)),
      key_name: operation,
      key_value:
        roomDetailsSelector &&
          roomDetailsSelector.room &&
          roomDetailsSelector.room.room_settings &&
          roomDetailsSelector.room.room_settings[operation] == 1
          ? 0
          : 1,
    };

    groupCategoryApi.callChangeUserRoomSettings(
      params,
      (message: string, resp: any) => {
        if (resp) {
          //Call only if operation is timestamp
          if (operation === MENU_OPERATIONS.TIMESTAMP) {
            groupCategoryAction.roomChatTimestampToogle(
              getBooleanStatus(resp[operation])
            );
          }
          //Call only if operation is push to talk & lock mic
          if (
            operation === MENU_OPERATIONS.PUSH_TO_TALK ||
            operation === MENU_OPERATIONS.LOCK_MIC
          ) {
            groupCategoryAction.resetNormalUserMicHandleIsChanged(true);
          }

          //call only save default setting save called
          //  if (operation === MENU_OPERATIONS.SAVE_AS_DEFAULT_ROOM_SETTINGS) {
          //   groupCategoryAction.roomChatTimestampToogle(
          //     getBooleanStatus(resp[operation])
          //   );
          // }
          getRoomDetails();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handlenewRoomSettings = (operation: string, value: any) => {
    let savedRoomSettingArray = JSON.parse(localStorage.getItem('roomSettings') || '[]');
    if (savedRoomSettingArray.length) {
      let updatedData: any = [];
      savedRoomSettingArray.forEach((ele: any) => {
        if (ele.roomId == parseInt(cryptr.decrypt(roomId))) {
          let updatedSettings = { ...ele.settings };
          if (operation == 'notify_users_join_exit_room') {
            updatedSettings.notify_users_join_exit_room = !updatedSettings.notify_users_join_exit_room;
          } else if (operation == 'show_timestamp_chat_room') {
            updatedSettings.show_timestamp_chat_room = !updatedSettings.show_timestamp_chat_room;
          } else if (operation == 'notify_users_start_stops_webcam') {
            updatedSettings.notify_users_start_stops_webcam = !updatedSettings.notify_users_start_stops_webcam;
          } else if (operation == 'disable_dig_sound') {
            updatedSettings.disable_dig_sound = !updatedSettings.disable_dig_sound;
          }
          let obj = {
            roomId: ele.roomId,
            settings: updatedSettings
          };
          updatedData.push(obj);
        } else {
          updatedData.push(ele);
        }
      });
      localStorage.setItem('roomSettings', JSON.stringify(updatedData));
      const newData = JSON.parse(localStorage.getItem('roomSettings') || '[]');
      const checktimeStampAvailable = newData.filter((x: any) =>
        x.roomId == parseInt(cryptr.decrypt(roomId))
      );
      setShowtimeStamp(checktimeStampAvailable);
      pmWindowAction.SetTimeStamp(checktimeStampAvailable);
    } else {
      var roomSettings: any = {
        roomId: parseInt(cryptr.decrypt(roomId)),
        settings: {
          notify_users_join_exit_room: roomDetailsSelector?.room?.room_settings?.notify_users_join_exit_room == 1 ? false : true,
          notify_users_start_stops_webcam: roomDetailsSelector?.room?.settings?.notify_users_start_stops_webcam == 1 ? false :true,
          disable_dig_sound: roomDetailsSelector?.room?.settings?.disable_dig_sound == 1 ? false : true,
          show_timestamp_chat_room: roomDetailsSelector?.room?.room_settings?.show_timestamp_chat_room == 1 ? false : true,
        }
      };
      savedRoomSettingArray.push(roomSettings);
      localStorage.setItem('roomSettings', JSON.stringify(savedRoomSettingArray));
    }
  };


  //Api call for fetch save default room setting
  // const handleSaveAsDefaultRoomSetting = (operation: string) => {
  //   const params1 = {
  //     room_id: parseInt(cryptr.decrypt(roomId)),
  //   };
  //   groupCategoryApi.callGetRoomDetails(
  //     params1,
  //     (message: string, resp: any) => {

  //       if (resp) {
  //         setSuperRoomSettings(resp.user.room_user_settings)


  //         var settingUpdateValu = roomDetailsSelector.user[operation];
  //         if (settingUpdateValu == 0) {
  //           settingUpdateValu = 1;
  //           document.getElementsByClassName(
  //             "room-chat-content-editable"
  //           )[0].style.fontFamily = resp.user.font_family;
  //           document.getElementsByClassName(
  //             "room-chat-content-editable"
  //           )[0].style.fontSize = resp.user.font_size;
  //           document.getElementsByClassName(
  //             "room-chat-content-editable"
  //           )[0].style.fontStyle = resp.user.font_style;
  //           document.getElementsByClassName(
  //             "room-chat-content-editable"
  //           )[0].style.textDecoration = resp.user.text_decoration;
  //           document.getElementsByClassName(
  //             "room-chat-content-editable"
  //           )[0].style.fontWeight = resp.user.font_weight;
  //           document.getElementsByClassName(
  //             "room-chat-content-editable"
  //           )[0].style.color = resp.user.font_color;
  //         } else if (settingUpdateValu == 1) {
  //           settingUpdateValu = 0;
  //           document.getElementsByClassName(
  //             "room-chat-content-editable"
  //           )[0].style = "";
  //           // document.getElementsByClassName(
  //           //   "room-chat-content-editable"
  //           // )[0].style = "";
  //         }

  //         const params = {
  //           room_id: parseInt(cryptr.decrypt(roomId)),
  //           key_name: operation,
  //           key_value: settingUpdateValu,
  //         };
  //         groupCategoryApi.callRoomUserWiseSaveDefaultSetting(
  //           params,
  //           (message: string, resp: any) => {
  //             if (resp) {
  //               getRoomDetails();
  //             }
  //           },
  //           (message: string) => {
  //             // toast.error(message)
  //             console.log("ERROR = ", message);
  //           }
  //         );
  //       }
  //     },
  //     (message: string) => {
  //       toast.error(message);
  //     }
  //   );
  // };

  const handleResetDefaultSetting = () => {
    const params = {
      settings: ["show_timestamp_chat_room", "notify_users_join_exit_room"],
    };
    groupCategoryApi.callRoomResetDefaultSetting(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
          localStorage.removeItem('roomSettings');
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  const handleSaveDefaultRoomSetting = (operation: string) => {

    const params = {
      show_timestamp_chat_room: showtimestamp[0]?.
        settings
        ?.show_timestamp_chat_room == true ? 1: 0,
      notify_users_join_exit_room: showtimestamp[0]?.
        settings
        ?.notify_users_join_exit_room ==true ? 1: 0
    };
    groupCategoryApi.callRoomSaveDefaultSetting(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getRoomDetails();
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  // callRoomSaveDefaultSetting

  // const handleResetDefaultSetting = (operation: string) => {
  //   // console.log(
  //   //   "Class === ",
  //   //   document.getElementsByClassName("room-chat-content-editable")[0].style
  //   // );
  //   const params1 = {
  //     room_id: parseInt(cryptr.decrypt(roomId)),
  //   };
  //   groupCategoryApi.callGetRoomDetails(
  //     params1,
  //     (message: string, resp: any) => {
  //       if(resp) {
  //         setSuperRoomSettings(resp.user.room_user_settings)
  //       }

  //       console.log("INSIDE RESET = ", resp.user.save_default_room_settings);
  //       const checkforreset = resp.user.save_default_room_settings;
  //       console.log("INSIDE RESET checkforreset = ", checkforreset);
  //       if (checkforreset == 1) {
  //         document.getElementsByClassName(
  //           "room-chat-content-editable"
  //         )[0].style = "";

  //         const params2 = {
  //           room_id: parseInt(cryptr.decrypt(roomId)),
  //           key_name: "save_default_room_settings",
  //           key_value: 0,
  //         };
  //         groupCategoryApi.callRoomUserWiseSaveDefaultSetting(
  //           params2,
  //           (message: string, resp: any) => {
  //             if (resp) {
  //               getRoomDetails();
  //               console.log("Response from setting api sdsd =  ", resp);
  //             }
  //           },
  //           (message: string) => {
  //             // toast.error(message)
  //             console.log("ERROR = ", message);
  //           }
  //         );

  //         const params = {
  //           room_id: parseInt(cryptr.decrypt(roomId)),
  //           // key_name: operation,
  //           // dynamicParams: dynamicParamsArray, // Array of objects containing key-value pairs
  //           font_color: "#000000",
  //           font_family: "Open Sans",
  //           font_size: 3,
  //           text_decoration: "normal",
  //           font_weight: "normal",
  //           font_style: "normal",
  //           // save_default_room_settings: 1,
  //         };
  //         groupCategoryApi.callRoomResetDefaultSetting(
  //           params,
  //           (message: string, resp: any) => {
  //             if (resp) {
  //               console.log("Response from reset api =  ", resp);
  //             }
  //           },
  //           (message: string) => {
  //             // toast.error(message)
  //             console.log("ERROR = ", message);
  //           }
  //         );
  //       }
  //     },
  //     (message: string) => {
  //       toast.error(message);
  //     }
  //   );
  // };

  //Pm setting related Api call

  const getPmWindowDetails = () => {
    let params = {
      pm_id: parseInt(cryptr.decrypt(pmId)),
    };
    pmWindowApi.callGetPmsDetails(
      params,
      (message: string, resp: any) => { },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handlePmSetting = (operation: string) => {
    // const params = {
    //   pm_id: parseInt(cryptr.decrypt(pmId)),
    //   key_name: operation,
    //   key_value:
    //     pmWindowDetailsSelector &&
    //     pmWindowDetailsSelector.pm_settings &&
    //     pmWindowDetailsSelector.pm_settings[operation]
    //       ? 0
    //       : 1,
    // };
    // pmWindowApi.callPmHeaderMenuSettingActionUpdate(
    //   params,
    //   (message: string, resp: any) => {
    //     if (resp) {
    //       //Call only if operation is timestamp
    //       if (operation === MENU_OPERATIONS.TIMESTAMP) {
    //         pmWindowAction.pmChatTimestampToogle(
    //           getBooleanStatus(resp[operation])
    //         );
    //       }
    //       getPmWindowDetails();
    //     }
    //   },
    //   (message: string) => {}
    // );


    SaveTimeStamp();



  };


  const SaveTimeStamp = () => {
    const id = parseInt(cryptr.decrypt(pmId));
    let SavedTimeStampArray = JSON.parse(localStorage.getItem('timeStamp') || '[]');

    if (SavedTimeStampArray.length) {
      let updatedData: any = [];
      SavedTimeStampArray.forEach((ele: any) => {
        if (ele.pm_id == id) {
          let obj = {
            pm_id: ele.pm_id,
            settings: {
              show_timestamp_pm: ele?.settings?.show_timestamp_pm == true ? false : true
            }
          }
          updatedData.push(obj)
        } else {
          updatedData.push(ele)
        }
      })
      localStorage.setItem('timeStamp', JSON.stringify(updatedData));
      const newData = JSON.parse(localStorage.getItem('timeStamp') || '[]')
      const checktimeStampAvailable = newData?.filter((x: any) =>
        x.pm_id == parseInt(cryptr.decrypt(pmId)))
      setShowtimeStamp(checktimeStampAvailable);
      pmWindowAction.SetTimeStamp(checktimeStampAvailable)
    }
    else {
      var timeStamp: any = {
        pm_id: parseInt(cryptr.decrypt(pmId)),
        settings: {
          show_timestamp_pm: pmWindowDetailsSelector.pm_settings.show_timestamp_pm == 1 ? false : true
        }
      }
      SavedTimeStampArray.push(timeStamp)
      localStorage.setItem('timeStamp', JSON.stringify(SavedTimeStampArray))
    }
  }

  const handleSaveAsDefaultPmSetting = () => {
    // const params = {
    //   pm_id: parseInt(cryptr.decrypt(pmId)),
    // };
    const params = {
      show_timestamp_pm: showtimestamp[0]?.settings?.show_timestamp_pm == true ? 1 : 0
    };
    pmWindowApi.callPmHeaderMenuSaveDefaultSetting(
      params,
      (message: string, resp: any) => {
        if (resp) {
          getPmWindowDetails();
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  const handleResetDefaultPmSetting = () => {
    // const params = {
    //   pm_id: parseInt(cryptr.decrypt(pmId)),
    // };
    const params = {
      settings: ['show_timestamp_pm']
    };
    pmWindowApi.callPmHeaderMenuResetDefaultSetting(
      params,
      (message: string, resp: any) => {
        if (resp) {
          localStorage.removeItem('timeStamp');
          getPmWindowDetails();
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  const handleNicknameSortSetting = () => {
    setSortNicknameAlphabetically((prevState: any) => !prevState)
    localStorage.setItem("sortNicknameAlphabetically",JSON.stringify(!sortNicknameAlphabetically))
  };

  const handleAutoScrollTextChat =() => {
    setSortAutoScrollTextChat((prevState: any) => !prevState)
    localStorage.setItem("sortAutoScrollTextChat",JSON.stringify(!sortAutoScrollTextChat))
  };

  // console.log("roomDetailsSelector=============",roomDetailsSelector);
  
  return (
    <React.Fragment>
      <Menu id="room_header_menu_setting_id" className="header-click-menu">
        <Item
          onClick={(event) =>
            handleAutoScrollTextChat()
          }
        >
         {
          sortAutoScrollTextChat ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Autoscroll Text Chat
        </Item>

        {/* <Item
          onClick={(event) =>
            handleNicknameSortSetting()
          }
        >
          {roomDetailsSelector &&
          roomDetailsSelector.user &&
          roomDetailsSelector.user.room_user_settings &&
          roomDetailsSelector.user.room_user_settings[
            MENU_OPERATIONS.SORT_NICKNAME_ALPHABETICALLY
          ] ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Sort Nicknames Alphabatically
        </Item> */}
        <Item
          onClick={(event) =>
            handleNicknameSortSetting()
          }
        >
          {
          sortNicknameAlphabetically ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Sort Nicknames Alphabatically
        </Item>
        {/* <Separator /> */}
        {/* <Item
                    onClick={(event) => handleRoomSettings(MENU_OPERATIONS.SHOW_INCOMING_TEXT_WITH_FORMAT)}>
                    {
                        roomDetailsSelector && roomDetailsSelector.user && roomDetailsSelector.user.room_user_settings && roomDetailsSelector.user.room_user_settings[MENU_OPERATIONS.SHOW_INCOMING_TEXT_WITH_FORMAT] ?
                            <i className="fa fa-check" aria-hidden="true"></i> : null
                    }
                    Show Incoming Text with Format</Item>
                <Separator /> */}
        <Item
          onClick={(event) => handlenewRoomSettings(MENU_OPERATIONS.TIMESTAMP, showtimestamp[0]?.settings?.notify_users_join_exit_room)}
        >
          {/* {roomDetailsSelector &&
            roomDetailsSelector.room &&
            roomDetailsSelector.room.room_settings &&
            roomDetailsSelector.room.room_settings[
            MENU_OPERATIONS.TIMESTAMP
            ] == 1 ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null} */}

          {showtimestamp && showtimestamp[0]?.settings[MENU_OPERATIONS.TIMESTAMP] == true ?
            (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : null}
          Timestamp
        </Item>

        {/* <Item
          onClick={(event) =>
            handleRoomSettings(MENU_OPERATIONS.SORT_NICKNAME_ALPHABETICALLY)
          }
        >
          {roomDetailsSelector &&
          roomDetailsSelector.user &&
          roomDetailsSelector.user.room_user_settings &&
          roomDetailsSelector.user.room_user_settings[
            MENU_OPERATIONS.SORT_NICKNAME_ALPHABETICALLY
          ] ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Sort Nicknames Alphabetically
        </Item>
        <Separator /> */}
        <Item
          onClick={(event) =>
            handlenewRoomSettings(MENU_OPERATIONS.NOTIFY_EXIT_JOIN_ROOM, showtimestamp[0]?.settings[
              MENU_OPERATIONS.NOTIFY_EXIT_JOIN_ROOM
            ].val)
          }
        >
          {showtimestamp &&
            showtimestamp[0]?.settings[
            MENU_OPERATIONS.NOTIFY_EXIT_JOIN_ROOM
            ] == true ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Notify when Users Exit & Joins Room
        </Item>

        <Item
          onClick={(event) =>
            handlenewRoomSettings(MENU_OPERATIONS.NOTIFY_START_STOP_WEBCAM, showtimestamp[0]?.settings[
              MENU_OPERATIONS.NOTIFY_START_STOP_WEBCAM
            ]?.val)
          }
        >
          {showtimestamp &&
            showtimestamp[0]?.settings[
            MENU_OPERATIONS.NOTIFY_START_STOP_WEBCAM
            ] == true ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Notify when Users Start & Stops WebCam
        </Item>

        <Item
          onClick={(event) =>
            handlenewRoomSettings(MENU_OPERATIONS.DISABLE_DIG_SOUND, showtimestamp[0]?.settings[
              MENU_OPERATIONS.DISABLE_DIG_SOUND
            ]?.val)
          }
        >
          {showtimestamp &&
            showtimestamp[0]?.settings[
            MENU_OPERATIONS.DISABLE_DIG_SOUND
            ] == true ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Disable Dig Sound
        </Item>

        {/* <Submenu label="Notify Me When User">
        <Item
            onClick={(event) =>
              handleRoomSettings(MENU_OPERATIONS.NOTIFY_USER_JOIN_ROOM)
            }
          >
            {roomDetailsSelector &&
              roomDetailsSelector.user &&
              roomDetailsSelector.user.room_user_settings &&
              roomDetailsSelector.user.room_user_settings[
              MENU_OPERATIONS.NOTIFY_USER_JOIN_ROOM
              ] ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : null}
            Joins a room
          </Item>
          <Item
            onClick={(event) =>
              handleRoomSettings(MENU_OPERATIONS.NOTIFY_EXIT_ROOM)
            }
          >
            {roomDetailsSelector &&
              roomDetailsSelector.user &&
              roomDetailsSelector.user.room_user_settings &&
              roomDetailsSelector.user.room_user_settings[
              MENU_OPERATIONS.NOTIFY_EXIT_ROOM
              ] ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : null}
            Exits room
          </Item> */}
        {/* <Item
            onClick={(event) =>
              handleRoomSettings(MENU_OPERATIONS.NOTIFY_START_WEBCAM)
            }
          >
            {roomDetailsSelector &&
            roomDetailsSelector.user &&
            roomDetailsSelector.user.room_user_settings &&
            roomDetailsSelector.user.room_user_settings[
              MENU_OPERATIONS.NOTIFY_START_WEBCAM
            ] ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : null}
            Starts Webcam
          </Item>
          <Item
            onClick={(event) =>
              handleRoomSettings(MENU_OPERATIONS.NOTIFY_STOP_WEBCAM)
            }
          >
            {roomDetailsSelector &&
            roomDetailsSelector.user &&
            roomDetailsSelector.user.room_user_settings &&
            roomDetailsSelector.user.room_user_settings[
              MENU_OPERATIONS.NOTIFY_STOP_WEBCAM
            ] ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : null}
            Stops Webcam
          </Item> */}
        {/* </Submenu> */}
        {/* <Item onClick={(event) => handleItemClick(event)}>Font</Item> */}
        {/* <Item
          onClick={(event) =>
            handleRoomSettings(MENU_OPERATIONS.CHANGE_ROOM_SCREEN)
          }
          disabled={true}
        >
          {roomDetailsSelector &&
          roomDetailsSelector.user &&
          roomDetailsSelector.user.room_user_settings &&
          roomDetailsSelector.user.room_user_settings[
            MENU_OPERATIONS.CHANGE_ROOM_SCREEN
          ] ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Change Room Skin
        </Item> */}
        {/* <Item
                    onClick={(event) => handleRoomSettings(MENU_OPERATIONS.MUTE_INCOMING_SOUND)}>
                    {
                        roomDetailsSelector && roomDetailsSelector.user && roomDetailsSelector.user.room_user_settings && roomDetailsSelector.user.room_user_settings[MENU_OPERATIONS.MUTE_INCOMING_SOUND] ?
                            <i className="fa fa-check" aria-hidden="true"></i> : null
                    }
                    Mute Incoming Sound
                </Item> */}
        <Item
          // onClick={() => {
          //   handleSaveAsDefaultRoomSetting(
          //     MENU_OPERATIONS.SAVE_AS_DEFAULT_ROOM_SETTINGS
          //   );
          //   // handleRoomSettings(MENU_OPERATIONS.SAVE_AS_DEFAULT_ROOM_SETTINGS)
          // }}
          onClick={() => {
            handleSaveDefaultRoomSetting(
              MENU_OPERATIONS.SAVE_AS_DEFAULT_ROOM_SETTINGS
            );
            // handleRoomSettings(MENU_OPERATIONS.SAVE_AS_DEFAULT_ROOM_SETTINGS)
          }}
        >
          {roomDetailsSelector &&
            roomDetailsSelector.user &&
            roomDetailsSelector.user.save_default_room_settings ==
            // roomDetailsSelector.user.room_user_settings &&
            // roomDetailsSelector.user.room_user_settings[
            // MENU_OPERATIONS.SAVE_AS_DEFAULT_ROOM_SETTINGS]
            // roomDetailsSelector.user.room_user_settings[
            //   MENU_OPERATIONS.SAVE_AS_DEFAULT_ROOM_SETTINGS]
            1 ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Save as Default Room Settings
        </Item>
        <Item
          onClick={() => {
            // handleResetDefaultSetting(
            //   MENU_OPERATIONS.RESET_DEFAULT_ROOM_SETTINGS
            // );
            handleResetDefaultSetting();
          }}
        >
          Reset Default Settings
        </Item>
      </Menu>

      <Menu id="pm_header_settings_id" className="header-click-menu">
        {/* <Item onClick={(event) => handlePmSetting("autoscrool_text")}>
          {pmWindowDetailsSelector &&
          pmWindowDetailsSelector.pm_settings &&
          pmWindowDetailsSelector.pm_settings.autoscrool_text ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Autoscroll Text Chat
        </Item> */}
        {/* <Separator /> */}
        {/* <Item
                    onClick={(event) => handlePmSetting(MENU_OPERATIONS.SHOW_INCOMING_TEXT_WITH_FORMAT)}>
                    {
                        pmWindowDetailsSelector && pmWindowDetailsSelector.pm_settings && pmWindowDetailsSelector.pm_settings[MENU_OPERATIONS.SHOW_INCOMING_TEXT_WITH_FORMAT] ?
                            <i className="fa fa-check" aria-hidden="true"></i> : null
                    }
                    Show Incoming Text with Format</Item>
                <Separator /> */}
        <Item onClick={(event) => handlePmSetting(MENU_OPERATIONS.TIMESTAMP)}>
          {/* {pmWindowDetailsSelector &&
            pmWindowDetailsSelector.pm_settings &&
            pmWindowDetailsSelector.pm_settings.show_timestamp_pm == 1 ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null} */}


          {showtimestamp && showtimestamp?.length &&
            showtimestamp[0]?.settings &&
            showtimestamp[0]?.settings?.show_timestamp_pm == true ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Timestamp 
        </Item>
        {/* <Item
                    onClick={(event) => handlePmSetting(MENU_OPERATIONS.SORT_NICKNAME_ALPHABETICALLY)}>
                    {
                        pmWindowDetailsSelector && pmWindowDetailsSelector.pm_settings && pmWindowDetailsSelector.pm_settings[MENU_OPERATIONS.SORT_NICKNAME_ALPHABETICALLY] ?
                            <i className="fa fa-check" aria-hidden="true"></i> : null
                    }
                    Sort Nicknames Alphabetically
                </Item> */}
        {/* <Separator /> */}

        {/* <Item onClick={(event) => handlePmSetting("disable_dig_sound")}>
          {pmWindowDetailsSelector &&
          pmWindowDetailsSelector.pm_settings &&
          pmWindowDetailsSelector.pm_settings.disable_dig_sound ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Disable Dig Sound
        </Item> */}

        {/* <Item onClick={(event) => handleItemClick(event)}>Font</Item> */}
        {/* <Separator /> */}
        {/* <Item onClick={(event) => handleItemClick(event)}>PM Skins</Item> */}
        {/* <Item
          onClick={(event) =>
            handlePmSetting(MENU_OPERATIONS.MUTE_INCOMING_SOUND)
          }
        >
          {pmWindowDetailsSelector &&
          pmWindowDetailsSelector.pm_settings &&
          pmWindowDetailsSelector.pm_settings[
            MENU_OPERATIONS.MUTE_INCOMING_SOUND
          ] ? (
            <i className="fa fa-check" aria-hidden="true"></i>
          ) : null}
          Mute Incoming Sound
        </Item> */}
        <Separator />
        <Item onClick={() => handleSaveAsDefaultPmSetting()}>
          Save as Default PM Settings
        </Item>
        <Item onClick={() => handleResetDefaultPmSetting()}>
          Reset Default PM Settings
        </Item>
      </Menu>
    </React.Fragment>
  );
};

export default SettingContextMenu;


