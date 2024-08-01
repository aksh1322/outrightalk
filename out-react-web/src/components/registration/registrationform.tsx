import React, { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import moment from 'moment';
import FormTextInput from '../../_common/components/form-elements/textinput/formTextInput';
import FormTextAreaInput from '../../_common/components/form-elements/textarea/textareaInput';
import SelectInput from '../../_common/components/form-elements/selectinput/selectInput';
import DateInput from '../../_common/components/form-elements/datepicker/dateInput';
import { useAppGlobalAction } from '../../_common/hooks/actions/common/appGlobalActionHook';
import { GENDER_RADIO, DATE_FORMAT, URLS } from '../../_config';
import { useUserApi } from '../../_common/hooks/actions/user/appUserApiHook';
import { useToaster } from '../../_common/hooks/actions/common/appToasterHook';
import { OptionValue } from '../../_common/interfaces/common';
import { useAppRegistrationAction } from '../../_common/hooks/actions/registration/appRegistrationActionHook';
import { useAppRegistrationDataSelector } from '../../_common/hooks/selectors/registrationSelector';
import { useCommonApi } from '../../_common/hooks/actions/commonApiCall/appCommonApiCallHook'

interface registrationFormValues {
  nickname: string;
  dateOfBirth: string;
  gender: OptionValue | undefined | any;
  country: OptionValue | undefined | any;
  state: string;
  email: string;
  confirmEmail: string;
  password: string;
  repassword: string;
  aboutYourself: string;
}



const registrationSchema = yup.object().shape({
  nickname: yup.string()
    .required('Nickname is required'),
  // .matches(/^[^s]+(s+[^s]+)*$/, 'space not allowed'),
  email: yup
    .string()
    // .email('Please provide valid email')
    .required('Email is required'),
  confirmEmail: yup.string()
    // .oneOf([yup.ref('email'), ''], 'Email must match')
    .required('Confirm email is Required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password should have minimum 8 characters')
    .max(20, 'Max 20 characters are allowed'),
  repassword: yup.string()
    .oneOf([yup.ref('password'), ''], 'Passwords must match')
    .required('Confirm Password is Required'),
  dateOfBirth: yup.string()
    .required('Date of birth is required'),
  country: yup
    .object()
    .shape({
      value: yup.string().required('Country is required'),
    }).nullable()
    .required('Country is required'),
  gender: yup
    .object()
    .shape({
      value: yup.string().required('Gender is required'),
    }).nullable()
    .required('Gender is required'),
  state: yup.string()
    .required('State is required'),
  aboutYourself: yup.string()
    .required('About yourself is required'),
})

function RegistrationForm() {
  /**
   * const
   */
  const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<registrationFormValues>({
    // mode: 'onBlur',
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      nickname: '',
      email: '',
      confirmEmail: '',
      dateOfBirth: '',
      gender: '',
      state: '',
      country: '',
      aboutYourself: '',
      password: '',
      repassword: ''
    },
  })
  const [toggleActive, setToggleActive] = useState(true)
  const globalActions = useAppGlobalAction()
  const history = useHistory()
  const userApi = useUserApi()
  const commonApi = useCommonApi()
  const toast = useToaster()
  const registrationAction = useAppRegistrationAction()
  const registrationDataSelector = useAppRegistrationDataSelector()
  const [globeLock, setGlobeLock] = useState<any>({ dobIsLock: 0, genderIsLock: 0, countryIsLock: 0, stateIsLock: 0, emailIsLock: 0, aboutIsLock: 0 })
  const [countryList, setCountryList] = useState<any>();
  const [genderList, setGenderList] = useState<any>();
  const [toggleVisible, setToggleVisible] = useState(true)
  const [passwordTextToggle, setPasswordTextToggle] = useState('password')
  const [passwordConfirmTextToggle, setPasswordConfirmTextToggle] = useState('password')

  /**
   * effects
   */
  /**
   * functions
   */

  //Load Gender List Load Country List

  useEffect(() => {
    getCountryList();
    getGenderList();
  }, [])

  const getCountryList = () => {
    commonApi.callGetCountryList((message: string, resp: any) => {
      if (resp && resp.list && resp.list.length) {
        setCountryList(resp.list)
      }
    }, (message: string) => {
      // toast.error(message)
    })
  }
  const getGenderList = () => {
    commonApi.callGetGenderList((message: string, resp: any) => {
      if (resp && resp.list && resp.list.length) {
        setGenderList(resp.list)
      }
    }, (message: string) => {
      // toast.error(message)
    })
  }

  const onSubmit = (values: registrationFormValues) => {
    // var regStepOneValue = { ...values, ...globeLock }
    // console.log('regStepOneValue', regStepOneValue)
    // registrationAction.registrationStepDataContainer(regStepOneValue)
    // registrationAction.registrationStepChange(2)
    var parms = {
      extra: {
        step: 1
      },
      apiParms: {
        nickname: values.nickname,
        password: values.password,
        confirm_password: values.repassword,
        dob: moment(values.dateOfBirth).format('MM/DD/YYYY'),//06/10/2000
        dob_visible: globeLock.dobIsLock,
        gender: values.gender && values.gender.value ? parseInt(values.gender.value) : 0,
        gender_visible: globeLock.genderIsLock,
        country: values.country && values.country.value ? parseInt(values.country.value) : 0,
        country_visible: globeLock.countryIsLock,
        state: values.state,
        state_visible: globeLock.stateIsLock,
        email: values.email,
        email_visible: globeLock.emailIsLock,
        confirm_email: values.confirmEmail,
        about: values.aboutYourself,
        about_visible: globeLock.aboutIsLock
      }
    }
    userApi.callRegistation(parms, (message: string, resp: any) => {
      toast.success(message)
      registrationAction.registrationStepChange(2)
    }, (message: string) => {
      toast.error(message)
    })

  }

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

  const resetRegistration = () => {
    reset({
      nickname: '',
      email: '',
      confirmEmail: '',
      dateOfBirth: '',
      gender: '',
      state: '',
      country: '',
      aboutYourself: '',
      password: '',
      repassword: ''
    })
  }

  // setValue when first step fillup and previous called
  // value get form redux store

  useEffect(() => {
    if (registrationDataSelector && registrationDataSelector.data && countryList && countryList.length && genderList && genderList.length) {

      var foundCountry = countryList && countryList.length ? countryList.filter((x: any) => x.id == registrationDataSelector.data.country) : null;
      var foundGender = genderList && genderList.length ? genderList.filter((x: any) => x.id == registrationDataSelector.data.gender) : null;
      setValue('nickname', registrationDataSelector.data.nickname ? registrationDataSelector.data.nickname : '');
      setValue('password', registrationDataSelector.data.password ? registrationDataSelector.data.password : '')
      setValue('repassword', registrationDataSelector.data.password ? registrationDataSelector.data.password : '')
      setValue('dateOfBirth', registrationDataSelector.data.dob ? new Date(registrationDataSelector.data.dob) : '')
      setValue('gender', registrationDataSelector.data.gender && foundGender && foundGender.length ? { label: foundGender[0].title, value: foundGender[0].id } : '')
      setValue('country', registrationDataSelector.data.country && foundCountry && foundCountry.length ? { label: foundCountry[0].country_name, value: foundCountry[0].id } : '')
      setValue('state', registrationDataSelector.data.state ? registrationDataSelector.data.state : '')
      setValue('email', registrationDataSelector.data.email ? registrationDataSelector.data.email : '')
      setValue('confirmEmail', registrationDataSelector.data.email ? registrationDataSelector.data.email : '')
      setValue('aboutYourself', registrationDataSelector.data.about ? registrationDataSelector.data.about : '')
      setGlobeLock({
        dobIsLock: registrationDataSelector.data.dob_visible ? 1 : 0,
        genderIsLock: registrationDataSelector.data.gender_visible ? 1 : 0,
        countryIsLock: registrationDataSelector.data.country_visible ? 1 : 0,
        stateIsLock: registrationDataSelector.data.state_visible ? 1 : 0,
        emailIsLock: registrationDataSelector.data.email_visible ? 1 : 0,
        aboutIsLock: registrationDataSelector.data.about_visible ? 1 : 0
      })
      //clickable next button
      setToggleVisible(false)
    }
    else {

    }

  }, [registrationDataSelector, countryList, genderList])

  // const nextStepRegistration=()=>{
  //   registrationAction.registrationStepChange(2)
  // }
  const gotoLogin = () => {
    history.push(URLS.LOGIN)
  }
  const onBlurNickNameCheck = () => {
    const nickNameValue = getValues("nickname");
    setValue('nickname', nickNameValue.trim())
    if (nickNameValue && nickNameValue.trim() != '') {
      const params = {
        nickname: nickNameValue.trim()
      }
      userApi.callCheckNickName(params, (message: string, resp: any) => {
        setToggleVisible(false)
        toast.success(message)
      }, (message: any, resp: any) => {
        setToggleVisible(true)
        toast.error(message)
      })
    }
    else {
      setToggleVisible(true)
    }
  }

  const handlePasswordTextToggle = () => {
    if (passwordTextToggle == 'password') {
      setPasswordTextToggle('text')
    }
    else {
      setPasswordTextToggle('password')
    }
  }

  const handleConfirmPasswordTextToggle = () => {
    if (passwordConfirmTextToggle == 'password') {
      setPasswordConfirmTextToggle('text')
    }
    else {
      setPasswordConfirmTextToggle('password')
    }
  }

  return (
    <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="pb-3">
        <div className="d-flex justify-content-between register-heading">
          <h2 className="white-text">Register</h2>
          <p className="mb-0">1 of 2</p>
        </div>
        <h3 className="white-text">Login Information</h3>
      </div>
      <div className="d-flex justify-content-between reg-fld-row reg-fld-col-2">
        <div className="reg-fld">
          <div className="form-group">
            <Controller
              control={control}
              name="nickname"
              render={({ onChange, onBlur, value, name, ref }) => (
                <FormTextInput
                  // name={name}
                  onChange={onChange}
                  onBlur={() => {
                    onBlur()
                    onBlurNickNameCheck()
                  }
                  }
                  value={value.trimLeft()}
                  inputRef={ref}
                  type="text"
                  error={errors.nickname}
                  placeholder="Nickname"
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between reg-fld-row reg-fld-col-2">
        <div className="reg-fld">
          <div className="form-group">
            <Controller
              control={control}
              name="password"
              render={({ onChange, onBlur, value, name, ref }) => (
                <FormTextInput
                  // name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  type={passwordTextToggle}
                  error={errors.password}
                  placeholder="Password"
                />
              )}
            />
            <span className="eye-password-text" onClick={handlePasswordTextToggle}>
              {passwordTextToggle == 'password' ?
                <i className="fa fa-eye" aria-hidden="true"></i> :
                <i className="fa fa-eye-slash" aria-hidden="true"></i>}
            </span>
          </div>
        </div>

        <div className="reg-fld">
          <div className="form-group">
            <Controller
              control={control}
              name="repassword"
              render={({ onChange, onBlur, value, name, ref }) => (
                <FormTextInput
                  // name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  type={passwordConfirmTextToggle}
                  error={errors.repassword}
                  placeholder="Confirm Password"
                />
              )}
            />
            <span className="eye-password-text" onClick={handleConfirmPasswordTextToggle}>
              {passwordConfirmTextToggle == 'password' ?
                <i className="fa fa-eye" aria-hidden="true"></i> :
                <i className="fa fa-eye-slash" aria-hidden="true"></i>}
            </span>
          </div>
        </div>


      </div>
      <div className="divider-line" />
      <div className="account-info-panel">
        <h3 className="white-text">Account Information</h3>
        <div className="d-flex justify-content-between reg-fld-row reg-fld-col-2">
          <div className="reg-fld d-flex">
            <div className="form-group">
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <DateInput
                    // name={name}
                    onChange={(e) => {
                      onChange(e)
                    }}
                    onBlur={onBlur}
                    value={value}
                    maxDate={new Date()}
                    dateFormat={DATE_FORMAT}
                    inputRef={ref}
                    error={errors.dateOfBirth}
                    placeholder="Date of Birth"
                  />
                )}
              />
            </div>
            {/* <button type="button" className="lock-btn" /> */}
            <button type="button" onClick={() => globeLockToggle('dob')} className={globeLock.dobIsLock ? 'lock-btn' : 'globe-btn'} />
          </div>
          <div className="reg-fld d-flex">
            <div className="form-group">
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
                    options={genderList ? genderList.map((c: any) => ({
                      value: String(c.id),
                      label: c.title,
                    })) : []}
                    error={errors.gender}
                    placeholder="Gender"
                  />
                )}
              />
            </div>
            <button type="button" onClick={() => globeLockToggle('gender')} className={globeLock.genderIsLock ? 'lock-btn' : 'globe-btn'} />
          </div>
        </div>
        <div className="d-flex justify-content-between reg-fld-row reg-fld-col-2">
          <div className="reg-fld d-flex">
            <div className="form-group">
              <Controller
                control={control}
                name="country"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <SelectInput
                    // name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    dark={true}
                    options={countryList ? countryList.map((c: any) => ({
                      value: String(c.id),
                      label: c.country_name,
                    })) : []}
                    error={errors.country}
                    placeholder="Choose Country"
                  />
                )}
              />
            </div>
            <button type="button" onClick={() => globeLockToggle('country')} className={globeLock.countryIsLock ? 'lock-btn' : 'globe-btn'} />
          </div>
          <div className="reg-fld d-flex">
            <div className="form-group">
              <Controller
                control={control}
                name="state"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <FormTextInput
                    // name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    type="text"
                    error={errors.state}
                    placeholder="State"
                  />
                )}
              />
            </div>
            <button type="button" onClick={() => globeLockToggle('state')} className={globeLock.stateIsLock ? 'lock-btn' : 'globe-btn'} />
          </div>
        </div>
        <div className="d-flex justify-content-between reg-fld-row reg-fld-col-2">
          <div className="reg-fld d-flex">
            <div className="form-group">
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
                    error={errors.email}
                    placeholder="Email"
                  />
                )}
              />
            </div>
            <button type="button" onClick={() => globeLockToggle('email')} className={globeLock.emailIsLock ? 'lock-btn' : 'globe-btn'} />
          </div>
          <div className="reg-fld d-flex">
            <div className="form-group">
              <Controller
                control={control}
                name="confirmEmail"
                render={({ onChange, onBlur, value, name, ref }) => (
                  <FormTextInput
                    // name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    type="text"
                    error={errors.confirmEmail}
                    placeholder="Confirm Email"
                  />
                )}
              />
            </div>
            <span className="btn-blank-space" />
          </div>
        </div>
        <div className="d-flex reg-fld-row reg-fld-col-1">
          <div className="reg-fld d-flex">
            <div className="form-group">
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
                    inputRef={ref}
                    type="textarea"
                    error={errors.aboutYourself}
                    placeholder="About Yourself"
                  />
                )}
              />
            </div>
            <button type="button" onClick={() => globeLockToggle('about')} className={globeLock.aboutIsLock ? 'lock-btn' : 'globe-btn'} />
          </div>
        </div>
        <div className="reg-btn-panel d-flex justify-content-between">
          <button type="button" onClick={resetRegistration} className="btn btn-danger">Reset</button>
          <div className="d-flex">
            <button type="button" className="btn btn-default mr-2" onClick={gotoLogin}>Cancel</button>
            <button type="submit" disabled={toggleVisible} className="btn btn-primary">Next</button>
          </div>
        </div>
      </div>
    </form>
  )
}
export default RegistrationForm
