import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router'
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
interface LockWordModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
}

interface LockWordFormValues {
    lockword: string;
}

const lockSchema = yup.object().shape({
    lockword: yup
        .string()
        .required('Lockword is required')
        .min(4, 'Lockword should have minimum 4 characters')
        .max(16, 'Max 16 characters are allowed')
})

export default function LockWordModal({ onClose, shouldShow }: LockWordModalProps) {

    const { roomId } = useParams<any>();
    const groupCategoryApi = useGroupCategoryApi()
    const [passwordTextToggle, setPasswordTextToggle] = useState('password')
    const r_id: any = roomId ? parseInt(cryptr.decrypt(roomId)) : null;
    const history = useHistory()
    const { register, control, setValue, handleSubmit, errors } = useForm<LockWordFormValues>({
        resolver: yupResolver(lockSchema),
        defaultValues: {
            lockword: ''
        },
    })

    useEffect(() => {

    }, [])

    const onSubmit = (values: LockWordFormValues) => {
        var params = {
            room_id: parseInt(cryptr.decrypt(roomId)),
            lockword: values.lockword
        }
        groupCategoryApi.callVerifyLockword(params, (message: string, resp: any) => {

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

    const handleExitRoom = (e: any, roomId: any) => {
        e.preventDefault();
        e.stopPropagation();
        var params = {
            room_id: roomId,
        }
        groupCategoryApi.callExitFromRoom(params, (message: string, resp: any) => {
            if (r_id == roomId) {
                history.replace('');
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
                // onHide={() => onClose()}
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                // size=""
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
                            <h3>This room is locked! Please enter the Lockword to join.</h3>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="lockword"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                // name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type={passwordTextToggle}
                                                error={errors.lockword}
                                                placeholder="Lock Word"
                                            />
                                        )}
                                    />
                                    <span className="eye-password-text" onClick={handlePasswordTextToggle}>
                                        {passwordTextToggle == 'password' ?
                                            <i className="fa fa-eye" aria-hidden="true"></i> :
                                            <i className="fa fa-eye-slash" aria-hidden="true"></i>}
                                    </span>
                                </div>
                                <div className="d-flex">
                                    <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Confirm</button>
                                    <button type="button" className="btn theme-btn btn-primary waves-effect" onClick={(e) => {
                                        handleExitRoom(e, r_id)
                                        onClose(false)
                                    }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}