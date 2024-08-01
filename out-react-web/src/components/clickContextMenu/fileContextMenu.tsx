import React, { useEffect, useState, useRef } from "react";
import { Menu, Item, Separator, Submenu } from "react-contexify";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import { useHistory } from "react-router-dom";
import { useUserApi } from "../../_common/hooks/actions/user/appUserApiHook";
import { useToaster } from "../../_common/hooks/actions/common/appToasterHook";
import { UpdateVisibilityStatus } from "../../_common/interfaces/ApiReqRes";
import { useAppUserAction } from "src/_common/hooks/actions/user/appUserActionHook";
import { URLS, STORAGE, CRYPTO_SECRET_KEY } from "src/_config";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import {
  useAppLeftMenuItemListSelector,
  useAppRoomDetailsSelector,
  useRoomAutoSaveSelector,
  useAppAmountSelector,
} from "src/_common/hooks/selectors/groupCategorySelector";
import RoomDetailsModal from "../commonModals/roomDetailsModal/roomDetailsModal";
import { useAppPmWindowDetails } from "src/_common/hooks/selectors/pmWindowSelector";
import ContactListForGiftModal from "src/components/commonModals/contactListForGiftSend/ContactListModal";
import StickerBuyModal from "src/components/commonModals/stickerBuyModal/stickerBuyModal";
import CustomizedPersonalMessageModal from "../commonModals/customizedPersonalMessageModal/customizedPersonalMessageModal";
import SweetAlert from "react-bootstrap-sweetalert";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";
import { updateAmount } from "src/_common/hooks/actions/common/appAmountHook";
import { useSelector, useDispatch } from "react-redux";
import { useUserPreferenceApi } from "src/_common/hooks/actions/userPreference/appUserPreferenceApiHook";
import { useParams } from "react-router";
import { setTimeout } from "timers";
import { FILE_URL } from "src/_config/site_urls";
// import html2PDF from 'jspdf-html2canvas';

// import { bindActionCreators } from 'redux';
// import {actionCreators} from ''
// import jsPDF from 'jspdf';

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

