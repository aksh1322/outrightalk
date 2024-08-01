import React from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useAppUserPreferencesSelector } from 'src/_common/hooks/selectors/userPreferenceSelector';
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';

interface ParentalOtpModalProps {
    onClose: (success: any) => void;
    onSuccess: (status: boolean) => void
    shouldShow: boolean;
    userId: number;
}
interface ParentalOtpFormValues {
    otp: string
}

const ParentalOtpModalFormSchema = yup.object().shape({
    otp: yup
        .string()
        .required("OTP is required")
        .min(8, "Minimum 8 character required")
        .max(8, "Maximum 8 character required")
})

export default function ParentalControlOtpAcceptModal({ onClose, onSuccess, shouldShow, userId }: ParentalOtpModalProps) {
    const userPreferenceApi = useUserPreferenceApi()
    const preferenceSelector = useAppUserPreferencesSelector()

    const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<ParentalOtpFormValues>({
        resolver: yupResolver(ParentalOtpModalFormSchema),
        defaultValues: {
            otp: ''
        },
    })

    const handleClose = () => {
        onClose(true)
    }

    const onSubmit = (values: ParentalOtpFormValues) => {

        const params = {
            user_id: userId,
            otp: values.otp
        }

        userPreferenceApi.callParentalControlForgotPasswordOtp(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                onSuccess(true)
                onClose(true)
            }
        }, (message: string) => {
            toast.error(message)
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
                size={'sm'}
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h2>OTP</h2>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'parental-control-otp'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel parental-otp">
                        <div className="form-group">
                            <Controller
                                control={control}
                                name="otp"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <FormTextInput
                                        name={name}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        inputRef={ref}
                                        type="text"
                                        error={errors.otp}
                                        placeholder="Enter OTP"
                                    />
                                )}
                            />
                        </div>
                        <div className="mt-3 d-flex align-items-center login-btn">
                            <button className="btn btn-primary btn-block waves-effect waves-light w-auto mr-2" type="submit"
                                onClick={handleSubmit(onSubmit)}
                            >Next</button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}