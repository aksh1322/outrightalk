import React, { useEffect, useState } from "react";
import clsx from "clsx";
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";
import BannerShow from "src/components/common/banner";
import AddNewNoteModal from "./modal/addNewNoteModal";
import UpdateNoteModal from "./modal/updateNotebook";
import ContactListModal from "../commonModals/leftSideBarModals/ContactListModal";
import NoteDetailsModal from "./modal/noteDetailsModal";
import { useNotebookApi } from "src/_common/hooks/actions/notebook/appNotebookApiHook";
import { useAppNotebookList } from "src/_common/hooks/selectors/notebookSelector";
import { useAppNotebookAction } from "src/_common/hooks/actions/notebook/appNotebookActionHook";
import { useAppUserDetailsSelector } from "src/_common/hooks/selectors/userSelector";
import { toast } from "react-toastify";
import { getSubscriptionColor } from "src/_config";
import { flatMap } from "lodash";
import { log } from "console";

function MyNotebookPage() {
  const notebookApi = useNotebookApi();
  const notebookListSelector = useAppNotebookList();
  const voiceVideoNotebookCountAction = useAppNotebookAction();
  const userSelector = useAppUserDetailsSelector();
  console.log("userSelector ===>", userSelector);
  const [checkedValues, setCheckedValues] = useState<number[]>([]);
  const [alert, setAlert] = useState<any>(null);
  const [showaddNewNoteModal, setAddNewNoteModal] = useState<boolean>(false);
  const [showUpdateNoteModal, setUpdateNoteModal] = useState<boolean>(false);
  const [showContactListModal, setContactListModalModal] =
    useState<boolean>(false);
  const [showNoteDetailsModal, setNoteDetailsModalModal] =
    useState<boolean>(false);
  const [noteBookList, setNotebookList] = useState<any[]>([]);
  const [isNewNote, setIsNewNote] = useState<any>();
  const [selectedNotebookId, setSelectedNotebookId] = useState<any>();

  function handleSelect(checkedName: number) {
    const newNames = checkedValues?.includes(checkedName)
      ? checkedValues?.filter((name) => name !== checkedName)
      : [...(checkedValues ?? []), checkedName];
    setCheckedValues(newNames);
    return newNames;
  }

  const onCheckSelectAll = (evt: any) => {
    let tempCheckedValues = [...checkedValues];
    if (evt) {
      console.log("notebookListSelector ==> ", notebookListSelector);
      if (notebookListSelector && notebookListSelector.length) {
        for (let k = 0; k < notebookListSelector.length; k++) {
          if (notebookListSelector[k].isShare === 0) {
            let exist = tempCheckedValues.indexOf(notebookListSelector[k].id);
            if (exist == -1) {
              tempCheckedValues.push(notebookListSelector[k].id);
            }
          }
        }
      }

      setCheckedValues(tempCheckedValues);
    } else {
      if (notebookListSelector && notebookListSelector.length) {
        for (let k = 0; k < notebookListSelector.length; k++) {
          if (notebookListSelector[k].isShare === 0) {
            let exist = tempCheckedValues.indexOf(notebookListSelector[k].id);
            if (exist !== -1) {
              tempCheckedValues.splice(exist, 1);
            }
          }
        }
      }
      setCheckedValues(tempCheckedValues);
    }
  };

  const selectMaster = () => {
    let tempCheckedValues = [...checkedValues];
    if (notebookListSelector && notebookListSelector.length) {
      for (let k = 0; k < notebookListSelector.length; k++) {
        if (notebookListSelector[k].isShare === 0) {
          let exist = tempCheckedValues.indexOf(notebookListSelector[k].id);
          if (exist == -1) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const showAlert = (e: React.MouseEvent, ids: number[]) => {
    e && e.preventDefault();
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
        title={`Delete ${ids.length > 1 ? "Notebooks" : "Notebook"}`}
        onConfirm={() => deleteNotebook({ notebook_id: ids.map((x) => x) })}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {`Are you sure to delete ${ids.length > 1 ? "notebooks" : "notebook"}?`}
      </SweetAlert>
    );
  };

  const deleteNotebook = (params: { notebook_id: any }) => {
    let fd = new FormData();
    for (const [key, value] of Object.entries(params)) {
      if (key == "notebook_id") {
        value.map((user: any) => fd.append("notebook_id[]", user));
      } else {
        fd.append(key, value);
      }
    }

    notebookApi.callDeleteNotebook(
      fd,
      (message: string, resp: any) => {
        if (resp) {
          hideAlert();
          setCheckedValues([]);
          getNotebookList();
        }
      },
      (message: string) => {
        hideAlert();
        toast.error(message);
      }
    );
  };

  const handelRefreshNotebookList = (e: React.MouseEvent) => {
    e && e.preventDefault();
    getNotebookList();
  };

  const addNewNoteModalOpen = (e: any) => {
    e.preventDefault();
    setAddNewNoteModal(true);
  };

  const addNewNoteCloseModal = () => {
    if (showaddNewNoteModal) setAddNewNoteModal(false);
  };

  const updateNoteModalOpen = (e: any, id: number) => {
    e.preventDefault();
    setSelectedNotebookId(id);
    setUpdateNoteModal(true);
  };

  const updateNoteCloseModal = () => {
    if (showUpdateNoteModal) setUpdateNoteModal(false);
  };

  const contactListModalOpen = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setSelectedNotebookId(id);
    setContactListModalModal(true);
  };

  const contactListCloseModal = () => {
    if (showContactListModal) setContactListModalModal(false);
  };

  const NoteDetailsModalOpen = (
    e: React.MouseEvent,
    id: number,
    viewStatus: number
  ) => {
    e.preventDefault();
    setSelectedNotebookId(id);
    setIsNewNote(viewStatus);
    setNoteDetailsModalModal(true);
  };

  const NoteDetailsCloseModal = () => {
    if (showNoteDetailsModal) setNoteDetailsModalModal(false);
  };

  const getNotebookList = () => {
    notebookApi.callNotebookList(
      (message: string, resp: any) => {
        if (resp) {
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  const isNewMessageViewd = (status: boolean) => {
    if (status) {
      getNotebookList();
    }
  };

  useEffect(() => {
    getNotebookList();
  }, []);

  return (
    <React.Fragment>
      <div className="container-fluid">
        {alert}
        <div className="row justify-content-center">
          <div className="col-sm-12">
            <div className="page-heading-panel d-flex justify-content-between">
              <h1>My Notebook</h1>
              <div className="d-flex">
                <a
                  href="#"
                  data-toggle="modal"
                  data-target=".add-new-notebook-modal"
                  className="mail-action-btn waves-effect send-voice-btn"
                  onClick={(e) => addNewNoteModalOpen(e)}
                >
                  <i className="create-room-icon" /> Add New Note
                </a>
                <div className="d-inline-flex p-r-2">
                  {/* <a
                    href="#"
                    className={clsx({
                      "mail-action-btn waves-effect": checkedValues.length,
                      "mail-action-btn waves-effect disable-link":
                        !checkedValues.length,
                    })}
                    onClick={(e) => showAlert(e, checkedValues)}
                  >
                    <i className="delete-icon" />
                  </a> */}
                  <a
                    href="#"
                    className="mail-action-btn waves-effect"
                    onClick={(e) => handelRefreshNotebookList(e)}
                  >
                    <i className="refresh-icon" />
                  </a>
                </div>
              </div>
            </div>
            <div className="table-panel voicemail-table">
              <div
                className="table-responsive mb-0"
                data-pattern="priority-columns"
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>
                        {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id="customCheck-outlinecolor1"
                            checked={selectMaster()}
                            onChange={(evt) => {
                              onCheckSelectAll(evt.target.checked);
                            }}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="customCheck-outlinecolor1"
                          />
                        </div> */}
                      </th>
                      <th style={{ width: 255 }} data-priority={1}>
                        Notebooks
                      </th>
                      <th>Owner</th>
                      <th>Created</th>
                      <th>Modified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notebookListSelector && notebookListSelector.length ? (
                      notebookListSelector.map((x: any, index: number) => (
                        <tr key={x.id}>
                          <td>
                            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={"customCheck-outlinecolor4s" + index}
                                checked={checkedValues.includes(x.id)}
                                onChange={() => handleSelect(x.id)}
                                disabled={
                                  x.isShare === 1 ||
                                  userSelector?.id !== x.user_id
                                    ? true
                                    : false
                                }
                              />
                              <label
                                className="custom-control-label"
                                htmlFor={"customCheck-outlinecolor4s" + index}
                              />
                            </div>
                          </td>

                          <td>
                            <a
                              href="#"
                              onClick={(e) =>
                                NoteDetailsModalOpen(e, x.id, x.is_viewed)
                              }
                              data-toggle="modal"
                              data-target=".details-notebook-modal"
                              className={clsx({
                                "new-note-not-viewed": x.is_viewed === 0,
                              })}
                            >
                              {x.notebook_title}
                            </a>
                          </td>
                          <td
                            style={{
                              color: getSubscriptionColor(
                                x && x.created_by && x.created_by.is_subscribed
                                  ? {
                                      ...x,
                                      subscription_info:
                                        x.created_by.is_subscribed,
                                    }
                                  : null
                              ),
                            }}
                          >
                            {x.created_by ? x.created_by.created_by : "--"}
                          </td>
                          <td>
                            {moment(x.created_on).format("DD.MM.YYYY") +
                              " | " +
                              moment(x.created_on).format("hh:MM A")}
                          </td>
                          <td>
                            {x.modify_by && x.modify_by.modify_by
                              ? x.modify_by.modify_by
                              : ""}
                            <div>
                              {moment(x.updated_on).format("DD.MM.YYYY") +
                                " | " +
                                moment(x.updated_on).format("hh:MM A")}
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center justify-content-start action-btns">
                              <a
                                href="#"
                                data-toggle="modal"
                                data-target=".contact-list-share-notebook-modal"
                                className={clsx({
                                  "table-action-btn waves-effect":
                                    userSelector &&
                                    userSelector.id === x.user_id,
                                  "table-action-btn waves-effect disable-link":
                                    userSelector &&
                                    userSelector.id != x.user_id,
                                })}
                                onClick={(e) => contactListModalOpen(e, x.id)}
                              >
                                <i className="share-icon" />
                              </a>

                              <a
                                href="#"
                                className={clsx({
                                  "table-action-btn waves-effect":
                                    (userSelector &&
                                      userSelector.id === x.user_id) ||
                                    x.is_editable,
                                  "table-action-btn waves-effect disable-link":
                                    !x.is_editable &&
                                    userSelector &&
                                    userSelector.id != x.user_id,
                                })}
                                onClick={(e) => updateNoteModalOpen(e, x.id)}
                              >
                                <i className="notebook-icon-edit mb-1"></i>
                              </a>

                              <a
                                href="#"
                                className={clsx({
                                  "table-action-btn waves-effect":
                                    userSelector &&
                                    userSelector.id === x.user_id,
                                  "table-action-btn waves-effect disable-link":
                                    (userSelector &&
                                      userSelector.id != x.user_id) ||
                                    x.isShare === 1,
                                })}
                                onClick={(e) => showAlert(e, [x.id])}
                              >
                                <i className="delete-icon" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={50}>No record found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {/* end row */}
      </div>

      {showaddNewNoteModal ? (
        <AddNewNoteModal
          onClose={addNewNoteCloseModal}
          onSuccess={getNotebookList}
          shouldShow={showaddNewNoteModal}
        />
      ) : null}

      {showUpdateNoteModal ? (
        <UpdateNoteModal
          onClose={updateNoteCloseModal}
          onSuccess={getNotebookList}
          shouldShow={showUpdateNoteModal}
          noteBookId={selectedNotebookId}
        />
      ) : null}

      {showContactListModal ? (
        <ContactListModal
          onClose={contactListCloseModal}
          onSuccess={getNotebookList}
          shouldShow={showContactListModal}
          type={"notebook"}
          notebookId={selectedNotebookId}
        />
      ) : null}

      {showNoteDetailsModal ? (
        <NoteDetailsModal
          onClose={NoteDetailsCloseModal}
          isNewMessageView={isNewMessageViewd}
          onSuccess={getNotebookList}
          viewedStatus={isNewNote}
          shouldShow={showNoteDetailsModal}
          noteBookId={selectedNotebookId}
        />
      ) : null}
    </React.Fragment>
  );
}

export default MyNotebookPage;
