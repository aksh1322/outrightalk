import React from 'react';


export function BuyCreditFailureComponent() {
    return (
        <React.Fragment>
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
                                <form className="form-horizontal">
                                    <div className="thankyou-icon">
                                        <img src="/img/cross_error.png" alt="failed" />
                                    </div>
                                    <div className="thankyou-text">
                                        <h1>Failed</h1>
                                        <h2>Payment Failed</h2>
                                    </div>
                                    {/* <div className="thankyou-text-bottom">
                                        <p>We have sent you a verification email with a link</p>
                                    </div> */}
                                </form>
                            </div>
                        </div>
                        <div className="text-center login-foot">
                            <div>
                                <p>
                                    <a href="#"
                                        onClick={(e) => { e.preventDefault(); window.close() }}
                                    >Close</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}