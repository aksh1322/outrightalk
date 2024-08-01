import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'
import { Modal } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { toast } from 'react-toastify';

interface ParentalControlPasswordConfirmationModalProps {
    onClose: (success: any) => void;
    onSuccess: (success: boolean) => void;
    shouldShow: boolean;
    setPassword: any;
}

interface ParentalControlPasswordConfirmationFormValues {
    password: string;
}

const parentalPasswordSchema = yup.object().shape({
    password: yup
        .string()
        .required('Password is required')
})

export default function ParentalControlPasswordConfirmationModal({ onClose, onSuccess, shouldShow, setPassword }: ParentalControlPasswordConfirmationModalProps) {

    const [passwordTextToggle, setPasswordTextToggle] = useState('password')

    const { register, control, setValue, handleSubmit, errors } = useForm<ParentalControlPasswordConfirmationFormValues>({
        resolver: yupResolver(parentalPasswordSchema),
        defaultValues: {
            password: ''
        },
    })

    const handlePasswordTextToggle = () => {
        if (passwordTextToggle == 'password') {
            setPasswordTextToggle('text')
        }
        else {
            setPasswordTextToggle('password')
        }
    }

    //After submit the password funcion will call
    const onSubmit = (values: ParentalControlPasswordConfirmationFormValues) => {
        if (setPassword == values.password) {
            onSuccess(true)
        } else {
            onSuccess(false)
        }
    }

    useEffect(() => {

    }, [])

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                // onHide={() => onClose()}
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                size="sm"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <img src="/img/logo.png" />
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'parental-password-confirm'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">
                            <h5>Password</h5>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type={passwordTextToggle}
                                                error={errors.password}
                                                placeholder="Password"
                                            />
                                        )}
                                    />
                                    <span className="eye-password-text" onClick={handlePasswordTextToggle}>
                                        {
                                            passwordTextToggle == 'password' ?
                                                <i className="fa fa-eye" aria-hidden="true"></i> :
                                                <i className="fa fa-eye-slash" aria-hidden="true"></i>
                                        }
                                    </span>
                                </div>
                                <div className="d-flex">
                                    <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Confirm</button>
                                    <button type="button" className="btn theme-btn btn-default waves-effect" onClick={() => onClose(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )

}