function downloadURI(uri: string, name: string) {
  var link = document.createElement("a");
  // If you don't know the name or want to use
  // the webserver default set name = ''
  link.setAttribute("download", name);
  link.href = uri;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const FileContextMenu = ({
  openVirtualCreditsModal,
  setOpenVirtualCreditsModal,
  handlePdfSave,
  handleGroupPdfSave,
}: any) => {
  const commonApi = useCommonApi();
  const userApi = useUserApi();
  const toast = useToaster();
  const userAction = useAppUserAction();
  const pmWindowApi = usePmWindowApi();
  const groupCategoryApi = useGroupCategoryApi();
  const groupCategoryAction = useAppGroupCategoryAction();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const pmWindowDetailsSelector = useAppPmWindowDetails();
  const autoSaveSelector = useRoomAutoSaveSelector();
  const anchorRef = useRef(null);
  const history = useHistory();
  const [showRoomDetailsModal, setShowRoomDetailsModal] =
    useState<boolean>(false);

  const [alert, setAlert] = useState<any>(null);
  const [showStickerBuyModal, setShowStickerBuyModal] =
    useState<boolean>(false);
  const [showContactListModal, setContactListModalModal] =
    useState<boolean>(false);
  const [eStoreActiveSection, setEStoreActiveSection] =
    useState<string>("Stickers");
  const [byStickerModalType, setByStickerModalType] = useState<any>();
  const [selectedContactList, setSelectedContactList] = useState<any>([]);
  const [
    showCustomizedPersonalMessageModal,
    setShowCustomizedPersonalMessageModal,
  ] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [getSelectedValue, setSelectedValue] = useState<any>(1);
  const leftMenuItemDetails = useAppLeftMenuItemListSelector();
  const amountSelector = useAppAmountSelector();
  const [pdfurl, setPdfUrl] = useState<any>("");
  const [downloadBtn, setDownloadbtn] = useState<boolean>(false);
  // const { groupId, roomId } = useParams<any>();

  const { groupId, roomId } = useParams<any>();
  const { pmId } = useParams<any>();

  let r_id: number;

  if (roomId !== null && roomId !== undefined) {
    r_id = parseInt(cryptr.decrypt(roomId));
  } else {
    // Handle the case when roomId is null or undefined
  }

  // const r_id: number = parseInt(cryptr.decrypt(roomId));
  // const [saveChat, setSaveChat] = useState<boolean>(false);
  const showRoomNameSelected = amountSelector.amount;

  const preference = useUserPreferenceApi();
  useEffect(() => {
    if (openVirtualCreditsModal) {
      openGiftSticker([]);
    }
    if (leftMenuItemDetails) {
      setSelectedValue(
        leftMenuItemDetails?.show_room_i_am_in_options
          ?.show_room_i_am_in_options || 0
      );
    }
    setSelectedValue(showRoomNameSelected);

    // console.log('------------------------------------------',document.getElementById('anchorTag'));
    // console.log('-------------------------',r_id);
  }, [openVirtualCreditsModal, leftMenuItemDetails, showRoomNameSelected]);

  const handleItemClick = (e: any, val: any) => {
    // setSelectedItem(item);
    const params = { show_room_i_am_in_options: Number(val) };
    preference.callSaveUserPreference(
      params,
      (message: string, resp: any) => {
        toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
    setSelectedValue(val);
    const newAmount = val;
    dispatch(updateAmount(newAmount));
  };

  const handleClickDownloadPdf = (roomType: string) => {
    console.log("r_id ====>", r_id);

    let params;
    if (roomType == "room") {
      params = {
        room_id: r_id,
        download: true,
        isPM: false,
      };
    } else {
      params = {
        room_id: parseInt(cryptr.decrypt(pmId)),
        download: true,
        isPM: true,
      };
    }

    groupCategoryApi.callGetAllChatFromRoom(
      params,
      (message: string, resp: any) => {
        if (resp) {
          if (resp.fileUrl) {
            downloadURI(resp.fileUrl, "chat");
            setPdfUrl(resp.fileUrl);
            setDownloadbtn(true);
          }
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
    // console.log('-------------r_id',r_id);
  };

  const handleCloseOthersRoomPmUsersWindow = () => {
    let params = {
      pm_id: pmWindowDetailsSelector.id,
    };
    pmWindowApi.callExitPmWindow(
      params,
      (message: string, resp: any) => {
        history.push(URLS.USER.DASHBOARD);
      },
      (message: string) => {}
    );
  };

  const handleSaveChat = () => {
    if (
      roomDetailsSelector &&
      roomDetailsSelector.room &&
      roomDetailsSelector.room.id
    ) {
      var params = {
        room_id: roomDetailsSelector.room.id,
      };
      commonApi.callSaveRoomChat(
        params,
        (message: string, resp: any) => {
          toast.success(resp.message);
        },
        (message: string) => {
          toast.error(message);
        }
      );
    } else {
      toast.error("Room Id not found");
    }
  };

  const handleOpenRoomDetailsModal = () => {
    setShowRoomDetailsModal(true);
  };

  const handleCloseRoomDetailsModal = () => {
    if (showRoomDetailsModal) setShowRoomDetailsModal(false);
  };

  const handleStatusChange = (e: any, status: number) => {
    const params: UpdateVisibilityStatus = {
      visible_status: status,
    };
    userApi.callUpdateUserVisibilityStatus(
      params,
      (message: string, resp: any) => {
        if (resp) {
        } else {
          toast.error(message);
        }
      },
      (message: string, resp: any) => {
        toast.error(message);
      }
    );
  };

  const LogOut = () => {
    console.log("filecontext");
    userApi.callLogout(
      (message: string, resp: any) => {
        if (resp) {
          localStorage.removeItem(STORAGE);
          localStorage.setItem("isAdult", "0");
          groupCategoryAction.emptyRoomListCategoryWise();
          userAction.logout();
          history.push(URLS.LOGIN);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const gotoProfilePage = () => {
    history.push(URLS.USER.MY_PROFILE);
  };

  const gotoMyNotebookPage = (e: any) => {
    history.push(URLS.USER.NOTEBOOK);
  };

  const gotoMyPreference = () => {
    history.push(URLS.USER.USER_PREFERENCES);
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const showAlert = () => {
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
        title={`Exit OutrighTalk`}
        onConfirm={() => LogOut()}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {`Are you sure you want to exit OutrighTalk?`}
      </SweetAlert>
    );
  };

  const handleExitRoom = () => {
    if (
      roomDetailsSelector &&
      roomDetailsSelector.room &&
      roomDetailsSelector.room.id
    ) {
      var params = {
        room_id: roomDetailsSelector.room.id,
      };
      groupCategoryApi.callExitFromRoom(
        params,
        (message: string, resp: any) => {
          toast.success(message);
          history.push(URLS.USER.GROUPS_AND_CATEGORY);
        },
        (message: string) => {
          toast.error(message);
        }
      );
    } else {
      toast.error("Room Id not found");
    }
  };

  //For send virtual gift

  const contactListCloseModal = () => {
    if (showContactListModal) setContactListModalModal(false);
  };

  const openContactListModal = (e: any) => {
    setContactListModalModal(true);
  };

  const openGiftSticker = (contactList: any) => {
    setSelectedContactList(contactList);
    // setByStickerModalType('giftSendStickerBuy')
    setShowStickerBuyModal(true);
  };

  //for stricker buy modal close
  const handleOnCloseSticker = () => {
    setShowStickerBuyModal(false);
    setSelectedContactList([]);
    // setByStickerModalType('')
    // getStickerCategory()

    setOpenVirtualCreditsModal(null);
  };

  //For customized message modal
  const handleOpenCustomizedMessageModal = () => {
    setShowCustomizedPersonalMessageModal(true);
  };

  const handleCloseCustomizedMessageModal = () => {
    if (showCustomizedPersonalMessageModal)
      setShowCustomizedPersonalMessageModal(false);
  };

  const handleOpenStore = () => {
    console.log("Open Store");
  };

  const handleClearAboutMessage = () => {
    userApi.callCLearAboutMessage(
      (message: string, resp: any) => {
        if (resp) {
          userAction.manageAboutMessage(null);
          toast.success(message);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };
  const gotoChatHistoryPage = () => {
    history.push(URLS.USER.CHAT_HISTORY);
  };

  return (
    <React.Fragment>
      {alert}
      <Menu id="menu_header_file_id" className="header-click-menu">
        <Submenu label="Change my status">
          <Item onClick={(e) => handleStatusChange(e, 1)}>Available</Item>
          <Item onClick={(e) => handleStatusChange(e, 2)}>Away</Item>
          <Item onClick={(e) => handleStatusChange(e, 3)}>
            DND (Do not Disturb)
          </Item>
          <Item onClick={(e) => handleStatusChange(e, 4)}>Invisible</Item>
        </Submenu>
        <Submenu label="Show the room I’m in to">
          <Item onClick={(e) => handleItemClick(e, 1)}>
            {getSelectedValue && getSelectedValue == 1 ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : (
              ""
            )}
            My contacts only
          </Item>
          <Item onClick={(e) => handleItemClick(e, 2)}>
            {getSelectedValue && getSelectedValue == 2 ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : (
              ""
            )}
            All users
          </Item>
          <Item onClick={(e) => handleItemClick(e, 3)}>
            {getSelectedValue && getSelectedValue == 3 ? (
              <i className="fa fa-check" aria-hidden="true"></i>
            ) : (
              ""
            )}
            No one.
          </Item>
        </Submenu>
        <Item onClick={handleOpenCustomizedMessageModal}>
          Customize a personal message
        </Item>
        <Item onClick={handleClearAboutMessage}>Clear About message</Item>
        <Separator />
        <Item onClick={() => gotoMyPreference()}>Preferences</Item>
        <Item onClick={(event) => gotoMyNotebookPage(event)}>My Notebook</Item>
        {/* <Item onClick={() => gotoProfilePage()}>My OutrigTalk</Item> */}
        <Separator />
        {/* <Item onClick={(event) => handleItemClick(event.props.profile)}>Delete</Item> */}
        <Item onClick={openGiftSticker}>Outrightalk e-Store</Item>
        {/* <Item onClick={(event) => handleItemClick(event)}>Skins</Item> */}
        {/* <Item onClick={(event) => handleItemClick(event)}>Language</Item> */}
        {/* <Item onClick={(event) => handleItemClick(event, 0)}>
          Received Files
        </Item> */}
        <Item onClick={(e) => gotoChatHistoryPage()}>Chat History</Item>
        <Separator />
        {/* <Item onClick={(e) => handleItemClick(e)}>Chat History</Item> */}
        <Item onClick={() => showAlert()}>Exit</Item>
      </Menu>

      <Menu id="room_header_menu_file_id" className="header-click-menu">
        <Item onClick={() => handleClickDownloadPdf("room")}>Save</Item>

        {/* <Item> */}
        {/* {downloadBtn ? (
                    <>
                        <Separator />
                        <Item>
                            <a href={`${FILE_URL}${pdfurl}`} id="anchorTag" target="_blank" style={{ color: 'black' }} download="w3logo" ref={anchorRef}>Download</a>
                        </Item>
                    </>
                ) 
                 : '' } */}
        {/* <a href={`${FILE_URL}${pdfurl}`} id="anchorTag" target="_blank" download="w3logo" ref={anchorRef}>Download</a> */}

        {/* </Item> */}
        {/* <a href= download style={{ display: 'none' }} ref={anchorRef}></a> */}
        {/* <Item onClick={(e) => handleSaveChat()} >   
                {
                    autoSaveSelector && autoSaveSelector.status?
                    <i className="fa fa-check" aria-hidden="true"></i>:
                    null
                }
                Autosave</Item> */}
        <Separator />
        <Item onClick={handleOpenRoomDetailsModal}>Room Details</Item>
        <Separator />
        <Item onClick={() => handleExitRoom()}>Exit Room</Item>
      </Menu>

      <Menu id="pm_header_file_id" className="header-click-menu">
        <Item onClick={() => handleClickDownloadPdf("pm")}>Save</Item>
        <Item
          onClick={(event) => {
            setEStoreActiveSection("Stickers");
            openContactListModal(event);
          }}
        >
          Send a Virtual Gift
        </Item>
        <Item
          onClick={(event) => {
            setEStoreActiveSection("Nickname-Subscriptions");
            openContactListModal(event);
          }}
        >
          Buy Gift Subscription
        </Item>
        <Separator />
        {/* <Item onClick={(event) => handleItemClick(event, 0)}>
          Save Conversation
        </Item> */}
        <Item onClick={() => handleCloseOthersRoomPmUsersWindow()}>
          Close Conversation
        </Item>
      </Menu>

      {showRoomDetailsModal && (
        <RoomDetailsModal
          shouldShow={showRoomDetailsModal}
          onClose={handleCloseRoomDetailsModal}
          roomId={roomDetailsSelector.room.id}
        />
      )}

      {showStickerBuyModal ? (
        <StickerBuyModal
          onClose={handleOnCloseSticker}
          shouldShow={showStickerBuyModal}
          byModalType={"ownStickerBuy"} //ownStickerBuy or giftSendStickerBuy
          selectedContactList={selectedContactList}
          entityId={pmWindowDetailsSelector?.id}
          type={"pm"}
          selectedSection={eStoreActiveSection}
        />
      ) : null}

      {showContactListModal ? (
        <ContactListForGiftModal
          onClose={contactListCloseModal}
          onSuccess={openGiftSticker}
          shouldShow={showContactListModal}
          type={"stickerGiftSend"}
          isPMUsers={true}
        />
      ) : null}

      {showCustomizedPersonalMessageModal ? (
        <CustomizedPersonalMessageModal
          title="Customized Personal Message"
          onClose={handleCloseCustomizedMessageModal}
          shouldShow={showCustomizedPersonalMessageModal}
        />
      ) : null}
    </React.Fragment>
  );
};

export default FileContextMenu;
