import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import LoginForm from "../../components/login/loginform";
import { URLS } from "../../_config";

export default function Login() {
  const domains = ["https://outrightalk.com"];

  // window.onload = (event: any) => {
  // console.log("event--", event)

  // window.addEventListener("message", messageHandler, false);
  // function messageHandler(event: any) {
  //   // if (!domains.includes(event.origin)) {
  //   //   return;
  //   // }
  //   if (!event.origin.includes("https://outrightalk.com")) {
  //     return
  //   }
  //   // const { action, key, value } = event.data
  //   const data = JSON.parse(event.data)
  //   if (typeof data.outright_ui !== 'undefined') {
  //     localStorage.setItem('outright_ui', data.outright_ui)
  //     // console.log("Token is set: ", data.outright_ui)
  //   }

  //   if (typeof data.open_user_subscription_modal !== 'undefined') {
  //     // {
  //     //   "plan_id": 4,
  //     //     "duration_id": 5
  //     // }
  //     localStorage.setItem('open_user_subscription_modal', data.open_user_subscription_modal)
  //   }

  //   if (typeof data.open_room_subscription_modal !== 'undefined') {
  //     // {
  //     //   "plan_id": 4,
  //     //     "duration_id": 5
  //     // }
  //     localStorage.setItem('open_room_subscription_modal', data.open_room_subscription_modal)
  //   }

  //   // if (action == 'save') {
  //   //   localStorage.setItem(key, value)
  //   // } else if (action == 'get') {
  //   //   event.source.postMessage({
  //   //     action: 'returnData',
  //   //     key,
  //   //     // JSON.parse(window.localStorage.getItem(key))
  //   //   }, '*')
  //   // }
  // }
  // };

  //Set Login Page Title
  useEffect(() => {
    //localStorage.clear()
    const prevTitle = document.title;
    document.title = "Login";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-8 col-xl-5">
              <div className="card overflow-hidden">
                <div className="bg-soft-primary">
                  <div className="row">
                    <div className="col-12">
                      <div className="text-primary p-3 text-center">
                        <img src="img/logo-login.png" alt="logo" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body py-0 login">
                  <div className="p-2 pl-5 pr-5 pt-4 pb-3">
                    {/* <form className="form-horizontal" action="index.html">
                    <div className="pb-3">
                      <h2 className="white-text">Welcome back !</h2>
                      <h3 className="white-text">Login</h3>
                    </div>                   
                      <div className="form-group">
                        <select className="form-control">
                          <option>Enter or select a Nickname</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <input type="password" className="form-control" id="userpassword" placeholder="Password" />
                      </div>
                      <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="customControlInline" />
                        <label className="custom-control-label" htmlFor="customControlInline">Remember Nickname</label>
                      </div>
                      <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="customControlInline1" />
                        <label className="custom-control-label" htmlFor="customControlInline1">Login Invisible</label>
                      </div>
                      <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="customControlInline2" />
                        <label className="custom-control-label" htmlFor="customControlInline2">Login Automatically</label>
                      </div>
                      <div className="mt-3 d-flex align-items-center login-btn">
                        <button className="btn btn-primary btn-block waves-effect waves-light w-auto mr-2" type="submit">Log In</button>
                        <p className="mb-0">Forgot Password?                      
                          <Link className="font-weight-medium" to={URLS.FORGOT_PASSWORD}>Reset</Link>
                        </p>
                      </div>
                    </form> */}
                    <LoginForm />

                    <div className="or-divider">
                      <span>Or</span>
                    </div>
                    <div className="facebook-btn">
                      <a href="#">
                        <i className="fb-icon" /> Login with Facebook
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-center login-foot">
                  <div>
                    <p>
                      New User?
                      {/* <a
                        href="auth-register.html"
                        className="font-weight-medium"
                      >
                        {" "}
                        Register{" "}
                      </a> */}
                      <Link
                        className="font-weight-medium"
                        to={URLS.REGISTRATION}
                      >
                        {" "}
                        Register{" "}
                      </Link>
                      {/* Register */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
