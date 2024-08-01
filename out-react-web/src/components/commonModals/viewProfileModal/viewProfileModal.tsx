import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { getNameInitials, DATE_FORMAT } from 'src/_config';
import { getAvailabiltyStatusText, getBooleanStatus, getSubscriptionColor, getValueFromArrayOfObject, getVisibleData } from 'src/_config/functions';
import { useUserApi } from 'src/_common/hooks/actions/user/appUserApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { OptionValue } from 'src/_common/interfaces/common';
import { UserDetailsReq } from 'src/_common/interfaces/ApiReqRes';
import Slider from "react-slick";

interface viewProfileModalProps {
    onClose: (success: any) => void;
    addToContactList: (success: any) => void;
    shouldShow: boolean;
    isAddedToContactList?: boolean;
    userId: any;
}

export default function ViewProfileModal({ onClose, shouldShow, addToContactList, isAddedToContactList, userId }: viewProfileModalProps) {

    const settings = {
        dots: false,
        infinite: false,
        slidesToShow: 4,
        slidesToScroll: 4,
        swipeToSlide: true,
        autoplay: false,
    };

    const userApi = useUserApi()
    const toast = useToaster()
    const [userDetails, setUserDetails] = useState<any>()

    const handleViewProfile = (id: number) => {
        let params = { user_id: id }
        userApi.callFetchUserDetails(params, (message: string, resp: any) => {
            setUserDetails(resp.user)
        }, (message: string) => {
        })
    }

    useEffect(() => {
        handleViewProfile(userId)
    }, [])

    const renderSlides = () =>
        userDetails && userDetails.gallery && userDetails.gallery.length && userDetails.gallery.map((gal: any, index: number) =>
            <div className="profile_view_img">
                <div className="gallery-list" key={gal.id}>
                    <div className="gallery-box">
                        <img src={gal.gallery.original} alt={"img-" + gal.id} />
                    </div>
                </div>
            </div>
        )

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                size='lg'
                centered
                contentClassName='custom-modal profile_section'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <h2>Profile Details</h2>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="modal-close"></i>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-12">


                            <div className="profile-wrap">
                                <div className="pro-img-wrap">
                                    <div className="pro-img">
                                        <span className="sub-menu-avatar">
                                            {
                                                userDetails && userDetails.avatar
                                                    && getBooleanStatus(userDetails.avatar && userDetails.avatar.visible_avatar ? userDetails.avatar.visible_avatar : 0)
                                                    && userDetails.avatar.thumb ?
                                                    <img src={userDetails.avatar.thumb} alt={userDetails.username} />
                                                    :
                                                    (
                                                        <span className="profile-text-avatar">
                                                            {
                                                                getNameInitials(userDetails?.username)
                                                            }
                                                        </span>
                                                    )
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className="about-profile">
                                    <h2 style={{
                                        color: getSubscriptionColor(userDetails && userDetails.is_subscribed ?
                                            {
                                                ...userDetails,
                                                subscription_info: userDetails.is_subscribed
                                            } : null)
                                    }}>
                                        {
                                            // userDetails && userDetails.customize_nickname && userDetails.customize_nickname.nickname ? userDetails.customize_nickname.nickname : userDetails?.username
                                            userDetails?.username
                                        }
                                    </h2>
                                    <p className="about-text">
                                        {
                                            userDetails
                                                && userDetails.visible_option && userDetails.visible_option.length &&
                                                !getBooleanStatus(getValueFromArrayOfObject(userDetails.visible_option, "about_visible")) ?
                                                userDetails && userDetails.about : '--'
                                        }
                                    </p>
                                    <p>
                                        {/* <span className={userDetails && userDetails.visible_status ? 'user-status st-' + userDetails.visible_status : 'user-status st-1'} /> */}
                                        {getAvailabiltyStatusText(userDetails && userDetails.visible_status)}
                                    </p>
                                    {
                                        !isAddedToContactList ?
                                            <a href="#" onClick={() => addToContactList(userDetails)} className="btn btn-primary btn-lg mr-2">Add To Contact List</a>
                                            : null
                                    }
                                    {
                                        (userDetails && userDetails.is_subscribed)
                                            ?
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <p>
                                                        Current Plan: {(userDetails.is_subscribed.plan_info) && userDetails.is_subscribed.plan_info.title}
                                                    </p>
                                                </div>
                                            </div>
                                            :
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <p>
                                                        Current Plan: Basic
                                                    </p>
                                                </div>
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="account-data">
                                <h2>Account Information</h2>
                                <div className="row">
                                    {
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Date of Birth</label>
                                                <div className="account-data-value">
                                                    {
                                                        userDetails
                                                            && userDetails.visible_option && userDetails.visible_option.length &&
                                                            !getBooleanStatus(getValueFromArrayOfObject(userDetails.visible_option, "dob_visible")) ?
                                                            userDetails && userDetails.date_of_birth : '--'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Gender</label>
                                                <div className="account-data-value">
                                                    {
                                                        userDetails
                                                            && userDetails.visible_option && userDetails.visible_option.length &&
                                                            !getBooleanStatus(getValueFromArrayOfObject(userDetails.visible_option, "gender_visible")) ?
                                                            userDetails && userDetails.gender_name && userDetails.gender_name.title ? userDetails.gender_name.title : '--' : '--'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Country</label>
                                                <div className="account-data-value">
                                                    {
                                                        userDetails
                                                            && userDetails.visible_option && userDetails.visible_option.length &&
                                                            !getBooleanStatus(getValueFromArrayOfObject(userDetails.visible_option, "country_visible")) ?
                                                            userDetails && userDetails.country_name && userDetails.country_name.country_name ? userDetails.country_name.country_name : '--' : '--'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>State</label>
                                                <div className="account-data-value">
                                                    {
                                                        userDetails
                                                            && userDetails.visible_option && userDetails.visible_option.length &&
                                                            !getBooleanStatus(getValueFromArrayOfObject(userDetails.visible_option, "state_visible")) ?
                                                            userDetails && userDetails.state : '--'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Email</label>
                                                <div className="account-data-value">
                                                    {
                                                        userDetails
                                                            && userDetails.visible_option && userDetails.visible_option.length &&
                                                            !getBooleanStatus(getValueFromArrayOfObject(userDetails.visible_option, "email_visible")) ?
                                                            userDetails && userDetails.email : '--'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>

                                {
                                    userDetails && userDetails.gallery && userDetails.gallery.length ?
                                        <>
                                            <h2>Gallery</h2>
                                            <div className="profile-gallery">
                                                <Slider {...settings}>
                                                    {
                                                        renderSlides()
                                                    }
                                                </Slider>
                                            </div>
                                        </> : null
                                }
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment >
    )
}
