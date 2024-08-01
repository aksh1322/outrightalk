import React, { useEffect, useState } from "react";
import { Menu, Item, Separator, Submenu } from "react-contexify";
import SweetAlert from "react-bootstrap-sweetalert";
import AddToFavouriteFolderSelectionModal from "src/components/commonModals/addToFavouriteFolderSelectionModal/addToFavouriteFolderSelectionModal";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import { useAppRoomDetailsSelector } from "src/_common/hooks/selectors/groupCategorySelector";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import {
  useAppFavouriteRoomListSelector,
  useAppRoomFavouriteFolderListSelector,
} from "src/_common/hooks/selectors/favouritesSelector";
import { CRYPTO_SECRET_KEY, getBooleanStatus, URLS } from "src/_config";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { useFavouritesApi } from "src/_common/hooks/actions/favourites/appFavouritesApiHook";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const FavouriteContextMenu = (props: any) => {
  const { groupId, roomId } = useParams<any>();
  const groupCategoryApi = useGroupCategoryApi();
  const favouriteApi = useFavouritesApi();
  const userSelector = useAppUserDetailsSelector();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const groupCategoryAction = useAppGroupCategoryAction();
  const favouriteFolderListSelector = useAppRoomFavouriteFolderListSelector();
  const history = useHistory();
  const [folderSelectionModal, setFolderSelectionModal] =
    useState<boolean>(false);
  const [alert, setAlert] = useState<any>(null);

  const handleItemClick = (e: any) => {
    console.log(e);
  };

  const gotoPage = (page: string) => {
    switch (page) {
      case "myRoom":
        history.push(URLS.USER.MY_ROOMS);
        break;
      case "manageFavouriteRooms":
        history.push(URLS.USER.MANAGE_FAVOURITE_ROOMS);
        break;
    }
  };

  //Add as Favourite room
  // const addAsFavourite = (roomId: number) => {
  //     const params = {
  //         room_id: roomId
  //     };
  //     groupCategoryApi.callAddAsFavourite(params, (message: string, resp: any) => {
  //         if (resp) {
  //             getRoomDetails(roomId)
  //         }
  //     }, (message: string) => {
  //         toast.error(message)
  //     })
  // }

  //Remove from favourite room
  const removeAsFavourite = (roomId: number) => {
    const params = {
      room_id: roomId,
    };
    groupCategoryApi.callRemoveFavourite(
      params,
      (message: string, resp: any) => {
        if (resp) {
          hideAlert();
          getRoomDetails(roomId);
          getRoomFavouriteFolderList();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const showRemoveFavouriteAlert = (roomId: number) => {
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
        onConfirm={() => removeAsFavourite(roomId)}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {`Are you sure you want to delete this room from your Favorites?`}
      </SweetAlert>
    );
  };

  //Get Room Details
  const getRoomDetails = (roomId: number) => {
    const params = {
      room_id: roomId,
    };
    groupCategoryApi.callGetRoomDetails(
      params,
      (message: string, resp: any) => {
        if (resp && resp.list && resp.list.length) {
        }
      },
      (message: string) => {
        // toast.error(message)
      }
    );
  };

  //favourite Folder selectiom modal
  const openFavouriteFolderSelectionModal = () => {
    setFolderSelectionModal(true);
  };

  const closeFavouriteFolderSelectionModal = () => {
    if (folderSelectionModal) setFolderSelectionModal(false);
  };

  const getRoomFavouriteFolderList = () => {
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

  const gotoRoomDetailsPage = (rId: number, gId: number) => {
    let pageUrl = history.location.pathname.split("/");
    const room = cryptr.encrypt(rId);
    const group = cryptr.encrypt(gId);
    if (pageUrl && pageUrl.length && pageUrl.includes("room-details")) {
      if (roomDetailsSelector.room.id && roomDetailsSelector.room.id != rId) {
        groupCategoryAction.emptyRoomDetails();
        groupCategoryAction.fromRouteHandler(rId);
        history.replace("");
        history.push(`${group}/${room}/room-details`);
      }
    } else {
      groupCategoryAction.emptyRoomDetails();
      groupCategoryAction.fromRouteHandler(rId);
      history.replace("");
      history.push(`${group}/${room}/room-details`);
    }
  };
  const handleInviteFriend = () => {};

  useEffect(() => {
    getRoomFavouriteFolderList();
  }, []);

  return (
    <React.Fragment>
      {alert}
      <Menu id="menu_header_favourite_id" className="header-click-menu">
        {getBooleanStatus(
          userSelector && userSelector.allow_create_room
        ) ? null : (
          <Item onClick={(event) => gotoPage("myRoom")}>My Room</Item>
        )}
        <Item onClick={(event) => gotoPage("manageFavouriteRooms")}>
          Manage Favorite Rooms
        </Item>
        {favouriteFolderListSelector && favouriteFolderListSelector.length ? (
          <Separator />
        ) : null}
        {favouriteFolderListSelector && favouriteFolderListSelector.length
          ? favouriteFolderListSelector.map((folder: any, index: number) => (
              <React.Fragment key={index}>
                {folder?.rooms && folder?.rooms.length > 0 && (
                  <Submenu
                    label={
                      folder?.folder_name ? folder.folder_name : "--"
                    }
                  >
                    {folder?.rooms && folder?.rooms.length
                      ? folder?.rooms.map((room: any, index: number) => (
                          <Item
                            key={room.id}
                            onClick={(event) =>
                              gotoRoomDetailsPage(
                                room.room_info.id,
                                room.room_info.group_id
                              )
                            }
                          >
                            {room.room_info && room.room_info.room_name
                              ? room.room_info.room_name
                              : "--"}
                          </Item>
                        ))
                      : null}
                  </Submenu>
                )}
              </React.Fragment>
            ))
          : null}
      </Menu>

      <Menu id="room_header_menu_favourite_id" className="header-click-menu">
        {userSelector && userSelector.allow_create_room === 0 ? (
          <Item onClick={(event) => gotoPage("myRoom")}>My Room</Item>
        ) : null}
        {roomDetailsSelector &&
        roomDetailsSelector.room &&
        getBooleanStatus(roomDetailsSelector.room.is_favourite_count) ? (
          <Item
            onClick={(event) =>
              showRemoveFavouriteAlert(roomDetailsSelector.room.id)
            }
          >
            Remove from Favourite
          </Item>
        ) : (
          <Item onClick={(event) => openFavouriteFolderSelectionModal()}>
            Add to Favourite
          </Item>
        )}
        <Item onClick={(event) => gotoPage("manageFavouriteRooms")}>
          Manage Favorite Rooms
        </Item>
        {favouriteFolderListSelector && favouriteFolderListSelector.length ? (
          <Separator />
        ) : null}
        {favouriteFolderListSelector && favouriteFolderListSelector.length
          ? favouriteFolderListSelector.map((folder: any, index: number) => (
              <React.Fragment>
                {folder?.rooms && folder?.rooms.length > 0 && (
                  <Submenu
                    label={
                      folder && folder?.folder_name ? folder.folder_name : "--"
                    }
                  >
                    {folder?.rooms && folder?.rooms.length
                      ? folder?.rooms.map((room: any, index: number) => (
                          <Item
                            key={room.id}
                            onClick={(event) =>
                              gotoRoomDetailsPage(
                                room.room_info.id,
                                room.room_info.group_id
                              )
                            }
                          >
                            {room.room_info && room.room_info.room_name
                              ? room.room_info.room_name
                              : "--"}
                          </Item>
                        ))
                      : null}
                  </Submenu>
                )}
              </React.Fragment>
            ))
          : null}
      </Menu>

      {folderSelectionModal && (
        <AddToFavouriteFolderSelectionModal
          onClose={closeFavouriteFolderSelectionModal}
          onSuccess={getRoomDetails}
          shouldShow={folderSelectionModal}
          roomId={roomDetailsSelector.room.id}
        />
      )}
    </React.Fragment>
  );
};

export default FavouriteContextMenu;
