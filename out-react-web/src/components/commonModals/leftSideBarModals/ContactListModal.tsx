import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import SweetAlert from 'react-bootstrap-sweetalert';
import { calculateMinTime, CONTACT_LIST_TYPE, DATE_ALL_FORMAT, getAvailabiltyStatusText, getBooleanStatus, getBooleanToValueStatus, getNameInitials, getStatusColor, getSubscriptionColor, TIME_CONFIG } from 'src/_config';
import { useVideoMessageApi } from 'src/_common/hooks/actions/videoMessage/appVideoMessageApiHook';
import { useNotebookApi } from 'src/_common/hooks/actions/notebook/appNotebookApiHook';
import { useAppVideoMessageAction } from 'src/_common/hooks/actions/videoMessage/appVideoMessageActionHook';
import { useAppContactListUser } from 'src/_common/hooks/selectors/videoMessageSelector';
import { useAppNotebookContactListUser } from 'src/_common/hooks/selectors/notebookSelector';
import DateInput from 'src/_common/components/form-elements/datepicker/dateInput';
import TimePicker from 'src/_common/components/form-elements/timePicker/timePicker';
import * as yup from 'yup';
import moment from 'moment';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

interface ContactListModalProps {
    onClose: () => void;
    onSuccess: () => void;
    shouldShow: boolean;
    type?: string; //like : videomessage, voicemail, notebook etc..
    notebookId?: number;
}

const ContactListSchema = yup.object().shape({

    date: yup
        .string()
        .when("time", (time: any) => {
            if (time)
                return yup.string().required("Date required")
        }).nullable(),
    time: yup
        .string()
        .when("date", (date: any) => {
            if (date)
                return yup.string().required("Time required")
        }),
}, [
    ['date', 'time'], // <--- adding your fields which need validation on cycle dependency 
])
interface contactListFormValues {
    date: string;
    time: string;
}

