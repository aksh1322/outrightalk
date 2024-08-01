import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useUserApi } from 'src/_common/hooks/actions/user/appUserApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { useAppUserAction } from 'src/_common/hooks/actions/user/appUserActionHook';
import { useCommonApi } from 'src/_common/hooks/actions/commonApiCall/appCommonApiCallHook'
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';

interface ChangePasswordModalProps {
    shouldShow: boolean;
}

interface ChangePasswordFormValues {
    oldPassword: string;
    password: string;
    confirmpassword: string;
    nickname:string;
    securityQuestion:string;
    securityAnswer:string;
}

const changePasswordSchema = yup.object().shape({
    oldPassword: yup
        .string()
        .required('Old password is required')
        .min(8, 'Old password should have minimum 8 characters')
        .max(20, 'Max 20 characters are allowed'),
    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password should have minimum 8 characters')
        .max(20, 'Max 20 characters are allowed'),
    confirmpassword: yup
        .string()
        .required('Confirm password is required')
        .min(8, 'Confirm password should have minimum 8 characters')
        .max(20, 'Max 20 characters are allowed'),
    nickname: yup.string()
        .required('Nickname is required'),
    securityAnswer: yup.string()
        .required('Security Answer is required'),
    securityQuestion: yup.object().required('Security question is required')
})


export default function ChangePasswordModal({ shouldShow }: ChangePasswordModalProps) {

    const { control, handleSubmit, setValue, errors } = useForm<ChangePasswordFormValues>({
        resolver: yupResolver(changePasswordSchema),
        defaultValues: {
            nickname:'',
            oldPassword: '',
            password: '',
            confirmpassword: '',
            securityQuestion:undefined,
            securityAnswer:''
        },
    })

    const [oldPasswordTextToggle, setOldPasswordTextToggle] = useState('password')
    const [passwordTextToggle, setPasswordTextToggle] = useState('password')
    const [passwordConfirmTextToggle, setPasswordConfirmTextToggle] = useState('password')

    const [questionList, setQuestionList] = useState<any[]>([]);
    const commonApi = useCommonApi()
    const userSelector = useAppUserDetailsSelector()

    const userAction = useAppUserAction()
    const userApi = useUserApi()
    const toast = useToaster()

    useEffect(()=>{
        getQuestionList()
    },[])
    useEffect(() => {
        if (userSelector && questionList && questionList.length ) {
            var foundQuestion = questionList && questionList.length ? questionList.filter((x: any) => x.id == userSelector.question) : null;
            // setValue('securityQuestion', userSelector.question && foundQuestion && foundQuestion.length ? { label: foundQuestion[0].question, value: foundQuestion[0].id } : '');        
        }
    }, [userSelector,questionList])


    const getQuestionList = () => {
        commonApi.callGetSecretQuestion((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setQuestionList(resp.list)
            }
        }, (message: string) => {
        })
    }

    const handleClose = (e: any) => {
        e.preventDefault()
        userAction.showChangePasswordModal(false)
    }

    const onSubmit = (values: ChangePasswordFormValues) => {

        var parms = {
            nickname: values.nickname,
            current_password: values.oldPassword,
            password: values.password,
            confirm_password: values.confirmpassword,
            security_answer: values.securityAnswer,
            security_question: values.securityQuestion
        }
        userApi.callUpdatePassword(parms, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                userAction.showChangePasswordModal(false)
            } else {
                toast.error(message)
            }
        }, (message: string, resp: any) => {
            toast.error(message)
        })
    }

    const handleOldPasswordTextToggle = () => {
        if (oldPasswordTextToggle == 'password') {
            setOldPasswordTextToggle('text')
        }
        else {
            setOldPasswordTextToggle('password')
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
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                // size='lg'
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <img src="/img/logo.png" />
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'change-password'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">
                            <h2>Change <strong>Password</strong></h2>
                            <form className="reset-password"  onSubmit={handleSubmit(onSubmit)} noValidate>
                                
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
                                                type='text'
                                                error={errors.nickname}
                                                placeholder="Nickname"
                                            />
                                        )}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="securityQuestion"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <SelectInput
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                name={name}
                                                // isDisabled={true}
                                                error={errors.securityQuestion}
                                                inputRef={ref}
                                                dark={true}
                                                options={questionList ? questionList.map((c: any) => ({
                                                    value: String(c.id),
                                                    label: c.question,
                                                })) : []}
                                                placeholder="Choose Secret Question"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        autoComplete="off"
                                        name="securityAnswer"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type="text"
                                                error={errors.securityAnswer}
                                                placeholder="Security Answer"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="form-group">
                                    <Controller
                                        autoComplete="off"
                                        control={control}
                                        name="oldPassword"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type={oldPasswordTextToggle}
                                                error={errors.oldPassword}
                                                placeholder="Old Password"
                                            />
                                        )}
                                    />
                                    <span className="eye-password-text" onClick={handleOldPasswordTextToggle}>
                                    {oldPasswordTextToggle == 'password' ?
                                                <i className="fa fa-eye" aria-hidden="true"></i> :
                                                <i className="fa fa-eye-slash" aria-hidden="true"></i>}
                                    </span>
                                </div>


                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="password"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type={passwordTextToggle}
                                                error={errors.password}
                                                placeholder="New Password"
                                            />
                                        )}
                                    />
                                    <span className="eye-password-text" onClick={handlePasswordTextToggle}>
                                    {passwordTextToggle == 'password' ?
                                                <i className="fa fa-eye" aria-hidden="true"></i> :
                                                <i className="fa fa-eye-slash" aria-hidden="true"></i>}
                                    </span>
                                </div>

                                <div className="form-group">
                                    <Controller
                                        control={control}
                                        name="confirmpassword"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                name={name}
                                                onChange={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type={passwordConfirmTextToggle}
                                                error={errors.confirmpassword}
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

                                <div className="reg-btn-panel d-flex justify-content-between mt-5">
                                    <button type="button" className="btn theme-btn btn-danger waves-effect" onClick={(e) => handleClose(e)}>Cancel</button>
                                    <button type="submit" className="btn theme-btn btn-primary mr-2 waves-effect">Update Password</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment >
    )
}