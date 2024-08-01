import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  getAvailabiltyStatusText,
  getBooleanStatus,
  getNameInitials,
  getStatusColor,
  getSubscriptionColor,
} from "src/_config";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";

interface WhoIsViewingMeProps {
  onClose: () => void;
  shouldShow: boolean;
  roomId: number;
}

export default function WhoIsViewingMeModal({
  onClose,
  shouldShow,
  roomId,
}: WhoIsViewingMeProps) {
  const [listOfViewers, setListOfViewers] = useState<any[]>([]);
  const groupCategoryApi = useGroupCategoryApi();

  const getListOfViewers = () => {
    const params = {
      room_id: roomId,
    };

    groupCategoryApi.callWhoIsViewMyWebCam(
      params,
      (message: string, resp: any) => {
        if (resp) {
          setListOfViewers(resp);
        } else {
          setListOfViewers([]);
        }
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  useEffect(() => {
    getListOfViewers();
  }, []);

  const handleCheck = (e: any, x: any) => {    
    const params = {
      room_id: x.room_id,
      view_user_id: x.user_id,
      is_view: e.target.checked 
    };
  
    groupCategoryApi.callViewMyWebCam(params, (message: string, resp: any) => {
        if (resp) {
        }
    }, (message: string) => {

    })
  }

  return (
    <React.Fragment>
      <Modal
        show={shouldShow}
        backdrop="static"
        keyboard={false}
        className="theme-custom-modal"
        size="lg"
        centered
        contentClassName="custom-modal"
      >
        <Modal.Header>
          <h5 className="modal-title mt-0">Users Viewing me</h5>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={onClose}
          >
            <i className="modal-close" />
          </button>
        </Modal.Header>
        <Modal.Body bsPrefix={"who-is-viewing-me"}>
          <div className="modal-body pl-0 pr-0">
            <div className="contact-list-table">
              <div
                className="table-responsive mb-0 contact_mod"
                data-pattern="priority-columns"
              >
                <table className="table">
                  <tbody>
                    {listOfViewers && listOfViewers.length ? (
                      listOfViewers.map((x: any, index: number) => (
                        <tr key={x.id}>
                          <td>
                            <div className="message-table-name d-inline-flex align-items-center ml-4">
                              <input 
                                type="checkbox" 
                                defaultChecked={true}
                                className="mr-4" 
                                onChange={e => handleCheck(e, x)}
                              />
                              <div className="message-mail-avatar">
                                {x &&
                                x.user_info &&
                                x.user_info.avatar &&
                                getBooleanStatus(
                                  x.user_info.avatar &&
                                    x.user_info.avatar.visible_avatar
                                    ? x.user_info.avatar.visible_avatar
                                    : 0
                                ) &&
                                x.user_info.avatar.thumb ? (
                                  <img
                                    src={x.user_info.avatar.thumb}
                                    alt={x.user_info.username}
                                  />
                                ) : (
                                  <span className="text-avatar">
                                    {getNameInitials(x.user_info.username)}
                                  </span>
                                )}
                              </div>
                              <div className="message-mail-content">
                                <h4 style={{
                                      color: getSubscriptionColor(
                                        x.user_info
                                      ),
                                    }}>
                                  {x.customize_nickname &&
                                  x.customize_nickname.nickname
                                    ? x.customize_nickname.nickname
                                    : x.user_info.username}
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
                                    {x.user_info.visible_status === 4
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
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}
