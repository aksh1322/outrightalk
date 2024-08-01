import React from 'react'
import { Link } from 'react-router-dom'
import { URLS } from '../../../_config'
import ForgotPasswordOtpForm from '../../../components/passwordReset/forgotPasswordOtp/forgotPasswordOtpForm'
export default function ForgotPasswordOtpContainer() {
  return (
    <div className="account-pages my-5 pt-sm-5">
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-8 col-xl-5">
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
          <div className="card-body pt-0 login">
            <div className="p-2 pl-5 pr-5 pt-4 pb-3">
             <ForgotPasswordOtpForm/>
            </div>
          </div>
          <div className="text-center login-foot">
            <div>
              <p>{'Back to '} 
                {/* <a href="auth-login.html" className="font-weight-medium"> Login </a>  */}
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
