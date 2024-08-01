import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { getSubscriptionType } from "src/_config";
import { useAppLoader } from "src/_common/hooks/actions/common/appLoaderHook";

interface SwitchNicknameSubscriptionModalProps {
  onClose: (success: any) => void;
  onCancel: (success: any) => void;
  shouldShow: boolean;
  roomId: number,
  openUserSubscriptionModal: any;
}

export default function SwitchNicknameSubscriptionModal({
  onClose,
  onCancel,
  shouldShow,
  roomId,
  openUserSubscriptionModal,
}: SwitchNicknameSubscriptionModalProps) {
  const userSelector = useAppUserDetailsSelector();
  const commonApi = useCommonApi();
  const { showLoader, hideLoader } = useAppLoader();
  const [selectedPlanId, setSelectedPlanId] = useState<any>(null);

  console.log(
    "userSelector=====================>SwitchNicknameSubscriptionModalProps",
    userSelector
  );
  const handlePlanDetailsChanged = (id: number) => {
    setSelectedPlanId(id);
  };
  const handleSwitchNicknameSubscription = () => {
    const params = {
      subscription_id: selectedPlanId,
      room_id: roomId,
      type: "nickname"
    };
    // showLoader();
    commonApi.callSwitchNicknameSubscription(
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
          <h2>Switch Subscription plan</h2>
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
          bsPrefix={"upgrade-nickname-subscription"}
          className="modal-body pl-0 pr-0"
        >
          <div className="manage-video-message-panel">
            {userSelector &&
            userSelector.is_subscribed != null &&
            userSelector?.is_subscribed?.room_id == 0 ? (
              <div className="row">
                <div className="col-sm-12">
                  <p>
                    Current Plan:{" "}
                    {userSelector && userSelector?.is_subscribed?.plan_info
                      ? userSelector?.is_subscribed?.plan_info?.title +
                        ` ( ${
                          userSelector &&
                          userSelector?.is_subscribed?.price_info
                            ? getSubscriptionType(
                                userSelector?.is_subscribed?.price_info?.type
                              )
                            : ""
                        } )`
                      : "--"}
                    &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                    {userSelector && userSelector?.is_subscribed?.is_gift == 0
                      ? `${
                          userSelector?.is_subscribed?.is_closed
                            ? "Valid upto"
                            : "Renew at"
                        } :
                                        ${
                                          userSelector?.is_subscribed
                                            ?.renew_date
                                        } `
                      : null}
                    {userSelector &&
                      userSelector?.is_subscribed?.is_gift == 1 &&
                      `
                    expires_at : ${userSelector?.is_subscribed?.expire_date}`}
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
                {userSelector && userSelector?.all_subscribtions?.length
                  ? userSelector.all_subscribtions.map((x: any) =>
                      x?.room_id == 0 && x?.is_gift == 0 ? (
                        <div className="row">
                          <div className="col-sm-4" key={x.id}>
                            <div
                              className="planname"
                              aria-disabled={
                                x.id == userSelector?.is_subscribed?.id
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
                                    x.id == userSelector?.is_subscribed?.id
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
                {userSelector && userSelector?.all_subscribtions?.length
                  ? userSelector.all_subscribtions.map((x: any) =>
                      x?.room_id == 0 && x?.is_gift == 1 ? (
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
                                    x.id == userSelector?.is_subscribed?.id
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
                onClose(false);
                // handleRemoveRoomSubscription()
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn theme-btn btn-primary waves-effect"
              onClick={handleSwitchNicknameSubscription}
            >
              Switch
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
