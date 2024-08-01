import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'
import { Modal } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { toast } from 'react-toastify';
import { CRYPTO_SECRET_KEY } from 'src/_config';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface AdminCodeModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
}

interface AdminCodeFormValues {
    admincode: string;
}

const lockSchema = yup.object().shape({
    admincode: yup
        .string()
        .required('Admin code is required')
        .min(6, 'Admin code should have minimum 6 characters')
        .max(12, 'Max 12 characters are allowed')
})

export default function AdminCodeModal({ onClose, shouldShow }: AdminCodeModalProps) {

    const { roomId } = useParams<any>();
    const groupCategoryApi = useGroupCategoryApi()
    const [passwordTextToggle, setPasswordTextToggle] = useState('password')

    const { register, control, setValue, handleSubmit, errors } = useForm<AdminCodeFormValues>({
        resolver: yupResolver(lockSchema),
        defaultValues: {
            admincode: ''
        },
    })

    useEffect(() => {

    }, [])

    const onSubmit = (values: AdminCodeFormValues) => {
        var params = {
            room_id: parseInt(cryptr.decrypt(roomId)),
            admincode: values.admincode
        }
        groupCategoryApi.callVerifyAdminCode(params, (message: string, resp: any) => {

            onClose(true)

        }, (message: string) => {
            toast.error(message)
        })
    }

    // const confirmPassword = () => {
    //     console.log('success true called')
    //     onClose(true)
    // }
    const handlePasswordTextToggle = () => {
        if (passwordTextToggle == 'password') {
            setPasswordTextToggle('text')
        }
        else {
            setPasswordTextToggle('password')
        }
    }


    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                // onHide={() => onClose()}
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                // size="sm"
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
                            <h5>Admin Code</h5>
                            <form noValidate>
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="admincode"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                // name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type={passwordTextToggle}
                                                error={errors.admincode}
                                                placeholder="Admin Code"
                                            />
                                        )}
                                    />
                                    <span className="eye-password-text" onClick={handlePasswordTextToggle}>
                                        {passwordTextToggle == 'password' ?
                                            <i className="fa fa-eye" aria-hidden="true"></i> :
                                            <i className="fa fa-eye-slash" aria-hidden="true"></i>}
                                    </span>
                                </div>
                                {/* <div className="d-flex">
                                    <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Confirm</button>
                                    <button type="button" className="btn theme-btn btn-default waves-effect" onClick={() => onClose(false)}>Cancel</button>
                                </div> */}
                            </form>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <div className="d-flex">
                        <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect" onClick={handleSubmit(onSubmit)}>Confirm</button>
                        <button type="button" className="btn theme-btn btn-primary waves-effect" onClick={() => onClose(false)}>Cancel</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
}