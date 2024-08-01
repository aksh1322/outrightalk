import React, { useState, useEffect } from 'react'
import { Modal, Form } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import { toast } from 'react-toastify';
import { useParams } from 'react-router';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { CRYPTO_SECRET_KEY } from 'src/_config';
import { useAppRoomAdminControlSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import clsx from 'clsx';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface KickedUsersListsProps {
    getRoomAdminControl: () => void
}


export default function KickedUsersLists({ getRoomAdminControl }: KickedUsersListsProps) {

    const groupCategoryApi = useGroupCategoryApi()
    const roomAdminControl = useAppRoomAdminControlSelector()
    const { roomId } = useParams<any>();
    const [alert, setAlert] = useState<any>(null);
    const room_id: number = parseInt(cryptr.decrypt(roomId));
    const [checkedValues, setCheckedValues] = useState<number[]>([]);

    function handleSelect(checkedName: number) {
        const newNames = checkedValues?.includes(checkedName)
            ? checkedValues?.filter(name => name !== checkedName)
            : [...(checkedValues ?? []), checkedName];
        setCheckedValues(newNames);
        return newNames;
    }

    const onCheckSelectAll = (evt: any) => {
        let tempCheckedValues = [...checkedValues]
        if (evt) {
            if (roomAdminControl && roomAdminControl.kicked_users && roomAdminControl.kicked_users.length) {
                for (let k = 0; k < roomAdminControl.kicked_users.length; k++) {
                    let exist = tempCheckedValues.indexOf(roomAdminControl.kicked_users[k].details.id)
                    if (exist == -1) {
                        tempCheckedValues.push(roomAdminControl.kicked_users[k].details.id)
                    }
                }
            }
            setCheckedValues(tempCheckedValues);
        }
        else {
            if (roomAdminControl.kicked_users && roomAdminControl.kicked_users.length) {
                for (let k = 0; k < roomAdminControl.kicked_users.length; k++) {
                    let exist = tempCheckedValues.indexOf(roomAdminControl.kicked_users[k].details.id)
                    if (exist !== -1) {
                        tempCheckedValues.splice(exist, 1)
                    }
                }
            }
            setCheckedValues(tempCheckedValues);
        }

    }

    const selectMaster = () => {
        let tempCheckedValues = [...checkedValues]
        if (roomAdminControl.kicked_users && roomAdminControl.kicked_users.length) {
            for (let k = 0; k < roomAdminControl.kicked_users.length; k++) {
                let exist = tempCheckedValues.indexOf(roomAdminControl.kicked_users[k].details.id)
                if (exist == -1) {
                    return false
                }
            }
        }
        return true
    }
    const hideAlert = () => {
        setAlert(null);
    }
    const handleRemoveKickUser = (e: any) => {
        e.preventDefault()

        //Get the list of username selected from the list
        let kickedUsers: string[] = [];
        checkedValues && checkedValues.length && checkedValues.map((x: number) => {
            let user = roomAdminControl.kicked_users.filter((users: any) => users.details.id == x)
            if (user && user.length) {
                kickedUsers.push(user.map((x: any) => x.details.username))
            }
        })
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
                title={checkedValues.length === roomAdminControl.kicked_users.length ? "Clear Kicked users list" : "Remove Kicked Users"}
                onConfirm={() => removeKickedUsers()}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {
                    checkedValues.length === roomAdminControl.kicked_users.length ? `Are you sure you want to clear the Kick List?` : `Are you sure you want to remove (${kickedUsers.toString()}) from the Kick List?`
                }
            </SweetAlert>
        );
    }

    const removeKickedUsers = () => {
        // console.log('delete kicked users called')
        hideAlert()
        const params = {
            room_id: room_id,
            user_id: checkedValues,
        };
        groupCategoryApi.callRemoveUserFromKickList(params, (message: string, resp: any) => {
            toast.success(message)
            getRoomAdminControl()

        }, (message: string) => {
            toast.error(message)
        })
    }


    return (
        <React.Fragment>
            {alert}
            <div className="col-sm-6">
                <div className="form-group">
                    <label>Kicked Users</label>
                    <div className="list-users-wrap">
                        {roomAdminControl && roomAdminControl.kicked_users && roomAdminControl.kicked_users.length ?
                            <div className="list-header">
                                <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                                    <input type="checkbox"
                                        className="custom-control-input"
                                        id="customCheck-kick1"
                                        checked={selectMaster()}
                                        onChange={(evt) => {
                                            onCheckSelectAll(evt.target.checked)
                                        }}
                                    />
                                    <label className="custom-control-label" htmlFor="customCheck-kick1"> Select All
                                    </label>
                                </div>
                                <div className="actions">
                                    <a href="#" onClick={(e) => handleRemoveKickUser(e)}
                                        className={
                                            clsx({
                                                'mail-action-btn waves-effect': checkedValues.length,
                                                'mail-action-btn waves-effect disable-link': !checkedValues.length
                                            })
                                        }>
                                        <img src="/img/delete-icon.png" alt="" />
                                    </a>
                                </div>
                            </div>
                            : null}
                        <ul>
                            {roomAdminControl && roomAdminControl.kicked_users && roomAdminControl.kicked_users.length ? roomAdminControl.kicked_users.map((kick: any, index: number) =>
                                <li key={index}>
                                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                                        <input type="checkbox"
                                            className="custom-control-input"
                                            id={"kickuser" + kick.details.id}
                                            checked={checkedValues.includes(kick.details.id)}
                                            onChange={() => handleSelect(kick.details.id)}
                                        />
                                        <label className="custom-control-label" htmlFor={"kickuser" + kick.details.id}> {kick.details.username}
                                        </label>
                                    </div>
                                </li>) :
                                <li>
                                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                                        No User in Kick list

                                    </div>
                                </li>
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </React.Fragment >
    )
}
