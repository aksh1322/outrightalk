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

export default function CallNotificationModal({
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
      if (pmWindowDetailsSelector.total_pm_users + checkedValues.length < 4) {
        //maximum 4 user allowed per pm lessthan 4 checked beacuse first check length then add value that is when add 5th element then length found 4
        const newNames = checkedValues?.includes(checkedName)
          ? checkedValues?.filter((name: any) => name !== checkedName)
          : [...(checkedValues ?? []), checkedName];
        setCheckedValues(newNames);
        return newNames;
      } else {
        toast.error("Maximum 4 users allowed per PM");
      }
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
          //Pm user whose are in the pm room already
          let pmUsers =
            pmWindowDetailsSelector &&
            pmWindowDetailsSelector.users &&
            pmWindowDetailsSelector.users.length
              ? pmWindowDetailsSelector.users.map((x: any) => x.user_id)
              : [];

          //Filter out those users from list whose are already in the pm room
          let filterUsers =
            resp && resp.users && resp.users.length
              ? resp.users.filter(
                  (x: any) => !pmUsers.includes(x.contact_user_id)
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
  const handleAddUser = () => {
    const params = {
      pm_id: pmId,
      user_id: checkedValues,
    };
    pmWindowApi.callAddMemberIntoPmWindow(
      params,
      (message: string, resp: any) => {
        getPmWindowDetails();
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
          <h5 className="modal-title mt-0">Ringing...</h5>
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
                <span>Skynew is calling you</span>
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
