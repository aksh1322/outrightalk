import React, { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// import Skeleton from 'react-loading-skeleton';
import ImageUploadInput from 'src/_common/components/form-elements/imageUploadInput/imageUploadInput'
import { useCommonApi } from 'src/_common/hooks/actions/commonApiCall/appCommonApiCallHook'
import BannerShow from 'src/components/common/banner';
import EditUserProfileModal from './editUserProfileModal';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import { useAppUserAction } from 'src/_common/hooks/actions/user/appUserActionHook';
import GalleryModal from '../userPreferences/modal/galleryModal';
import { getSubscriptionColor, getSubscriptionType } from 'src/_config';

interface UserDetailsFormValues {
    avatarId: number;
}

const userDetailsSchema = yup.object().shape({

})
interface ProfileFormProps {
    hideImageLabel?: boolean;
}

function MyProfilePage({ hideImageLabel }: ProfileFormProps) {

    const [showEditUserProfileModal, setEditUserProfileModal] = useState<boolean>(false)
    const [countryList, setCountryList] = useState<any[]>([]);
    const [genderList, setGenderList] = useState<any[]>([]);
    const [questionList, setQuestionList] = useState<any[]>([]);
    const [country, setCountry] = useState<any>();
    const [gender, setGender] = useState<any>();
    const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
    const commonApi = useCommonApi()
    const userSelector = useAppUserDetailsSelector()
    const userAction = useAppUserAction()


    const getCountryList = () => {
        commonApi.callGetCountryList((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setCountryList(resp.list)
            }
        }, (message: string) => {
        })
    }

    const getGenderList = () => {
        commonApi.callGetGenderList((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setGenderList(resp.list)
            }
        }, (message: string) => {
        })
    }

    const getQuestionList = () => {
        commonApi.callGetSecretQuestion((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setQuestionList(resp.list)
            }
        }, (message: string) => {
        })
    }

    const changePasswordModalOpen = (e: React.MouseEvent) => {
        e.preventDefault();
        userAction.showChangePasswordModal(true)
    }

    const editUserProfileModalOpen = (e: any) => {
        e.preventDefault();
        setEditUserProfileModal(true)
    }

    const editUserProfileCloseModal = () => {
        if (showEditUserProfileModal) setEditUserProfileModal(false)
    }

    const galleryModalOpen = (e: any) => {
        e.preventDefault();
        setShowGalleryModal(true)
    }

    const galleryCloseModal = () => {
        if (showGalleryModal) setShowGalleryModal(false)
    }

    const { control, errors } = useForm<UserDetailsFormValues>({
        resolver: yupResolver(userDetailsSchema),
        defaultValues: {
            avatarId: undefined
        },
    })

    useEffect(() => {
        getCountryList()
        getGenderList()
        getQuestionList()
    }, [userSelector])

    useEffect(() => {

        var foundCountry = countryList && countryList.length ? countryList.filter((x: any) => x.id == userSelector?.country) : null;

        var foundGender = genderList && genderList.length ? genderList.filter((x: any) => x.id == userSelector?.gender) : null;

        if (foundGender && foundGender.length) {
            setGender(foundGender[0].title)
        }

        if (foundCountry && foundCountry.length) {
            setCountry(foundCountry[0].country_name)
        }

    }, [userSelector, countryList, genderList])

    console.log('userSelector --------------->', userSelector?.badge_data);

    return (
        <React.Fragment>
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-sm-12">
                        <div className="page-heading-panel d-flex justify-content-between">
                            <h1>My Profile</h1>
                            <div className="d-flex">
                                <a href="#" onClick={editUserProfileModalOpen} className="mail-action-btn waves-effect edit-btn">
                                    <i className="bx bx-edit-alt" /> Edit Profile
                                </a>
                                <a href="#"
                                    onClick={galleryModalOpen}
                                    className="mail-action-btn waves-effect edit-btn">
                                    Gallery
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center create-manager-panel">
                    <div className="col-lg-12">
                        <div className="dark-box-inner">
                            <div className="row">
                                <div className="col-sm-12">
                                    <div className="profile-wrap">
                                        <Controller
                                            control={control}
                                            name="avatarId"
                                            render={({ onChange, onBlur, value, name, ref }) => (
                                                <ImageUploadInput
                                                    name={name}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    value={value}
                                                    inputRef={ref}
                                                    error={errors.avatarId}
                                                    text={hideImageLabel ? '' : ''}
                                                />
                                            )}
                                        />
                                        <div className="about-profile">
                                            <h2 style={{
                                                color: getSubscriptionColor(userSelector)
                                            }}>
                                                {userSelector && userSelector.username ? userSelector.username : '--'}
                                                {
                                                    (
                                                        userSelector && userSelector.badge_data &&
                                                        userSelector.badge_data.current_badge &&
                                                        (new Date(userSelector.badge_data.expiry_date.replaceAll("-", "/")).getTime() > new Date().getTime())
                                                    )
                                                        ?
                                                        <img src={userSelector?.badge_data?.current_badge?.icon?.original} height={25} width={25} className="m-2" alt="" />
                                                        :
                                                        ''
                                                }
                                            </h2>
                                            {/* <h3>Orchid</h3> */}
                                            <p>
                                                {userSelector && userSelector.about ? userSelector.about : ''}
                                            </p>
                                            {
                                                userSelector?.is_subscribed ?
                                                    <div className="row">
                                                        <div className="col-sm-12">
                                                            <p>
                                                                Current Plan: {
                                                                    userSelector?.is_subscribed && userSelector?.is_subscribed.plan_info ? userSelector?.is_subscribed.plan_info.title + ` ( ${userSelector?.is_subscribed && userSelector?.is_subscribed.price_info ? getSubscriptionType(userSelector?.is_subscribed.price_info.type) : ''} )` : '--'
                                                                }
                                                                &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                                                                {
                                                                    userSelector?.is_subscribed && userSelector.is_subscribed.renew_date ?
                                                                        `${userSelector?.is_subscribed?.is_closed ? "Valid upto" : "Renew at"} :
                                                        ${userSelector?.is_subscribed?.renew_date} `
                                                                        : null
                                                                }
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
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Date of Birth</label>
                                                    <div className="account-data-value">{userSelector && userSelector.date_of_birth ? userSelector.date_of_birth : ''}</div>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Gender</label>
                                                    <div className="account-data-value">
                                                        {gender}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Country</label>
                                                    <div className="account-data-value">
                                                        {country}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>State</label>
                                                    <div className="account-data-value">{userSelector && userSelector.state ? userSelector.state : ''}</div>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <div className="account-data-value">{userSelector && userSelector.email ? userSelector.email : ''}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <h2>Login Information</h2>
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Nickname</label>
                                                    <div className="account-data-value">{userSelector && userSelector.username ? userSelector.username : ''}</div>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Password</label>
                                                    <div className="account-data-value">******</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <a href="#" onClick={changePasswordModalOpen} className="btn btn-primary btn-lg mr-2">Change Password</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {
                showEditUserProfileModal ?
                    <EditUserProfileModal
                        onClose={editUserProfileCloseModal}
                        shouldShow={showEditUserProfileModal}
                        fetchCountryList={countryList}
                        fetchGenderList={genderList}
                        fetchQuestionList={questionList}
                    /> : null
            }

            {
                showGalleryModal ?
                    <GalleryModal
                        onClose={galleryCloseModal}
                        shouldShow={showGalleryModal}
                        passwordVerified={true}
                    /> : null
            }
        </React.Fragment>
    )
}

export default MyProfilePage