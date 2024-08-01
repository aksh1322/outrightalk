import React from 'react'
import { Link } from 'react-router-dom'
import { URLS } from '../../_config'

export default function Page404() {
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
                      <img src="/img/logo.png" alt="logo" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body pt-0 login thankyou">
                <div className="p-2 pl-3 pr-3 pt-4 pb-3">
                  <form className="form-horizontal" action="index.html">
                    {/* <div className="thankyou-icon">
                      <img src="images/login/thankyou-icon.png" />
                    </div> */}
                    <div className="thankyou-text">
                      <h1>404</h1>
                      <h2>Not Found</h2>
                    </div>                    
                  </form>
                </div>
              </div>
              <div className="text-center login-foot">
                <div>
                  <p>Back to  <Link className="font-weight-medium" to={URLS.LOGIN}>Login</Link> </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
