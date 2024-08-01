import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useCommonApi } from 'src/_common/hooks/actions/commonApiCall/appCommonApiCallHook';
import { toast } from 'react-toastify';

interface AwardedBadgesModalProps {
    onClose: (success: any) => void;
    // onCancel: (success: any) => void;
    shouldShow: boolean;
}

export default function AwardedBadgesModal({ onClose, shouldShow }: AwardedBadgesModalProps) {

    
    const commonApi = useCommonApi()
    const [badges, setBadges] = useState<any>([])

    useEffect(() => {
        getAwardedBadgesList()
    }, [])

    const getAwardedBadgesList = () => {
        let params = {}
        commonApi.callGetAwardedBadges(params, (message: string, resp: any) => {
   
            console.log(resp)
          setBadges(resp.awardedBadges)

        }, (message: string) => {
            toast.error(message)
        })


    }

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
                    <h2>Awarded Badges</h2>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => onClose(true)}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'upgrade-nickname-subscription'} className="modal-body pl-0 pr-0">
                    <div className="manage-video-message-panel">
                        <div className="row">
                            <div className="col-md-12">
                                <ul className="giftlist price-list-section">
                                    {badges ?  badges.map((x: any, index: number) =>
                                        <li className="gift-item text-center" key={index} >
                                        <div className="custom-control custom-radio custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-3 d-inline-block ml-0 pl-0">
                                            <img style={{width:"100px"}} src={x.icon.thumb}  alt="" />
                                        </div>
                                        <div className="text-center item-description">
                                            {x.title}
                                        </div>
                                    </li>
                                    ): null }
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
                            Go Back
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </React.Fragment >
    )


}