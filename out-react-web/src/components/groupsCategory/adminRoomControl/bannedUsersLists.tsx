import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { toast } from "react-toastify";
import { useParams } from "react-router";
import { useGroupCategoryApi } from "src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook";
import { CRYPTO_SECRET_KEY } from "src/_config";
import {
  useAppRoomAdminControlSelector,
  useAppRoomDetailsSelector,
} from "src/_common/hooks/selectors/groupCategorySelector";
import clsx from "clsx";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface BannedUsersListsProps {
  getRoomAdminControl: () => void;
}

export default function BannedUsersLists({
  getRoomAdminControl,
}: BannedUsersListsProps) {
  const roomDetailsSelector = useAppRoomDetailsSelector();
  const roomAdminControl = useAppRoomAdminControlSelector();
  const groupCategoryApi = useGroupCategoryApi();
  const { roomId } = useParams<any>();
  const [alert, setAlert] = useState<any>(null);
  const room_id: number = parseInt(cryptr.decrypt(roomId));
  const [checkedValues, setCheckedValues] = useState<number[]>([]);

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
      if (
        roomAdminControl.banned_users &&
        roomAdminControl.banned_users.length
      ) {
        for (let k = 0; k < roomAdminControl.banned_users.length; k++) {
          let exist = tempCheckedValues.indexOf(
            roomAdminControl.banned_users[k].details.id
          );
          if (exist == -1) {
            tempCheckedValues.push(roomAdminControl.banned_users[k].details.id);
          }
        }
      }
      setCheckedValues(tempCheckedValues);
    } else {
      if (
        roomAdminControl.banned_users &&
        roomAdminControl.banned_users.length
      ) {
        for (let k = 0; k < roomAdminControl.banned_users.length; k++) {
          let exist = tempCheckedValues.indexOf(
            roomAdminControl.banned_users[k].details.id
          );
          if (exist !== -1) {
            tempCheckedValues.splice(exist, 1);
          }
        }
      }
      setCheckedValues(tempCheckedValues);
    }
  };

  const selectMaster = () => {
    let tempCheckedValues = [...checkedValues];
    if (
      roomAdminControl &&
      roomAdminControl.banned_users &&
      roomAdminControl.banned_users.length
    ) {
      for (let k = 0; k < roomAdminControl.banned_users.length; k++) {
        let exist = tempCheckedValues.indexOf(
          roomAdminControl.banned_users[k].details.id
        );
        if (exist == -1) {
          return false;
        }
      }
    }
    return true;
  };

  const hideAlert = () => {
    setAlert(null);
  };
  const handleRemoveBannedUsers = (e: any) => {
    e.preventDefault();
    if (![1, 3].includes(roomDetailsSelector.room.join_status.is_admin)) {
      return;
    }
    //Get the list of username selected from the list
    let bannedUsers: string[] = [];
    checkedValues &&
      checkedValues.length &&
      checkedValues.map((x: number) => {
        let user = roomAdminControl.banned_users.filter(
          (users: any) => users.details.id == x
        );
        if (user && user.length) {
          bannedUsers.push(user.map((x: any) => x.details.username));
        }
      });

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
        title={
          checkedValues.length === roomAdminControl.banned_users.length
            ? "Clear Ban list"
            : "Remove Banned Users"
        }
        onConfirm={() => removeBannedUsers()}
        onCancel={hideAlert}
        focusCancelBtn={true}
      >
        {checkedValues.length === roomAdminControl.banned_users.length
          ? `Are you sure you want to clear the Ban List?`
          : `Are you sure you want to remove (${bannedUsers.toString()}) from the Ban List?`}
      </SweetAlert>
    );
  };

  const removeBannedUsers = () => {
    hideAlert();
    const params = {
      room_id: room_id,
      user_id: checkedValues,
    };
    groupCategoryApi.callRemoveUserFromBanList(
      params,
      (message: string, resp: any) => {
        toast.success(message);

        getRoomAdminControl();
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };

  return (
    <React.Fragment>
      {alert}
      <div className="col-sm-6">
        <div className="form-group">
          <label>Banned Users</label>
          <div className="list-users-wrap">
            {roomAdminControl &&
            roomAdminControl.banned_users &&
            roomAdminControl.banned_users.length ? (
              <div className="list-header">
                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="customCheck-ban1"
                    checked={selectMaster()}
                    onChange={(evt) => {
                      onCheckSelectAll(evt.target.checked);
                    }}
                    disabled={
                      ![1, 3].includes(
                        roomDetailsSelector.room.join_status.is_admin
                      )
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customCheck-ban1"
                  >
                    {" "}
                    Select All
                  </label>
                </div>

                <div className="actions">
                  <a
                    href="#"
                    onClick={(e) => handleRemoveBannedUsers(e)}
                    className={clsx({
                      "mail-action-btn waves-effect": checkedValues.length,
                      "mail-action-btn waves-effect disable-link":
                        !checkedValues.length,
                    })}
                  >
                    <img src="/img/delete-icon.png" alt="" />
                  </a>
                </div>
              </div>
            ) : null}
            <ul>
              {roomAdminControl &&
              roomAdminControl.banned_users &&
              roomAdminControl.banned_users.length ? (
                roomAdminControl.banned_users.map((ban: any, index: number) => (
                  <li key={index}>
                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id={"banuser" + ban.details.id}
                        checked={checkedValues.includes(ban.details.id)}
                        onChange={() => handleSelect(ban.details.id)}
                        disabled={
                          ![1, 3].includes(
                            roomDetailsSelector.room.join_status.is_admin
                          )
                        }
                      />
                      <label
                        className="custom-control-label"
                        htmlFor={"banuser" + ban.details.id}
                      >
                        {" "}
                        {ban.details.username}
                      </label>
                    </div>
                  </li>
                ))
              ) : (
                <li>
                  <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                    No User in Ban list
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
