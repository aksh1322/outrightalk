import React, { useEffect, useState } from "react";
import { Redirect, useHistory, useParams } from "react-router";
import { Spinner } from "react-bootstrap";
import { useAppRoomListCategoryWiseSelector } from "../hooks/selectors/groupCategorySelector";
import LockWordModal from "src/components/commonModals/lockWordModal/lockWordModal";
import AdminCodeModal from "src/components/commonModals/adminCodeModal/adminCodeModal";
import { useGroupCategoryApi } from "../hooks/actions/groupCategory/appGroupCategoryApiHook";
import SweetAlert from "react-bootstrap-sweetalert";
import { CRYPTO_SECRET_KEY, URLS } from "src/_config";
import { toast } from "react-toastify";
import { roomListCategoryWise } from "src/sagas/groupCategorysaga";
import { useNotificationsContext } from "src/hooks";
import { useAppUserDetailsSelector } from "../hooks/selectors/userSelector";
import { useAppGroupCategoryAction } from "../hooks/actions/groupCategory/appGroupCategoryActionHook";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const joinRoomGauard = (Component: React.ComponentType) => {
  function JoinRoomHoc(props: any) {
    const groupCategoryApi = useGroupCategoryApi();
    const { groupId } = useParams<any>();
    const { roomId } = useParams<any>();
    const history = useHistory();
    const rommListCategoryWise = useAppRoomListCategoryWiseSelector();
    const [lockRoomModal, setLockRoomModal] = useState(false);
    const [adminCodeModal, setAdminCodeModal] = useState(false);
    const [showLockLoader, setShowLockLoader] = useState(true);
    const [isFirstTimeLockWordRun, setIsFirstTimeLockWordRun] =
      useState<boolean>(false);
    const [alert, setAlert] = useState<any>(null);
    const { RoomInviteData } = useNotificationsContext();
    const useSelector = useAppUserDetailsSelector();
    const [activerooms, SetActiveRooms] = useState<any>();
    const groupCategoryAction = useAppGroupCategoryAction();
    const closeLockWindowModal = (success: any) => {
      setLockRoomModal(false);
      if (success) {
        //call join room Api here
        //after success full joinApi room called call getRoomList Api for admin or headAdmin check
        joinRoom();
      } else {
        history.goBack();
      }
    };

    const closeAdminCodeModal = (success: any) => {
      setAdminCodeModal(false);
      if (success) {
        setShowLockLoader(false);
      } else {
        history.goBack();
      }
    };

    const hideAlert = () => {
      setAlert(null);
    };

    const handleMultipleJoinRoomCancel = () => {
      setAlert(null);
      history.replace("");
      history.push(URLS.USER.DASHBOARD);
    };

    // const handleShowAlert = (exit_room: number) => {
    //   setAlert(
    //     <SweetAlert
    //       warning
    //       // showCancel
    //       confirmBtnText="Ok"
    //       cancelBtnText="Cancel"
    //       cancelBtnBsStyle="danger"
    //       confirmBtnBsStyle="success"
    //       allowEscape={false}
    //       closeOnClickOutside={false}
    //       title="Alert"
    //       onConfirm={() => handleFinalJoinRoom(exit_room)}
    //       onCancel={handleMultipleJoinRoomCancel}
    //       focusCancelBtn={true}
    //     >
    //       You have a basic nickname, you cannot be in more than one voice room
    //       simultaneously, you will exit the current room automatically. Do you
    //       want to proceed?
    //     </SweetAlert>
    //   );
    // };
    // useEffect(() => {
    //   getActiveRoom();
    // }, []);

    const getActiveRoom = () => {
      groupCategoryApi.callGetMyActiveRooms(
        (message: string, resp: any) => {
          if (resp?.active_rooms?.length > 0) {
            // const groupId = cryptr.encrypt(group)
            // const roomID = cryptr.encrypt(roomId);
            handleShowAlert(0, roomId, resp.active_rooms[0]?.id);
          } else {
            handleFinalJoinRoom(0, roomId);
            // history.push(`${roomID}/room-details`);
          }
          SetActiveRooms(resp?.active_rooms);
        },
        (message: string) => {}
      );
    };
    const handleShowAlert = (
      exit_room: number,
      roomId: number,
      activeRoomId: number
    ) => {
      setAlert(
        <SweetAlert
          warning
          // showCancel
          confirmBtnText="Ok"
          cancelBtnText="Cancel"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title="Alert"
          onConfirm={() => handleFinalJoinRoom(exit_room, roomId, activeRoomId)}
          focusCancelBtn={true}
        >
          You have a basic nickname, you cannot be in more than one voice room
          simultaneously, you will exit the current room automatically. Do you
          want to proceed?
        </SweetAlert>
      );
    };

    const handleShowAlerts = (exit_room: number) => {
      setAlert(
        <SweetAlert
          warning
          confirmBtnText="Ok"
          cancelBtnText="Cancel"
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="success"
          allowEscape={false}
          closeOnClickOutside={false}
          title="Alert"
          onConfirm={() => redirecttoactiveRooms()}
          focusCancelBtn={true}
        >
          <p>
            You have reached your room joining limit. You need to exit the room
            to join a new one.
          </p>
        </SweetAlert>
      );
    };
    const redirecttoactiveRooms = () => {
      // onClose(true);
      history.replace('')
      history.push('groups')
      groupCategoryAction.activeRoomsPopDownHandler(true);
      setAlert(null);
    };
    const joinRoom = () => {
      let SimultaneousRoom = useSelector?.is_subscribed?.feature.filter(
        (x: any) => x.type == "simultaneous_room"
      );
      if (SimultaneousRoom) {
        groupCategoryApi.callGetMyActiveRooms(
          (message: string, resp: any) => {
            if (resp?.active_rooms
              ?.length > SimultaneousRoom[0]?.value) {
              // const groupId = cryptr.encrypt(group)
              // const roomID = cryptr.encrypt(roomId);
              // handleShowAlert(0, roomId, resp.active_rooms[0]?.id);
              // console.log("roomid",roomId,"response of active rooms",resp);
              handleShowAlerts(1);
            } else {
              handleFinalJoinRoom(0, roomId);
          
            }
            // SetActiveRooms(resp?.active_rooms);
          },
          (message: string) => {}
        );


        // console.log(activerooms?.length,SimultaneousRoom[0]?.value,"data");
        
        // if (activerooms?.length > SimultaneousRoom[0]?.value) {
        //   console.log();
          
        //   handleShowAlerts(1);
        // } else {
        //   // const groupId = cryptr.encrypt(group)
        //   // const roomID = cryptr.encrypt(roomId);
        //   handleFinalJoinRoom(0, roomId);
        //   // history.push(`${roomID}/room-details`);
        // }
      } else {
        getActiveRoom();
      }

      // const params = {
      //   room_id: parseInt(cryptr.decrypt(roomId)),
      // };
      // groupCategoryApi.callJoinSimultaneouslyRoom(
      //   params,
      //   (message: string, resp: any) => {
      //     if (resp) {
      //       console.log(resp,"Response");

      //       handleFinalJoinRoom(0);
      //     }
      //   },
      //   (message: string) => {
      //     // toast.error(message)
      //     // history.replace("")
      //     // history.push(URLS.USER.DASHBOARD)
      //     handleShowAlert(1);
      //   }
      // );
    };

    const handleFinalJoinRoom = (
      exit_room?: number,
      roomId?: any,
      activeRoomID?: any,
      invitation_code?: any, // initation code

    ) => {
      const params: any = {
        room_id: cryptr.decrypt(roomId),
        exit_room,
        invitation_code, // initation code
      };
      groupCategoryApi.callJoinRoom(
        params,
        (message: string, resp: any) => {
          console.log("join room guard call =====", resp);
          
          hideAlert();
          setShowLockLoader(false);
          // setAlert(null)
          if (activeRoomID) {
            setTimeout(() => {
              handleExitRoom(activeRoomID);
            }, 1000);
          }
          // getRoomList();
        },
        (message: string) => {
          toast.error(message);
          history.replace("");
          history.push(URLS.USER.DASHBOARD);
        }
      );
    };
    const handleExitRoom = (data: any) => {
      var params = {
        room_id: data,
      };
      groupCategoryApi.callExitFromRoom(
        params,
        (message: string, resp: any) => {
          getActiveRoom();
          toast.success(message);
          // if (r_id == data) {
          //     history.replace('');
          //     history.push(`groups`);
          // }

          // window.location.reload();
        },
        (message: string) => {
          toast.error(message);
        }
      );
    };
    useEffect(() => {
      getRoomList();
    }, [groupId]);

    const getRoomList = () => {
      const params = {
        group_id: parseInt(cryptr.decrypt(groupId)),
      };
      groupCategoryApi.callGetRoomListCategoryWise(
        params,
        (message: string, resp: any) => {},
        (message: string) => {}
      );
    };

    useEffect(() => {
      const data: any = localStorage.getItem("isAdminlock");
      const url = new URL(window.location.href);
      const Newparams = new URLSearchParams(url.search);
      const codeParam = Newparams.get("invitation_code");
      if (codeParam) {
        var params = {
          room_id: parseInt(cryptr.decrypt(roomId)),
          invitation_code: codeParam,
        };
        groupCategoryApi.callVerifyInviteCode(
          params,
          (message: string, resp: any) => {
            // history.replace("");
            joinRoom();
            // history.push(`${groupId}/${roomId}/room-details`);
          },
          (message: string) => {
            toast.error(message);
          }
        );
      } else {
        if (data) {
          // joinRoom()
          closeLockWindowModal(true);
        } else {
          if (
            rommListCategoryWise &&
            rommListCategoryWise.list &&
            rommListCategoryWise.list.length &&
            roomId &&
            !isFirstTimeLockWordRun
          ) {
            let routeRoom =
              rommListCategoryWise &&
              rommListCategoryWise.list &&
              rommListCategoryWise.list.length
                ? rommListCategoryWise.list.filter(
                    (x) => x.id == parseInt(cryptr.decrypt(roomId))
                  )
                : null;
            if (routeRoom && routeRoom.length) {
              if (
                routeRoom[0].locked_room &&
                routeRoom[0].join_status == null
              ) {
                //when room is locked and not user notjoin or exit room then this segment called
                //open lockWord Popup Here
                setLockRoomModal(true);

              } else if (
                routeRoom[0].locked_room &&
                routeRoom[0].join_status &&
                [1, 2].includes(routeRoom[0].join_status.is_admin)
              ) {
                //room islocked and user is admin or head admin then admin password modal appear
                setAdminCodeModal(true);
              } else if (
                !routeRoom[0].locked_room &&
                routeRoom[0].join_status == null
              ) {
                joinRoom();
                setIsFirstTimeLockWordRun(true);
              } else {
                setShowLockLoader(false);
              }
            }
          }
        }
      }
    }, [rommListCategoryWise, roomId]);

    return (
      <React.Fragment>
        {alert}
        {showLockLoader ? (
          <div className="lock-loader-container">
            <div className="lock-loader-base">
              <Spinner animation="border" variant="info" />
            </div>
          </div>
        ) : (
          <Component {...props} />
        )}
        <LockWordModal
          onClose={closeLockWindowModal}
          shouldShow={lockRoomModal}
        />
        <AdminCodeModal
          onClose={closeAdminCodeModal}
          shouldShow={adminCodeModal}
        />
      </React.Fragment>
    );
  }

  return JoinRoomHoc;
};
export default joinRoomGauard;
