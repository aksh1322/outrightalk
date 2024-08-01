import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {
  API_BASE_URL,
  API_URL,
  LOGIN_STORAGE,
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
import { useChatContext } from "src/hooks"

interface ContactListModalProps {
  shouldShow: boolean;
  onClose: () => void;
  getPmWindowDetails: () => void;
  pmId: number;
}

export default function SendFilePmModal({
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
  const [file, setFile] = useState<File | null>(null)

  const {currentRoomMembers} = useChatContext()

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

  async function handleSendFileSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if(!file) throw new Error('No file provided.')
      if(!checkedValues || checkedValues.length === 0) throw new Error('No user selected.')
      
      const formData : FormData = new FormData();

      formData.append('file', file)

      checkedValues.forEach((userId:any, index: number) => {
        formData.append(`user_id[${index}]`, userId);
      });

      const url = API_BASE_URL + 'file/send'
      
      const token = JSON.parse(localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_TOKEN) as string)
      
      const resp = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          authorization: `Bearer ${token}`
        }
      })
      
      const {data} = await resp.json()
      
      if("errors" in data) {
        toast.error(data.errors?.file[0])
        throw new Error(data.errors?.file[0])
      }

      onClose()

      
    } catch (error) {
      // toast.error(JSON.stringify(error))
      console.error('Error sending file', error)
    }


  }
  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: signed_in_user_id,
    send_bird_user: { sb_access_token: signedInUserToken },
  } = value ? JSON.parse(value) :  {
    id: null,
    send_bird_user: { sb_access_token: null },
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
          <h5 className="modal-title mt-0">Send File</h5>
          <button type="button" className="close" onClick={() => handleCloseModal()}>
            <i className="modal-close" />
          </button>
        </Modal.Header>
        <Modal.Body bsPrefix={"-contactlist"}>
          <form className="modal-body pl-0 pr-0" onSubmit={handleSendFileSubmit}>
            <div className="contact-list-file">
              <div className="form-group">
                <label htmlFor="exampleFormControlFile1">Example file input</label>
                <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files: FileList = e.target.files as FileList
                  if(files && files?.length > 0) {
                    setFile(files[0])
                  } 
                }} className="form-control-file" id="exampleFormControlFile1" />
              </div>
              {/* <input
                className="form-control"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleContactSearch}
              />
              <button type="submit" className="search-btn waves-effect" /> */}
            </div>
            <div className="contact-list-table">
              <div className="table-responsive mb-0 contact_mod" data-pattern="priority-columns">
                <table className="table">
                  <tbody>
                    {currentRoomMembers && currentRoomMembers.length ? (
                      currentRoomMembers.map((x: any, index: number) => {
                        console.log(x)
                        if(+x.userId === +signed_in_user_id) return

                        return (
                          <tr key={x.userId}>
                            <td>
                              <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success d-inline-flex">
                                <input
                                  type="checkbox"
                                  className="custom-control-input"
                                  id={"customCheck-outlinecolor17" + index}
                                  checked={checkedValues.includes(x.userId)}
                                  onChange={e => {
                                    handleSelect(e, x.userId)
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
                                  x.nickname &&
                                  (
                                    <span className="text-avatar">
                                      {getNameInitials(x.nickname)}
                                    </span>
                                  )}
                                </div>
                                

                                <div className="message-mail-content">
                                  <h4
                                    style={{
                                      color: getSubscriptionColor(x),
                                    }}
                                  >
                                    {x.nickname}
                                  </h4>
                                  
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
              <div className="d-flex justify-content-between w-100">
                <button
                  className={"unshare-btn waves-effect"}
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className={clsx({
                    "next-btn waves-effect": checkedValues.length,
                    "next-btn waves-effect disable-link": !checkedValues.length || !file,
                  })}
                  type="submit"
                  // onClick={handleAddUser}
                >
                  Send File
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  )
}
