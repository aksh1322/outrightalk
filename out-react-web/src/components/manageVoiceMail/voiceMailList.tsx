import clsx from 'clsx';
import React, { useEffect, useState } from 'react'
import SweetAlert from 'react-bootstrap-sweetalert';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { useVideoMessageApi } from 'src/_common/hooks/actions/videoMessage/appVideoMessageApiHook';
import { useAppVideoMessageAction } from 'src/_common/hooks/actions/videoMessage/appVideoMessageActionHook';
import { useAppMessageList } from 'src/_common/hooks/selectors/videoMessageSelector';
import { CUSTOM_MESSAGE, getAvailabiltyStatusText, getBooleanStatus, getNameInitials, getStatusColor, getSubscriptionColor, getVoiceVideoMessageStorageLimit } from 'src/_config';
import { RestoreMessage, ViewMessage } from 'src/_common/interfaces/ApiReqRes';
import ViewMessageModal from '../commonModals/viewMessageModal/viewMessageModal';
import Microphone from 'src/_common/components/elements/audio/audio'
import { useAppNotebookAction } from 'src/_common/hooks/actions/notebook/appNotebookActionHook';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
function VoiceMailList() {

    const toast = useToaster()
    const voiceList = useAppMessageList()
    const videoVoiceMessageApi = useVideoMessageApi()
    const videoMessageAction = useAppVideoMessageAction()
    const voiceVideoNotebookCountAction = useAppNotebookAction()
    const userSelector = useAppUserDetailsSelector()
    const [checkedValues, setCheckedValues] = useState<number[]>([]);
    const [alert, setAlert] = useState<any>(null);
    const [showViewMessageModal, setShowViewMessageModal] = useState<boolean>(false)
    const [message, setMessage] = useState<any>()

    const ViewMessageModalOpen = () => {
        setShowViewMessageModal(true)
    }

    const ViewMessageCloseModal = () => {
        if (showViewMessageModal) setShowViewMessageModal(false)
    }

    const hideAlert = () => {
        setAlert(null);
    }

    const showAlert = (e: React.MouseEvent, ids: number[]) => {
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
                title={`Delete ${ids.length > 1 ? 'Voicemails' : 'Voicemail'}`}
                onConfirm={() => deleteVoiceMail({ voicemail_id: ids.map(x => x) })}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {`Are you sure to delete ${ids.length > 1 ? 'voicemails' : 'voicemail'}?`}
            </SweetAlert>
        );
    }

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
            if (voiceList && voiceList.unread_message.length) {
                for (let k = 0; k < voiceList.unread_message.length; k++) {
                    if (voiceList.unread_message[k].deleted_at == null) {
                        let exist = tempCheckedValues.indexOf(voiceList.unread_message[k].id)
                        if (exist == -1) {
                            tempCheckedValues.push(voiceList.unread_message[k].id)
                        }
                    }
                }
            }

            if (voiceList && voiceList.old_message.length) {
                for (let k = 0; k < voiceList.old_message.length; k++) {

                    if (voiceList.old_message[k].deleted_at == null) {
                        let exist = tempCheckedValues.indexOf(voiceList.old_message[k].id)
                        if (exist == -1) {
                            tempCheckedValues.push(voiceList.old_message[k].id)
                        }
                    }

                }
            }



            setCheckedValues(tempCheckedValues);
        }
        else {

            if (voiceList && voiceList.unread_message.length) {
                for (let k = 0; k < voiceList.unread_message.length; k++) {
                    if (voiceList.unread_message[k].deleted_at == null) {
                        let exist = tempCheckedValues.indexOf(voiceList.unread_message[k].id)
                        if (exist !== -1) {
                            tempCheckedValues.splice(exist, 1)
                        }
                    }
                }
            }

            if (voiceList && voiceList.old_message.length) {
                for (let k = 0; k < voiceList.old_message.length; k++) {
                    if (voiceList.old_message[k].deleted_at == null) {
                        let exist = tempCheckedValues.indexOf(voiceList.old_message[k].id)
                        if (exist !== -1) {
                            tempCheckedValues.splice(exist, 1)
                        }
                    }
                }
            }

            setCheckedValues(tempCheckedValues);
        }

    }

    const selectMaster = () => {
        let tempCheckedValues = [...checkedValues]
        if (voiceList && voiceList.unread_message.length) {
            for (let k = 0; k < voiceList.unread_message.length; k++) {
                if (voiceList.unread_message[k].deleted_at == null) {
                    let exist = tempCheckedValues.indexOf(voiceList.unread_message[k].id)
                    if (exist == -1) {
                        return false
                    }
                }
            }
        }

        if (voiceList && voiceList.old_message.length) {
            for (let k = 0; k < voiceList.old_message.length; k++) {
                if (voiceList.old_message[k].deleted_at == null) {
                    let exist = tempCheckedValues.indexOf(voiceList.old_message[k].id)
                    if (exist == -1) {
                        return false
                    }
                }
            }
        }
        return true
    }

    const getVoiceMessageList = () => {
        const params = {
            type: 'voice'
        }
        videoVoiceMessageApi.callGetMessageList(params, (message: string, resp: any) => {
            if (resp) {

            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleRefreshList = (e: React.MouseEvent) => {
        e.preventDefault();
        getVoiceMessageList()
    }

    const deleteVoiceMail = (params: any) => {

        let fd = new FormData();
        const data = {
            record_id: params.voicemail_id
        }

        for (const [key, value] of Object.entries(data)) {
            value.map((x: any) => fd.append('record_id[]', x))
        }

        videoVoiceMessageApi.callDeleteMessage(fd, (message: string, resp: any) => {
            if (resp) {
                hideAlert();
                // toast.success(message)
                getVoiceMessageList()
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const restoreVideoMesage = (e: React.MouseEvent, params: RestoreMessage) => {
        e.preventDefault()
        videoVoiceMessageApi.callRestoreMessage(params, (message: string, resp: any) => {
            if (resp) {
                // toast.success(message)
                getVoiceMessageList()
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const viewVideoMessage = (params: ViewMessage) => {
        videoVoiceMessageApi.callViewMessage(params, (message: string, resp: any) => {
            if (resp) {
                setMessage(resp)
                ViewMessageModalOpen()
                getVoiceMessageList()
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleViewMessage = (e: React.MouseEvent, id: number, viewStatus: number) => {
        e.preventDefault()
        if (userSelector?.is_subscribed) {
            const limit: number = getVoiceVideoMessageStorageLimit(userSelector && userSelector.is_subscribed && userSelector.is_subscribed.feature, 'audio')
            if (voiceList && voiceList.old_message.length < limit) {
                viewVideoMessage({ record_id: id })
            } else {
                toast.error(CUSTOM_MESSAGE.OTHERS.VOICE_OLD_MSG_LIMIT)
            }
        } else {
            if (voiceList && voiceList.old_message.length < 2) {
                viewVideoMessage({ record_id: id })
            } else {
                toast.error(CUSTOM_MESSAGE.OTHERS.VOICE_OLD_MSG_LIMIT)
            }
        }

    }

    const handleReplyMessage = (e: React.MouseEvent, id: number, title: string) => {
        e.preventDefault()
        videoMessageAction.showVoiceMailModal(true, [id], '', '', `RE: ${title}`, true)
    }

    useEffect(() => {
        getVoiceMessageList()
    }, [])

    const isShowMasterCheckBox = () => {
        if ((voiceList && voiceList.unread_message.length) || (voiceList && voiceList.old_message.length)) {

            var unreadFound = voiceList && voiceList.unread_message.length ? voiceList.unread_message.filter((msg: any) => msg.deleted_at == null) : [];
            var oldFound = voiceList && voiceList.old_message.length ? voiceList.old_message.filter((msg: any) => msg.deleted_at == null) : [];

            if ((unreadFound && unreadFound.length) || (oldFound && oldFound.length)) {
                return true
            }
            else {
                return false
            }
        }
        return false
    }

    return (
        <React.Fragment>
            <div className="table-responsive mb-0" data-pattern="priority-columns">
                {alert}
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: 80 }}>
                                {isShowMasterCheckBox() ?
                                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                                        <input type="checkbox" className="custom-control-input" id="master-select-voice"
                                            checked={selectMaster()}
                                            onChange={(evt) => {
                                                onCheckSelectAll(evt.target.checked)
                                            }} />
                                        <label className="custom-control-label" htmlFor="master-select-voice" />
                                    </div> : null}
                            </th>
                            <th style={{ width: 255 }} data-priority={1}>Messages</th>
                            <th className="text-right" colSpan={2}>
                                <div className="d-inline-flex p-r-2">
                                    <a href="#" className={
                                        clsx({
                                            'mail-action-btn waves-effect': checkedValues.length,
                                            'mail-action-btn waves-effect disable-link': !checkedValues.length
                                        })
                                    } onClick={(e) => showAlert(e, checkedValues)}>

                                        <i className="delete-icon" />
                                    </a>
                                    <a href="#" className="mail-action-btn waves-effect"
                                        onClick={(e) => handleRefreshList(e)}>
                                        <i className="refresh-icon" />
                                    </a>
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={4}>
                                <h2 className="title-in-table">New Messages</h2>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {voiceList && voiceList.unread_message.length ? voiceList.unread_message.map((x: any, index: number) =>
                            <tr className={
                                clsx({
                                    'deleted': x.deleted_at != null,
                                    'unread': x.deleted_at === null
                                })
                            } key={index}>
                                <td>
                                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                                        <input type="checkbox" className="custom-control-input"
                                            id={"unread-voice-msg" + x.id}
                                            checked={checkedValues.includes(x.id)}
                                            onChange={() => handleSelect(x.id)}
                                            disabled={x.deleted_at ? true : false}
                                        />
                                        <label className="custom-control-label" htmlFor={"unread-voice-msg" + x.id} />
                                    </div>
                                </td>
                                <td>
                                    <div className="message-table-name d-flex align-items-center">
                                        <div className="message-mail-avatar">
                                            {
                                                x && x.from_user && x.from_user.avatar && getBooleanStatus(x.from_user.avatar && x.from_user.avatar.visible_avatar ? x.from_user.avatar.visible_avatar : 0) && x.from_user.avatar.thumb ?
                                                    <img src={x.from_user.avatar.thumb} alt={x.from_user.username} /> : (<span className="text-avatar">{getNameInitials(x.from_user.username)}</span>)
                                            }
                                        </div>
                                        <div className="message-mail-content">
                                            <h4
                                                style={{
                                                    color: getSubscriptionColor(x && x.from_user && x.from_user.is_subscribed ?
                                                        {
                                                            ...x,
                                                            subscription_info: x.from_user.is_subscribed
                                                        } : null)
                                                }}
                                            >
                                                {
                                                    x.from_user.customize_nickname && x.from_user.customize_nickname.nickname ? x.from_user.customize_nickname.nickname : x.from_user.username
                                                }
                                            </h4>
                                            <p>
                                                <span>
                                                    <i className="oline-tag" style={{ backgroundColor: getStatusColor(x.from_user.visible_status) }} />
                                                    {
                                                        x.from_user.visible_status == 4 ?
                                                            getAvailabiltyStatusText(0) :
                                                            getAvailabiltyStatusText(x.from_user.visible_status)
                                                    }
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <h5>
                                        <a href="#"
                                            onClick={(e) => {
                                                x.deleted_at != null ? e.preventDefault() : handleViewMessage(e, x.id, x.is_view)
                                            }}>
                                            {x.title}
                                        </a>
                                    </h5>

                                    {/* {
                                        x.deleted_at != null ? <span className="deleted">Deleted</span> : null
                                    } */}
                                    <h6>{x.converted_posted_time}</h6>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center justify-content-end action-btns">
                                        {
                                            // x.deleted_at != null ? <>
                                            //     <a href="#" className="table-action-btn waves-effect undo"
                                            //         onClick={(e) => restoreVideoMesage(e, { record_id: x.id })}
                                            //     >
                                            //         <i className="undo-icon" />
                                            //     </a>
                                            // </> :
                                            <>
                                                <a href="#" className="table-action-btn waves-effect"
                                                    onClick={(e) => { x.deleted_at != null ? e.preventDefault() : handleReplyMessage(e, x.from_user.id, x.title) }}
                                                >
                                                    <i className="forward-icon" />
                                                </a>
                                                <a className="table-action-btn waves-effect"
                                                    onClick={(e) => showAlert(e, [x.id])}>
                                                    <i className="delete-icon" />
                                                </a>
                                            </>
                                        }
                                    </div>
                                </td>

                            </tr>
                        )
                            :
                            <tr>
                                <td colSpan={50}>No record found</td>
                            </tr>
                        }

                        <tr>
                            <th colSpan={4}>
                                <h2 className="title-in-table">Old Messages</h2>
                            </th>
                        </tr>
                    </tbody>


                    {/* OLD MESSAGE BLOCK START FROM HERE */}


                    <tbody className="tbody-no-border">

                        {
                            voiceList && voiceList.old_message.length ? voiceList.old_message.map((x: any, index: number) =>
                                <tr className={
                                    clsx({
                                        'deleted': x.deleted_at != null,
                                        'unread': x.deleted_at === null
                                    })
                                } key={index}>
                                    <td>
                                        <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                                            <input type="checkbox" className="custom-control-input" id={"old-voice-msg" + x.id}
                                                checked={checkedValues.includes(x.id)}
                                                onChange={() => handleSelect(x.id)}
                                                disabled={x.deleted_at ? true : false}
                                            />
                                            <label className="custom-control-label" htmlFor={"old-voice-msg" + x.id} />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="message-table-name d-flex align-items-center">
                                            <div className="message-mail-avatar">
                                                {
                                                    x && x.from_user && x.from_user.avatar && getBooleanStatus(x.from_user.avatar && x.from_user.avatar.visible_avatar ? x.from_user.avatar.visible_avatar : 0) && x.from_user.avatar.thumb ?
                                                        <img src={x.from_user.avatar.thumb} alt={x.from_user.username} /> : (<span className="text-avatar">{getNameInitials(x.from_user.username)}</span>)
                                                }
                                            </div>
                                            <div className="message-mail-content">
                                                <h4
                                                    style={{
                                                        color: getSubscriptionColor(x && x.from_user && x.from_user.is_subscribed ?
                                                            {
                                                                ...x,
                                                                subscription_info: x.from_user.is_subscribed
                                                            } : null)
                                                    }}
                                                >
                                                    {
                                                        x.from_user.customize_nickname && x.from_user.customize_nickname.nickname ? x.from_user.customize_nickname.nickname : x.from_user.username
                                                    }
                                                </h4>
                                                <p>
                                                    <span>
                                                        <i className="oline-tag" style={{ backgroundColor: getStatusColor(x.from_user.visible_status) }} />
                                                        {
                                                            x.from_user.visible_status == 4 ?
                                                                getAvailabiltyStatusText(0) :
                                                                getAvailabiltyStatusText(x.from_user.visible_status)
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <h5>
                                            <a href="#"
                                                className="old-message-title"
                                                onClick={(e) => { x.deleted_at != null ? e.preventDefault() : handleViewMessage(e, x.id, x.is_view) }}>
                                                {x.title}
                                            </a>
                                        </h5>

                                        {/* {
                                            x.deleted_at != null ? <span className="deleted">Deleted</span> : null
                                        } */}

                                        <h6>{x.converted_posted_time}</h6>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-end action-btns">
                                            {
                                                // x.deleted_at != null ? <>
                                                //     <a href="#" className="table-action-btn waves-effect undo"
                                                //         onClick={(e) => restoreVideoMesage(e, { record_id: x.id })}
                                                //     >
                                                //         <i className="undo-icon" />
                                                //     </a>
                                                // </> :
                                                <>
                                                    <a href="#" className="table-action-btn waves-effect"
                                                        onClick={(e) => { x.deleted_at != null ? e.preventDefault() : handleReplyMessage(e, x.from_user.id, x.title) }}
                                                    >
                                                        <i className="forward-icon" />
                                                    </a>
                                                    <a href="#" className="table-action-btn waves-effect"
                                                        onClick={(e) => showAlert(e, [x.id])}>
                                                        <i className="delete-icon" />
                                                    </a>
                                                </>
                                            }
                                        </div>
                                    </td>

                                </tr>
                            )
                                :
                                <tr>
                                    <td colSpan={50}>No record found</td>
                                </tr>
                        }

                        <tr>
                            <th colSpan={4}>
                                <h2 className="title-in-table">Deleted Messages</h2>
                            </th>
                        </tr>

                        {/* DELETED MESSAGE BLOCK START FROM HERE */}

                        {
                            voiceList && voiceList.deleted_message.length ? voiceList.deleted_message.map((x: any, index: number) =>
                                <tr className="deleted" key={x.id}>
                                    <td>
                                        <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success">
                                            <input type="checkbox" className="custom-control-input" id={"old-video-msg" + x.id}
                                                checked={checkedValues.includes(x.id)}
                                                onChange={() => handleSelect(x.id)}
                                                disabled={x.deleted_at ? true : false}
                                            />
                                            <label className="custom-control-label" htmlFor={"old-video-msg" + x.id} />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="message-table-name d-flex align-items-center">
                                            <div className="message-mail-avatar">
                                                {
                                                    x && x.from_user && x.from_user.avatar && getBooleanStatus(x.from_user.avatar && x.from_user.avatar.visible_avatar ? x.from_user.avatar.visible_avatar : 0) && x.from_user.avatar.thumb ?
                                                        <img src={x.from_user.avatar.thumb} alt={x.from_user.username} /> : (<span className="text-avatar">{getNameInitials(x.from_user.username)}</span>)
                                                }
                                            </div>
                                            <div className="message-mail-content">
                                                <h4
                                                    style={{
                                                        color: getSubscriptionColor(x && x.from_user && x.from_user.is_subscribed ?
                                                            {
                                                                ...x,
                                                                subscription_info: x.from_user.is_subscribed
                                                            } : null)
                                                    }}
                                                >
                                                    {
                                                        x.from_user.customize_nickname && x.from_user.customize_nickname.nickname ? x.from_user.customize_nickname.nickname : x.from_user.username
                                                    }
                                                </h4>
                                                <p>
                                                    <span>
                                                        <i className="oline-tag" style={{ backgroundColor: getStatusColor(x.from_user.visible_status) }} />
                                                        {
                                                            x.from_user.visible_status === 4 ?
                                                                getAvailabiltyStatusText(0) :
                                                                getAvailabiltyStatusText(x.from_user.visible_status)
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>

                                        <h5>
                                            {
                                                x.title
                                            }
                                        </h5>

                                        {/* {
                                            x.deleted_at != null ? <span className="deleted">Deleted</span> : null
                                        } */}

                                        <h6>{x.converted_posted_time}</h6>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-end action-btns">

                                            <a href="#" className="table-action-btn waves-effect undo"
                                                onClick={(e) => restoreVideoMesage(e, { record_id: x.id })}
                                            >
                                                <i className="undo-icon" />
                                            </a>

                                            <a href="#" className="table-action-btn waves-effect disable-link">
                                                <i className="forward-icon" />
                                            </a>
                                            <a href="#" className="table-action-btn waves-effect disable-link">
                                                <i className="delete-icon" />
                                            </a>
                                        </div>
                                    </td>

                                </tr>
                            )
                                :
                                <tr>
                                    <td colSpan={50}>No record found</td>
                                </tr>
                        }
                    </tbody>
                </table>
            </div>

            {
                showViewMessageModal ?
                    <ViewMessageModal
                        onClose={ViewMessageCloseModal}
                        shouldShow={showViewMessageModal}
                        message={message}
                        type={'audio'}
                    /> : null
            }

        </React.Fragment>
    )
}

export default VoiceMailList
