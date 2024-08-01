import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {
  getAvailabiltyStatusText,
  getBooleanStatus,
  getNameInitials,
  getStatusColor,
  getSubscriptionColor,
} from "src/_config";
import clsx from "clsx";
import { toast } from "react-toastify";
import { useAppPmWindowDetails } from "src/_common/hooks/selectors/pmWindowSelector";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";

interface ContactListModalProps {
  shouldShow: boolean;
  onClose: () => void;
  getPmWindowDetails: () => void;
  pmId: number;
}

export default function RemoveUserPmModal({
  shouldShow,
  onClose,
  pmId,
  getPmWindowDetails,
}: ContactListModalProps) {
  const [addedUser, setAddedUser] = useState<any>();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const pmWindowApi = usePmWindowApi();
  const pmWindowDetailsSelector = useAppPmWindowDetails();

  useEffect(() => {
    if (pmWindowDetailsSelector) {
      const addedUser = pmWindowDetailsSelector?.users.find(
        (user: any) => user?.is_admin == 0 && user?.is_added == 1
      );
      if (addedUser) {
        setAddedUser(addedUser);
      }
    }
  }, [pmWindowDetailsSelector]);

  const handleCloseModal = () => {
    onClose();
  };

  const handleCheckboxChange = (userId: number) => {
    setSelectedUserId(userId === selectedUserId ? null : userId);
  };
  // Remove user/ users from pm window

  // const handleRemoveUser = () => {
  //   if (selectedUserId !== null) {
  //     let fd = new FormData();
  //     const params = {
  //       pm_id: pmId,
  //       user_id: [selectedUserId],
  //     };

  //     for (const [key, value] of Object.entries(params)) {
  //       if (Array.isArray(value)) {
  //         value.forEach((val) => fd.append(`${key}[]`, val.toString()));
  //       } else {
  //         fd.append(key, value.toString());
  //       }
  //     }
  //     pmWindowApi.callRemoveMemberFromPmWindow(
  //       fd,
  //       (message: string, resp: any) => {
  //         getPmWindowDetails();
  //         onClose();
  //       },
  //       (message: string) => {
  //         toast.error(message);
  //       }
  //     );
  //   }
  // };
  const handleRemoveUser = () => {
    if (selectedUserId !== null) {
      let fd = new FormData();
      const params = {
        pm_id: pmId,
        user_id: [selectedUserId],
      };

      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            if (val !== undefined && val !== null) {
              fd.append(`${key}[]`, val.toString());
            }
          });
        } else {
          if (value !== undefined && value !== null) {
            fd.append(key, value.toString());
          }
        }
      }
      pmWindowApi.callRemoveMemberFromPmWindow(
        fd,
        (message: string, resp: any) => {
          getPmWindowDetails();
          onClose();
        },
        (message: string) => {
          toast.error(message);
        }
      );
    }
  };

  // console.log(
  //   "pmWindowDetailsSelector----------",
  //   pmWindowDetailsSelector,
  //   addedUser
  // );

  return (
    <React.Fragment>
      <Modal
        show={shouldShow}
        backdrop="static"
        keyboard={false}
        className="bs-example-modal-center contact-list-modal theme-custom-modal"
        size="lg"
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <h5 className="modal-title mt-0">Remove user</h5>
          <button
            type="button"
            className="close"
            onClick={() => handleCloseModal()}
          >
            <i className="modal-close" />
          </button>
        </Modal.Header>
        <Modal.Body bsPrefix={"-contactlist"}>
          <div className="modal-body pl-0 pr-0">
            <div className="contact-list-table">
              <div
                className="table-responsive mb-0 contact_mod"
                data-pattern="priority-columns"
              >
                <table className="table">
                  <tbody>
                    {addedUser ? (
                      <tr>
                        <td>
                          <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success d-inline-flex">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={"customCheck-outlinecolor17"}
                              checked={selectedUserId === addedUser.user_id}
                              onChange={() =>
                                handleCheckboxChange(addedUser.user_id)
                              }
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="customCheck-outlinecolor17"
                            />
                          </div>
                          <div className="message-table-name d-inline-flex align-items-center ml-4">
                            <div className="message-mail-avatar">
                              {addedUser &&
                              addedUser?.user_info &&
                              addedUser?.user_info?.avatar &&
                              getBooleanStatus(
                                addedUser?.user_info?.avatar &&
                                  addedUser?.user_info?.avatar?.visible_avatar
                                  ? addedUser?.user_info?.avatar?.visible_avatar
                                  : 0
                              ) &&
                              addedUser?.user_info.avatar.thumb ? (
                                <img
                                  src={addedUser?.user_info?.avatar?.thumb}
                                  alt={addedUser?.user_info?.username}
                                />
                              ) : (
                                <span className="text-avatar">
                                  {getNameInitials(
                                    addedUser?.user_info?.username
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="message-mail-content">
                              <h4
                                style={{
                                  color: getSubscriptionColor(
                                    addedUser?.user_info
                                  ),
                                }}
                              >
                                {addedUser?.user_info?.customize_nickname &&
                                addedUser?.user_info?.customize_nickname
                                  ?.nickname
                                  ? addedUser?.user_info?.customize_nickname
                                      ?.nickname
                                  : addedUser?.user_info?.username}
                                {addedUser &&
                                addedUser?.user_info?.user_badge &&
                                addedUser?.user_info?.user_badge
                                  ?.current_badge &&
                                new Date(
                                  addedUser?.user_info?.user_badge?.expiry_date.replaceAll(
                                    "-",
                                    "/"
                                  )
                                ).getTime() > new Date().getTime() ? (
                                  <img
                                    src={
                                      addedUser?.user_info?.user_badge
                                        ?.current_badge?.icon?.original
                                    }
                                    height={25}
                                    width={25}
                                    className="m-2"
                                    alt=""
                                  />
                                ) : (
                                  ""
                                )}
                              </h4>
                              <p>
                                <span>
                                  <i
                                    className="oline-tag"
                                    style={{
                                      backgroundColor: getStatusColor(
                                        addedUser?.user_info?.visible_status
                                      ),
                                    }}
                                  />
                                  {addedUser?.user_info?.visible_status == 4
                                    ? getAvailabiltyStatusText(0)
                                    : getAvailabiltyStatusText(
                                        addedUser?.user_info?.visible_status
                                      )}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={50}>No record found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="contact-list-bottom-form d-flex justify-content-between">
              <div className="d-flex">
                <button
                  className={clsx({
                    "next-btn waves-effect": selectedUserId,
                    "next-btn waves-effect disable-link": !selectedUserId,
                  })}
                  onClick={handleRemoveUser}
                  data-toggle="modal"
                  data-target=".sendvoicemail"
                  data-dismiss="modal"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
