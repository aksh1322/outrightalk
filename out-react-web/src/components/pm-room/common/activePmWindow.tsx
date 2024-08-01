import React, { useContext, useEffect, useState } from "react";
import Slider from "react-slick";
// import clsx from "clsx";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import { useAppPmWindowAction } from "src/_common/hooks/actions/pmWindow/appPmWindowActionHook";
import {
  useAppActivePmWindowListSelector,
  useAppActivePmsRouteSelector,
} from "src/_common/hooks/selectors/pmWindowSelector";
import { toast } from "react-toastify";
import { CRYPTO_SECRET_KEY, URLS } from "src/_config";
import { useHistory, useLocation } from "react-router-dom";
import { useParams } from "react-router";
// import { AntmediaContext } from 'src';

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const settings = {
  dots: false,
  infinite: false,
  slidesToShow: 5,
  slidesToScroll: 5,
  swipeToSlide: true,
  autoplay: false,
};

export default function ActivePmWindowPopDown() {
  // const antmedia = useContext<any>(AntmediaContext);

  const [selectedSlider, setSelectedSlider] = useState(0);
  const userSelector = useAppUserDetailsSelector();
  const pmWindowApi = usePmWindowApi();
  const pmWindowAction = useAppPmWindowAction();
  const activePmWindowSelector = useAppActivePmWindowListSelector();
  const [activePmWindows, setActivePmWindows] = useState(
    activePmWindowSelector
  );
  const history = useHistory();
  const location = useLocation();
  const { pmId } = useParams<any>();
  const pm_id: any = pmId ? parseInt(cryptr.decrypt(pmId)) : null;

  const handleCloseActivePmWindow = (e: any) => {
    e.preventDefault();
    getActivePmWindows();
    pmWindowAction.activePmWindowPopDownHandler(false);
  };

  const handleCloseOthersRoomPmUsersWindow = (e: any, data_id: any) => {
    e.preventDefault();
    e.stopPropagation();
    let params = {
      pm_id: data_id,
    };
    pmWindowApi.callExitPmWindow(
      params,
      (message: string, resp: any) => {
        toast.success(message);
        if (data_id == pm_id) history.push("/dashboard");

        // Update the list of active PM windows by filtering out the closed PM window
        const updatedPmWindows = activePmWindows.filter(
          (pmWindow: any) => pmWindow.id !== data_id
        );
        setActivePmWindows(updatedPmWindows);

        // pmWindowAction.activePmWindowPopDownHandler(false);
        // getActivePmWindows();
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleActivePmWindowRedirect = (id: number) => {
    const userId = cryptr.encrypt(id);
    // history.replace('')
    history.push(`/pm/${userId}`);
  };

  const handleEnterPmWindow = (e: any, data: any) => {
    e.preventDefault();
    console.log("handleEnterPmWindow----", data);
    let pageUrl = history.location.pathname.split("/");
    if (pageUrl && pageUrl.length && pageUrl.includes("pm")) {
      if (pm_id && pm_id != data.id) {
        setSelectedSlider(data.id);
        // let path = history.location.pathname.split('/').pop();
        // groupCategoryAction.emptyRoomDetails()
        pmWindowAction.activePmWindowPopDownHandler(false);
        pmWindowAction.fromRouteHandler(data.id);
        handleActivePmWindowRedirect(data.id);
        // const groupId = cryptr.encrypt(data.group_id)
        // const roomId = cryptr.encrypt(data.id)
        // // groupCategoryAction.roomMembersLargeViewMembersStreamData([])
        // history.replace('');
        // history.push(`${groupId}/${roomId}/room-details`);
      } else {
        pmWindowAction.activePmWindowPopDownHandler(false);
      }
    } else {
      setSelectedSlider(data.id);
      // let path = history.location.pathname.split('/').pop();
      // groupCategoryAction.emptyRoomDetails()
      pmWindowAction.activePmWindowPopDownHandler(false);
      pmWindowAction.fromRouteHandler(data.id);
      handleActivePmWindowRedirect(data.id);
      // const groupId = cryptr.encrypt(data.group_id)
      // const roomId = cryptr.encrypt(data.id)
      // // groupCategoryAction.roomMembersLargeViewMembersStreamData([])
      // history.replace('');
      // history.push(`${groupId}/${roomId}/room-details`);
    }
  };

  const getPmAdminName = (users: any[]) => {
    console.log(users, "hello users");
    const userId = userSelector && userSelector.id;

    let foundUsers = users.filter((x: any) => x.is_admin == 1);

    if (foundUsers && foundUsers.length) {
      if (foundUsers[0].user_id != userId) {
        return foundUsers[0].customize_nickname &&
          foundUsers[0].customize_nickname.nickname
          ? foundUsers[0].customize_nickname.nickname
          : foundUsers[0].user_info.username;
      } else {
        let foundUsers = users.filter((x: any) => x.is_admin == 0);
        if (foundUsers && foundUsers.length) {
          return foundUsers[0].customize_nickname &&
            foundUsers[0].customize_nickname.nickname
            ? foundUsers[0].customize_nickname.nickname
            : foundUsers[0].user_info.username;
        } else {
          return "NA";
        }
      }
    } else {
      return "NA";
    }
  };

  const renderSlides = () =>
    activePmWindows &&
    activePmWindows.length &&
    activePmWindows.map((activePmWindow: any, index: any) => (
      <div key={index}>
        <div
          className="room-box"
          onClick={async (e) => {
            // if (antmedia.publishStreamId) await antmedia.handleLeaveFromRoom();

            handleEnterPmWindow(e, activePmWindow);
          }}
        >
          <button
            className="exit-room"
            onClick={(e) =>
              handleCloseOthersRoomPmUsersWindow(e, activePmWindow.id)
            }
            // style={{ zIndex: 2 }}
          >
            <img src="/img/close-icon.png" style={{ width: "15px" }} alt="" />
          </button>
          {activePmWindow.pm_type === "group" ? (
            <img src="/img/room-img.jpg" alt="group_image" />
          ) : (
            <img src="/img/room-img.jpg" alt="single_image" />
          )}
          {/* <img src={activePmWindow.room_picture && activePmWindow.room_picture.thumb ? activePmWindow.room_picture.thumb : "/img/room-img.jpg"} alt={activePmWindow.room_name} /> */}
          {/* <img src="/img/room-img01.jpg" alt={activePmWindow.room_name} /> */}
          <div className="room-box-name">
            {activePmWindow?.users
              ?.map((user: any) => user?.user_info?.username)
              .join(", ")}
          </div>
        </div>
      </div>
    ));

  //Get active pms
  const getActivePmWindows = () => {
    pmWindowApi.callGetActivePmWindows(
      (message: string, resp: any) => {
        if (resp) {
          setActivePmWindows(resp?.active_pms);
        }
      },
      (message: string) => {}
    );
  };

  useEffect(() => {
    getActivePmWindows();
  }, []);

  const handleEnterPmWindowFunction = (e: any, data: any) => {
    e.preventDefault();
    console.log("handleEnterPmWindow----", data);
    let pageUrl = history.location.pathname.split("/");
    if (pageUrl && pageUrl.length && pageUrl.includes("pm")) {
      if (pm_id && pm_id != data.id) {
        setSelectedSlider(data.id);
        // let path = history.location.pathname.split('/').pop();
        // groupCategoryAction.emptyRoomDetails()
        pmWindowAction.activePmWindowPopDownHandler(false);
        pmWindowAction.fromRouteHandler(data.id);
        handleActivePmWindowRedirect(data.id);
        // const groupId = cryptr.encrypt(data.group_id)
        // const roomId = cryptr.encrypt(data.id)
        // // groupCategoryAction.roomMembersLargeViewMembersStreamData([])
        // history.replace('');
        // history.push(`${groupId}/${roomId}/room-details`);
      } else {
        pmWindowAction.activePmWindowPopDownHandler(false);
      }
    } else {
      setSelectedSlider(data.id);
      // let path = history.location.pathname.split('/').pop();
      // groupCategoryAction.emptyRoomDetails()
      pmWindowAction.activePmWindowPopDownHandler(false);
      pmWindowAction.fromRouteHandler(data.id);
      handleActivePmWindowRedirect(data.id);
      // const groupId = cryptr.encrypt(data.group_id)
      // const roomId = cryptr.encrypt(data.id)
      // // groupCategoryAction.roomMembersLargeViewMembersStreamData([])
      // history.replace('');
      // history.push(`${groupId}/${roomId}/room-details`);
    }
  };

  return (
    <React.Fragment>
      <div className="active-room-wrapper">
        <a
          href="#"
          onClick={(e) => handleCloseActivePmWindow(e)}
          className="close-box"
        >
          <img src="/img/close-icon.png" alt="close" />
        </a>
        <div className="room-list">
          {activePmWindows && activePmWindows.length ? (
            <Slider {...settings}>{renderSlides()}</Slider>
          ) : (
            <div className="no-active-pm-container">
              {/* <img src="/img/room-img.jpg" alt="no-room" />
<div className="room-box-name">No Active PM</div> */}
              <p className="no-active-pm">No Active PM</p>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
