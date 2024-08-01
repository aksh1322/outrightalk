import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'
import { Form, Modal } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';

interface UploadRoomVideoModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    roomId: number;
    fromWhere?: string;
}

interface UploadRoomVideoFormValues {
    file: any;
    file_hidden: string;
}

const UploadRoomVideoSchema = yup.object().shape({
    file: yup
        .mixed(),
    file_hidden: yup
        .string()
        .required("Video file is required")
})

export default function UploadRoomVideoModal({ onClose, shouldShow, roomId, fromWhere }: UploadRoomVideoModalProps) {

    const groupCategoryApi = useGroupCategoryApi()
    const [selectedFileName, setSelectedFileName] = useState<string>('')
    const [viewSubmitButton, setviewSubmitButton] = useState<boolean>(false)
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('')
    const [isVideoPreviewShow, setIsVideoPreviewShow] = useState<boolean>(false)


    const { register, control, getValues, setValue, reset, handleSubmit, errors } = useForm<UploadRoomVideoFormValues>({
        resolver: yupResolver(UploadRoomVideoSchema),
        defaultValues: {
            file: '',
            file_hidden: ''
        },
    })

    const handelUploadFileChange = (e: any) => {

        let blobURL = URL.createObjectURL(e.target.files[0]);

        setVideoPreviewUrl(blobURL)
        setIsVideoPreviewShow(true)


        setviewSubmitButton(true)
        setSelectedFileName(getValues('file') && getValues('file').length ? getValues('file')[0].name : '')
        setValue('file_hidden', getValues('file') && getValues('file').length ? getValues('file')[0].name : '')
    }

    const handleReset = () => {
        setSelectedFileName('')
        reset({
            file: null,
            file_hidden: '',
        })
    }

    const handleUploadRoomVideo = (values: UploadRoomVideoFormValues) => {
        let fd = new FormData();
        const params = {
            video: values && values.file.length ? values.file[0] : '',
            room_id: roomId
        }

        for (const [key, value] of Object.entries(params)) {
            fd.append(key, value)
        }

        if (fromWhere == 'roomActionMenu') {

            groupCategoryApi.callRoomMenuPlayVideo(fd, (message: string, resp: any) => {
                if (resp) {
                    toast.success(message)
                    handleReset()
                    onClose(true)
                }
            }, (message: string) => {
                toast.error(message)
            })


        } else {
            groupCategoryApi.callUploadRoomVideo(fd, (message: string, resp: any) => {
                if (resp) {
                    toast.success(message)
                    handleReset()
                    onClose(true)
                }
            }, (message: string) => {
                toast.error(message)
            })
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
                size={'sm'}
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h2>Upload Video</h2>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'create-room'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel text-center">
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group input_f marg">
                                    <span>Upload Video</span>
                                    <input type="hidden" name="file_hidden" placeholder="hidden field" ref={register} />
                                    <input className="" type="file"
                                        name="file"
                                        placeholder="Select File"
                                        capture
                                        accept="video/*"
                                        ref={register}
                                        onChange={(e) => handelUploadFileChange(e)}
                                    />
                                    {
                                        errors && errors.file_hidden && errors.file_hidden.message ? <>
                                            <Form.Control.Feedback type="invalid" >
                                                {errors.file_hidden.message}
                                            </Form.Control.Feedback>
                                        </> : null
                                    }
                                </div>
                                <label className="selected-file-name-label">{selectedFileName}</label>
                                {
                                    isVideoPreviewShow ?
                                        <div className="uploaded-cam-video" style={{ marginBottom: '15px' }}>
                                            <video src={videoPreviewUrl}
                                                style={{ height: 'fit-content' }}
                                                width="220"
                                                height="240"
                                                controls
                                                disablePictureInPicture
                                                controlsList="nofullscreen nodownload"
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div> : null
                                }
                                {
                                    viewSubmitButton ?
                                        <div className="form-group">
                                            <button type="submit"
                                                className="btn theme-btn btn-primary mr-2 waves-effect"
                                                onClick={handleSubmit(handleUploadRoomVideo)}
                                                disabled={!selectedFileName ? true : false}
                                            >
                                                {
                                                    fromWhere == 'roomActionMenu' ?
                                                        'Send for approval' : 'Submit'
                                                }
                                            </button>
                                        </div>
                                        : null
                                }


                            </div>

                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}