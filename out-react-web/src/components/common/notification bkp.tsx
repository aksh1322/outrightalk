import React, { useEffect } from 'react'
import { useAppInstanceInvitedUsers } from 'src/_common/hooks/selectors/notificationSelector'
import { useAppNotificationAction } from 'src/_common/hooks/actions/notification/appNotificationActionHook';
import { useNotificationApi } from 'src/_common/hooks/actions/notification/appNotificationApiHook';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { toast } from 'react-toastify';
import moment from 'moment';
import { CHAT_DATE_TIME_FORMAT, CRYPTO_SECRET_KEY, getBooleanStatus, getNameInitials } from 'src/_config';
import { useHistory } from 'react-router';
import { RemoveSingleNotification } from 'src/_common/interfaces/ApiReqRes';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

export default function Notification() {

    const history = useHistory()
    const notificationAction = useAppNotificationAction()
    const notificationAPi = useNotificationApi()
    const groupCategoryApi = useGroupCategoryApi()
    const notificationSelector = useAppInstanceInvitedUsers()

    const handleRemoveSingleNotification = (e: any, id: number) => {
        e && e.preventDefault()
        const params: RemoveSingleNotification = {
            record_id: id
        }
        notificationAPi.callRemoveSingleNotification(params, (message: string, resp: any) => {
            if (resp) {
                notificationAction.removeSingleNotification(id)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const getAllNotifications = () => {
        notificationAPi.callGetALlNotifications((message: string, resp: any) => {
            if (resp) { }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleAcceptJoinInvitation = (notificationId: number, g_id: number, r_id: number) => {
        const groupId = cryptr.encrypt(g_id)
        const roomId = cryptr.encrypt(r_id)
        history.replace('')
        history.push(`${groupId}/${roomId}/room-details`)
    }

    useEffect(() => {
        getAllNotifications()
    }, [])


    return (
        <React.Fragment>

            <div className="dropdown d-inline-block top-user-panel">
                <button type="button" className="btn header-item noti-icon waves-effect" id="page-header-notifications-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i className="bx bx-bell bx-tada"></i>
                    <span className="badge badge-danger badge-pill">
                        {
                            notificationSelector && notificationSelector.length ? notificationSelector.length : null
                        }
                    </span>
                </button>
                <div className="dropdown-menu dropdown-menu-right notification-box">
                    {/* <div className="p-3">
                            <div className="row align-items-center">
                                <div className="col">
                                    <h6 className="m-0" key="t-notifications"> Notifications </h6>
                                </div>
                                <div className="col-auto">
                                    <a href="#!" className="small" key="t-view-all"> View All</a>
                                </div>
                            </div>
                        </div> */}
                    <div className="p-3">
                        {
                            notificationSelector && notificationSelector.length ?
                                notificationSelector.map((x: any, index: number) => (
                                    <div className="media" key={index}>
                                        <span className="remove-notification ml-2">
                                            <a href="#" onClick={(e) => handleRemoveSingleNotification(e, x.id)}>
                                                <img src="/img/close-btn.png" alt="remove" />
                                            </a>
                                        </span>
                                        {/* <img src="/img/noavatar.png" className="mr-3 rounded-circle avatar-xs" alt="user-pic" /> */}
                                        {
                                            x && x.from_user_info && x.from_user_info.avatar.thumb
                                                // && getBooleanStatus(x.from_user_info.avatar && x.from_user_info.avatar.visible_avatar ? x.from_user_info.avatar.visible_avatar : 0)
                                                && x.from_user_info.avatar.thumb
                                                ?
                                                <img className="mr-3 rounded-circle avatar-xs" src={x.from_user_info.avatar.thumb} alt={x.from_user_info.username} /> :
                                                (
                                                    <span className="notification-avatar">
                                                        {
                                                            getNameInitials(x.from_user_info.username)
                                                        }
                                                    </span>
                                                )
                                        }
                                        <div className="media-body">
                                            <h6 className="mt-0 mb-1" key="t-your-order">
                                                {x.message}
                                            </h6>
                                            <div className="font-size-12 text-muted">
                                                {/* <p className="mb-1" key="t-grammer">If several languages coalesce the grammar</p> */}
                                                <p className="mb-0">
                                                    <i className="mdi mdi-clock-outline"></i>
                                                    <span key="t-min-ago">
                                                        {
                                                            moment(x.formated_date, 'DD-MMMM-YYYY hh:mm a').format(CHAT_DATE_TIME_FORMAT.DISPLAY_DATE_WITH_TIME)
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="btns-two-wrap">
                                                <button type="button"
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleAcceptJoinInvitation(x.id, x.group_id, x.entity_id)}
                                                >
                                                    Accept
                                                </button>
                                                <button type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRemoveSingleNotification(null, x.id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )) :
                                <div>
                                    No notification found
                                </div>
                        }
                    </div>
                </div>
            </div>


        </React.Fragment>
    )
}
