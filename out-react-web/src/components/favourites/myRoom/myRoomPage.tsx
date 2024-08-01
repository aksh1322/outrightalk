import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import SweetAlert from 'react-bootstrap-sweetalert';
import BannerShow from 'src/components/common/banner';
import { getDisableStatus, getRoomcategoryInitials, getStaticColor, capitalizeFirstLetter, getBooleanToValueStatus, getBooleanStatus } from 'src/_config/functions';
import { Modal } from 'react-bootstrap';
import { useHistory } from 'react-router';
import { URLS } from 'src/_config';
import { useAppUserDetailsSelector } from '../../../_common/hooks/selectors/userSelector'
import { useFavouritesApi } from 'src/_common/hooks/actions/favourites/appFavouritesApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { CRYPTO_SECRET_KEY } from 'src/_config';
import { useUserApi } from 'src/_common/hooks/actions/user/appUserApiHook';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

export default function MyRoomPage() {

    const [alert, setAlert] = useState<any>(null)
    const favouritesApi = useFavouritesApi()
    const userApi = useUserApi()
    const userSelector = useAppUserDetailsSelector()
    const history = useHistory()
    const [roomList, setRoomList] = useState<any>(null)
    const groupCategoryApi = useGroupCategoryApi()
    const toast = useToaster()

    const hideAlert = () => {
        setAlert(null);
    }

    const showAlert = (e: React.MouseEvent, id: any) => {
        e && e.preventDefault()
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
                title="Delete Room"
                onConfirm={() => handleRoomDelete(id)}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                Are you sure to delete the room?
            </SweetAlert>
        );
    }

    const getMyRooms = () => {
        favouritesApi.callGetMyRooms(
            (message: string, resp: any) => {
                setRoomList(resp)
            }, (message: string) => {

            }
        )
    }

    const refreshMyRoom = (e: React.MouseEvent) => {
        e.preventDefault()
        getMyRooms()
    }

    const handleRoomDelete = (id: number) => {
        var params = {
            room_id: id,
        }
        groupCategoryApi.callDeleteRoom(params, (message: string, resp: any) => {
            toast.success(message)
            hideAlert()
            getMyRooms()
            userMeCall()
        }, (message: string) => {
            toast.error(message)
        })
    }

    const gotToRoomDetailsPage = (e: any, groupId: number, roomId: number) => {
        e.preventDefault();
        const g_Id = cryptr.encrypt(groupId)
        const r_Id = cryptr.encrypt(roomId)

        history.push(`${g_Id}/${r_Id}/room-details`)
    }

    //Init Api call
    const userMeCall = () => {
        userApi.callGetMe((message: string, resp: any) => {
        }, (message: string, resp: any) => {
            toast.error(message)
        })
    }

    useEffect(() => {
        getMyRooms()
    }, [])

    return (
        <React.Fragment>
            <div className="page-heading-panel d-flex justify-content-between">
                <h1>My Rooms</h1>
                <div className="d-flex">
                    <a href="#"
                        onClick={(e) => refreshMyRoom(e)}
                        // className="mail-action-btn waves-effect"
                        className={
                            clsx({
                                "mail-action-btn waves-effect disable-link": getBooleanStatus(userSelector && userSelector.allow_create_room),
                                "mail-action-btn waves-effect": !getBooleanStatus(userSelector && userSelector.allow_create_room)
                            })
                        }
                    >
                        <i className="refresh-icon" />
                    </a>
                </div>
            </div>
            {alert}
            <div className="table-panel voicemail-table">
                <div className="table-responsive mb-0" data-pattern="priority-columns">
                    <table className="table">
                        <thead>
                            <tr>
                                <th data-priority={1} className="text-center">Lock</th>
                                <th data-priority={2} className="text-center">Type</th>
                                <th data-priority={3}>Room Name</th>
                                <th data-priority={4} className="text-center">Users</th>
                                <th data-priority={5} className="text-center">Cams On</th>
                                <th data-priority={6} className="text-center">Favourite</th>
                                {/* <th data-priority={7} className="text-center">Action</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                roomList && roomList.list && roomList.list.length ? (roomList.list.map((listValue: any, index: number) => (
                                    <tr key={index}>
                                        <td align="center">
                                            <a href="#">
                                                {
                                                    listValue && listValue.locked_room === 1 ?
                                                        <img src="/img/lock-icon.png" alt={`Private-${index}`} /> :
                                                        <img src="/img/public-icon.png" alt={`Public-${index}`} />
                                                }
                                            </a>
                                        </td>
                                        <td align="center">{listValue.type ? listValue.type : '--'}</td>
                                        <td>
                                            <div className="room-name">
                                                <a href="#"
                                                    onClick={(e) => gotToRoomDetailsPage(e, listValue.group_id, listValue.id)}
                                                >
                                                    {
                                                        listValue.room_name ? listValue.room_name : '--'
                                                    }
                                                </a>
                                            </div>
                                        </td>
                                        <td align="center">{listValue.total_user ? listValue.total_user : 0}</td>
                                        <td align="center">{listValue.total_camera_on ? listValue.total_camera_on : 0}</td>
                                        <td align="center">{listValue.total_favourite ? listValue.total_favourite : 0}</td>
                                        {/* <td align="center">
                                            <button className="btn btn-danger" onClick={(e) => showAlert(e, listValue.id)}><i className="fa fa-trash"></i></button>
                                        </td> */}
                                    </tr>
                                ))
                                ) : (
                                    <tr>
                                        <td colSpan={50} align="center"> No Rooms Available</td>
                                    </tr>
                                )}

                        </tbody>
                    </table>
                </div>
            </div>
        </React.Fragment>
    )
}