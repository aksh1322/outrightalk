import React, { useState, useEffect } from "react";
import { FormGroup, FormLabel, InputGroup, Modal } from "react-bootstrap";
import ProgressBar from "@ramonak/react-progress-bar";
import ReactTooltip from "react-tooltip";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import Slider from "react-slick";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { CRYPTO_SECRET_KEY, getSubscriptionColor } from "src/_config";
import { toast } from "react-toastify";
import { useParams } from "react-router";
import BuyVirtualGiftModal from "src/components/commonModals/buyVitrualGift/buyVirtualGiftModal";
import AwardedBadgesModal from "src/components/commonModals/awardedBadges/awardedBadgesModal";
import PointsToCashModal from "src/components/commonModals/pointsToCash/pointsToCash";
import SharePointsModal from "src/components/commonModals/sharePointsModal/sharePontsModal";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import {
  useAppUserDetailsSelector,
  useAppUserSendGiftTypeSelector,
} from "src/_common/hooks/selectors/userSelector";
import { ReactComponent as LockSvg } from "src/assets/svg/lock-svgrepo-com.svg";
import SweetAlert from "react-bootstrap-sweetalert";

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface StickerBuyModalProps {
  onClose: () => void;
  shouldShow: boolean;
  byModalType: string;
  selectedContactList: any;
  entityId?: number;
  type: string;
  selectedSection?: string;
}

const settings = {
  dots: false,
  infinite: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  swipeToSlide: true,
  autoplay: false,
};

