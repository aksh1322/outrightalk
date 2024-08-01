import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
interface BuyVirtualGiftModalProps {
    onClose: (success: any) => void;
    // onCancel: (success: any) => void;
    shouldShow: boolean;
    openVirtualCreditsModal: any;
}

export default function BuyVirtualGiftModal({ onClose, shouldShow, openVirtualCreditsModal }: BuyVirtualGiftModalProps) {

    const [alert, setAlert] = useState<any>(null);
    const groupCategoryApi = useGroupCategoryApi();
    const [virtualCreditList, setVirtualCreditList] = useState<any>([])
    const [isPlanSelected, setIsPlanSelected] = useState<boolean>(true)
    const [selectedCreditDetails, setSelectedCreditDetails] = useState<any>()

    const { register, control, setValue, reset, handleSubmit, errors } = useForm<any>({
        defaultValues: {
            creditchoose: "",
        }
    })

    const getVirtualCreditList = () => {
        var params = {}
        groupCategoryApi.callGetVirtualGiftCreditList(params, (message: string, resp: any) => {
            if (resp && resp.length) {
                setVirtualCreditList(resp)
            } else {
                setVirtualCreditList([])
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    useEffect(() => {
        getVirtualCreditList()
    }, [])

    const handleCreditChanged = (data: any) => {
        setIsPlanSelected(false)
        setSelectedCreditDetails(data)
    }

    const handleProceedToBuy = () => {
        const params = {
            plan_id: selectedCreditDetails.id
        }
        groupCategoryApi.callBuyVirtualGiftCredit(params, (message: string, resp: any) => {
            if (resp && resp.url) {
                onClose(true)
                window.open(resp.url, '_blank', "status=1,toolbar=0")
            } else {
                toast.error(message)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    useEffect(() => {
        if (openVirtualCreditsModal) {
            let find = virtualCreditList.find((ele: any) => ele.id = openVirtualCreditsModal.plan_id)
            if (find) {
                setValue("creditchoose", find.id.toString())
                handleCreditChanged(find)
            }
        }
    }, [
        openVirtualCreditsModal,
        virtualCreditList
    ])

    return (
        <React.Fragment>

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
                    <h2>Buy Virtual Credit</h2>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'upgrade-nickname-subscription'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel">

                        <div className="row">
                            <div className="col-md-12">
                                <ul className="giftlist price-list-section">
                                    {
                                        virtualCreditList && virtualCreditList.length ? virtualCreditList.map((x: any, index: number) =>
                                            <li className="gift-item" key={index}>
                                                <div className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-3 d-inline-block ml-0 pl-0">
                                                    <input type="radio" className="custom-control-input" value={x.id} name="creditchoose" id={"radiocredit" + x.id} ref={register}
                                                        onChange={() => handleCreditChanged(x)}
                                                    />
                                                    <label className="custom-control-label" htmlFor={"radiocredit" + x.id}>
                                                        {x.credit_type}&nbsp; credit
                                                    </label>
                                                </div>
                                                <div className="item-description">
                                                    <span className="item-price">
                                                        Price: {x.show_price}
                                                    </span>
                                                    <span className="validity">
                                                        free {x.free_credit} credit expire in {x.expire_in_months} months
                                                    </span>
                                                </div>

                                            </li>

                                        ) : <li>
                                            no list found
                                        </li>
                                    }

                                </ul>

                            </div>

                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
                    <div className="d-flex justify-content-between">
                        <button type="button" className="btn theme-btn btn-danger waves-effect mr-2"
                            data-dismiss="modal" aria-label="Close"
                            onClick={() => onClose(true)}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn theme-btn btn-primary waves-effect"
                            disabled={isPlanSelected}
                            // disabled={true}
                            onClick={handleProceedToBuy}
                        >
                            Proceed to Pay
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment >
    )


}