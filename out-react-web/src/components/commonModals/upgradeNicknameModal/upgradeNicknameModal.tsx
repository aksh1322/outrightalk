import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SweetAlert from 'react-bootstrap-sweetalert';
import moment from 'moment';
import { useUserApi } from 'src/_common/hooks/actions/user/appUserApiHook';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { CHAT_DATE_TIME_FORMAT, getNewSubscriptionPlanName, getSubscriptionNewEndDate, getSubscriptionType } from 'src/_config';
interface UpgradeNicknameSubscriptionModalProps {
    onClose: (success: any) => void;
    onCancel: (success: any) => void;
    shouldShow: boolean;
    openUserSubscriptionModal: any
}

export default function UpgradeNicknameSubscriptionModal({ onClose, onCancel, shouldShow, openUserSubscriptionModal }: UpgradeNicknameSubscriptionModalProps) {
    const userApi = useUserApi()
    const [nicknameSubscriptionList, setNicknameSubscriptionList] = useState<any[]>([])
    const [selectedPlanId, setSelectedPlanId] = useState<any>(null)
    const [planList, setPlanList] = useState<any[]>([])
    const [isPlanSelected, setIsPlanSelected] = useState<boolean>(true)
    const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>()
    const [currentPlan, setCurrentPlan] = useState<any>()
    const [currentPlanDetails, setCurrentPlanDetails] = useState<any[]>([])
    const [planModifyStatus, setPlanModifyStatus] = useState<any>('')
    const [alert, setAlert] = useState<any>(null);

    const SUBSCRIPTION_PLAN_UPGRADATION = {
        UPGRADE: 'upgrade',
        DOWNGRADE: 'downgrade',
        SAME: 'same'
    }

    const { register, control, setValue, reset, handleSubmit, errors } = useForm<any>({
        defaultValues: {
            planchoose: "",
            plandetailschoose: ""
        }
    })

    const getNicknameSubscriptionList = () => {
        const params = {}
        userApi.callGetNicknameSubscriptionPlan(params, (message: string, resp: any) => {
            if (resp && resp.plans.length) {
                setNicknameSubscriptionList(resp.plans)
                setCurrentPlan(resp.subscriptionInfo)
            } else {
                setNicknameSubscriptionList([])
                setCurrentPlan(null)
            }
        }, (message: string) => {
            console.error("Error at nickname subscription fetch");
        })
    }
    useEffect(() => {
        getNicknameSubscriptionList()
    }, [])

    const handlePlanChanged = (id: number, plan: any) => {
        if (!isPlanSelected) setIsPlanSelected(true)
        setPlanList(plan)
        setSelectedPlanId(id)
        setSelectedPlanDetails(null)
    }

    console.log("cureentplanupgradename>>>>>>>>>>>>>>>>", currentPlan);
    

    const handlePlanDetailsChanged = (x: any) => {
        if (isPlanSelected) setIsPlanSelected(false)
        setSelectedPlanDetails(x)
        if (currentPlan && currentPlan.price_info && currentPlan.price_info.sort_order) {
            if (currentPlan.price_info.is_gift != 1 &&
                currentPlan.price_info.sort_order > x.sort_order) {
                setPlanModifyStatus(SUBSCRIPTION_PLAN_UPGRADATION.DOWNGRADE)
            } else if (currentPlan.price_info.is_gift != 1 &&
                currentPlan.price_info.sort_order == x.sort_order && currentPlan.price_info.sort_order < x.sort_order) {
                setPlanModifyStatus(SUBSCRIPTION_PLAN_UPGRADATION.SAME)
            } else {
                setPlanModifyStatus(SUBSCRIPTION_PLAN_UPGRADATION.UPGRADE)
            }
        }
    }


    useEffect(() => {
        if (openUserSubscriptionModal) {
            if (nicknameSubscriptionList.length > 0) {
                let findPlan = nicknameSubscriptionList.find((ele: any) => ele.id == openUserSubscriptionModal.plan_id)
                if (findPlan) {
                    setValue("planchoose", findPlan.id.toString())

                    handlePlanChanged(findPlan.id, findPlan.plans)
                    let findDurationPlan = findPlan.plans.find((ele: any) => ele.id == openUserSubscriptionModal.duration_id)
                    if (findDurationPlan) {
                        setTimeout(() => {
                            setValue("plandetailschoose", findDurationPlan.id.toString())
                        }, 400)

                        handlePlanDetailsChanged(findDurationPlan)

                    }
                }
            }
        }
    }, [openUserSubscriptionModal, nicknameSubscriptionList])

    const handleNextOnBuyPlan = () => {
        const params = {
            plan_id: selectedPlanDetails.subscription_id,
            time_period_id: selectedPlanDetails.id,
        }
        userApi.callProcessNicknameSubscription(params, (message: string, resp: any) => {
            if (resp && resp.url) {
                onClose(true)
                window.open(resp.url, '_blank', "status=1,toolbar=0")
            } else {
                toast.error(message)
            }
        }, (message: string) => {
            console.error("Error at nickname subscription purchase");
        })
    }

    const getCurrenPlanDetails = () => {
        if (currentPlan && currentPlan.plan_info) {
            const found = nicknameSubscriptionList.filter((x: any) => x.id == currentPlan.plan_info.id)
            if (found && found.length) {
                setCurrentPlanDetails(found[0].plans)
            } else {
                setCurrentPlanDetails([])
            }
        }
    }

    useEffect(() => {
        getCurrenPlanDetails()
    }, [currentPlan, nicknameSubscriptionList])

    useEffect(() => {
        if (!openUserSubscriptionModal) {

            if (currentPlanDetails && currentPlanDetails.length && currentPlan && currentPlan.plan_info) {
                if (nicknameSubscriptionList && nicknameSubscriptionList.length) {
                    setValue("planchoose", currentPlan.subscription_plan_id.toString())
                    setSelectedPlanId(currentPlan.subscription_plan_id)
                    setPlanList(currentPlanDetails)
                    setTimeout(() => {
                        setValue("plandetailschoose", currentPlan.subscription_price_id.toString())
                    }, 400)
                    setIsPlanSelected(false)
                    setPlanModifyStatus(SUBSCRIPTION_PLAN_UPGRADATION.SAME)
                }
            }
        }
    }, [currentPlan, nicknameSubscriptionList, currentPlanDetails, openUserSubscriptionModal])

    const hideAlert = () => {
        setAlert(null);
    }

    const removeNicknameSubscription = () => {
        userApi.callRemoveNicknameSubscription((message: string, resp: any) => {
            if (resp) {
                hideAlert()
                onClose(true)
                onCancel(true)
            }
        }, (message: string) => {
            toast.error(message)
            console.error("Error at nickname subscription remove");
        })
    }

    const handleRemoveRoomSubscription = () => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes"
                cancelBtnText="No"
                cancelBtnBsStyle="danger"
                confirmBtnBsStyle="success"
                allowEscape={false}
                closeOnClickOutside={false}
                title={`Cancel Nickname Subscription`}
                onConfirm={() => removeNicknameSubscription()}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {`Are you sure you want to cancel nickname subscription?`}
            </SweetAlert>
        );
    }
    return (
        <React.Fragment>
            {alert}
            <Modal
                show={shouldShow}
                backdrop="static"
                onHide={() => onClose(false)}
                keyboard={false}
                className="theme-custom-modal"
                dialogClassName="modal-dialog-scrollable"
                size={'lg'}
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h2>Select Subscription plan</h2>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'upgrade-nickname-subscription'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel">
                        {
                            currentPlan ?
                                <div className="row">
                                    <div className="col-sm-12">
                                        <p>
                                            Current Plan: {
                                                currentPlan && currentPlan.plan_info ? currentPlan.plan_info.title + ` ( ${currentPlan && currentPlan.price_info ? getSubscriptionType(currentPlan.price_info.type) : ''} )` : '--'
                                            }
                                            &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                                            {
                                                currentPlan && currentPlan.renew_date ?
                                                    `${currentPlan.is_closed ? "Valid upto" : "Renew at"} :
                                        ${currentPlan.renew_date} ` : null
                                            }
                                        </p>
                                    </div>
                                </div>
                                : null
                        }
                        <div className="row">
                            {
                                nicknameSubscriptionList && nicknameSubscriptionList.length ? nicknameSubscriptionList.map((x: any) =>
                                    <div className="col-sm-4" key={x.id}>
                                        <div className="planname">
                                            <div className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block ml-0 pl-0">
                                                <input type="radio" className="custom-control-input" onChange={() => handlePlanChanged(x.id, x.plans)} id={"radioplanname" + x.id} value={x.id} name="planchoose" ref={register} />
                                                <label style={{ color: x.color_code }} className="custom-control-label" htmlFor={"radioplanname" + x.id}>
                                                    {x.title}
                                                </label>
                                            </div>
                                        </div>
                                        {
                                            x.id == selectedPlanId ?
                                                <div className="plandetails">
                                                    {
                                                        planList && planList.length ? planList
                                                        .filter((z: any) => z.type != "weekly" && z.is_gift == 0)
                                                        .map((z: any) =>
                                                            <div className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block ml-0 pl-0" key={z.id}>

                                                                <input type="radio" className="custom-control-input" onChange={() => handlePlanDetailsChanged(z)} id={"radioplandetails-" + z.id}
                                                                    ref={register} value={z.id} name="plandetailschoose" />
                                                                <label className="custom-control-label" htmlFor={"radioplandetails-" + z.id}>
                                                                    {z.show_price} ({getSubscriptionType(z.type)})
                                                                </label>
                                                            </div>
                                                        ) : null
                                                    }

                                                </div> : null
                                        }
                                    </div>

                                ) : null
                            }
                            {/* </div> */}
                        </div>
                        <p className="plan-selection-message">
                            {
                                currentPlan ?
                                    planModifyStatus === SUBSCRIPTION_PLAN_UPGRADATION.DOWNGRADE ?
                                        currentPlan.is_closed ?
                                            <div>
                                                <p>Warning!</p>
                                                <p>You're trying to activate a lower plan compared to your current active plan. If you continue, your active plan will end and this new plan will take effect right from now.</p>
                                                <p>Do you want to proceed?</p>
                                            </div> :
                                            <div>
                                                <p>You're cancelling your current plan. All the features and facilities of your current plan will remain active till {currentPlan.renew_date}. After that your account will become a Free account.</p>
                                                <p>Are you sure?</p>
                                            </div>
                                        :
                                        (
                                            planModifyStatus === SUBSCRIPTION_PLAN_UPGRADATION.UPGRADE ?
                                                <div>
                                                    <p> You have {
                                                        currentPlan && currentPlan.plan_info ? currentPlan.plan_info.title + ` ( ${currentPlan && currentPlan.price_info ? getSubscriptionType(currentPlan.price_info.type) : ''} )` : '--'
                                                    } active till {''}  {(currentPlan.price_info.is_gift &&
                                                        currentPlan.expire_date) ||
                                                        currentPlan.renew_date}. Upgrading to {getNewSubscriptionPlanName(nicknameSubscriptionList, selectedPlanId) + ' ' + getSubscriptionType(selectedPlanDetails && selectedPlanDetails.type)} will update all your accessible features and your subscription will remain active till {getSubscriptionNewEndDate(selectedPlanDetails)}</p>
                                                    <p>Do you want to proceed?</p>
                                                </div>
                                                :
                                                null
                                        )
                                    : null
                            }
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <div className="d-flex justify-content-between">
                        {/* <div className="right-btns"> */}
                        {
                            (planModifyStatus === SUBSCRIPTION_PLAN_UPGRADATION.DOWNGRADE || planModifyStatus === SUBSCRIPTION_PLAN_UPGRADATION.SAME) && currentPlan && !currentPlan.is_closed ?
                                <button type="button" className="btn theme-btn btn-danger waves-effect mr-2 " data-dismiss="modal" aria-label="Close" onClick={() => {
                                    onClose(false)
                                    // handleRemoveRoomSubscription()
                                }} >Cancel</button>
                                :
                                <button
                                    type="submit"
                                    className="btn theme-btn btn-primary waves-effect"
                                    disabled={isPlanSelected}
                                    // disabled={true}

                                    onClick={handleNextOnBuyPlan}
                                >
                                    Proceed to Pay
                                </button>
                        }


                        {/* </div> */}
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment >
    )


}