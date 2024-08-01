import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {
  LOGIN_STORAGE,
  getAvailabiltyStatusText,
  getBooleanStatus,
  getNameInitials,
  getStatusColor,
  getSubscriptionColor,
} from "src/_config";
import clsx from "clsx";
import { toast } from "react-toastify";
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
import { useAppPmWindowDetails } from "src/_common/hooks/selectors/pmWindowSelector";
import { usePmWindowApi } from "src/_common/hooks/actions/pmWindow/appPmWindowApiHook";

interface ContactListModalProps {
  shouldShow: boolean;
  onClose: () => void;
  PmDetail: any;
  pmId: number;
  contactData: any
  flag: any
}

export default function AddContactPmModal({
  shouldShow,
  onClose,
  pmId,
  PmDetail,
  flag,
  contactData
}: ContactListModalProps) {
  const [checkedValues, setCheckedValues] = useState<any>();
  const commonApi = useCommonApi();
  const groupCategoryApi = useGroupCategoryApi()
  const pmWindowApi = usePmWindowApi();
  const pmWindowDetailsSelector = useAppPmWindowDetails();
  const [searchTerm, setSearchTerm] = useState<any>("");
  const [contactList, setContactList] = useState<any[]>([]);
  const [OrignalcontactList, setOrignalContactList] = useState<any[]>([]);


  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: signedInUserId,
    send_bird_user: { sb_access_token: signedInUserToken },
  } = value ? JSON.parse(value) :  {
    id: null,
    send_bird_user: { sb_access_token: null },
  };
  const handleContactSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const results = searchTerm
    ? contactList
    : contactList &&
    contactList.length &&
    contactList.filter((el: any) => {

    }


      // el.user_info && el.user_info.username
      //   ? el.user_info.username
      //       .toLowerCase()
      //       .includes(searchTerm.toLocaleLowerCase())
      //   : el.user_info.username
      //       .toLowerCase()
      //       .includes(searchTerm.toLocaleLowerCase())       
    );

  function handleSelect(e: any, checkedName: number) {


    setCheckedValues(checkedName)

  }

  // function handleSelect(e: any, checkedName: number) {
  //   if (e.target.checked) {
  //     // if (pmWindowDetailsSelector.total_pm_users + checkedValues.length < 4) {
  //       //maximum 4 user allowed per pm lessthan 4 checked beacuse first check length then add value that is when add 5th element then length found 4
  //       const newNames = checkedValues?.includes(checkedName)
  //         ? checkedValues?.filter((name: any) => name !== checkedName)
  //         : [...(checkedValues ?? []), checkedName];
  //       setCheckedValues(newNames);
  //       return newNames;
  //     // } else {
  //     //   toast.error("Maximum 4 users allowed per PM");
  //     // }
  //   } else {
  //     const newNames = checkedValues?.includes(checkedName)
  //       ? checkedValues?.filter((name: any) => name !== checkedName)
  //       : [...(checkedValues ?? []), checkedName];
  //     setCheckedValues(newNames);
  //     return newNames;
  //   }
  // }


  useEffect(() => {

    const data = pmWindowDetailsSelector?.users?.filter((x: any) => {
      return x.user_id != signedInUserId
    })
    let filteredData: any = [];
    data.forEach((element: any) => {
      const filterContact = contactData.filter((x: any) => {
        return x.value == element.user_id
      });
      if(filterContact.length > 0){
        filteredData = [...filteredData, ...filterContact];
      }
    });
    if(flag == 'add'){
      filteredData.length ? setContactList([]) : setContactList(data);
    }else {
      filteredData.length ? setContactList(data) : setContactList([]);
    }
  }, [flag])


  const getContactListUser = () => {
    const params = {
      type: "online",
    };
    commonApi.callOnlineOfflineCOntactList(
      params,
      (message: string, resp: any) => {
        if (resp && resp.users && resp.users.length) {
          //Pm user whose are in the pm room already
          let pmUsers = JSON.parse(JSON.stringify(resp.users));
          //Filter out those users from list whose are already in the pm room
          let filterUsers =
            resp && resp.users && resp.users.length
              ? resp.users.filter(
                (x: any) => !pmUsers.includes(x.contact_user_id)
              )
              : [];

          //Set filters users at contact list
          if (filterUsers && filterUsers.length) {
            setOrignalContactList(filterUsers);
          } else {
            setOrignalContactList([]);
          }
          setOrignalContactList(resp.users)
        } else {
          setOrignalContactList([]);
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
  const handleAddUser = () => {
    if (flag == 'add') {
      const params: any = {
        user_id: signedInUserId,
        contact_user_id: checkedValues
      }
      groupCategoryApi.callAddtoContactList(params, (message: string, resp: any) => {
        if (resp) {
          toast.success(message)
          // setShowModal(false)
          handleCloseModal();
        }
      }, (message: string) => {
        toast.error(message)
      })
    }
    else {
      const params: any = {
        user_id: signedInUserId,
        contact_user_id: checkedValues
      }
      groupCategoryApi.callRemoveFromContactList(params, (message: string, resp: any) => {
        if (resp) {

          toast.success(message)
          // setShowModal(false)
          handleCloseModal();
        }
      }, (message: string) => {
        toast.error(message)
      })
    }

  };

  //   const handleAddToContactList = (user: any) => {
  //     const params: any = {
  //         contact_user_id: user.id
  //     }
  //     groupCategoryApi.callAddtoContactList(params, (message: string, resp: any) => {
  //         if (resp) {
  //             toast.success(message)
  //             setShowModal(false)
  //         }
  //     }, (message: string) => {
  //         toast.error(message)
  //     })
  // }
  useEffect(() => {

    // getContactListUser();
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
          <h5 className="modal-title mt-0"> {flag == 'add' ? "Add Contact" : "Remove Contact"}</h5>
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
            {/* <div className="contact-list-search">
              <input
                className="form-control"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleContactSearch}
              />
              <button type="submit" className="search-btn waves-effect" />
            </div> */}
            <div className="contact-list-table">
              <div
                className="table-responsive mb-0 contact_mod"
                data-pattern="priority-columns"
              >
                <table className="table">
                  <tbody>
                    {contactList && contactList.length ? (
                      contactList.map((x: any, index: number) => {

                        return (
                          <tr key={x.id}>
                            <td>
                              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success d-inline-flex">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={"customCheck-outlinecolor17" + index}
                                  checked={checkedValues ==
                                    x.user_id
                                  }
                                  onChange={(e) => {
                                    handleSelect(e, x.user_id)
                                  }
                                  }
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
                                      {getNameInitials(x.user_info.username)}
                                    </span>
                                  )}
                                </div>
                                <div className="message-mail-content">
                                  <h4
                                    style={{
                                      color: getSubscriptionColor(
                                        x.user_info
                                      ),
                                    }}
                                  >
                                    {
                                      (x.user_info &&
                                        x.user_info.username)
                                        ? x.user_info.username
                                        : x.user_info.username}
                                    {
                                      (
                                        x && x.user_info.user_badge &&
                                        x.user_info.user_badge.current_badge &&
                                        (new Date(x.user_info.user_badge.expiry_date.replaceAll("-", "/")).getTime() > new Date().getTime())
                                      )
                                        ?
                                        <img src={x?.user_info.user_badge?.current_badge?.icon?.original} height={25} width={25} className="m-2" alt="" />
                                        : ''
                                    }
                                  </h4>
                                  <p>
                                    <span>
                                      <i
                                        className="oline-tag"
                                        style={{
                                          backgroundColor: getStatusColor(
                                            x.user_info.visible_status
                                          ),
                                        }}
                                      />
                                      {x.user_info.visible_status == 4
                                        ? getAvailabiltyStatusText(0)
                                        : getAvailabiltyStatusText(
                                          x.user_info.visible_status
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
                    "next-btn waves-effect": checkedValues,
                    "next-btn waves-effect disable-link": !checkedValues,
                  })}
                  onClick={handleAddUser}
                  data-toggle="modal"
                  data-target=".sendvoicemail"
                  data-dismiss="modal"
                >
                  {flag == 'add' ? 'Add' : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
