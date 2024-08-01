import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
import ImageUploadInput from 'src/_common/components/form-elements/imageUploadInput/imageUploadInput'
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import FormTextAreaInput from 'src/_common/components/form-elements/textarea/textareaInput';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import DateInput from 'src/_common/components/form-elements/datepicker/dateInput';
import { DATE_FORMAT } from 'src/_config';
import { getVisibleData } from 'src/_config/functions';
import { useUserApi } from 'src/_common/hooks/actions/user/appUserApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { OptionValue } from 'src/_common/interfaces/common';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import { useCommonApi } from 'src/_common/hooks/actions/commonApiCall/appCommonApiCallHook';
import { useAppUserAction } from 'src/_common/hooks/actions/user/appUserActionHook';
import GalleryModal from './modal/galleryModal';

interface EditUserProfileFormValues {
  dateOfBirth: string;
  gender: OptionValue | undefined | any;
  country: OptionValue | undefined | any;
  state: string;
  email: string;
  aboutYourself: string;
  // secretQuestion: OptionValue | undefined;
  // secretAnswer: string;
  nickname: string;
  flag: OptionValue | undefined | any;
}

const editUserProfileSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required'),
  gender: yup
    .object()
    .shape({
      value: yup.string().required('Gender is required'),
    }).nullable()
    .required('Gender is required'),
  dateOfBirth: yup.string()
    .required('Date of birth is required'),
  country: yup
    .object()
    .shape({
      value: yup.string().required('Country is required'),
    }).nullable()
    .required('Country is required'),
  state: yup.string()
    .required('State is required'),
  aboutYourself: yup.string()
    .required('About yourself is required'),
  // secretQuestion: yup
  //   .object()
  //   .shape({
  //     value: yup.string().required('secret question is required'),
  //   }).nullable()
  //   .required('secret question is required'),
  // secretAnswer: yup.string().required('Secret answer is required'),
})
function ProfileSetting() {

  const { register, control, setValue, handleSubmit, errors } = useForm<EditUserProfileFormValues>({
    resolver: yupResolver(editUserProfileSchema),
    defaultValues: {
      nickname: '',
      email: '',
      // confirmEmail: '',
      dateOfBirth: '',
      gender: '',
      state: '',
      country: '',
      aboutYourself: '',
      flag: ''
      // secretQuestion: undefined,
      // secretAnswer: '',

    },
  })

  const [countryList, setCountryList] = useState<any[]>([]);
  const [genderList, setGenderList] = useState<any[]>([]);
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);

  const [passwordTextToggle, setPasswordTextToggle] = useState('password')
  const [verifyPassword, setVerifyPassword] = useState('');
  const [passwordVerified, setPasswordVerified] = useState<boolean>(false)

  const userApi = useUserApi()
  const userAction = useAppUserAction()
  const commonApi = useCommonApi()
  const toast = useToaster()
  const userSelector = useAppUserDetailsSelector()
  const [globeLock, setGlobeLock] = useState<any>({ dobIsLock: 0, genderIsLock: 0, countryIsLock: 0, stateIsLock: 0, emailIsLock: 0, aboutIsLock: 0 })

  const galleryModalOpen = (e: any) => {
    e.preventDefault();
    setShowGalleryModal(true)
  }

  const galleryCloseModal = () => {
    if (showGalleryModal) setShowGalleryModal(false)
  }

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


  useEffect(() => {
    getCountryList();
    getGenderList();
    getQuestionList();
  }, [])

  const userMeCall = () => {
    userApi.callGetMe((message: string, resp: any) => {

    }, (message: string, resp: any) => {
      toast.error(message)
    })
  }

  const onSubmit = (values: EditUserProfileFormValues) => {
    var parms = {
      // first_name: values.name,
      dob: moment(values.dateOfBirth).format('YYYY/MM/DD'),//06/10/2000
      dob_visible: globeLock.dobIsLock,
      // gender: values.gender && values.gender.value ? parseInt(values.gender.value) : 0,
      gender_visible: globeLock.genderIsLock,
      country: values.country && values.country.value ? parseInt(values.country.value) : 0,
      country_visible: globeLock.countryIsLock,
      state: values.state,
      state_visible: globeLock.stateIsLock,
      // email: values.email,
      email_visible: globeLock.emailIsLock,
      about: values.aboutYourself,
      about_visible: globeLock.aboutIsLock,
      question: userSelector && userSelector.question ? userSelector.question : 0,
      answer: userSelector && userSelector.answer ? userSelector.answer : ''
    }
    userApi.callUpdateUserProfile(parms, (message: string, resp: any) => {
      if (resp) {
        toast.success(message)
        userMeCall()
      } else {
        toast.error(message)
      }
    }, (message: string, resp: any) => {
      toast.error(message)
    })
  }





  useEffect(() => {

    if (userSelector && countryList && countryList.length && questionList && questionList.length && genderList && genderList.length) {

      var foundCountry = countryList && countryList.length ? countryList.filter((x: any) => x.id == userSelector.country) : null;

      var foundGender = genderList && genderList.length ? genderList.filter((x: any) => x.id == userSelector.gender) : null;

      var foundQuestion = questionList && questionList.length ? questionList.filter((x: any) => x.id == userSelector.question) : null;

      setValue('nickname', userSelector.username ? userSelector.username : '');
      setValue('email', userSelector.email ? userSelector.email : '');
      // setValue('confirmEmail', userSelector.email ? userSelector.email : '');
      setValue('dateOfBirth', userSelector.dob ? new Date(userSelector.dob) : '');
      setValue('gender', userSelector.gender && foundGender && foundGender.length ? { label: foundGender[0].title, value: foundGender[0].id } : '');
      setValue('country', userSelector.country && foundCountry && foundCountry.length ? { label: foundCountry[0].country_name, value: foundCountry[0].id } : '');
      setValue('state', userSelector.state ? userSelector.state : '');
      setValue('aboutYourself', userSelector.about ? userSelector.about : '');
      setValue('secretQuestion', userSelector.question && foundQuestion && foundQuestion.length ? { label: foundQuestion[0].question, value: foundQuestion[0].id } : '');
      setValue('secretAnswer', userSelector.answer ? userSelector.answer : '');

      setGlobeLock({
        dobIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'dob_visible') : 0,
        genderIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'gender_visible') : 0,
        countryIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'country_visible') : 0,
        stateIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'state_visible') : 0,
        emailIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'email_visible') : 0,
        aboutIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'about_visible') : 0
      })
    }
  }, [userSelector, countryList, genderList, questionList])


  const globeLockToggle = (parms: string) => {

    switch (parms) {
      case 'dob':
        setGlobeLock({ ...globeLock, dobIsLock: globeLock.dobIsLock ? 0 : 1 })
        break;
      case 'gender':
        setGlobeLock({ ...globeLock, genderIsLock: globeLock.genderIsLock ? 0 : 1 })
        break;
      case 'country':
        setGlobeLock({ ...globeLock, countryIsLock: globeLock.countryIsLock ? 0 : 1 })
        break;
      case 'state':
        setGlobeLock({ ...globeLock, stateIsLock: globeLock.stateIsLock ? 0 : 1 })
        break;
      case 'email':
        setGlobeLock({ ...globeLock, emailIsLock: globeLock.emailIsLock ? 0 : 1 })
        break;
      case 'about':
        setGlobeLock({ ...globeLock, aboutIsLock: globeLock.aboutIsLock ? 0 : 1 })
        break;
    }

  }




  const changePasswordModalOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    userAction.showChangePasswordModal(true)
  }

  const handlePasswordTextToggle = () => {
    if (passwordTextToggle == 'password') {
      setPasswordTextToggle('text')
    }
    else {
      setPasswordTextToggle('password')
    }
  }

  const handlePasswordOnchange = (val: any) => {
    setVerifyPassword(val)
  }

  const checkPassword = () => {
    if (verifyPassword != '') {
      let params = {
        password: verifyPassword
      }
      userApi.callLoginCheckPassword(params, (message: string, resp: any) => {
        if (resp) {
          setPasswordVerified(true)
        }
      }, (message: string, resp: any) => {
        toast.error(message)
      })
    } else {
      toast.error('please fill password field')
    }
  }

  return (
    <React.Fragment>
      <div className="right-menu-details dark-box-inner all_inner_profile">
        <h3>My Profile Preference</h3>
        <div className="row">
          <div className="col-sm-4">
            <div className="pro-img-wrap">
              {/* <div className="pro-img">
                <img src="assets/img/pro-large.jpg" />
              </div>
              <button className="btn-upload">Update Photo</button> */}
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
                    disabled={!passwordVerified}
                  // error={errors.avatarId}
                  // text={hideImageLabel ? '' : ''}
                  />
                )}
              />
            </div>
          </div>
          <div className="col-sm-8">
            <div className="form-group">
              <label>Nickname</label>
              <Controller
                control={control}
                name="nickname"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <FormTextInput
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    disabled={true}
                    inputRef={ref}
                    type="text"
                    error={errors.nickname}
                    placeholder="Nickname"
                  />
                )}
              />
            </div>
            <div className="form-group two-bts-right">
              <a href="#" onClick={changePasswordModalOpen} className={passwordVerified ? "btn theme-btn btn-primary mr-2 waves-effect" : "btn theme-btn btn-primary mr-2 waves-effect disabled-link" } >Change Password</a>
              <a href="#" onClick={galleryModalOpen} className="btn theme-btn btn-primary waves-effect">Gallery</a>
            </div>
          </div>
        </div>
        <hr className="light-hr" />
        <div className="row">
          <div className="col-sm-6">
            <div className="form-group">
              <input type={passwordTextToggle}
                className="form-control"
                value={verifyPassword}
                disabled={passwordVerified ? true : false}
                onChange={(e) => handlePasswordOnchange(e.target.value)}
                placeholder="Password" />
              <span className="eye-password-text" onClick={handlePasswordTextToggle}>
                {passwordTextToggle == 'password' ?
                  <i className="fa fa-eye" aria-hidden="true"></i> :
                  <i className="fa fa-eye-slash" aria-hidden="true"></i>}
              </span>

            </div>
          </div>

          <div className="col-sm-6">
            <div className="form-group">
              <button type="button"
                className="btn theme-btn btn-primary mr-2 waves-effect"
                disabled={passwordVerified ? true : false}
                onClick={() => checkPassword()}>
                Verify
              </button>
            </div>
          </div>
        </div>

        <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>Date of Birth</label>
                <div className="input-public-private">
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <DateInput
                        onChange={(e) => {
                          onChange(e)
                        }}
                        onBlur={onBlur}
                        value={value}
                        // disabled={passwordVerified ? false : true}
                        disabled={true}
                        maxDate={new Date()}
                        dateFormat={DATE_FORMAT}
                        inputRef={ref}
                        error={errors.dateOfBirth}
                        placeholder="Date of Birth"
                      />
                    )}
                  />
                  <button type="button"
                    disabled={passwordVerified ? false : true}
                    onClick={() => globeLockToggle('dob')} className={globeLock.dobIsLock ? 'lock-btn' : 'globe-btn'} />
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Gender</label>
                <div className="input-public-private">
                  <div className="w-100">
                    <Controller
                      control={control}
                      name="gender"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          // name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          dark={true}
                          isDisabled={true}
                          options={genderList && genderList.length ? genderList.map((c: any) => ({
                            value: String(c.id),
                            label: c.title,
                          })) : []}
                          error={errors.gender}
                          placeholder="Gender"
                        />
                      )}
                    />
                  </div>
                  <button type="button"
                    disabled={passwordVerified ? false : true}
                    onClick={() => globeLockToggle('gender')} className={globeLock.genderIsLock ? 'lock-btn' : 'globe-btn'} />
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Country</label>
                <div className="input-public-private">
                  <div className="w-100">
                    <Controller
                      control={control}
                      name="country"
                      render={({ onChange, onBlur, value, name, ref }) => (
                        <SelectInput
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          inputRef={ref}
                          isDisabled={passwordVerified ? false : true}
                          dark={true}
                          options={countryList && countryList.length ? countryList.map((c: any) => ({
                            value: String(c.id),
                            label: c.country_name,
                          })) : []}
                          error={errors.country}
                          placeholder="Choose Country"
                        />
                      )}
                    />
                  </div>
                  <button type="button"
                    disabled={passwordVerified ? false : true}
                    onClick={() => globeLockToggle('country')} className={globeLock.countryIsLock ? 'lock-btn' : 'globe-btn'} />
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>State</label>
                <div className="input-public-private">
                  <Controller
                    control={control}
                    name="state"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <FormTextInput
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        disabled={passwordVerified ? false : true}
                        inputRef={ref}
                        type="text"
                        error={errors.state}
                        placeholder="State"
                      />
                    )}
                  />
                  <button type="button"
                    disabled={passwordVerified ? false : true}
                    onClick={() => globeLockToggle('state')} className={globeLock.stateIsLock ? 'lock-btn' : 'globe-btn'} />
                </div>
              </div>
            </div>
            {/* <div className="col-sm-6">
              <div className="form-group">
                <label>Secret Question</label>
                <Controller
                  control={control}
                  name="secretQuestion"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <SelectInput
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      inputRef={ref}
                      dark={true}
                      options={questionList && questionList.length ? questionList.map((c: any) => ({
                        value: String(c.id),
                        label: c.question,
                      })) : []}
                      error={errors.secretQuestion}
                      placeholder="Choose Secret Question"
                    />
                  )}
                />
              </div>
            </div> */}
            <div className="col-sm-6">
              <div className="form-group">
                <label>Flag</label>
                <Controller
                  control={control}
                  name="flag"
                  render={({ onChange, onBlur, value, name, ref }) => (
                    <SelectInput
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      isDisabled={passwordVerified ? false : true}
                      inputRef={ref}
                      dark={true}
                      options={[]}
                      error={errors.flag}
                      placeholder="Choose Flag"
                    />
                  )}
                />
              </div>
            </div>

            {/* <div className="col-sm-3">
              <div className="form-group">
                <label >Secret Answer</label>
                <div className="input-public-private">
                  <Controller
                    control={control}
                    name="secretAnswer"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <FormTextInput
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        inputRef={ref}
                        type="text"
                        error={errors.secretAnswer}
                        placeholder="Secret Answer"
                      />
                    )}
                  />
                </div>
              </div>
            </div> */}

            <div className="col-sm-6">
              <div className="form-group">
                <label >Email</label>
                <div className="input-public-private">
                  <Controller
                    control={control}
                    name="email"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <FormTextInput
                        // name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        inputRef={ref}
                        type="text"
                        disabled={true}
                        error={errors.email}
                        placeholder="Email"
                      />
                    )}
                  />
                  <button type="button"
                    disabled={passwordVerified ? false : true}
                    onClick={() => globeLockToggle('email')} className={globeLock.emailIsLock ? 'lock-btn' : 'globe-btn'} />
                </div>
              </div>
            </div>
            <div className="col-sm-12">
              <div className="form-group">
                <label >About</label>
                <div className="input-public-private">
                  <Controller
                    control={control}
                    name="aboutYourself"
                    render={({ onChange, onBlur, value, name, ref }) => (
                      <FormTextAreaInput
                        name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        rows={4}
                        isDisabled={passwordVerified ? false : true}
                        inputRef={ref}
                        type="textarea"
                        error={errors.aboutYourself}
                        placeholder="About Yourself"
                      />
                    )}
                  />
                  <button type="button"
                    disabled={passwordVerified ? false : true}
                    onClick={() => globeLockToggle('about')} className={globeLock.aboutIsLock ? 'lock-btn' : 'globe-btn'} />
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex mt-3">
            <button
              disabled={passwordVerified ? false : true}
              className="btn theme-btn btn-primary mr-2 waves-effect">Apply</button>
            {/* <button className="btn theme-btn btn-default waves-effect">Cancel</button> */}
          </div>
        </form>
      </div>

      {showGalleryModal ?
        <GalleryModal
          passwordVerified={passwordVerified}
          onClose={galleryCloseModal}
          shouldShow={showGalleryModal}
        /> : null
      }

    </React.Fragment>
  )
}

export default ProfileSetting
