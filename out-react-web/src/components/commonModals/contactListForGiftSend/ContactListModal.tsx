import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import {
  calculateMinTime,
  CONTACT_LIST_TYPE,
  DATE_ALL_FORMAT,
  getAvailabiltyStatusText,
  getBooleanStatus,
  getBooleanToValueStatus,
  getNameInitials,
  getStatusColor,
  getSubscriptionColor,
  TIME_CONFIG,
} from "src/_config";
import { useVideoMessageApi } from "src/_common/hooks/actions/videoMessage/appVideoMessageApiHook";
import { useNotebookApi } from "src/_common/hooks/actions/notebook/appNotebookApiHook";
import { useAppVideoMessageAction } from "src/_common/hooks/actions/videoMessage/appVideoMessageActionHook";
import { useAppContactListUser } from "src/_common/hooks/selectors/videoMessageSelector";
import { useAppNotebookContactListUser } from "src/_common/hooks/selectors/notebookSelector";
import DateInput from "src/_common/components/form-elements/datepicker/dateInput";
import TimePicker from "src/_common/components/form-elements/timePicker/timePicker";
import * as yup from "yup";
import moment from "moment";
import clsx from "clsx";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useAppPmWindowDetails } from "src/_common/hooks/selectors/pmWindowSelector";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";

interface ContactListModalProps {
  onClose: () => void;
  onSuccess: (sendList: any) => void;
  shouldShow: boolean;
  type?: string; //like : videomessage, voicemail, notebook etc..
  notebookId?: number;
  isPMUsers?: boolean;
}

const ContactListSchema = yup.object().shape(
  {
    date: yup
      .string()
      .when("time", (time: any) => {
        if (time) return yup.string().required("Date required");
      })
      .nullable(),
    time: yup.string().when("date", (date: any) => {
      if (date) return yup.string().required("Time required");
    }),
  },
  [
    ["date", "time"], // <--- adding your fields which need validation on cycle dependency
  ]
);
interface contactListFormValues {
  date: string;
  time: string;
}

export default function ContactListForGiftModal({
  onClose,
  onSuccess,
  shouldShow,
  type,
  notebookId,
  isPMUsers
}: ContactListModalProps) {

  const { register, control, setValue, handleSubmit, errors } =
    useForm<contactListFormValues>({
      resolver: yupResolver(ContactListSchema),
      defaultValues: {
        date: "",
        time: "",
      },
    });

  const [checkedValues, setCheckedValues] = useState<any>([]);
  const videoMessageAction = useAppVideoMessageAction();
  const videoVoiceMessageApi = useVideoMessageApi();
  const userSelector = useAppUserDetailsSelector();
  const pmWindowDetailsSelector = useAppPmWindowDetails();
 
  const [searchTerm, setSearchTerm] = useState<any>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [contactUsers, setContactUsers] = useState<any[]>([]);
  const contactList = useAppContactListUser();
  const [checkUseravailabiltyAlert, setCheckUserAvailabilityAlert] = useState<any>(null); 

  const handleContactSearch = (event: any) => {
    setSearchTerm(event.target.value);
  };

  

  let SearchContactData =
    type === CONTACT_LIST_TYPE.NOTEBOOK
      ? contactUsers
      : contactList && contactList.list;

    if(isPMUsers && userSelector){      
      SearchContactData = pmWindowDetailsSelector.users.filter((u: any) => (u.user_id !== userSelector.id))
    }

  const results = !searchTerm
    ? SearchContactData
    : SearchContactData &&
      SearchContactData.length &&
      SearchContactData.filter((el: any) =>
        el.customize_nickname && el.customize_nickname.nickname
          ? el.customize_nickname.nickname
              .toLowerCase()
              .includes(searchTerm.toLocaleLowerCase())
          : el.contact_user.username
              .toLowerCase()
              .includes(searchTerm.toLocaleLowerCase())
      );

  function handleSelect(checkedName: number) {
    const newNames = checkedValues?.includes(checkedName)
      ? checkedValues?.filter((name: any) => name !== checkedName)
      : [...(checkedValues ?? []), checkedName];
    setCheckedValues(newNames);
    return newNames;
  }

  const getContactListUser = () => {
    const params = {
      type: null,
    };
    videoVoiceMessageApi.callGetContactListUser(
      params,
      (message: string, resp: any) => {
        if (resp) {
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  useEffect(() => {
    getContactListUser();
  }, []);

  const handleGiftModal = () => {
    onSuccess(checkedValues);
    onClose();
  };

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
          <h5 className="modal-title mt-0">Contact List</h5>
          <button type="button" className="close" onClick={() => onClose()}>
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
                        x.contact_user = x.contact_user || x.user_info;
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
                                  onChange={() => handleSelect(x.contact_user.id)}
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor="customCheck-outlinecolor17"
                                />
                              </div>
                              <div className="message-table-name d-inline-flex align-items-center ml-4">
                                <div className="message-mail-avatar">
                                  {/* <img src={x.img} /> */}
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
                                        x &&
                                          x.contact_user &&
                                          x.contact_user.is_subscribed
                                          ? {
                                              ...x,
                                              subscription_info:
                                                x.contact_user.is_subscribed,
                                            }
                                          : null
                                      ),
                                    }}
                                  >
                                    {x.customize_nickname &&
                                    x.customize_nickname.nickname
                                      ? x.customize_nickname.nickname
                                      : x.contact_user.username}
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
                                      {x.contact_user.visible_status === 4
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
                        )
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
                  onClick={handleGiftModal}
                  data-toggle="modal"
                  data-target=".sendvoicemail"
                  data-dismiss="modal"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
