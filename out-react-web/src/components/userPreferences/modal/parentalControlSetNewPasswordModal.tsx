import React from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';

interface ParentalControlSetNewPasswordModalProps {
    onClose: (success: any) => void;
    onSuccess: (status: boolean) => void
    shouldShow: boolean;
    userId: number;
}

interface ParentalControlSetNewPasswordFormValues {
    password: string;
    c_password: string;
}

const ParentalControlSetNewPasswordModalFormSchema = yup.object().shape({
    password: yup
        .string()
        .required("Password is required"),
    c_password: yup
        .string()
        .oneOf([yup.ref('password'), ''], 'Passwords must match')
        .required("Confirm Password is required")
})

export default function ParentalControlSetNewPasswordModal({ onClose, onSuccess, shouldShow, userId }: ParentalControlSetNewPasswordModalProps) {
    const userPreferenceApi = useUserPreferenceApi()
    const preferenceSelector = useAppUserPreferencesSelector()

    const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<ParentalControlSetNewPasswordFormValues>({
        resolver: yupResolver(ParentalControlSetNewPasswordModalFormSchema),
        defaultValues: {
            password: '',
            c_password: ''
        },
    })

    const onSubmit = (values: ParentalControlSetNewPasswordFormValues) => {
        const params = {
            user_id: userId,
            password: values.password,
            c_password: values.c_password
        }

        userPreferenceApi.callParentalControlSetPasword(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                onSuccess(true)
                onClose(true)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleClose = () => {
        onClose(true)
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
                // size={'lg'}
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <img src="/img/logo.png" />
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'parental-control-set-password'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel parental-set-password">
                        <h2>Change <strong>Password</strong></h2>
                        <form className="reset-password" onSubmit={handleSubmit(onSubmit)} noValidate>

                            <div className="form-group">
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ onChange, onBlur, value, name, ref }) => (
                                        <FormTextInput
                                            name={name}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            inputRef={ref}
                                            type="password"
                                            error={errors.password}
                                            placeholder="New Password"
                                        />
                                    )}
                                />
                            </div>

                            <div className="form-group">
                                <Controller
                                    control={control}
                                    name="c_password"
                                    render={({ onChange, onBlur, value, name, ref }) => (
                                        <FormTextInput
                                            name={name}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            inputRef={ref}
                                            type="password"
                                            error={errors.c_password}
                                            placeholder="Confirm Password"
                                        />
                                    )}
                                />
                            </div>

                            <div className="reg-btn-panel d-flex justify-content-between mt-5">
                                <button type="button" className="btn theme-btn btn-danger waves-effect" onClick={handleClose}>Cancel</button>
                                <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect" onClick={handleSubmit(onSubmit)}>Update Password</button>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}