export default function ContactListModal({ onClose, onSuccess, shouldShow, type, notebookId }: ContactListModalProps) {

    const { register, control, setValue, handleSubmit, errors } = useForm<contactListFormValues>({
        resolver: yupResolver(ContactListSchema),
        defaultValues: {
            date: '',
            time: ''
        },
    })

    const [checkedValues, setCheckedValues] = useState<any>([]);
    const videoMessageAction = useAppVideoMessageAction()
    const videoVoiceMessageApi = useVideoMessageApi()
    const notebookApi = useNotebookApi()
    const [minTime, setMinTime] = useState(calculateMinTime(new Date()))

    const [searchTerm, setSearchTerm] = useState<any>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [contactUsers, setContactUsers] = useState<any[]>([])
    const contactList = useAppContactListUser()
    const [checkUseravailabiltyAlert, setCheckUserAvailabilityAlert] = useState<any>(null);

    const hideCheckUserAvailabilityAlert = () => {
        setCheckUserAvailabilityAlert(null);
    }

    //Check user Avalabilty alert if is_popup_open = 1, then below message will trigger
    const showCheckUserAvailabilityAlert = (message: string, isNextStep: number, remove_users: any[], values: contactListFormValues) => {
        setCheckUserAvailabilityAlert(
            <SweetAlert
                warning
                // showCancel
                confirmBtnText="Ok"
                cancelBtnText="No"
                cancelBtnBsStyle="danger"
                confirmBtnBsStyle="primary"
                allowEscape={false}
                closeOnClickOutside={false}
                title=""
                onConfirm={() => handleShareItemIfUserAvailable(isNextStep, remove_users, values)}
                onCancel={hideCheckUserAvailabilityAlert}
                focusCancelBtn={true}
            >
                {
                    message
                }
            </SweetAlert>
        );
    }

    const handleContactSearch = (event: any) => {
        setSearchTerm(event.target.value);
    };

    let SearchContactData = type === CONTACT_LIST_TYPE.NOTEBOOK ? contactUsers : (contactList && contactList.list)
    const results = !searchTerm
        ? SearchContactData
        : SearchContactData && SearchContactData.length && SearchContactData.filter((el: any) =>

            el.customize_nickname && el.customize_nickname.nickname ? el.customize_nickname.nickname.toLowerCase().includes(searchTerm.toLocaleLowerCase()) : el.contact_user.username.toLowerCase().includes(searchTerm.toLocaleLowerCase())
        );

    function handleSelect(checkedName: number) {
        const newNames = checkedValues?.includes(checkedName)
            ? checkedValues?.filter((name: any) => name !== checkedName)
            : [...(checkedValues ?? []), checkedName];
        setCheckedValues(newNames);
        return newNames;
    }

    const shareNotebook = () => {
        let fd = new FormData();
        const params = {
            notebook_id: notebookId,
            share_user_id: checkedValues
        }
        for (const [key, value] of Object.entries(params)) {
            if (key == 'share_user_id') {
                value.map((user: any) => fd.append('share_user_id[]', user))
            } else {
                fd.append(key, value)
            }
        }

        notebookApi.callShareNotebook(fd, (message: string, resp: any) => {
            if (resp) {
                onClose()
                onSuccess()
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleShareItem = (values: contactListFormValues) => {
        //Check user availability api call
        if (type != CONTACT_LIST_TYPE.NOTEBOOK) {
            let fd = new FormData();
            const params = {
                type: type === CONTACT_LIST_TYPE.VIDEOMESSAGE ? 'video' : 'voice',
                to_user: checkedValues
            }
            for (const [key, value] of Object.entries(params)) {
                if (key == 'to_user') {
                    value.map((user: any) => fd.append('to_user[]', user))
                } else {
                    fd.append(key, value)
                }
            }
            videoVoiceMessageApi.callCheckAvailabilityUser(fd, (message: string, resp: any) => {
                if (resp) {
                    if (getBooleanToValueStatus(resp.is_popup_open)) {
                        showCheckUserAvailabilityAlert(resp.msg, resp.is_forward_to_next_step, resp.remove_users, values)
                    } else {
                        handleShareItemIfUserAvailable(1, [], values)
                    }
                }
            }, (message: string) => {
                toast.error(message)
            })
        } else {
            handleShareItemIfUserAvailable(1, [], values)
        }
    }

    const handleShareItemIfUserAvailable = (isNextStep: number, remove_users: any[], values: contactListFormValues) => {
        let selectedDate = values.date ? moment(values.date).format(DATE_ALL_FORMAT.MOMENT_FORMAT) : null;
        let selectedTime = values.time ? moment(values.time).format(TIME_CONFIG.TIME_FORMAT) : null;

        if (getBooleanStatus(isNextStep)) {
            if (remove_users && remove_users.length) {
                remove_users.map((x: any) => {
                    let index = checkedValues.findIndex((z: any) => z == x)
                    if (index >= 0) {
                        checkedValues.splice(index, 1)
                    }
                })
            }
            if (type === CONTACT_LIST_TYPE.VIDEOMESSAGE) {
                onClose()
                videoMessageAction.showVideoMessageModal(true, checkedValues, selectedDate, selectedTime, '', false)

            } else if (type === CONTACT_LIST_TYPE.VOICEMAIL) {
                onClose()
                setTimeout(() => {
                    videoMessageAction.showVoiceMailModal(true, checkedValues, selectedDate, selectedTime, '', false)
                }, 100)

            } else {
                shareNotebook()
            }
        } else {
            if (remove_users && remove_users.length) {
                remove_users.map((x: any) => {
                    let index = checkedValues.findIndex((z: any) => z == x)
                    if (index >= 0) {
                        checkedValues.splice(index, 1)
                    }
                })
                hideCheckUserAvailabilityAlert()
            }
        }

    }

    const handleDateChange = (e: any) => {
        setValue('time', '');
        setMinTime(calculateMinTime(e))
    }

    const getContactListUser = () => {
        const params = {
            type: type === CONTACT_LIST_TYPE.VIDEOMESSAGE ? 'video' : 'voice'
        }
        videoVoiceMessageApi.callGetContactListUser(params, (message: string, resp: any) => {
            if (resp) { }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const getNotebookContactListUser = () => {
        const params = {
            notebook_id: notebookId
        }
        notebookApi.callNotebookContactList(params, (message: string, resp: any) => {
            if (resp) {
                if (resp && resp.length) {
                    setContactUsers(resp)
                } else {
                    setContactUsers([])
                }
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    useEffect(() => {
        if (type === CONTACT_LIST_TYPE.NOTEBOOK) {
            getNotebookContactListUser()
        } else {
            getContactListUser()
        }
    }, [])

    return (
        <React.Fragment>
            {checkUseravailabiltyAlert}
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="bs-example-modal-center contact-list-modal theme-custom-modal"
                size='lg'
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h5 className="modal-title mt-0">Contact List</h5>
                    <button type="button" className="close" onClick={() => onClose()}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'-contactlist'}>
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
                            <div className="table-responsive mb-0 contact_mod" data-pattern="priority-columns">
                                <table className="table">
                                    <tbody>
                                        {results && results.length ? results.map((x: any, index: number) =>
                                            <tr key={x.id}>
                                                <td>
                                                    <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox custom-checkbox-success d-inline-flex">
                                                        <input type="checkbox" className="custom-control-input"
                                                            id={"customCheck-outlinecolor17" + index}
                                                            checked={checkedValues.includes(x.contact_user.id)}
                                                            onChange={() => handleSelect(x.contact_user.id)}
                                                        />
                                                        <label className="custom-control-label" htmlFor="customCheck-outlinecolor17" />
                                                    </div>
                                                    <div className="message-table-name d-inline-flex align-items-center ml-4">
                                                        <div className="message-mail-avatar">
                                                            {/* <img src={x.img} /> */}
                                                            {
                                                                x && x.contact_user && x.contact_user.avatar && getBooleanStatus(x.contact_user.avatar && x.contact_user.avatar.visible_avatar ? x.contact_user.avatar.visible_avatar : 0) && x.contact_user.avatar.thumb ?
                                                                    <img src={x.contact_user.avatar.thumb} alt={x.contact_user.username} /> : (<span className="text-avatar">{getNameInitials(x.contact_user.username)}</span>)
                                                            }
                                                        </div>
                                                        <div className="message-mail-content">
                                                            <h4
                                                                style={{
                                                                    color: getSubscriptionColor(x && x.contact_user && x.contact_user.is_subscribed ?
                                                                        {
                                                                            ...x,
                                                                            subscription_info: x.contact_user.is_subscribed
                                                                        } : null)
                                                                }}>
                                                                {
                                                                    x.customize_nickname && x.customize_nickname.nickname ? x.customize_nickname.nickname : x.contact_user.username
                                                                }
                                                            </h4>
                                                            <p>
                                                                <span>
                                                                    <i className="oline-tag" style={{ backgroundColor: getStatusColor(x.contact_user.visible_status) }} />
                                                                    {
                                                                        x.contact_user.visible_status === 4 ?
                                                                            getAvailabiltyStatusText(0) :
                                                                            getAvailabiltyStatusText(x.contact_user.visible_status)
                                                                    }
                                                                </span>
                                                            </p>
                                                        </div>
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
                        </div>
                        <div className="contact-list-bottom-form d-flex justify-content-between">

                            {/* <form onSubmit={handleSubmit(handleShareItem)} noValidate> */}

                            {/* Date Time field start here */}
                            {
                                type === CONTACT_LIST_TYPE.VIDEOMESSAGE || type === CONTACT_LIST_TYPE.VOICEMAIL ?
                                    <>
                                        <div className="flex-grow-1 contact-list-form-fld mr-2">
                                            <Controller
                                                control={control}
                                                name="date"
                                                render={({ onChange, onBlur, value, name, ref }) => (
                                                    <DateInput
                                                        // name={name}
                                                        onChange={(e) => {
                                                            onChange(e)
                                                            handleDateChange(e)
                                                        }}
                                                        onBlur={onBlur}
                                                        value={value}
                                                        minDate={new Date()}
                                                        dateFormat={DATE_ALL_FORMAT.DATE_PICKER_FORMAT}
                                                        inputRef={ref}
                                                        error={errors.date}
                                                        placeholder="Date"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="flex-grow-1 contact-list-form-fld mr-2">
                                            <Controller
                                                control={control}
                                                name="time"
                                                render={({ onChange, onBlur, value, name, ref }) => (
                                                    <TimePicker
                                                        // name={name}
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        minTime={minTime}
                                                        value={value}
                                                        inputRef={ref}
                                                        timeIntervals={TIME_CONFIG.TIME_INTERVALS}
                                                        error={errors.time}
                                                        placeholder="Time"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </> : null
                            }
                            {/* Date Time field end here */}

                            <div className="d-flex">

                                <button
                                    className={
                                        clsx({
                                            'next-btn waves-effect': checkedValues.length,
                                            'next-btn waves-effect disable-link': !checkedValues.length
                                        })
                                    }
                                    // onClick={(e) => handleShareItem(e)}
                                    onClick={handleSubmit(handleShareItem)}
                                    data-toggle="modal" data-target=".sendvoicemail"
                                    data-dismiss="modal">
                                    Send
                                </button>
                            </div>
                            {/* </form> */}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}