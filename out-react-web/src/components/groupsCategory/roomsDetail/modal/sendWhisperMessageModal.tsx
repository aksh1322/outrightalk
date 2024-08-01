import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'
import { Modal } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import FormTextAreaInput from 'src/_common/components/form-elements/textarea/textareaInput';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { CRYPTO_SECRET_KEY } from 'src/_config';
import { MENU_OPERATIONS } from 'src/_config/site_statics';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
interface SendWhisperModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    fetchData: { id: number, userName: string, type: string, customize_nickname: any, whisper_channel: any }
}

interface SendWhisperFormValues {
    message: string;
}

const whisperMessageSchema = yup.object().shape({
    message: yup
        .string()
        .required('Message is required')
})

export default function SendWhisperMessageModal({ onClose, shouldShow, fetchData }: SendWhisperModalProps) {

    const { roomId } = useParams<any>();
    const r_id = parseInt(cryptr.decrypt(roomId));
    const groupCategoryApi = useGroupCategoryApi()
    const [whsiperMessageChannelOpen, setWhisperMessageChannelOpen] = useState<boolean>(fetchData && fetchData.whisper_channel ? true : false)

    const { register, control, setValue, reset, handleSubmit, errors } = useForm<SendWhisperFormValues>({
        resolver: yupResolver(whisperMessageSchema),
        defaultValues: {
            message: ''
        },
    })

    useEffect(() => {

    }, [])

    const getRoomDetails = () => {
        const params = {
            room_id: r_id
        };
        groupCategoryApi.callGetRoomDetails(params, (message: string, resp: any) => {
             
            if (resp && resp.list && resp.list.length) {
            }
        }, (message: string) => {
            console.error("Error at room details fetch");
        })
    }

    const onSubmit = (values: SendWhisperFormValues) => {

        var params = {
            room_id: parseInt(cryptr.decrypt(roomId)),
            chat_body: values.message,
            to_user_id: fetchData.id,
            type: fetchData.type,
            keep_whisper_channel: whsiperMessageChannelOpen ? 1 : 0
        }

        groupCategoryApi.callPostChatInRoom(params, (message: string, resp: any) => {
            if (roomId && r_id) {
                getRoomDetails()
            }
            onClose(true)
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleReset = (e: any) => {
        e.preventDefault();
        reset({
            message: ''
        })
    }

    const toggleKeepWhisperChannelOnOff = (e: any) => {
        if (e) {
            setWhisperMessageChannelOpen(true)
        } else {
            setWhisperMessageChannelOpen(false)
        }
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
                    <h2>Message to - {fetchData.customize_nickname && fetchData.customize_nickname.nickname ? fetchData.customize_nickname.nickname : fetchData.userName}</h2>
                </Modal.Header>
                <Modal.Body bsPrefix={'create-room'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="message"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextAreaInput
                                                name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                rows={2}
                                                value={value}
                                                inputRef={ref}
                                                type="textarea"
                                                error={errors.message}
                                                placeholder="Type message here..."
                                            />
                                        )}
                                    />
                                </div>
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox"
                                        onChange={(e) => {
                                            toggleKeepWhisperChannelOnOff(e.target.checked)
                                        }}
                                        className="custom-control-input"
                                        id="customControlInlineWhisper"
                                        checked={whsiperMessageChannelOpen ? true : false}
                                    />
                                    <label className="custom-control-label" htmlFor="customControlInlineWhisper">
                                        Keep this whisper channel open
                                    </label>
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
                            <button type="button" className="btn theme-btn btn-danger waves-effect mr-2 " data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>Cancel</button>
                            <button type="submit" onClick={handleSubmit(onSubmit)} className="btn theme-btn btn-primary waves-effect"> Send</button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    )
}