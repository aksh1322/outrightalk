import React, { useState, useEffect } from 'react'
import { Modal, Form } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams } from 'react-router';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { CRYPTO_SECRET_KEY, TIME_CONFIG, ADMIN_CONTROL, calculateMinTime, DATE_ALL_FORMAT } from 'src/_config';
import { useAppRoomDetailsSelector, useAppRoomAdminControlSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import TimePicker from 'src/_common/components/form-elements/timePicker/timePicker';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import DateInput from 'src/_common/components/form-elements/datepicker/dateInput';
import CheckboxInput from 'src/_common/components/form-elements/checkboxinput/checkboxInput'

const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface AdminMettingProps {
    roomWelcomeMsg: string;
}

const AdminMeetingSchema = yup.object().shape({
    // userunder: yup
    //     .object().nullable(true)
    //     .when("notallowed", (notallowed: any) => {
    //         if (notallowed)
    //             return yup.string().required("Field required")
    //     }),
    // onlyuser: yup
    //     .object().nullable(true)
    //     .when("areallowed", (areallowed: any) => {
    //         if (areallowed)
    //             return yup.string().required("Field required")
    //     }),

    meetingdate: yup
        .string()
        .when("mettingtime", (mettingtime: any) => {
            if (mettingtime)
                return yup.string().required("Metting Date required")
        }).nullable(),
    mettingtime: yup
        .string()
        .when("meetingdate", (meetingdate: any) => {
            if (meetingdate)
                return yup.string().required("Metting Time required")
        }),
}, [
    ['meetingdate', 'mettingtime'], // <--- adding your fields which need validation on cycle dependency 
])

export default function AdminMetting({ roomWelcomeMsg }: AdminMettingProps) {
    const { register, control, setValue, handleSubmit, errors } = useForm({
        resolver: yupResolver(AdminMeetingSchema),
        defaultValues: {
            userunder: '',
            notallowed: false,
            onlyuser: '',
            areallowed: false,
            disablehyperlink: false,
            antiflood: false,
            reddot: false,
            meetingdate: '',
            mettingtime: '',
        },
    })
    const { roomId } = useParams<any>();
    const groupCategoryApi = useGroupCategoryApi()
    const groupCategoryAction = useAppGroupCategoryAction()
    const roomAdminControl = useAppRoomAdminControlSelector()
    const [minTime, setMinTime] = useState(calculateMinTime(new Date()))
    const [userUnderAge, setUserUnderAge] = useState(false)
    const [onlyUserRange, setonlyUserRange] = useState(false)
    const room_id: number = parseInt(cryptr.decrypt(roomId));

    const handleCancelModal = () => {
        groupCategoryAction.showRoomAdminControlModal(false)
    }

    const onSubmit = (values: any) => {
        const params = {
            room_id: room_id,
            welcome_message: roomWelcomeMsg,
            under_age: values.userunder && values.userunder.value ? parseInt(values.userunder.value) : null,
            under_age_not_allowed: values.notallowed ? 1 : 0,
            under_age_range_id: values.onlyuser && values.onlyuser.value ? parseInt(values.onlyuser.value) : null,
            under_age_range_allowed: values.areallowed ? 1 : 0,
            disable_hyperlinks: values.disablehyperlink ? 1 : 0,
            anti_flood: values.antiflood ? 1 : 0,
            red_dot_newcomers: values.reddot ? 1 : 0,
            admin_meeting_date: values.meetingdate ? moment(values.meetingdate).format(DATE_ALL_FORMAT.MOMENT_FORMAT) : null,
            admin_meeting_time: values.mettingtime ? moment(values.mettingtime).format(TIME_CONFIG.TIME_FORMAT) : null
        };
        groupCategoryApi.callSaveAdminControlSetting(params, (message: string, resp: any) => {
            toast.success(message)
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleMettingDateChange = (e: any) => {
        setValue('mettingtime', '');
        setMinTime(calculateMinTime(e))
    }

    const handleUserUnderOnchange = (e: any, triggeredAction: any) => {
        if (triggeredAction && triggeredAction.action == 'select-option') {
            setValue('notallowed', true)
            setUserUnderAge(true)
            //reset only user value
            setValue('onlyuser', '');
            setValue('areallowed', false);
        }
        else if (triggeredAction && triggeredAction.action == 'clear') {
            setValue('notallowed', false)
            setUserUnderAge(false)
        }
        else {
            //Do nothing
        }
    }

    const handleNotAllowed = (e: any) => {
        if (e) {
            setUserUnderAge(true)
            //reset only user value
            setValue('onlyuser', '');
            setValue('areallowed', false);
        } else {
            setUserUnderAge(false)
        }
    }


    const handleOnlyUserOnchange = (e: any, triggeredAction: any) => {
        if (triggeredAction && triggeredAction.action == 'select-option') {
            setValue('areallowed', true)
            setonlyUserRange(true)

            //reset use under value
            setValue('userunder', '');
            setValue('notallowed', false);
        }
        else if (triggeredAction && triggeredAction.action == 'clear') {
            setValue('areallowed', false)
            setonlyUserRange(false)
        }
        else {
            //Do nothing
        }
    }

    const handleOnlyAllowed = (e: any) => {
        if (e) {
            setonlyUserRange(true)
            //reset use under value
            setValue('userunder', '');
            setValue('notallowed', false);
        } else {
            setonlyUserRange(false)
        }
    }

    useEffect(() => {
        if (roomAdminControl && roomAdminControl.room_settings) {

            setTimeout(() => {

                if (roomAdminControl.room_settings.under_age_not_allowed) {

                    setValue('userunder', { label: roomAdminControl.room_settings.under_age.toString(), value: roomAdminControl.room_settings.under_age.toString() });

                    setValue('notallowed', roomAdminControl.room_settings.under_age_not_allowed ? true : false);
                    setUserUnderAge(true)
                } else {
                    setValue('userunder', '');
                    setValue('notallowed', roomAdminControl.room_settings.under_age_not_allowed ? true : false);
                }

                if (roomAdminControl.room_settings.under_age_range_allowed) {
                    let found = roomAdminControl.age_range && roomAdminControl.age_range.length ? roomAdminControl.age_range.filter((x: any) => x.id == roomAdminControl.room_settings.under_age_range_id) : [];
                    if (found && found.length)
                        setValue('onlyuser', { label: found[0].display_range, value: found[0].id.toString() });
                    setValue('areallowed', roomAdminControl.room_settings.under_age_range_allowed ? true : false);
                    setonlyUserRange(true)
                } else {
                    setValue('onlyuser', '');
                    setValue('areallowed', roomAdminControl.room_settings.under_age_range_allowed ? true : false);
                }

                setValue('disablehyperlink', roomAdminControl.room_settings.disable_hyperlinks ? true : false);
                setValue('antiflood', roomAdminControl.room_settings.anti_flood ? true : false);
                setValue('reddot', roomAdminControl.room_settings.red_dot_newcomers ? true : false);
            }, 300)

        }

    }, [roomAdminControl])

    return (
        <React.Fragment>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group row">
                            <div className="col-sm-4">
                                <label className="adjust-label">User Under</label>
                            </div>
                            <div className="col-sm-8">
                                <Controller
                                    control={control}
                                    name="userunder"
                                    render={({ onChange, onBlur, value, name, ref }) => (
                                        <SelectInput
                                            // name={name}
                                            onChange={(e, triggeredAction) => {
                                                onChange(e)
                                                handleUserUnderOnchange(e, triggeredAction)
                                            }
                                            }
                                            onBlur={onBlur}
                                            value={value}
                                            isDisabled={onlyUserRange}
                                            inputRef={ref}
                                            dark={true}
                                            options={roomAdminControl && roomAdminControl.age_list && roomAdminControl.age_list.length ? roomAdminControl.age_list.map((x: any) => (
                                                { label: x.toString(), value: x.toString() })
                                            ) : []}
                                            error={errors.userunder}
                                            placeholder="Select Age"
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success pl-0 mb-4 d-inline-block" data-toggle="modal" data-target="#adultContent">
                            {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor23" />
                        <label className="custom-control-label" htmlFor="customCheck-outlinecolor23">Not Allowed</label> */}
                            <Controller
                                control={control}
                                name="notallowed"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <CheckboxInput
                                        name={name}
                                        onChange={(e) => {
                                            onChange(e)
                                            handleNotAllowed(e)
                                        }
                                        }
                                        classname="custom-control-input"
                                        onBlur={onBlur}
                                        value={value}
                                        disabled={onlyUserRange}
                                        id="notallowed"
                                        inputRef={ref}
                                        label="Not Allowed"
                                        error={errors.notallowed}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group row">
                            <div className="col-sm-4">
                                <label className="adjust-label">Only Users</label>
                            </div>
                            <div className="col-sm-8">
                                <Controller
                                    control={control}
                                    name="onlyuser"
                                    render={({ onChange, onBlur, value, name, ref }) => (
                                        <SelectInput
                                            // name={name}
                                            onChange={(e, triggeredAction) => {
                                                onChange(e)
                                                handleOnlyUserOnchange(e, triggeredAction)
                                            }}
                                            onBlur={onBlur}
                                            value={value}
                                            inputRef={ref}
                                            isDisabled={userUnderAge}
                                            dark={true}
                                            options={roomAdminControl && roomAdminControl.age_range && roomAdminControl.age_range.length ? roomAdminControl.age_range.map((x: any) => (
                                                { label: x.display_range, value: x.id })
                                            ) : []}
                                            error={errors.onlyuser}
                                            placeholder="Select Age"
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success pl-0 mb-4 d-inline-block" data-toggle="modal" data-target="#adultContent">
                            {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor24" />
                        <label className="custom-control-label" htmlFor="customCheck-outlinecolor24">Are Allowed</label> */}
                            <Controller
                                control={control}
                                name="areallowed"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <CheckboxInput
                                        name={name}
                                        onChange={(e) => {
                                            onChange(e)
                                            handleOnlyAllowed(e)
                                        }
                                        }
                                        classname="custom-control-input"
                                        onBlur={onBlur}
                                        value={value}
                                        disabled={userUnderAge}
                                        id="areallowed"
                                        inputRef={ref}
                                        label="Are Allowed"
                                        error={errors.areallowed}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success pl-0 mb-4 d-inline-block" data-toggle="modal" data-target="#adultContent">
                            {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor25" />
                        <label className="custom-control-label" htmlFor="customCheck-outlinecolor25">Disable Hyperlinks</label> */}
                            <Controller
                                control={control}
                                name="disablehyperlink"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <CheckboxInput
                                        name={name}
                                        onChange={onChange}
                                        classname="custom-control-input"
                                        onBlur={onBlur}
                                        value={value}
                                        id="disablehyperlink"
                                        inputRef={ref}
                                        label="Disable Hyperlinks"
                                        error={errors.disablehyperlink}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success pl-0 mb-4 d-inline-block" data-toggle="modal" data-target="#adultContent">
                            {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor26" />
                        <label className="custom-control-label" htmlFor="customCheck-outlinecolor26">Anti Flood</label> */}
                            <Controller
                                control={control}
                                name="antiflood"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <CheckboxInput
                                        name={name}
                                        onChange={onChange}
                                        classname="custom-control-input"
                                        onBlur={onBlur}
                                        value={value}
                                        id="antiflood"
                                        inputRef={ref}
                                        label="Anti Flood"
                                        error={errors.antiflood}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success pl-0 mb-4 d-inline-block" data-toggle="modal" data-target="#adultContent">
                            {/* <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor27" />
                        <label className="custom-control-label" htmlFor="customCheck-outlinecolor27">Red Dot Newcomers</label> */}
                            <Controller
                                control={control}
                                name="reddot"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <CheckboxInput
                                        name={name}
                                        onChange={onChange}
                                        classname="custom-control-input"
                                        onBlur={onBlur}
                                        value={value}
                                        id="reddot"
                                        inputRef={ref}
                                        label="Red Dot Newcomers"
                                        error={errors.reddot}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label>Admin Meeting Date</label>
                            {/* <input type="date" className="form-control" placeholder="Enter Date" /> */}
                            <Controller
                                control={control}
                                name="meetingdate"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <DateInput
                                        // name={name}
                                        onChange={(e) => {
                                            onChange(e)
                                            handleMettingDateChange(e)
                                        }}
                                        onBlur={onBlur}
                                        value={value}
                                        minDate={new Date()}
                                        dateFormat={DATE_ALL_FORMAT.DATE_PICKER_FORMAT}
                                        inputRef={ref}
                                        error={errors.meetingdate}
                                        placeholder="Admin meeting date"
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label>Admin Meeting Time</label>
                            {/* <input type="time" className="form-control" placeholder="Enter Date" /> */}
                            <Controller
                                control={control}
                                name="mettingtime"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <TimePicker
                                        // name={name}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        minTime={minTime}
                                        value={value}
                                        inputRef={ref}
                                        timeIntervals={TIME_CONFIG.TIME_INTERVALS}
                                        error={errors.mettingtime}
                                        placeholder="time"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="d-flex justify-content-end w-100">
                            <div className="right-btns">
                                <button type="button" className="btn theme-btn btn-danger waves-effect mr-2" onClick={handleCancelModal}>Cancel</button>
                                <button className="btn theme-btn btn-primary waves-effect" type="submit">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </React.Fragment >
    )
}
