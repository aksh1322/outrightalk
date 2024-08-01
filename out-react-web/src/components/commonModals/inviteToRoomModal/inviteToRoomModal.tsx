import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Modal } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { toast } from 'react-toastify';
import FormTextAreaInput from 'src/_common/components/form-elements/textarea/textareaInput';
import TimePicker from 'src/_common/components/form-elements/timePicker/timePicker';
import DateInput from 'src/_common/components/form-elements/datepicker/dateInput';
import EditorInputBasic from 'src/_common/components/form-elements/ckTextEditor/ckEditorInputBasic';
import { calculateMinTime, DATE_ALL_FORMAT, TIME_CONFIG } from 'src/_config';
import moment from 'moment';

interface InviteToRoomModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    getParams: (success: any) => void;
    isVIP?: boolean;
}

interface InviteToRoomFormValues {
    emails: string;
    message: string;
    start_date?: Date;
    start_time?: string;
    end_date?: Date;
    end_time?: string;
}

const inviteSchema = yup.object().shape({
    emails: yup
        .string()
        .required('Emails field is required'),
    message: yup
        .string()
});

export default function InviteToRoomModal({ onClose, shouldShow, getParams, isVIP }: InviteToRoomModalProps) {

    const { roomId } = useParams<any>();
    const groupCategoryApi = useGroupCategoryApi();
    const [isScheduled, setIsScheduled] = useState<boolean>(false);
    const [dateTimeDisableState, setDateTimeDisableState] = useState(false);
    const [startDateminTime, setStartDateminTime] = useState(calculateMinTime(new Date()));
    const [endDateminTime, setEndDateMinTime] = useState(calculateMinTime(new Date()));

    const { register, control, setValue, handleSubmit, errors } = useForm<InviteToRoomFormValues>({
        resolver: yupResolver(inviteSchema),
        defaultValues: {
            emails: '',
            message: ''
        },
    });

    useEffect(() => {
        setIsScheduled(!!isVIP);
    }, [isVIP]);

    const handleStartDateChange = (e: any) => {
        console.log('Start Date:', e);
        setValue('start_time', '');
        setStartDateminTime(calculateMinTime(e));
    };

    const handleEndDateChange = (e: any) => {
        console.log('End Date:', e);
        setValue('end_time', '');
        setEndDateMinTime(calculateMinTime(e));
    };

    const onSubmit = (values: any) => {
        console.log("values=====>", values);
        let params = {
            emails: values.emails,  
            message: values.message,
            start_date: values.start_date ? moment(values.start_date).format(DATE_ALL_FORMAT.MOMENT_FORMAT) : null,
            start_time: values.start_time ? moment(values.start_time).format(TIME_CONFIG.TIME_FORMAT) : null,
            end_date: values.end_date ? moment(values.end_date).format(DATE_ALL_FORMAT.MOMENT_FORMAT) : null,
            end_time: values.end_time ? moment(values.end_time).format(TIME_CONFIG.TIME_FORMAT) : null
        };

        getParams(params);
    };

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                size="lg"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <h2>Share via Email</h2>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="modal-close"></i>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'sendvoice-mail'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <Controller
                                                control={control}
                                                name="emails"
                                                render={({ onChange, onBlur, value, name, ref }) => (
                                                    <FormTextInput
                                                        name={name}
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        value={value}
                                                        inputRef={ref}
                                                        type="text"
                                                        error={errors.emails}
                                                        placeholder="Type nickname/emails... (Comma Separated)"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <Controller
                                                control={control}
                                                name="message"
                                                render={({ onChange, onBlur, value, name, ref }) => (
                                                    <FormTextAreaInput
                                                        name={name}
                                                        rows={5}
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        value={value}
                                                        inputRef={ref}
                                                        type="text"
                                                        error={errors.message}
                                                        placeholder="Type your message..."
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    {isVIP && (
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <input
                                                    type="checkbox"
                                                    id="isScheduled"
                                                    checked={isScheduled}
                                                    onChange={() => setIsScheduled(!isScheduled)}
                                                />
                                                <label htmlFor="isScheduled" style={{ marginLeft: '8px' }}>Schedule Invitation</label>
                                            </div>
                                        </div>
                                    )}
                                    {isScheduled && (
                                        <>
                                            <hr className="light-hr" />
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Start Date</label>
                                                    <Controller
                                                        control={control}
                                                        name="start_date"
                                                        render={({ onChange, onBlur, value, name, ref }) => (
                                                            <DateInput
                                                                onChange={(e) => {
                                                                    onChange(e);
                                                                    handleStartDateChange(e);
                                                                }}
                                                                onBlur={onBlur}
                                                                disabled={dateTimeDisableState}
                                                                value={value}
                                                                minDate={new Date()}
                                                                dateFormat="MM/dd/yyyy"
                                                                inputRef={ref}
                                                                error={errors.start_date}
                                                                placeholder="Set Start Date"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Start Time</label>
                                                    <Controller
                                                        control={control}
                                                        name="start_time"
                                                        render={({ onChange, onBlur, value, name, ref }) => (
                                                            <TimePicker
                                                                onChange={onChange}
                                                                disabled={dateTimeDisableState}
                                                                onBlur={onBlur}
                                                                minTime={startDateminTime}
                                                                value={value}
                                                                inputRef={ref}
                                                                timeIntervals={15}
                                                                error={errors.start_time}
                                                                placeholder="Set Start Time"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <hr className="light-hr" />
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>End Date</label>
                                                    <Controller
                                                        control={control}
                                                        name="end_date"
                                                        render={({ onChange, onBlur, value, name, ref }) => (
                                                            <DateInput
                                                                onChange={(e) => {
                                                                    onChange(e);
                                                                    handleEndDateChange(e);
                                                                }}
                                                                disabled={dateTimeDisableState}
                                                                onBlur={onBlur}
                                                                value={value}
                                                                minDate={new Date()}
                                                                dateFormat="MM/dd/yyyy"
                                                                inputRef={ref}
                                                                error={errors.end_date}
                                                                placeholder="Set End Date"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>End Time</label>
                                                    <Controller
                                                        control={control}
                                                        name="end_time"
                                                        render={({ onChange, onBlur, value, name, ref }) => (
                                                            <TimePicker
                                                                disabled={dateTimeDisableState}
                                                                onChange={onChange}
                                                                onBlur={onBlur}
                                                                minTime={endDateminTime}
                                                                value={value}
                                                                inputRef={ref}
                                                                timeIntervals={15}
                                                                error={errors.end_time}
                                                                placeholder="Set End Time"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="col-sm-12">
                                        <div className="d-flex">
                                            <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Invite</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    );
}
