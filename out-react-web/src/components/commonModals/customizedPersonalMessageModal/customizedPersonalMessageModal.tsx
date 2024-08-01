import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'
import { Modal } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import FormTextAreaInput from 'src/_common/components/form-elements/textarea/textareaInput';
import { useAppUserAction } from 'src/_common/hooks/actions/user/appUserActionHook';
import { useUserApi } from 'src/_common/hooks/actions/user/appUserApiHook';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';

interface CustomizedPersonalMessageModalProps {
    title:string,
    onClose: (success: any) => void;
    shouldShow: boolean;
}

interface CustomizedPersonalMessageFormValues {
    about: string;
}

const customizedPersonalMessageSchema = yup.object().shape({
    about: yup
        .string()
})

export default function CustomizedPersonalMessageModal({ onClose, shouldShow,title }: CustomizedPersonalMessageModalProps) {

    const userDetails = useAppUserDetailsSelector()
    const userApi = useUserApi()
    const userAction = useAppUserAction()

    const { register, control, setValue, reset, handleSubmit, errors } = useForm<CustomizedPersonalMessageFormValues>({
        resolver: yupResolver(customizedPersonalMessageSchema),
        defaultValues: {
            about: ''
        },
    })

    useEffect(() => {
        if (userDetails && userDetails.about) {
            setValue('about', userDetails.about ? userDetails.about : null);
        }
    }, [])

    const onSubmit = (values: CustomizedPersonalMessageFormValues) => {
        var params = {
            about: values.about
        }
        userApi.callCustomizedPersonalMessage(params, (message: string, resp: any) => {
            userAction.manageAboutMessage(values.about)
            onClose(true)
        }, (message: string) => {
            toast.error(message)
        })

    }

    const handleReset = (e: any) => {
        e.preventDefault();
        reset({
            about: ''
        })
    }

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                onHide={() => onClose(false)}
                keyboard={false}
                className="theme-custom-modal"
                dialogClassName="modal-dialog-scrollable"
                size={'lg'}
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h2>{title}</h2>
                </Modal.Header>
                <Modal.Body bsPrefix={'create-room'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="about"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextAreaInput
                                                name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                rows={4}
                                                type="text"
                                                error={errors.about}
                                                placeholder="Type customized personal message"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <div className="d-flex justify-content-between w-100">
                        <div className="left-btns">
                            <a href="#" onClick={(e) => handleReset(e)} className="btn theme-btn btn-default waves-effect">Reset</a>
                        </div>
                        <div className="right-btns">
                            <a href="#" className="btn theme-btn btn-danger waves-effect mr-2 " data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>Cancel</a>
                            <button type="submit" onClick={handleSubmit(onSubmit)} className="btn theme-btn btn-primary waves-effect"> Save</button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
}