import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import queryString from 'query-string';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';


export function BuyCreditSuccessComponent() {

    const location = useLocation()
    const groupCategoryApi = useGroupCategoryApi()

    const handleSuccess = () => {
        if (location && location.search) {
            const parsed = queryString.parse(location.search);
            if (parsed && parsed.session_id) {
                const params = {
                    session_id: parsed.session_id
                }
                groupCategoryApi.callBuyVirtualGiftCreditSuccess(params, (message: string, resp: any) => {
                    if (resp) {
                    }
                }, (message: string) => {
                    console.error("Error at buy credit success call");
                })
            }
        }
    }

    useEffect(() => {
        handleSuccess()
    }, [])

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
                                        <img src="/images/login/thankyou-icon-green.png" alt="success" />
                                    </div>
                                    <div className="thankyou-text">
                                        <h1>Success</h1>
                                        <h2>Payment Successfully</h2>
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