import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import queryString from 'query-string'
import SweetAlert from 'react-bootstrap-sweetalert';
import { useCommonApi } from 'src/_common/hooks/actions/commonApiCall/appCommonApiCallHook'
import BannerShow from '../../common/banner';
import SearchRoomForm from '../common/searchRoom';
import PasswordShowAdultRoomModal from '../../commonModals/groupsCategoryModals/passwordShowAdultRoomsModal';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'

import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useAppGroupCategorySelector } from 'src/_common/hooks/selectors/groupCategorySelector'
import { toast } from 'react-toastify';

import { CRYPTO_SECRET_KEY, getBooleanToValueStatus } from 'src/_config';
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const GROUP_CATEGORY_TYPE = {
    ADULT: 1,
    NORMAL: 0
}

export default function GroupsCategoryListPage() {

    const commonApi = useCommonApi()
    const history = useHistory()
    const location = useLocation()
    const getQueryValue = queryString.parse(location.search);
    const userSelector = useAppUserDetailsSelector()
    const groupCategoryList = useAppGroupCategorySelector()
    const groupCategoryApi = useGroupCategoryApi()
    const [groupCategory, setGroupCategory] = useState<any>();
    const [roomLanguageList, setRoomLanguageList] = useState<any>();

    const [showAdultRoomPasswordModal, setAdultRoomPasswordModal] = useState<boolean>(false)
    const [isCheckAdultRooms, setIsCheckAdultRooms] = useState<any>(localStorage.getItem('isAdult') == '1' ? true : false)
    const [roomName, setRoomName] = useState('');
    const [language, setLanguage] = useState<any>({})
    const [resetSearchParms, setResetSearchParms] = useState<boolean>(false);
    const [eighteenPlus, setEighteenPlus] = useState<any>(localStorage.getItem('isAdult') == '1' ? 1 : 0)
    const [alert, setAlert] = useState<any>(null);

    const adultRoomShowPasswordModalOpen = (e: any) => {
        e.preventDefault();
        setAdultRoomPasswordModal(true)
    }

    const adultRoomShowPasswordCloseModal = () => {
        if (showAdultRoomPasswordModal) setAdultRoomPasswordModal(false)
    }

    const hideAdultAlert = () => {
        setAlert(null);
        setIsCheckAdultRooms(false)
    }

    const showAdultAlert = (e: any, groupId: number) => {
        e && e.preventDefault()
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Show 18+"
                cancelBtnText="Cancel"
                cancelBtnBsStyle="default"
                confirmBtnBsStyle="primary"
                allowEscape={false}
                closeOnClickOutside={false}
                title="Adult Content Warning"
                onConfirm={() => gotoAdultRooms(e, groupId)}
                onCancel={hideAdultAlert}
                focusCancelBtn={true}
            >
                You are about to enter a chat room that may contain content of an adult nature. These rooms are for ADULTS only &amp; may contain content inappropriate for members under the age of 18.
            </SweetAlert>
        );
    }

    const gotoAdultRooms = (e: any, groupId: number) => {
        setIsCheckAdultRooms(true)
        const group = cryptr.encrypt(groupId)
        history.push(`${group}/rooms`);
    }



    const goToRoomsList = (e: any, groupId: number, categoty_type: number) => {
        e.preventDefault();
        if (categoty_type === GROUP_CATEGORY_TYPE.ADULT) {
            if (isCheckAdultRooms) {
                const group = cryptr.encrypt(groupId)
                history.push(`${group}/rooms?adult=true`);
            } else {
                showAdultAlert(e, groupId)
            }
        }
        else {
            const group = cryptr.encrypt(groupId)
            if (isCheckAdultRooms) {
                history.push(`${group}/rooms`);
            } else {
                history.push(`${group}/rooms`);
            }
        }
    }

    const getSearchParms = (r_name: string = '', r_language: any = {}) => {
        setRoomName(r_name);
        setLanguage(r_language);
        setResetSearchParms(false)
    }

    const getGroupCategoryList = () => {

        const params = {
            room_name: roomName,
            language_id: language && language.value ? parseInt(language.value) : '',
            '18plus_room': eighteenPlus
        };

        groupCategoryApi.callGetGroupCategoryList(params, (message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                // setGroupCategory(resp.list)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const getLanguageList = () => {
        groupCategoryApi.callGetRoomLanguage((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setRoomLanguageList(resp.list)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const confirm18PlusFilter = (isAdult: number = 0, isCheck: boolean = false) => {
        if (isCheck) {
            localStorage.setItem('isAdult', '1');
        } else {
            localStorage.setItem('isAdult', '0');
        }
        setIsCheckAdultRooms(isCheck)
        setEighteenPlus(isAdult)
    }

    const refreshGroupList = (e: any) => {
        e.preventDefault();
        setRoomName('');
        setLanguage({})
        setEighteenPlus(0)
        setIsCheckAdultRooms(false)
        setResetSearchParms(true)
    }

    useEffect(() => {
        getGroupCategoryList()
        getLanguageList()
    }, [eighteenPlus, roomName, language])

    return (
        <React.Fragment>
            <div className="page-heading-panel d-flex justify-content-between">
                {alert}
                <h1>Groups</h1>
                <div className="d-flex">
                    <a href="#" onClick={(e) => refreshGroupList(e)} className="mail-action-btn waves-effect">
                        <i className="refresh-icon" />
                    </a>
                </div>
            </div>
            <div className="search-box-inner">
                <SearchRoomForm
                    getParams={getSearchParms}
                    resetSearchParms={resetSearchParms}
                    fetchLanguageList={roomLanguageList}
                />
            </div>
            <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block" data-toggle="modal" data-target="#adultContent">
                <input type="checkbox" className="custom-control-input" id="customCheck-outlinecolor2" onChange={(e) => adultRoomShowPasswordModalOpen(e)} checked={isCheckAdultRooms} />

                <label className="custom-control-label" htmlFor="customCheck-outlinecolor2">Show +18 rooms</label>
            </div>
            <div className="table-panel voicemail-table custom_height">
                <div className="table-responsive mb-0" data-pattern="priority-columns">
                    <table className="table">
                        <thead>
                            <tr>
                                <th data-priority={1}>Categories</th>
                                <th style={{ width: '190px' }} className="text-center" data-priority={1}>Rooms</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                groupCategoryList && groupCategoryList.list && groupCategoryList.list.length ? (groupCategoryList.list.map((listValue, index) => (

                                    <tr className="cat-red" key={index} >
                                        <td>
                                            <a href="#" className="cat-name" style={{ backgroundColor: listValue.color_code }} onClick={(e) => goToRoomsList(e, listValue.id, listValue.categoty_type)}>
                                                {
                                                    listValue.categoty_type === 0 ?
                                                        listValue.group_type ? listValue.group_type + ': ' : ''
                                                        : 'Adult: '
                                                }
                                                {
                                                    listValue.group_name ? listValue.group_name : '--'
                                                }
                                            </a>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center justify-content-center">
                                                <span className="rooms-tag" style={{ backgroundColor: listValue.color_code }}>{listValue.total_room ? listValue.total_room : 0}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                                ) : (
                                    <tr>
                                        <td colSpan={50}> No Category Found</td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAdultRoomPasswordModal ?
                <PasswordShowAdultRoomModal
                    onClose={adultRoomShowPasswordCloseModal}
                    shouldShow={showAdultRoomPasswordModal}
                    onConfirm={confirm18PlusFilter}
                    isCheck={isCheckAdultRooms}
                /> : null}

        </React.Fragment>
    )
}

// export default GroupsCategoryListPage
