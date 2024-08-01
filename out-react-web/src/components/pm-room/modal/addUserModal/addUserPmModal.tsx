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
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { useAppPmWindowDetails } from "src/_common/hooks/selectors/pmWindowSelector";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";

interface ContactListModalProps {
  shouldShow: boolean;
  onClose: () => void;
  getPmWindowDetails: () => void;
  pmId: number;
}

export default function AddUserPmModal({
  shouldShow,
  onClose,
  pmId,
  getPmWindowDetails,
}: ContactListModalProps) {
  const [checkedValues, setCheckedValues] = useState<any>([]);
  const commonApi = useCommonApi();
  const pmWindowApi = usePmWindowApi();
  const pmWindowDetailsSelector = useAppPmWindowDetails();
  const [searchTerm, setSearchTerm] = useState<any>("");
  const [contactList, setContactList] = useState<any[]>([]);
  // console.log(pmWindowDetailsSelector, "pmWindowDetailsSelector");

  const handleContactSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const results = !searchTerm
    ? contactList
    : contactList &&
      contactList.length &&
      contactList.filter((el: any) =>
        el.customize_nickname && el.customize_nickname.nickname
          ? el.customize_nickname.nickname
              .toLowerCase()
              .includes(searchTerm.toLocaleLowerCase())
          : el.contact_user.username
              .toLowerCase()
              .includes(searchTerm.toLocaleLowerCase())
      );

  function handleSelect(e: any, checkedName: number) {
    if (e.target.checked) {
      // if (pmWindowDetailsSelector.total_pm_users + checkedValues.length < 4) {
      //maximum 4 user allowed per pm lessthan 4 checked beacuse first check length then add value that is when add 5th element then length found 4
      const newNames = checkedValues?.includes(checkedName)
        ? checkedValues?.filter((name: any) => name !== checkedName)
        : [...(checkedValues ?? []), checkedName];
      setCheckedValues(newNames);
      return newNames;
      // } else {
      //   toast.error("Maximum 4 users allowed per PM");
      // }
    } else {
      const newNames = checkedValues?.includes(checkedName)
        ? checkedValues?.filter((name: any) => name !== checkedName)
        : [...(checkedValues ?? []), checkedName];
      setCheckedValues(newNames);
      return newNames;
    }
  }

  const getContactListUser = () => {
    const params = {
      type: "online",
    };
    commonApi.callOnlineOfflineCOntactList(
      params,
      (message: string, resp: any) => {
        if (resp && resp.users && resp.users.length) {
          console.log("resp.users===========",resp.users);
          //Pm user whose are in the pm room already
          let pmUsers = pmWindowDetailsSelector?.users;
          console.log("pmUsers===========",pmUsers);
          
          // Extract user IDs from pmUsers
          let pmUserIds = pmUsers ? pmUsers.map((user:any) => user.user_id) : [];
          //Filter out those users from list whose are already in the pm room
          let filterUsers =
            resp && resp.users && resp.users.length
              ? resp.users.filter(
                  (x: any) => !pmUserIds.includes(x.contact_user_id)
                )
              : [];
          //Set filters users at contact list
          if (filterUsers && filterUsers.length) {
            setContactList(filterUsers);
          } else {
            setContactList([]);
          }
          // setContactList(resp.users)
        } else {
          setContactList([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const handleCloseModal = () => {
    onClose();
  };

  // Invite Users at room
  // const handleAddUser = () => {
  //   const params = {
  //     pm_id: pmId,
  //     user_id: checkedValues,
  //   };

  //   pmWindowApi.callAddMemberIntoPmWindow(
  //     params,
  //     (message: string, resp: any) => {
  //       getPmWindowDetails();
  //       onClose();
  //     },
  //     (message: string) => {
  //       toast.error(message);
  //     }
  //   );
  // };

  // Invite Users at room
  const handleAddUser = () => {
    const params = {
      pm_id: pmId,
      user_id: checkedValues,
    };

    pmWindowApi.callInviteInPmNotification(
      params,
      (message: string, resp: any) => {
        onClose();
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  useEffect(() => {
    getContactListUser();
  }, []);

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
          <h5 className="modal-title mt-0">Add user</h5>
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
            <div className="contact-list-search">
              <input
                className="form-control"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleContactSearch}
              />
              <button type="submit" className="search-btn waves-effect" />
            </div>
            <div className="contact-list-table">
              <div
                className="table-responsive mb-0 contact_mod"
                data-pattern="priority-columns"
              >
                <table className="table">
                  <tbody>
                    {results && results.length ? (
                      results.map((x: any, index: number) => {
                        console.log(x);
                        return (
                          <tr key={x.id}>
                            <td>
                              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success d-inline-flex">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={"customCheck-outlinecolor17" + index}
                                  checked={checkedValues.includes(
                                    x.contact_user.id
                                  )}
                                  onChange={(e) => {
                                    handleSelect(e, x.contact_user.id);
                                  }}
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor="customCheck-outlinecolor17"
                                />
                              </div>
                              <div className="message-table-name d-inline-flex align-items-center ml-4">
                                <div className="message-mail-avatar">
                                  {x &&
                                  x.contact_user &&
                                  x.contact_user.avatar &&
                                  getBooleanStatus(
                                    x.contact_user.avatar &&
                                      x.contact_user.avatar.visible_avatar
                                      ? x.contact_user.avatar.visible_avatar
                                      : 0
                                  ) &&
                                  x.contact_user.avatar.thumb ? (
                                    <img
                                      src={x.contact_user.avatar.thumb}
                                      alt={x.contact_user.username}
                                    />
                                  ) : (
                                    <span className="text-avatar">
                                      {getNameInitials(x.contact_user.username)}
                                    </span>
                                  )}
                                </div>
                                <div className="message-mail-content">
                                  <h4
                                    style={{
                                      color: getSubscriptionColor(
                                        x.contact_user
                                      ),
                                    }}
                                  >
                                    {x.customize_nickname &&
                                    x.customize_nickname.nickname
                                      ? x.customize_nickname.nickname
                                      : x.contact_user.username}
                                    {x &&
                                    x.badge_data &&
                                    x.badge_data.current_badge &&
                                    new Date(
                                      x.badge_data.expiry_date.replaceAll(
                                        "-",
                                        "/"
                                      )
                                    ).getTime() > new Date().getTime() ? (
                                      <img
                                        src={
                                          x?.badge_data?.current_badge?.icon
                                            ?.original
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
                                            x.contact_user.visible_status
                                          ),
                                        }}
                                      />
                                      {x.contact_user.visible_status == 4
                                        ? getAvailabiltyStatusText(0)
                                        : getAvailabiltyStatusText(
                                            x.contact_user.visible_status
                                          )}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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
                    "next-btn waves-effect": checkedValues.length,
                    "next-btn waves-effect disable-link": !checkedValues.length,
                  })}
                  onClick={handleAddUser}
                  data-toggle="modal"
                  data-target=".sendvoicemail"
                  data-dismiss="modal"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
