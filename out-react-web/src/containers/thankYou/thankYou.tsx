import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { URLS } from 'src/_config'
import { useHistory } from 'react-router-dom';

export default function ThankYou() {

  const history = useHistory()
  const [isRedirectUrl, setIsRedirectUrl] = useState<boolean>(false)

  useEffect(() => {
    if (history && history.location && history.location.state) {
      setIsRedirectUrl(true)
    } else {
      setIsRedirectUrl(false)
      history.push(URLS.LOGIN)
    }
  }, [])



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
              <div className="card-body pt-0 login thankyou">
                <div className="p-2 pl-3 pr-3 pt-4 pb-3">
                  <form className="form-horizontal" action="index.html">
                    <div className="thankyou-icon">
                      <img src="images/login/thankyou-icon-green.png" />
                    </div>
                    <div className="thankyou-text">
                      <h1>Thank You</h1>
                      <h2>for registering with OutrighTalk</h2>
                    </div>
                    <div className="thankyou-text-bottom">
                      <p>We have sent you a verification email with a link</p>
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
