import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'
import { Modal } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { CRYPTO_SECRET_KEY } from 'src/_config';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface CustomizedNicknameModalProps {
    onClose: (success: any) => void;
    onSuccess: (success: any) => void;
    shouldShow: boolean;
    fetchData: { id: number, userName: string, customize_nickname: any }
}

interface CustomizedNicknameFormValues {
    nickname: string;
}

const customizedNicknameSchema = yup.object().shape({
    nickname: yup
        .string()
        .required('Nickname is required')
})

export default function CustomizedNicknameModal({ onClose, onSuccess, shouldShow, fetchData }: CustomizedNicknameModalProps) {

    const { roomId } = useParams<any>();
    const groupCategoryApi = useGroupCategoryApi()

    const { register, control, setValue, reset, handleSubmit, errors } = useForm<CustomizedNicknameFormValues>({
        resolver: yupResolver(customizedNicknameSchema),
        defaultValues: {
            nickname: ''
        },
    })

    useEffect(() => {
        if (fetchData && fetchData.userName) {
            setValue('nickname', fetchData.customize_nickname && fetchData.customize_nickname.nickname ? fetchData.customize_nickname.nickname : fetchData.userName);
        }
    }, [])

    const onSubmit = (values: CustomizedNicknameFormValues) => {

        var params = {
            // room_id: parseInt(cryptr.decrypt(roomId)),
            nickname: values.nickname,
            for_user_id: fetchData.id
        }


        groupCategoryApi.callCustomizedNickname(params, (message: string, resp: any) => {
            onClose(true)
            onSuccess(true)
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleReset = (e: any) => {
        e.preventDefault();
        reset({
            nickname: ''
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
                    <h2>Customized Nickname</h2>
                </Modal.Header>
                <Modal.Body bsPrefix={'create-room'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="nickname"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type="text"
                                                error={errors.nickname}
                                                placeholder="Type customized nickname"
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