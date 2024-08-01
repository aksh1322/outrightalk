import React, { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Form } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import { toast } from 'react-toastify';
import styled, { keyframes } from "styled-components";
import LazyLoad from "react-lazyload";
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import { useUserPreferenceApi } from 'src/_common/hooks/actions/userPreference/appUserPreferenceApiHook';
import { GALLERY_IMAGE_LIMITATION } from 'src/_config';

const DELETE_IMAGE_ACTION = {
    SINGLE: 'single',
    ALL: 'all'
}

const loadingAnimation = keyframes`
  0% {
    background-color: #fff;
  }
  50% {
    background-color: #ccc;
  }
  100% {
    background-color: #fff;
  }
`;

const Placeholder = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  animation: ${loadingAnimation} 1s infinite;
`;

interface GalleryModalProps {
    passwordVerified?: boolean;
    onClose: (success: any) => void;
    onConfirm?: (success: any) => void;
    shouldShow: boolean;
}

interface galleryModalFormValues {
    gallery: any;
    gallery_hidden: string;
}

const galleryModalFormSchema = yup.object().shape({
    gallery: yup
        .mixed(),
    gallery_hidden: yup
        .string()
        .required("Image is required")
})

export default function GalleryModal({ passwordVerified, onClose, shouldShow, onConfirm }: GalleryModalProps) {

    const userPreferenceApi = useUserPreferenceApi()
    const userDetailsSelector = useAppUserDetailsSelector()
    const [alert, setAlert] = useState<any>(null);
    const [galleryImages, setGalleryImages] = useState<any[]>([]);
    const [selectedFileName, setSelectedFileName] = useState<string>('')
    const [isEnableUploadBtn, setIsEnableUploadBtn] = useState<boolean>(true)
    const [isAllowtoUploadImage, setIsAllowtoUploadImage] = useState<boolean>(true)
    const [userIds,setUserIds]=useState<any[]>([]);

    const { register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<galleryModalFormValues>({
        // mode: 'onBlur',
        resolver: yupResolver(galleryModalFormSchema),
        defaultValues: {
            gallery: '',
            gallery_hidden: ''
        },
    })

    const getAllGalleryImages = () => {
        userPreferenceApi.callGetAllGalleryImage((message: string, resp: any) => {
            if (resp) {
                if (userDetailsSelector && userDetailsSelector.avatar && userDetailsSelector.avatar.original) {
                    resp.list.push(
                        {
                            original: userDetailsSelector && userDetailsSelector.avatar.original,
                            id: userDetailsSelector && userDetailsSelector.id
                        }
                    )
                }
                setGalleryImages(resp.list.length ? resp.list : [])
                if (resp.list.length >= GALLERY_IMAGE_LIMITATION) {
                    setIsAllowtoUploadImage(false)
                } else {
                    setIsAllowtoUploadImage(true)
                }
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handelUploadFileChange = () => {

        if ((userDetailsSelector?.is_subscribed == null) && (galleryImages.length >= 25)) {
            toast.error('You need to subscribe to upload more than 25 images in gallery');
            return false;
        }
        if ((userDetailsSelector?.is_subscribed != null) && (galleryImages.length >= 75)) {
            toast.error('You can only upload maximum 75 images in gallery');
            return false;
        }

        setSelectedFileName(getValues('gallery') && getValues('gallery').length ? getValues('gallery')[0].name : '')
        setIsEnableUploadBtn(false)
        setValue('gallery_hidden', getValues('gallery') && getValues('gallery').length ? getValues('gallery')[0].name : '')

        setTimeout(() => {
            let a = document.getElementById('upload-btn');
            a?.click();
        }, 500);
    }

    const onUploadGalleryImage = (values: galleryModalFormValues) => {

        let fd = new FormData();
        const params = {
            gallery: values && values.gallery.length ? values.gallery[0] : ''
        }

        for (const [key, value] of Object.entries(params)) {
            fd.append(key, value)
        }
        userPreferenceApi.callUploadGalleryImage(fd, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                setUserIds([...userIds, resp?.id]);
                removeState()
                getAllGalleryImages()
              
            }
        }, (message: string) => {
            toast.error(message)
        })

    }

    const removeState = () => {
        setSelectedFileName('')
        setIsEnableUploadBtn(true)
        reset({
            gallery: null,
            gallery_hidden: ''
        })
    }
    const handleReset = ()=>{
        if (userIds.length) {
            setAlert(
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnText="Yes"
                    cancelBtnText="No"
                    cancelBtnBsStyle="danger"
                    confirmBtnBsStyle="success"
                    allowEscape={false}
                    closeOnClickOutside={false}
                    title="Reset All Images"
                    onConfirm={() =>  userIds.map((X:any)=>{
                        userPreferenceApi.callDeleteGalleryImage({ record_id: X }, (message: string, resp: any) => {
                            if (resp) {
                                removeState()
                                hideAlert();
                                getAllGalleryImages()
                            }
                        }, (message: string) => {
                            toast.error(message)
                        })
                    })}
                    onCancel={hideAlert}
                    focusCancelBtn={true}
                >
                    {
                        'Are you sure to Reset all gallery images'
                    }
                </SweetAlert>
            );
           
            
        }

    }

    const deleteGalleryImage = (params: any, action: string) => {
        if (DELETE_IMAGE_ACTION.SINGLE === action) {
            userPreferenceApi.callDeleteGalleryImage(params, (message: string, resp: any) => {
                if (resp) {
                    toast.success(message);
                    hideAlert();
                    getAllGalleryImages()
                }
            }, (message: string) => {
                toast.error(message)
            })
        } else {
            userPreferenceApi.callDeleteAllGalleryImage((message: string, resp: any) => {
                if (resp) {
                    toast.success(message);
                    hideAlert();
                    getAllGalleryImages()
                }
            }, (message: string) => {
                toast.error(message)
            })
        }
    }

    const hideAlert = () => {
        setAlert(null);
    }

    const showAlert = (e: React.MouseEvent, id: number, action: string) => {
        e && e.preventDefault()
        if (id === userDetailsSelector?.id) {
            toast.error("Profile image can't be deleted");
        } else {
            setAlert(
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnText="Yes"
                    cancelBtnText="No"
                    cancelBtnBsStyle="danger"
                    confirmBtnBsStyle="success"
                    allowEscape={false}
                    closeOnClickOutside={false}
                    title={DELETE_IMAGE_ACTION.SINGLE === action ? "Delete Image" : "Clear All Images"}
                    onConfirm={() => deleteGalleryImage({ record_id: id }, action)}
                    onCancel={hideAlert}
                    focusCancelBtn={true}
                >
                    {
                        DELETE_IMAGE_ACTION.SINGLE === action ? 'Are you sure to delete image' : 'Are you sure to clear all gallery images'
                    }
                </SweetAlert>
            );
        }

    }

    useEffect(() => {
        getAllGalleryImages()
    }, [])


    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                onHide={() => onClose(false)}
                keyboard={false}
                className="theme-custom-modal"
                dialogClassName="modal-dialog-scrollable"
                size={'xl'}
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h2>Gallery</h2>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>

                <Modal.Body bsPrefix={'create-room'} className="modal-body pl-0 pr-0">
                    {alert}
                    <div className="manage-video-message-panel">
                        <div className="row gal_mod_panel">                            {
                            galleryImages && galleryImages.length ? galleryImages.map((x: any, index: number) => (
                                <div className="gallery-list" key={index}>
                                    <div className="gallery-box">
                                        {/* <img className="or_img" src={x.gallery ? x.gallery.original : x.original} alt={`image_${x.id}`} /> */}

                                        <LazyLoad once={true} offset={100} overflow={true}
                                            placeholder={<Placeholder />} debounce={500}
                                        >
                                            <img className="or_img" src={x.gallery ? x.gallery.original : x.original} alt={`image_${x.id}`} />
                                        </LazyLoad>
                                        {
                                            x.gallery && x.gallery.original && passwordVerified ?
                                                <a href="#" className="delete-gallery-image" onClick={(e) => showAlert(e, x.id, DELETE_IMAGE_ACTION.SINGLE)}>
                                                    <i className="bx bx-x cancel_img waves-effect"></i>
                                                </a>
                                                : null
                                        }

                                    </div>
                                </div>
                            )) :
                                <div>
                                    <p>No image avilable!</p>
                                </div>
                        }
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <div className="d-flex w-100 row">
                        <div className="col-6 d-flex">
                            {passwordVerified ?
                                <div className="left-btns mr-3">
                                    <button type="button" onClick={handleReset} className="btn theme-btn btn-default waves-effect">Reset</button>
                                    <a href="#" className="btn theme-btn btn-danger waves-effect ml-2" onClick={(e) => showAlert(e, 0, DELETE_IMAGE_ACTION.ALL)}>
                                        Clear all
                                    </a>
                                </div>
                                : null}
                            {/* <div className="right-btns">
                                <a href="#" className="btn theme-btn btn-danger waves-effect mr-2 " data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>Close</a>
                            </div> */}
                        </div>
                        {
                            isAllowtoUploadImage && passwordVerified ?
                                <div className="col-sm-6 upl_img">
                                    <label className="selected-file-name-label gallery-custom-file-name">{selectedFileName}</label>
                                    <div className="form-group input_f" id="custom-button">
                                        <span>Upload File</span>
                                        <input type="hidden" name="gallery_hidden" placeholder="hidden field" ref={register} />
                                        <input className="" type="file"
                                            name="gallery"
                                            placeholder="Select room thumbnail"
                                            capture
                                            accept="image/*"
                                            ref={register}
                                            onChange={handelUploadFileChange}
                                        />
                                        {
                                            errors && errors.gallery_hidden && errors.gallery_hidden.message ? <>
                                                <Form.Control.Feedback type="invalid" >
                                                    {errors.gallery_hidden.message}
                                                </Form.Control.Feedback>
                                            </> : null
                                        }
                                    </div>

                                    <button style={{ display: 'none' }} type="submit" className="btn theme-btn btn-success waves-effect mr-2 upl"
                                        id="upload-btn"
                                        disabled={isEnableUploadBtn}
                                        onClick={handleSubmit(onUploadGalleryImage)}>
                                        Upload
                                    </button>
                                </div>
                                : null
                        }

                    </div>
                </Modal.Footer>

            </Modal>
        </React.Fragment>
    )

}