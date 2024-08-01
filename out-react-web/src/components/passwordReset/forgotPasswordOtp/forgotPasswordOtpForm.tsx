import React, { useEffect, useState } from 'react'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';

import FormTextInput from '../../../_common/components/form-elements/textinput/formTextInput';
import { useAppGlobalAction } from '../../../_common/hooks/actions/common/appGlobalActionHook';
import { useUserApi } from '../../../_common/hooks/actions/user/appUserApiHook';
import { useToaster } from '../../../_common/hooks/actions/common/appToasterHook';
import { useAppForgotPasswordDataSelector } from '../../../_common/hooks/selectors/registrationSelector';
import { URLS } from '../../../_config'

interface otpFormValues {
    otp: string;
}

const otpSchema = yup.object().shape({
    otp: yup.string().required('OTP is required'),
})

function ForgotPasswordOtpForm() {
    const { watch, register, control, setValue, getValues, reset, handleSubmit, errors } = useForm<otpFormValues>({
        // mode: 'onBlur',
        resolver: yupResolver(otpSchema),
        defaultValues: {
            otp: ''
        },
    })

    const [toggleActive, setToggleActive] = useState(true)
    const globalActions = useAppGlobalAction()
    const history = useHistory()
    const userApi = useUserApi()
    const toast = useToaster()
    const forgotPasswordDataSelector = useAppForgotPasswordDataSelector()
    const onSubmit = (values: otpFormValues) => {

        var parms = {
            token: forgotPasswordDataSelector && forgotPasswordDataSelector.data && forgotPasswordDataSelector.data.token ? forgotPasswordDataSelector.data.token : '',
            otp: values.otp
        }

        userApi.callForgotPasswordOtp(parms, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                history.push(URLS.RESET_PASSWORD)
            } else {
                toast.error(message)
            }
        }, (message: string, resp: any) => {
            toast.error(message)
        })
    }

    return (
        <form className="reset-password" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="pb-3">
                <h2 className="white-text">OTP</h2>
                <h3 className="white-text">Your OTP</h3>
            </div>

            <div className="form-group">
                <Controller
                    control={control}
                    name="otp"
                    render={({ onChange, onBlur, value, name, ref }) => (
                        <FormTextInput
                            name={name}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            inputRef={ref}
                            type="text"
                            error={errors.otp}
                            placeholder="Enter OTP"
                        />
                    )}
                />
            </div>
            <div className="mt-3 d-flex align-items-center login-btn">
                <button className="btn btn-primary btn-block waves-effect waves-light w-auto mr-2" type="submit">Next</button>
            </div>
        </form>

    )
}

export default ForgotPasswordOtpForm