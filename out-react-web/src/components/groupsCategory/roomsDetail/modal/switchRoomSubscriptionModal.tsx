import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import { getSubscriptionType } from "src/_config";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { useAppLoader } from "src/_common/hooks/actions/common/appLoaderHook";
import { useAppRoomDetailsSelector } from "src/_common/hooks/selectors/groupCategorySelector";

interface SwitchRoomSubscriptionModalProps {
  onClose: (success: any) => void;
  onCancel: (success: any) => void;
  shouldShow: boolean;
  roomId: number;
  openRoomSubscriptionModal: any;
}

export default function SwitchRoomSubscriptionModal({
  onClose,
  onCancel,
  shouldShow,
  roomId,
  openRoomSubscriptionModal,
}: SwitchRoomSubscriptionModalProps) {
  const userSelector = useAppUserDetailsSelector();
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const commonApi = useCommonApi();
  const { showLoader, hideLoader } = useAppLoader();
  const [selectedPlanId, setSelectedPlanId] = useState<any>(null);

  console.log(
    "roomDetails====++++===++++++====<<<<< switchRoomSubscription",
    roomDetailsSelector
  );

  console.log(
    "userselector ===============>>>>>>>>>>>>>>all_room_subscription",
    userSelector
  );

  const handlePlanDetailsChanged = (id: number) => {
    setSelectedPlanId(id);
  };
  const handleSwitchRoomSubscription = () => {
    const params = {
      subscription_id: selectedPlanId,
      room_id: roomId,
      type: "room",
    };
    // showLoader();
    commonApi.callSwitchRoomSubscription(
      params,
      (message: string, resp: any) => {
        if (resp) {
          onClose(true);
          toast.success(message);
          window.location.reload();
          // console.log(resp),
          //   hideLoader();
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  return (
    <React.Fragment>
      {alert}
      <Modal
        show={shouldShow}
        backdrop="static"
        onHide={() => onClose(false)}
        keyboard={false}
        className="theme-custom-modal"
        dialogClassName="modal-dialog-scrollable"
        size={"lg"}
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <h2>Switch Room Subscription plan</h2>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={() => onClose(true)}
          >
            <i className="modal-close" />
          </button>
        </Modal.Header>
        <Modal.Body
          bsPrefix={"switch-room-subscription"}
          className="modal-body pl-0 pr-0"
        >
          <div className="manage-video-message-panel">
            {roomDetailsSelector &&
            roomDetailsSelector.room.subscription_info ? (
              <div className="row">
                <div className="col-sm-12">
                  <p>
                    Current Room Plan:{" "}
                    {roomDetailsSelector.room &&
                    roomDetailsSelector.room.subscription_info.plan_info
                      ? roomDetailsSelector.room.subscription_info.plan_info
                          .title +
                        ` ( ${
                          roomDetailsSelector &&
                          roomDetailsSelector.room.subscription_info.price_info
                            ? getSubscriptionType(
                                roomDetailsSelector.room.subscription_info
                                  .price_info.type
                              )
                            : ""
                        } )`
                      : "--"}
                    &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                    {roomDetailsSelector &&
                    roomDetailsSelector.room.subscription_info.is_gift == 0
                      ? `${
                          roomDetailsSelector.room.subscription_info.is_closed
                            ? "Valid upto"
                            : "Renew at"
                        } :
                                 ${
                                   roomDetailsSelector?.room?.subscription_info
                                     ?.renew_date
                                 } `
                      : null}
                    {roomDetailsSelector &&
                      roomDetailsSelector.room.subscription_info.is_gift == 1 &&
                      `
                            expires_at : ${roomDetailsSelector.room.subscription_info.expire_date}`}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="row">
              <div className="col-sm-6">
                <h3
                  className="text-center"
                  style={{ color: "white", fontWeight: "bold" }}
                >
                  Purchased
                </h3>
                {userSelector && userSelector?.all_room_subscribtions?.length
                  ? userSelector.all_room_subscribtions.map((x: any) =>
                      x?.is_gift == 0 ? (
                        <div className="row">
                          <div className="col-sm-4" key={x.id}>
                            <div
                              className="planname"
                              aria-disabled={
                                x.id ==
                                roomDetailsSelector?.room?.subscription_info?.id
                              }
                            >
                              <div className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block ml-0 pl-0">
                                <input
                                  type="radio"
                                  className="custom-control-input"
                                  onChange={() =>
                                    handlePlanDetailsChanged(x.id)
                                  }
                                  id={"radioplanname" + x.id}
                                  value={x.id}
                                  name="planchoose"
                                  disabled={
                                    x.id ==
                                    roomDetailsSelector?.room?.subscription_info
                                      ?.id
                                  }
                                />
                                <label
                                  style={{ color: x?.plan_info?.color_code }}
                                  className="custom-control-label"
                                  htmlFor={"radioplanname" + x.id}
                                >
                                  {x?.plan_info?.title}
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-8">
                            <p className="mt-1">(renew at : {x?.renew_date})</p>
                          </div>
                        </div>
                      ) : null
                    )
                  : null}
              </div>
              <div className="col-sm-6">
                <h3
                  className="text-center"
                  style={{ color: "white", fontWeight: "bold" }}
                >
                  Gifted
                </h3>
                {userSelector && userSelector?.all_room_subscribtions?.length
                  ? userSelector.all_room_subscribtions.map((x: any) =>
                      x?.is_gift == 1 ? (
                        <div className="row">
                          <div className="col-sm-4" key={x.id}>
                            <div className="planname">
                              <div className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block ml-0 pl-0">
                                <input
                                  type="radio"
                                  className="custom-control-input"
                                  onChange={() =>
                                    handlePlanDetailsChanged(x.id)
                                  }
                                  id={"radioplanname" + x.id}
                                  value={x.id}
                                  name="planchoose"
                                  disabled={
                                    x.id ==
                                    roomDetailsSelector?.room?.subscription_info
                                      ?.id
                                  }
                                />
                                <label
                                  style={{ color: x?.plan_info?.color_code }}
                                  className="custom-control-label"
                                  htmlFor={"radioplanname" + x.id}
                                >
                                  {x?.plan_info?.title}
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-8">
                            <p className="mt-1">
                              (expire at : {x?.expire_date})
                            </p>
                          </div>
                        </div>
                      ) : null
                    )
                  : null}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn theme-btn btn-danger waves-effect mr-2 "
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => {
                onClose(true);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn theme-btn btn-primary waves-effect"
              onClick={handleSwitchRoomSubscription}
            >
              Switch
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
