import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { CONTACT_LIST_TYPE } from 'src/_config'
import { useVideoMessageApi } from 'src/_common/hooks/actions/videoMessage/appVideoMessageApiHook';
import { toast } from 'react-toastify';


interface PasswordManagedProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    type?: string;
}

interface ManagePasswordFormValues {
    password: string;
}

const managePasswordSchema = yup.object().shape({
    password: yup.string().required('Password is required'),
})


export default function PasswordManagedModal({ onClose, shouldShow, type }: PasswordManagedProps) {

    const { watch, register, control, reset, handleSubmit, errors } = useForm<ManagePasswordFormValues>({
        // mode: 'onBlur',
        resolver: yupResolver(managePasswordSchema),
        defaultValues: {
            password: ''
        },
    })

    const videoVoiceMessageApi = useVideoMessageApi()

    const confirmPassword = (values: ManagePasswordFormValues) => {

        const params = {
            type: type === CONTACT_LIST_TYPE.VIDEOMESSAGE ? 'video' : 'voice',
            password: values.password
        }

        videoVoiceMessageApi.callCheckPassword(params, (message: string, resp: any) => {
            if (resp && resp.val) {
                onClose(true)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    useEffect(() => {

    }, [])

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                onHide={() => onClose(false)}
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <img src="/img/logo.png" />
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'sendvoice-mail'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">
                            <h2>
                                {
                                    `Manage ${type === CONTACT_LIST_TYPE.VIDEOMESSAGE ? 'Videomessages' : 'Voicemails'}`
                                }
                            </h2>
                            <form onSubmit={handleSubmit(confirmPassword)} noValidate>
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
                                                type="password"
                                                error={errors.password}
                                                placeholder="Enter Password"
                                            />
                                        )}
                                    />
                                </div>
                                <div className="d-flex">
                                    <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect" >Confirm</button>
                                    <button className="btn theme-btn btn-default waves-effect" onClick={() => onClose(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}