export default function StickerBuyModal({
  onClose,
  shouldShow,
  byModalType,
  selectedContactList,
  entityId,
  type,
  selectedSection,
}: StickerBuyModalProps) {
  const [contactListUsers, setContactListUsers] = useState<any>([]);
  const [selectedUser, setSelectedUser] = useState<any>("");
  useEffect(() => {
    if (selectedContactList.length > 0) {
      for (let id of selectedContactList) {
        setSelectedUser(id)
        let params = { user_id: id };
        userApi.callFetchUserDetails(
          params,
          (message: string, resp: any) => {
            let findAny = selectedContactList.find(
              (ele: any) => ele.id == resp.user.id
            );
              
            if (!findAny) {
             
              setContactListUsers([...contactListUsers, resp.user]);
            }
          },
          (message: string) => {}
        );
      }
    }
  }, [selectedContactList]);

  const commonApi = useCommonApi();
  const userApi = useUserApi();
  const groupCategoryApi = useGroupCategoryApi();

  // const [selectedCat, setSelectedCat] = useState<any>(null)
  const [stickerCategories, setStickerCategories] = useState<any>([]);
  const [stickerSubCategories, setStickerSubCategories] = useState<any>([]);
  const [categorywiseSticker, setCategorywiseSticker] = useState<any>([]);
  const [categorywisePacks, setCategorywisePacks] = useState<any>([]);
  const [selectedStickerCategory, setSelectedStickerCategory] =
    useState<number>();
  const [selectedStickerSubCategory, setSelectedStickerSubCategory] =
    useState<number>();
  const [showBuyVirtualGift, setShowBuyVirtualGift] = useState<any>(false);
  const [ShowAwardedBadgesModal, setShowAwardedBadgesModal] =
    useState<any>(false);
  const [showPointsToCashModal, setShowPointsToCashModal] =
    useState<any>(false);
  const [showSharePointsModal, setShowSharePointsModal] = useState<any>(false);
  const [sharePercent, setSharePercent] = useState<number>(0);
  const [availableCredit, setAvailableCredit] = useState<any>();
  const [progressBar, setProgressBar] = useState<number>(0);
  const [currentBadgeImage, setCurrentBadgeImage] = useState<string>();
  const [nextBadgeImage, setNextBadgeImage] = useState<string>();
  const [remaningPoints, setRemaningPoints] = useState<number>(0);
  const [expireDate, setExpireDate] = useState<string>("");
  const [selectedData, setSelectedData] = useState<string>("Stickers");
  const [selectedSubscription, setSelectedSubscription] =
    useState<string>("Monthly");

  const [nicknameSubscriptionList, setNicknameSubscriptionList] = useState<
    any[]
  >([]);
  const [roomSubscriptionList, setRoomSubscriptionList] = useState<any[]>([]);
  const [virtualCreditList, setVirtualCreditList] = useState<any>([]);
  const [informationAlert, setinformationAlert] = useState<any>();
  const [openVirtualCreditsModal, setOpenVirtualCreditsModal] =
    useState<any>(null);
  const userSelector = useAppUserDetailsSelector();
  const sendGiftTypeValue = useAppUserSendGiftTypeSelector();
  // const { pmId } = useParams<any>();
  // const pm_id: number = parseInt(cryptr.decrypt(pmId));

  // const { roomId } = useParams<any>();
  // const r_id: number = parseInt(cryptr.decrypt(roomId));

  useEffect(() => {
    if (sendGiftTypeValue == "Nickname-Subscriptions") {
      setSelectedData(sendGiftTypeValue);
    }
    if(sendGiftTypeValue == "Virtual Credits"){
      setSelectedData(sendGiftTypeValue);
      getVirtualCreditList()
    }
  }, [sendGiftTypeValue]);


  useEffect(() => {
    let ifOpen = localStorage.getItem("open_virtual_credits_modal");
    if (ifOpen) {
      ifOpen = JSON.parse(ifOpen);
      setOpenVirtualCreditsModal(ifOpen);
      setShowBuyVirtualGift(true);
    }
  }, []);

  useEffect(() => {
    getStickerCategory();
    getBadgeDetails();
    getNicknameSubscriptionList("monthly");
    getRoomSubscriptionList("monthly");
  }, []);

  useEffect(() => {
    if (selectedSection) setSelectedData(selectedSection);
  }, [selectedSection]);

  const getVirtualCreditList = () => {
    var params = {};
    groupCategoryApi.callGetVirtualGiftCreditList(
      params,
      (message: string, resp: any) => {
        if (resp && resp.length) {
          setVirtualCreditList(resp);
        } else {
          setVirtualCreditList([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getNicknameSubscriptionList = (plan: string) => {
    const params = {
      plan: plan,
      is_gift:1
    };
    userApi.callGetNicknameSubscriptionPlan(
      params,
      (message: string, resp: any) => {
        if (resp && resp.plans.length) {
          setNicknameSubscriptionList(resp.plans);
        } else {
          setNicknameSubscriptionList([]);
        }
      },
      (message: string) => {
        console.error("Error at nickname subscription fetch");
      }
    );
  };

  const getRoomSubscriptionList = (plan: string) => {
    const params = {
      plan: plan,
      is_gift:1
    };
    groupCategoryApi.callGetRoomSubscriptionList(
      params,
      (message: string, resp: any) => {
        if (resp && resp.plans.length) {
          setRoomSubscriptionList(resp.plans);
        } else {
          setRoomSubscriptionList([]);
        }
      },
      (message: string) => {
        console.error("Error at room subscription fetch");
      }
    );
  };

  const getStickerCategory = () => {
    let params = {
      type: ["credit"],
    };
    commonApi.callGetStickerCategories(
      params,
      (message: string, resp: any) => {
        if (resp && resp.categories && resp.categories.length) {
          setStickerCategories(resp.categories);
          if (
            resp.categories[0].children &&
            resp.categories[0].children.length
          ) {
            setStickerSubCategories(resp.categories[0].children);
            getCategorywiseSticker(
              null,
              resp.categories[0].id,
              resp.categories[0].children[0].id
            );
          } else {
            setStickerSubCategories([]);
            getNonChildrenCategorywiseSticker(null, resp.categories[0].id);
          }
        }

        if (resp && resp.credit && resp.credit.credit) {
          setAvailableCredit(resp.credit.credit);
        } else {
          setAvailableCredit(0);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getBadgeDetails = () => {
    let params = {};
    commonApi.callGetBadgeDetails(
      params,
      (message: string, response: any) => {
        var remaning =
          response.badge_data.next_badge.points -
          response.badge_points.current_balance;
        if (remaning > 0) {
          setRemaningPoints(remaning + 1);
        }
        if (response.badge_points.current_balance == 0) {
          var progressBar = 0;
        } else {
          var progressBar =
            (response.badge_points.current_balance /
              response.badge_data.next_badge.points) *
            100;
        }

        setCurrentBadgeImage(
          response.badge_data.current_badge
            ? response.badge_data.current_badge.icon.thumb
            : ""
        );
        setNextBadgeImage(response.badge_data.next_badge.icon.thumb);
        setProgressBar(progressBar);
        setExpireDate(response.badge_data.expiry_date);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getCategorywiseSticker = (e: any, pcatId: number, catId: number) => {
    if (e) {
      e.preventDefault();
    }
    setSelectedStickerCategory(pcatId);
    setSelectedStickerSubCategory(catId);
    let params = {
      category_id: pcatId,
      sub_category_id: catId,
    };
    commonApi.callGetAllStickerCategorywise(
      params,
      (message: string, resp: any) => {
        if (resp && resp.sticker && resp.sticker.length > 0) {
          setCategorywiseSticker(resp.sticker);
          setCategorywisePacks(resp.sticker_packs);
        } else {
          setCategorywiseSticker([]);
          setCategorywisePacks([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const getNonChildrenCategorywiseSticker = (e: any, catId: number) => {
 
    if (e) {
      e.preventDefault();
    }
    setSelectedStickerCategory(catId);
    let params = {
      category_id: catId,
    };
    commonApi.callGetAllStickerCategorywise(
      params,
      (message: string, resp: any) => {
   
        if (resp && resp.sticker && resp.sticker.length > 0) {
          // console.log("resp sticker", resp);
          setCategorywiseSticker(resp.sticker);
          setCategorywisePacks(resp.sticker_packs);
          setStickerSubCategories([]);
        } else {
          setCategorywiseSticker([]);
          setCategorywisePacks([]);
          setStickerSubCategories([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const fromSliderCategoryWise = (catId: number) => {
    let found =
      stickerCategories && stickerCategories.length
        ? stickerCategories.filter((x: any) => x.id == catId)
        : [];
    if (found && found.length) {
      if (found[0].children && found[0].children.length) {
        setStickerSubCategories(found[0].children);
        getCategorywiseSticker(
          null,
          found[0].children[0].pid,
          found[0].children[0].id
        );
      }
    }
  };

  // const selectSticker = (e: any,cat:any) => {
  //     e.preventDefault();
  //     // setSelectedCat(cat.id)
  // }

  const renderSlides = () =>
    stickerCategories.map((cat: any, index: any) => (
      <div className="slipper_category">
        {cat.children && cat.children.length ? (
          <a
            href="#"
            className={cat.id == selectedStickerCategory ? "active" : ""}
            key={index}
            onClick={(e) => fromSliderCategoryWise(cat.id)}
          >
            {cat.title}
          </a>
        ) : (
          <a
            href="#"
            className={cat.id == selectedStickerCategory ? "active" : ""}
            key={index}
            onClick={(e) => getNonChildrenCategorywiseSticker(e, cat.id)}
          >
            {cat.title}
          </a>
        )}
      </div>
    ));

  const handleBuyVirtualCredit = (e: any, virtualCreditId: number) => {
    e.preventDefault();
    if(selectedUser){
      const params = {
        user_id:selectedUser,
        plan_id:virtualCreditId,
      }
      commonApi.callsendVirtualGift(params,(message:string,resp:any)=>{
        if(resp){
          toast.success(message);
          getStickerCategory();
        }
      },(message:string)=>{
  toast.error(message)
      })
    }
    else {
      setinformationAlert(
        <SweetAlert
        danger
        confirmBtnText="Ok"
      confirmBtnBsStyle="primary"
      allowEscape={false}
      closeOnClickOutside={false}
      title="Invalid Operation"
      onConfirm={() => setinformationAlert(false)}
      onCancel={() => {
        setinformationAlert(false);
      }}
      focusCancelBtn={true}
      >
        <p>
           You can not send gift from here directly, please right click  nickname and  send gift option
           </p>
    </SweetAlert>
    )
    }
  };

  const handleBuySubscription = (
    e: any,
    planId: number,
    timePeriodId: number,
  ) => {
    e.preventDefault();
    if(selectedUser){
      const params = {
        user_id:selectedUser,
        plan_id:planId,
        time_period_id:timePeriodId
      }
      commonApi.callGetGiftedSubscription(params,(message:string,resp:any)=>{
        if(resp){
          toast.success(message);
          getStickerCategory();
        }
      },(message:string)=>{
  toast.error(message)
      })
    }
    else {
      setinformationAlert(
        <SweetAlert
        danger
        confirmBtnText="Ok"
      confirmBtnBsStyle="primary"
      allowEscape={false}
      closeOnClickOutside={false}
      title="Invalid Operation"
      onConfirm={() => setinformationAlert(false)}
      onCancel={() => {
        setinformationAlert(false);
      }}
      focusCancelBtn={true}
      >
        <p>
           You can not send gift from here directly, please  right click  nickname and send gift option
           </p>
    </SweetAlert>
    )
    }
    
  };

  const handleBuySticker = (e: any, stickerId: number) => {
    e.preventDefault();

    if (byModalType == "ownStickerBuy") {
      if (stickerId) {
        let params = {
          sticker_id: stickerId,
        };
        commonApi.callStickerBuy(
          params,
          (message: string, resp: any) => {
            onClose();
          },
          (message: string) => {
            toast.warn(message);
          }
        );
      } else {
        toast.error("Sticker id not found");
      }
    } else {
      if (stickerId) {
        let params = {
          sticker_id: stickerId,
          user_id: selectedContactList,
          entity_id: entityId,
          type,
        };
        commonApi.callStickerGiftpurchase(
          params,
          (message: string, resp: any) => {
            onClose();
          },
          (message: string) => {
            toast.error(message);
          }
        );
      } else {
        toast.error("Sticker id not found");
      }
    }
  };

  const handleBuyPack = (e: any, pack_id: number) => {
    e.preventDefault();
    if (byModalType == "ownStickerBuy") {
      if (pack_id) {
        let params = {
          pack_id: pack_id,
        };
        commonApi.callPackBuy(
          params,
          (message: string, resp: any) => {
            onClose();
          },
          (message: string) => {
            toast.warn(message);
          }
        );
      } else {
        toast.error("Sticker id not found");
      }
    } else {
      if (pack_id) {
        let params = {
          pack_id: pack_id,
          user_id: selectedContactList,
        };
        commonApi.callSendPackAsGift(
          params,
          (message: string, resp: any) => {
            onClose();
          },
          (message: string) => {
            toast.error(message);
          }
        );
      } else {
        toast.error("Sticker id not found");
      }
    }
  };

  const handleSendPoints = (userId: any) => {
    let params = {
      points_percentage: sharePercent,
      user_id: userId,
    };
    commonApi.callSharePointsNotify(
      params,
      (message: string, resp: any) => {
        toast.success(resp.message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const updateSelected = (e: any) => {
    setSelectedSubscription("Monthly");
    setSelectedData(e.target.innerText);
    if (e.target.innerText == "Nickname-Subscriptions") {
      getNicknameSubscriptionList("Monthly");
    } else if (e.target.innerText == "Room-Subscriptions") {
      getRoomSubscriptionList("Monthly");
    }
    else {
      getVirtualCreditList();
    }
  };

  const updateSelectedSubscription = (e: any) => {
    setSelectedSubscription(e.target.innerText);
    if (selectedData == "Nickname-Subscriptions") {
      getNicknameSubscriptionList(e.target.innerText);
    } else {
      getRoomSubscriptionList(e.target.innerText);
    }
  };

  const openBuyCreditModal = (e: any) => {
    e.preventDefault();
    setShowBuyVirtualGift(true);
  };

  const openAwardedBadgesModal = (e: any) => {
    e.preventDefault();
    setShowAwardedBadgesModal(true);
  };

  const openPointsToCashModal = (e: any) => {
    e.preventDefault();
    setShowPointsToCashModal(true);
  };

  const openSharePointsModal = (e: any) => {
    e.preventDefault();
    setSharePercent(e.target.value);
    setShowSharePointsModal(true);
  };

  const handleCloseSharePointsModal = () => {
    setShowSharePointsModal(false);
  };

  const handleCloseAwardedBadgesModal = () => {
    setShowAwardedBadgesModal(false);
  };

  const handleCloseBuyVirtualGiftModal = () => {
    setShowBuyVirtualGift(false);
    if (openVirtualCreditsModal) {
      localStorage.removeItem("open_virtual_credits_modal");
      setOpenVirtualCreditsModal(null);
    }
  };

  const handleClosePointsToCashModal = () => {
    setShowPointsToCashModal(false);
  };

  return (
    <React.Fragment>
      {informationAlert}
      <Modal
        show={shouldShow}
        backdrop="static"
        keyboard={false}
        size="xl"
        centered
        // dialogClassName="modal-dialog-scrollable"
        // contentClassName='custom-modal'
      >
        <Modal.Header>
          {/* <h5 className="modal-title mt-0">Add New Stickers</h5> */}
          {/* <div className="credits-wrap top_creadit">
                            <h2 className="available-credit">Available Credits : <span className="available-credit-value">{availableCredit}</span></h2>
                            <a href="#" onClick={(e) => openBuyCreditModal(e)} className="buy-credits">buy Credits</a>
                        </div> */}
          <div className="upper-wrap">
            <div className="head">
              <h5>OutrighTalk e-store</h5>
            </div>
          </div>
          <button type="button" className="close" onClick={() => onClose()}>
            <span aria-hidden="true">&times;</span>
          </button>
        </Modal.Header>
        <Modal.Body
          bsPrefix={"sticker-buy"}
          className="modal-body all_creadit_body_section"
        >
          <div className="user_n d-flex justify-content-between">
            <div
              className="user_name mb-2"
              style={{
                background: "rgb(162 216 255)",
                borderRadius: "5px",
              }}
            >
              <svg
                width="35"
                height="35"
                viewBox="0 0 35 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="17.5" cy="17.5" r="17.5" fill="#556DE3" />
                <path
                  d="M13.625 13.625C13.625 15.6236 15.2514 17.25 17.25 17.25C19.2486 17.25 20.875 15.6236 20.875 13.625C20.875 11.6264 19.2486 10 17.25 10C15.2514 10 13.625 11.6264 13.625 13.625ZM23.6944 25.3056H24.5V24.5C24.5 21.3914 21.9698 18.8611 18.8611 18.8611H15.6389C12.5294 18.8611 10 21.3914 10 24.5V25.3056H23.6944Z"
                  fill="white"
                />
              </svg>
              <span
                className="ml-2"
                style={{
                  color: getSubscriptionColor(userSelector),
                }}
              >
                {userSelector?.username}
                {currentBadgeImage ? (
                  <img
                    src={currentBadgeImage}
                    className="mr-1"
                    alt="badge"
                    style={{
                      maxWidth: "25px",
                      width: "100%",
                      marginLeft: "5px",
                    }}
                  />
                ) : null}
              </span>
              {contactListUsers.length > 0 ? (
                <>
                  <span className="ml-2">sending a gift to</span>
                  {contactListUsers.map((ele: any) => (
                    <span
                      className="ml-2"
                      style={{
                        color: getSubscriptionColor(ele),
                      }}
                    >
                      {ele?.username}
                    </span>
                  ))}
                </>
              ) : null}
            </div>
            <div className="badges-options d-flex">
              <button
                type="button"
                onClick={(e) => openBuyCreditModal(e)}
                className="btn btn-primary mr-1"
              >
                Buy V Credits
              </button>
              <button
                type="button"
                onClick={(e) => openAwardedBadgesModal(e)}
                className="btn btn-primary mr-1"
              >
                Awarded Badges
              </button>
              <button
                type="button"
                onClick={(e) => openPointsToCashModal(e)}
                className="btn btn-primary mr-1"
              >
                Points for Cash $
              </button>
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-expanded="false"
                >
                  Share Points
                </button>
                <div
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  <button
                    className="dropdown-item"
                    value="25"
                    onClick={(e) => openSharePointsModal(e)}
                  >
                    25%
                  </button>
                  <button
                    className="dropdown-item"
                    value="50"
                    onClick={(e) => openSharePointsModal(e)}
                  >
                    50%
                  </button>
                  <button
                    className="dropdown-item"
                    value="75"
                    onClick={(e) => openSharePointsModal(e)}
                  >
                    75%
                  </button>
                  <button
                    className="dropdown-item"
                    value="100"
                    onClick={(e) => openSharePointsModal(e)}
                  >
                    100%
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="current-level d-flex mt-3 mb-3 justify-content-between align-items-center">
            <div className="d-flex">
              {currentBadgeImage ? (
                <div className=" current-lev">
                  <p className="pr-2">Current Badge</p>
                  <img src={currentBadgeImage} alt="badge" />
                </div>
              ) : (
                <div className=" current-lev">
                  <p className="pr-2">No Badge</p>
                </div>
              )}
              <div className="Expire ml-2 d-flex">
                <span>Expire Date </span>
                <p
                  className="mb-0"
                  data-tip={
                    expireDate != ""
                      ? "Will be expiring on " + expireDate
                      : "No expiry date"
                  }
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.49998 1.58334C5.13473 1.58334 1.58331 5.13476 1.58331 9.50001C1.58331 13.8653 5.13473 17.4167 9.49998 17.4167C13.8652 17.4167 17.4166 13.8653 17.4166 9.50001C17.4166 5.13476 13.8652 1.58334 9.49998 1.58334ZM10.2916 14.25H8.70831V12.6667H10.2916V14.25ZM11.0643 10.3827C10.9091 10.5078 10.7595 10.6273 10.6408 10.7461C10.3178 11.0683 10.2924 11.3612 10.2916 11.3739V11.4792H8.70831V11.347C8.70831 11.2536 8.73127 10.4152 9.52056 9.62588C9.67494 9.47151 9.86652 9.31476 10.0676 9.15168C10.6487 8.68063 11.0303 8.33705 11.0303 7.86363C11.0211 7.4637 10.8557 7.08325 10.5696 6.80369C10.2834 6.52412 9.89924 6.36765 9.4992 6.36776C9.09916 6.36786 8.71504 6.52453 8.42905 6.80424C8.14305 7.08395 7.97789 7.46449 7.9689 7.86443H6.38556C6.38556 6.1473 7.78285 4.75001 9.49998 4.75001C11.2171 4.75001 12.6144 6.1473 12.6144 7.86443C12.6144 9.12872 11.681 9.88318 11.0643 10.3827V10.3827Z"
                      fill="#ff5722"
                    />
                  </svg>
                </p>
                <ReactTooltip />
              </div>
            </div>
            <div>
              {" "}
              <span>
                Available credits <strong>{availableCredit} </strong>
              </span>
            </div>
          </div>
          <div className="progress-level  w-50 d-flex align-items-center">
            {currentBadgeImage ? (
              <img src={currentBadgeImage} className="mr-1" alt="badge" />
            ) : null}
            <ProgressBar className="progress_bar" completed={progressBar} />
            <span>
              <img className="mx-2" src={nextBadgeImage} alt="badge" />
            </span>
          </div>
          <div className="note mb-4 mt-2">
            <span>
              Remaining points to next level:{" "}
              <strong>{remaningPoints} Points</strong>
            </span>
          </div>
          <div className="note mb-4 mt-2">
            <span>
              <strong>All Gifts</strong>
            </span>
          </div>
          {/* <div className="manage-video-message-panel text-center"> */}
          <div className="new-sticker-tabs new_left_section">
            <div className="mb-2">
              <a
                href="#"
                className={selectedData == "Stickers" ? "active" : " "}
                onClick={(e) => updateSelected(e)}
              >
                Stickers
              </a>
              <a
                href="#"
                className={
                  selectedData == "Nickname-Subscriptions" ? "active" : " "
                }
                onClick={(e) => updateSelected(e)}
              >
                Nickname-Subscriptions
              </a>
              <a
                href="#"
                className={
                  selectedData == "Room-Subscriptions" ? "active" : " "
                }
                onClick={(e) => updateSelected(e)}
              >
                Room-Subscriptions
              </a>
              <a
                href="#"
                className={selectedData == "Virtual Credits" ? "active" : " "}
                onClick={(e) => updateSelected(e)}
              >
                Virtual Credits
              </a>
            </div>

            {selectedData == "Room-Subscriptions" ||
            selectedData == "Nickname-Subscriptions" ? (
              <div className="mb-2">
                <a
                  href="#"
                  className={selectedSubscription == "Monthly" ? "active" : " "}
                  onClick={(e) => updateSelectedSubscription(e)}
                >
                  Monthly
                </a>
                <a
                  href="#"
                  className={selectedSubscription == "Weekly" ? "active" : " "}
                  onClick={(e) => updateSelectedSubscription(e)}
                >
                  Weekly
                </a>
              </div>
            ) : selectedData == "Virtual Credits" ? null : (
              <div className="row">
                <div className="col-xl-3 col-lg-3 col-md-12">
                  <div className="slider_height">
                    {renderSlides()}
                    {/* <Slider vertical={true} verticalSwiping={true} {...settings}>{renderSlides()}</Slider> */}
                  </div>
                </div>
                <div className="col-xl-9 col-lg-9 col-md-12">
                  <div className="new-sticker-body new_right_section">
                    <div className="row">
                      {selectedData == "Stickers" ? (
                        <>
                          {stickerSubCategories &&
                          stickerSubCategories.length ? (
                            <div className="col-md-3">
                              <ul className="sub-category left_panel_category">
                                {stickerSubCategories &&
                                stickerSubCategories.length
                                  ? stickerSubCategories.map((subcat: any) => (
                                      <li
                                        className={
                                          selectedStickerSubCategory ==
                                          subcat.id
                                            ? "active"
                                            : ""
                                        }
                                        onClick={() =>
                                          getCategorywiseSticker(
                                            null,
                                            subcat.pid,
                                            subcat.id
                                          )
                                        }
                                      >
                                        {subcat.title}
                                      </li>
                                    ))
                                  : null}
                              </ul>
                            </div>
                          ) : null}
                          <div
                            className={
                              stickerSubCategories &&
                              stickerSubCategories.length
                                ? "col-md-9 right_panel_sticker"
                                : "col-md-12 right_panel_sticker"
                            }
                          >
                            {categorywiseSticker &&
                            categorywiseSticker.length ? (
                              <>
                                {categorywiseSticker.map((sticker: any) => (
                                  <div className="new-sticker-box">
                                    <div className="new-sticker-img">
                                      <img src={sticker.icon.thumb} alt="" />
                                    </div>
                                    {sticker.title ? (
                                      <h2>{sticker.title}</h2>
                                    ) : null}
                                    {byModalType == "ownStickerBuy" ? (
                                      // sticker.is_buy ?
                                      // (
                                      //   <a
                                      //     href="#"
                                      //     onClick={(e) => {
                                      //       e.preventDefault();
                                      //     }}
                                      //   >
                                      //     Already buy
                                      //   </a>
                                      // ) :
                                      <a
                                        href="#"
                                        onClick={(e) =>
                                          handleBuySticker(e, sticker.id)
                                        }
                                      >
                                        {sticker.credit_points} credits
                                      </a>
                                    ) : (
                                      <a
                                        // className={`${
                                        //   byModalType == "giftSendStickerBuy" &&
                                        //   sticker.is_buy
                                        //     ? "credits_sticker"
                                        //     : ""
                                        // }`}
                                        href="#"
                                        onClick={(e) => {
                                          // if (sticker.is_buy) {
                                          //   toast.warn("sticker alredy bought");
                                          // }
                                          handleBuySticker(e, sticker.id);
                                        }}
                                      >
                                        {sticker.credit_points} credits
                                      </a>
                                    )}
                                  </div>
                                ))}

                                {categorywisePacks.map((sticker: any) => (
                                  <div className="new-sticker-box">
                                    <div style={{ float: "right" }}>
                                      <LockSvg
                                        width={25}
                                        height={25}
                                        fill={"#9b9898"}
                                      />
                                    </div>
                                    <div className="new-sticker-img">
                                      <img src={sticker.icon.thumb} alt="" />
                                    </div>
                                    {sticker.title ? (
                                      <h2>{sticker.title}</h2>
                                    ) : null}
                                    {byModalType == "ownStickerBuy" ? (
                                      // sticker.is_buy ?
                                      // (
                                      //   <a
                                      //     href="#"
                                      //     onClick={(e) => {
                                      //       e.preventDefault();
                                      //     }}
                                      //   >
                                      //     Already buy
                                      //   </a>
                                      // ) :
                                      <a
                                        href="#"
                                        onClick={(e) =>
                                          handleBuyPack(e, sticker.id)
                                        }
                                      >
                                        {sticker.credit_points} credits
                                      </a>
                                    ) : (
                                      <a
                                        // className={`${
                                        //   byModalType == "giftSendStickerBuy" &&
                                        //   sticker.is_buy
                                        //     ? "credits_sticker"
                                        //     : ""
                                        // }`}
                                        href="#"
                                        onClick={(e) => {
                                          // if (sticker.is_buy) {
                                          //   toast.warn("sticker alredy bought");
                                          // }
                                          handleBuyPack(e, sticker.id);
                                        }}
                                      >
                                        {sticker.credit_points} credits
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="new-sticker-box">
                                <h2>No Sticker Found</h2>
                              </div>
                            )}
                          </div>
                        </>
                      ) : selectedData == "Nickname-Subscriptions" ? (
                        <>
                          <div className="col-md-12 right_panel_sticker">
                            {nicknameSubscriptionList &&
                            nicknameSubscriptionList.length ? (
                              nicknameSubscriptionList.map((sticker: any) => (
                                <div className="new-sticker-box">
                                  <div className="new-sticker-img">
                                    <img src={sticker.icon.thumb} alt="" />
                                  </div>
                                  {sticker.title ? (
                                    <h2>{sticker.title}</h2>
                                  ) : null}
                                  <a
                                    href="#"
                                    onClick={(e) =>
                                      handleBuySubscription(
                                        e,
                                        sticker.id,
                                        sticker.plans[0].id
                                      )
                                    }
                                  >
                                    {sticker.plans[0].virtual_credits} credits
                                  </a>
                                </div>
                              ))
                            ) : (
                              <div className="new-sticker-box">
                                <h2>No Subscriptions Found</h2>
                              </div>
                            )}
                          </div>
                        </>
                      ) : selectedData == "Room-Subscriptions" ? (
                        <>
                          <div className="col-md-12 right_panel_sticker">
                            {roomSubscriptionList &&
                            roomSubscriptionList.length ? (
                              roomSubscriptionList.map((sticker: any) => (
                                <div className="new-sticker-box">
                                  <div className="new-sticker-img">
                                    <img src={sticker.icon.thumb} alt="" />
                                  </div>
                                  {sticker.title ? (
                                    <h2>{sticker.title}</h2>
                                  ) : null}
                                  <a
                                    href="#"
                                    onClick={(e) =>
                                      handleBuySubscription(
                                        e,
                                        sticker.id,
                                        sticker.plans[0].id
                                      )
                                    }
                                  >
                                    {sticker.plans[0].virtual_credits} credits
                                  </a>
                                </div>
                              ))
                            ) : (
                              <div className="new-sticker-box">
                                <h2>No Subscriptions Found</h2>
                              </div>
                            )}
                          </div>
                        </>
                      ) : selectedData == "Virtual Credits" ? (
                        <>
                          <div className="col-md-12 right_panel_sticker">
                            {virtualCreditList && virtualCreditList.length ? (
                              virtualCreditList.map((sticker: any) => (
                                <div className="new-sticker-box">
                                  <div className="new-sticker-img">
                                    <img src={sticker.icon.thumb} alt="" />
                                  </div>
                                  {sticker.paid_credit ? (
                                    <h2>Paid : {sticker.paid_credit}</h2>
                                  ) : null}
                                  {sticker.free_credit ? (
                                    <h2>Free : {sticker.free_credit}</h2>
                                  ) : null}

                                  <a
                                    href="#"
                                    onClick={(e) =>
                                      handleBuyVirtualCredit(e, sticker.id)
                                    }
                                  >
                                    {sticker.paid_credit} credits
                                  </a>
                                </div>
                              ))
                            ) : (
                              <div className="new-sticker-box">
                                <h2>No Virtual Credits Found</h2>
                              </div>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {[
            "Room-Subscriptions",
            "Nickname-Subscriptions",
            "Virtual Credits",
          ].includes(selectedData) && (
            <div className="new-sticker-body new_right_section">
              <div className="row">
                {selectedData == "Stickers" ? (
                  <>
                    {stickerSubCategories && stickerSubCategories.length ? (
                      <div className="col-md-3">
                        <ul className="sub-category left_panel_category">
                          {stickerSubCategories && stickerSubCategories.length
                            ? stickerSubCategories.map((subcat: any) => (
                                <li
                                  className={
                                    selectedStickerSubCategory == subcat.id
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() =>
                                    getCategorywiseSticker(
                                      null,
                                      subcat.pid,
                                      subcat.id
                                    )
                                  }
                                >
                                  {subcat.title}
                                </li>
                              ))
                            : null}
                        </ul>
                      </div>
                    ) : null}
                    <div
                      className={
                        stickerSubCategories && stickerSubCategories.length
                          ? "col-md-9 right_panel_sticker"
                          : "col-md-12 right_panel_sticker"
                      }
                    >
                      {categorywiseSticker && categorywiseSticker.length ? (
                        categorywiseSticker.map((sticker: any) => (
                          <div className="new-sticker-box">
                            <div className="new-sticker-img">
                              <img src={sticker.icon.thumb} alt="" />
                            </div>
                            {sticker.title ? <h2>{sticker.title}</h2> : null}
                            {byModalType == "ownStickerBuy" ? (
                              // sticker.is_buy ?
                              // (
                              //   <a
                              //     href="#"
                              //     onClick={(e) => {
                              //       e.preventDefault();
                              //     }}
                              //   >
                              //     Already buy
                              //   </a>
                              // ) :
                              <a
                                href="#"
                                onClick={(e) => handleBuySticker(e, sticker.id)}
                              >
                                {sticker.credit_points} credits
                              </a>
                            ) : (
                              <a
                                // className={`${
                                //   byModalType == "giftSendStickerBuy" &&
                                //   sticker.is_buy
                                //     ? "credits_sticker"
                                //     : ""
                                // }`}
                                href="#"
                                onClick={(e) => {
                                  // if (sticker.is_buy) {
                                  //   toast.warn("sticker alredy bought");
                                  // }
                                  handleBuySticker(e, sticker.id);
                                }}
                              >
                                {sticker.credit_points} credits
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="new-sticker-box">
                          <h2>No Sticker Found</h2>
                        </div>
                      )}
                    </div>
                  </>
                ) : selectedData == "Nickname-Subscriptions" ? (
                  <>
                    <div className="col-md-12 right_panel_sticker">
                      {nicknameSubscriptionList &&
                      nicknameSubscriptionList.length ? (
                        nicknameSubscriptionList.map((sticker: any) => (
                          <div className="new-sticker-box">
                            <div className="new-sticker-img">
                              <img src={sticker.icon.thumb} alt="" />
                            </div>
                            {sticker.title ? <h2>{sticker.title}</h2> : null}
                            <a
                              href="#"
                              onClick={(e) =>
                                handleBuySubscription(
                                  e,
                                  sticker?.id,
                                  sticker?.plans[0]?.id
                                )
                              }
                            >
                              {sticker.plans[0].virtual_credits} credits
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="new-sticker-box">
                          <h2>No Subscriptions Found</h2>
                        </div>
                      )}
                    </div>
                  </>
                ) : selectedData == "Room-Subscriptions" ? (
                  <>
                    <div className="col-md-12 right_panel_sticker">
                      {roomSubscriptionList && roomSubscriptionList.length ? (
                        roomSubscriptionList.map((sticker: any) => (
                          <div className="new-sticker-box">
                            <div className="new-sticker-img">
                              <img src={sticker.icon.thumb} alt="" />
                            </div>
                            {sticker.title ? <h2>{sticker.title}</h2> : null}
                            <a
                              href="#"
                              onClick={(e) =>
                                handleBuySubscription(
                                  e,
                                  sticker?.id,
                                  sticker.plans[0]?.id
                                )
                              }
                            >
                              {sticker?.plans[0]?.virtual_credits} credits
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="new-sticker-box">
                          <h2>No Subscriptions Found</h2>
                        </div>
                      )}
                    </div>
                  </>
                ) : selectedData == "Virtual Credits" ? (
                  <>
                    <div className="col-md-12 right_panel_sticker">
                      {virtualCreditList && virtualCreditList.length ? (
                        virtualCreditList.map((sticker: any) => (
                          <div className="new-sticker-box">
                            <div className="new-sticker-img">
                              <img src={sticker.icon.thumb} alt="" />
                            </div>
                            {sticker.paid_credit ? (
                              <h2>Paid : {sticker.paid_credit}</h2>
                            ) : null}
                            {sticker.free_credit ? (
                              <h2>Free : {sticker.free_credit}</h2>
                            ) : null}

                            <a
                              href="#"
                              onClick={(e) =>
                                handleBuyVirtualCredit(e, sticker?.id)
                              }
                            >
                              {sticker?.paid_credit} credits
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="new-sticker-box">
                          <h2>No Virtual Credits Found</h2>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* </div> */}
        </Modal.Body>
      </Modal>

      {showBuyVirtualGift ? (
        <BuyVirtualGiftModal
          onClose={handleCloseBuyVirtualGiftModal}
          // onCancel={}
          shouldShow={showBuyVirtualGift}
          openVirtualCreditsModal={openVirtualCreditsModal}
        />
      ) : null}

      {ShowAwardedBadgesModal ? (
        <AwardedBadgesModal
          onClose={handleCloseAwardedBadgesModal}
          // onCancel={}
          shouldShow={ShowAwardedBadgesModal}
        />
      ) : null}

      {showPointsToCashModal ? (
        <PointsToCashModal
          onClose={handleClosePointsToCashModal}
          // onCancel={}
          shouldShow={showPointsToCashModal}
        />
      ) : null}

      {SharePointsModal ? (
        <SharePointsModal
          onClose={handleCloseSharePointsModal}
          onSuccess={handleSendPoints}
          shouldShow={showSharePointsModal}
          percentage={sharePercent}
        />
      ) : null}
    </React.Fragment>
  );
}
