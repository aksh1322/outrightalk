import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { URLS } from '../../_config'
import RegistrationForm from '../../components/registration/registrationform'
import RegistrationFormStepTwo from '../../components/registration/registrationFormStepTwo';
import { useAppRegistrationStepSelector } from '../../_common/hooks/selectors/registrationSelector'

export default function RegistrationContainer() {

  const registrationStepSelector = useAppRegistrationStepSelector()

  return (
    <div className="account-pages my-5 pt-sm-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-9 col-xl-9">
            <div className="card overflow-hidden">
              <div className="bg-soft-primary">
                <div className="row">
                  <div className="col-12">
                    <div className="text-primary p-4 text-center">
                      <img src="img/logo.png" alt="logo" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body pt-0 login register">
                <div className="p-2 pl-5 pr-5 pt-4 pb-3">
                  {registrationStepSelector && registrationStepSelector === 1 ?
                    <RegistrationForm /> : null}
                  {registrationStepSelector && registrationStepSelector === 2 ?
                    <RegistrationFormStepTwo /> : null}

                </div>
              </div>
              <div className="text-center login-foot">
                <div>
                  <p>{'Back to  '}
                    {/* <a href="auth-register.html" className="font-weight-medium"> Login</a> */}
                    <Link className="font-weight-medium" to={URLS.LOGIN}>Login</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
