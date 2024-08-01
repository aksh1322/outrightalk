import React from 'react'
import { Link } from 'react-router-dom'
import { URLS } from '../../../_config'
import ForgotPasswordForm from '../../../components/passwordReset/forgotPassword/forgotPassword';
import NickNameForm from '../../../components/passwordReset/forgotPassword/enterNickNameForm';
import { useAppForgotPasswordSelector } from '../../../_common/hooks/selectors/registrationSelector';

export default function ForgotPassword() {

  const forgotPasswordStepSelector = useAppForgotPasswordSelector()

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
                  {/* <form className="form-horizontal" action="index.html">
                <div className="pb-3">
                  <h2 className="white-text">Answer</h2>
                  <h3 className="white-text">Your Secret Question</h3>
                </div>
                <div className="form-group">
                  <select className="form-control">
                    <option>Choose Secret Question</option>
                  </select>
                </div>
                <div className="form-group">
                  <input type="text" className="form-control" id="answer" placeholder="Enter Your Answer" />
                </div>
                <div className="mt-3 d-flex align-items-center login-btn">
                  <button className="btn btn-primary btn-block waves-effect waves-light w-auto mr-2" type="submit">Send</button>
                </div>
              </form> */}
                  {forgotPasswordStepSelector && forgotPasswordStepSelector === 1 ?
                    <NickNameForm /> : null}
                  {forgotPasswordStepSelector && forgotPasswordStepSelector === 2 ?
                    <ForgotPasswordForm /> : null}
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
