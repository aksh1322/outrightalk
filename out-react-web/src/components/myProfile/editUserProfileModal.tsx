import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
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

interface editUserProfileModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    fetchCountryList: any[];
    fetchGenderList: any[];
    fetchQuestionList: any[];
}

interface EditUserProfileFormValues {
    // name: string;
    dateOfBirth: string;
    gender: OptionValue | undefined | any;
    country: OptionValue | undefined | any;
    state: string;
    email: string;
    // confirmEmail: string;
    aboutYourself: string;
    // secretQuestion: OptionValue | undefined;
    // secretAnswer: string;
}

const editUserProfileSchema = yup.object().shape({
    // name: yup
    //     .string()
    //     .required('Name is required'),
    email: yup
        .string()
        .required('Email is required'),
    // confirmEmail: yup.string()
    //     // .oneOf([yup.ref('email'), ''], 'Email must match')
    //     .required('Confirm email is Required'),
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
    // secretQuestion: yup
    //     .object()
    //     .shape({
    //         value: yup.string().required('secret question is required'),
    //     }).nullable()
    //     .required('secret question is required'),
    // secretAnswer: yup.string().required('Secret answer is required'),
})

export default function EditUserProfileModal({ onClose, shouldShow, fetchGenderList, fetchCountryList, fetchQuestionList }: editUserProfileModalProps) {
    const { register, control, setValue, handleSubmit, errors } = useForm<EditUserProfileFormValues>({
        resolver: yupResolver(editUserProfileSchema),
        defaultValues: {
            // name: '',
            email: '',
            // confirmEmail: '',
            dateOfBirth: '',
            gender: '',
            state: '',
            country: '',
            aboutYourself: '',
            // secretQuestion: undefined,
            // secretAnswer: '',
        },
    })

    console.log(fetchQuestionList)


    const userApi = useUserApi()
    const toast = useToaster()
    const userSelector = useAppUserDetailsSelector()
    const [passwordTextToggle, setPasswordTextToggle] = useState('password')
    const [verifyPassword, setVerifyPassword] = useState('');
    const [passwordVerified, setPasswordVerified] = useState<boolean>(false)

    const [globeLock, setGlobeLock] = useState<any>({ dobIsLock: 0, genderIsLock: 0, countryIsLock: 0, stateIsLock: 0, emailIsLock: 0, aboutIsLock: 0 })

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
            // question: values.secretQuestion && values.secretQuestion.value ? parseInt(values.secretQuestion.value) : 0,
            // answer: "values.secretAnswer"
        }
        userApi.callUpdateUserProfile(parms, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                userMeCall()
                onClose(false);
            } else {
                toast.error(message)
            }
        }, (message: string, resp: any) => {
            toast.error(message)
        })
    }


    useEffect(() => {

        if (userSelector && fetchCountryList && fetchCountryList.length && fetchQuestionList && fetchQuestionList.length) {

            var foundCountry = fetchCountryList && fetchCountryList.length ? fetchCountryList.filter((x: any) => x.id == userSelector.country) : null;

            var foundGender = fetchGenderList && fetchGenderList.length ? fetchGenderList.filter((x: any) => x.id == userSelector.gender) : null;

            // var foundQuestion = fetchQuestionList && fetchQuestionList.length ? fetchQuestionList.filter((x: any) => x.id == userSelector.question) : null;

            // setValue('name', userSelector.full_name && userSelector.full_name.trim() != "" ? userSelector.full_name : '');

            setValue('email', userSelector.email ? userSelector.email : '');
            // setValue('confirmEmail', userSelector.email ? userSelector.email : '');
            setValue('dateOfBirth', userSelector.dob ? new Date(userSelector.dob) : '');
            setValue('gender', userSelector.gender && foundGender && foundGender.length ? { label: foundGender[0].title, value: foundGender[0].id } : '');
            setValue('country', userSelector.country && foundCountry && foundCountry.length ? { label: foundCountry[0].country_name, value: foundCountry[0].id } : '');
            setValue('state', userSelector.state ? userSelector.state : '');
            setValue('aboutYourself', userSelector.about ? userSelector.about : '');
            // setValue('secretQuestion', userSelector.question && foundQuestion && foundQuestion.length ? { label: foundQuestion[0].question, value: foundQuestion[0].id } : '');
            // setValue('secretAnswer', userSelector.answer ? userSelector.answer : '');

            setGlobeLock({
                dobIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'dob_visible') : 0,
                genderIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'gender_visible') : 0,
                countryIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'country_visible') : 0,
                stateIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'state_visible') : 0,
                emailIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'email_visible') : 0,
                aboutIsLock: userSelector && userSelector.visible_option && userSelector.visible_option.length ? getVisibleData(userSelector.visible_option, 'about_visible') : 0
            })
        }
    }, [userSelector])


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
    }

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                size='lg'
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <img src="img/logo.png" />
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'update-profile'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">
                            <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
                                <div className="pb-3">
                                    <div className="d-flex justify-content-between register-heading">
                                        <h2>Update <strong>Profile</strong></h2>
                                    </div>
                                </div>
                                {/* <div className="d-flex justify-content-between reg-fld-row reg-fld-col-2">
                                    <div className="reg-fld">
                                        <div className="form-group">
                                            <Controller
                                                control={control}
                                                name="name"
                                                render={({ onChange, onBlur, value, name, ref }) => (
                                                    <FormTextInput
                                                        name={name}
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        value={value}
                                                        inputRef={ref}
                                                        type="text"
                                                        error={errors.name}
                                                        placeholder="Name"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div> */}
                                <div className="d-flex justify-content-between reg-fld-row reg-fld-col-1">
                                    <div className="reg-fld">

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
                                    <div className="col-sm-2">
                                        <div className="form-group">
                                            <button type="button"
                                                className="btn theme-btn btn-primary mr-2 waves-effect"
                                                disabled={passwordVerified ? true : false}
                                                onClick={() => checkPassword()}>
                                                Verify
                                            </button>
                                        </div>
                                    </div>



                                    {/* <div className="reg-fld">
                                        <div className="form-group">
                                            <Controller
                                                control={control}
                                                name="secretQuestion"
                                                render={({ onChange, onBlur, value, name, ref }) => (
                                                    <SelectInput
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        value={value}
                                                        isDisabled={passwordVerified ? false : true}
                                                        inputRef={ref}
                                                        dark={true}
                                                        options={fetchQuestionList ? fetchQuestionList.map((c: any) => ({
                                                            value: String(c.id),
                                                            label: c.question,
                                                        })) : []}
                                                        error={errors.secretQuestion}
                                                        placeholder="Choose Secret Question"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div> 
                                    <div className="col-sm-2">
                                        <div className="form-group">
                                            <Controller
                                                control={control}
                                                name="secretAnswer"
                                                render={({ onChange, onBlur, value, name, ref }) => (
                                                    <FormTextInput
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        value={value}
                                                        disabled={passwordVerified ? false : true}
                                                        inputRef={ref}
                                                        type="text"
                                                        error={errors.secretAnswer}
                                                        placeholder="Secret Answer"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div> */}
                                </div>
                                <div className="divider-line" />
                                <div className="account-info-panel">
                                    <div className="d-flex justify-content-between reg-fld-row reg-fld-col-2">
                                        <div className="reg-fld d-flex">
                                            <div className="form-group">
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
                                            </div>
                                            {/* <button type="button" className="lock-btn" /> */}
                                            <button type="button"
                                                disabled={passwordVerified ? false : true}
                                                onClick={() => globeLockToggle('dob')} className={globeLock.dobIsLock ? 'lock-btn' : 'globe-btn'} />
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
                                                            isDisabled={true}
                                                            options={fetchGenderList ? fetchGenderList.map((c: any) => ({
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
                                    <div className="d-flex justify-content-between reg-fld-row reg-fld-col-2">
                                        <div className="reg-fld d-flex">
                                            <div className="form-group">
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
                                                            options={fetchCountryList ? fetchCountryList.map((c: any) => ({
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
                                        <div className="reg-fld d-flex">
                                            <div className="form-group">
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
                                            </div>
                                            <button type="button"
                                                disabled={passwordVerified ? false : true}
                                                onClick={() => globeLockToggle('state')} className={globeLock.stateIsLock ? 'lock-btn' : 'globe-btn'} />
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
                                                            disabled={true}
                                                            error={errors.email}
                                                            placeholder="Email"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <button type="button"
                                                disabled={passwordVerified ? false : true}
                                                onClick={() => globeLockToggle('email')} className={globeLock.emailIsLock ? 'lock-btn' : 'globe-btn'} />
                                        </div>
                                        {/* <div className="reg-fld d-flex">
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
                                        </div> */}
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
                                                            isDisabled={passwordVerified ? false : true}
                                                            inputRef={ref}
                                                            type="textarea"
                                                            error={errors.aboutYourself}
                                                            placeholder="About Yourself"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <button type="button"
                                                disabled={passwordVerified ? false : true}

                                                onClick={() => globeLockToggle('about')} className={globeLock.aboutIsLock ? 'lock-btn' : 'globe-btn'} />
                                        </div>
                                    </div>
                                    <div className="reg-btn-panel d-flex justify-content-between mt-5">
                                        <button type="button" className="btn theme-btn btn-danger waves-effect" onClick={() => onClose(false)}>Cancel</button>
                                        <button
                                            type='submit'
                                            disabled={passwordVerified ? false : true}
                                            className="btn theme-btn btn-primary mr-2 waves-effect">Update Profile</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment >
    )
}
