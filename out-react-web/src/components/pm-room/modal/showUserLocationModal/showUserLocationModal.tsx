import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'
import { Modal } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import MapComponentForPm from './MapComponentForPm';
import { CRYPTO_SECRET_KEY } from 'src/_config';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector';
import { usePmWindowApi } from 'src/_common/hooks/actions/pmWindow/appPmWindowApiHook';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface UserLocationModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
}

export default function UserLocationShowModal({ onClose, shouldShow }: UserLocationModalProps) {

    const pmWindowApi = usePmWindowApi()
    const [currentLat, setCurrentLat] = useState<number>(0)
    const [currentLng, setCurrentLng] = useState<number>(0)
    const [usersList, setUsersList] = useState<any[]>([])
    const staticRange: number = 2000;
    const { pmId } = useParams<any>();
    const pm_id: number = parseInt(cryptr.decrypt(pmId));
    const userDetails = useAppUserDetailsSelector()


    const onSuccess = (location: any) => {
        setCurrentLat(location.coords.latitude)
        setCurrentLng(location.coords.longitude)
    }

    const geUsersList = () => {
        const params: any = {
            pm_id
        }
        pmWindowApi.callPmShowUsersLocation(params, (message: string, resp: any) => {
            if (resp) {
                setUsersList(resp)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(onSuccess, () => { })
        geUsersList()
    }, [])

    return (
        <React.Fragment>

            <Modal
                show={shouldShow}
                backdrop="static"
                // onHide={() => onClose()}
                keyboard={false}
                className="sendvoicemail send-video-message theme-custom-modal"
                size="xl"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h5 className="modal-title mt-0">Users Location</h5>
                    <button type="button" className="close" onClick={() => onClose(true)}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'show-user-locations'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel">
                            <div style={{ height: "80vh" }}>
                                <MapComponentForPm
                                    range={staticRange}
                                    currentLat={currentLat}
                                    currentLng={currentLng}
                                    userDetails={userDetails}
                                    usersList={usersList}
                                // changeShowInfo={changeShowInfo}
                                // showInfo={showInfo}
                                // changeCurrentUser={changeCurrentUser}
                                // currentUser={currentUser}
                                // handleViewProfile={handleViewProfile}
                                // handleAddToContactList={handleAddToContactList}
                                />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

        </React.Fragment>
    )

}