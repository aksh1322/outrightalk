import React, { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Form, Modal } from 'react-bootstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import SweetAlert from 'react-bootstrap-sweetalert';
import * as yup from 'yup';
import { CUSTOM_MESSAGE, FIND_AND_ADD_USER_TYPE, getSubscriptionColor, removeEmptyObjectKey } from 'src/_config';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import { OptionValue } from 'src/_common/interfaces/common';
import { useCommonApi } from 'src/_common/hooks/actions/commonApiCall/appCommonApiCallHook'
import { useAppUserDetailsSelector, useAppFindAndAddUserModalOpen } from 'src/_common/hooks/selectors/userSelector'
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useUserApi } from 'src/_common/hooks/actions/user/appUserApiHook';
import { useAppUserAction } from 'src/_common/hooks/actions/user/appUserActionHook';
import ViewProfileModal from 'src/components/commonModals/viewProfileModal/viewProfileModal';
import { toast } from 'react-toastify';
interface FindAndAddUserModalProps {
    shouldShow: boolean;
}

interface SearchFieldFormValues {
    nickname?: string;
    email?: string;
    age: any;
    max_age?: any;
    language?: OptionValue | undefined | any;
    country?: OptionValue | undefined | any;
    gender?: OptionValue | undefined | any;
}

const searchFieldFormSchema = yup.object().shape({
    nickname: yup
        .string(),
    email: yup
        .string(),
    // age: yup
    //     .string(),
    age: yup
        .number()
        .transform(value => (isNaN(value) ? null : value))
        .when("max_age", (max_age: any) => {
            if (max_age)
                return yup.number().required("Age is required")
        }).nullable(),
    max_age: yup
        .number()
        .transform(value => (isNaN(value) ? null : value))
        .nullable(true),
    language: yup
        .object()
        .nullable(),
    country: yup
        .object()
        .nullable(),
    gender: yup
        .object()
        .nullable()
})

export default function FindAndAddUserModal({ shouldShow }: FindAndAddUserModalProps) {

    const commonApi = useCommonApi()
    const userApi = useUserApi()
    const userSelector = useAppUserDetailsSelector()
    const userAction = useAppUserAction()

    const [showModal, setShowModal] = useState<boolean>(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [initialState, setInitialState] = useState<any>(null)
    const [selectedUserId, setSelectedUserId] = useState<number>()
    const [alert, setAlert] = useState<any>(null);


    const findAndAddUserModalOpenSelector = useAppFindAndAddUserModalOpen()
    const groupCategoryApi = useGroupCategoryApi()
    const [LanguageList, setLanguageList] = useState<any[]>([]);
    const [countryList, setCountryList] = useState<any[]>([]);
    const [genderList, setGenderList] = useState<any[]>([]);
    const [userList, setUserList] = useState<any[]>([]);
    const [searchParams, setSearchParams] = useState<any>({
        nickname: null,
        email: null,
        age: null,
        max_age: null,
        language: null,
        country: null,
        gender: null
    })

    const { register, control, setValue, handleSubmit, reset, errors } = useForm<SearchFieldFormValues>({
        resolver: yupResolver(searchFieldFormSchema),
        defaultValues: {
            nickname: '',
            email: '',
            age: null,
            max_age: null,
            language: undefined,
            country: undefined,
            gender: undefined
        },
    })

    const getLanguageList = () => {
        groupCategoryApi.callGetRoomLanguage((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setLanguageList(resp.list)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const getCountryList = () => {
        commonApi.callGetCountryList((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setCountryList(resp.list)
            }
        }, (message: string) => {
            // toast.error(message)
        })
    }

    const getGenderList = () => {
        commonApi.callGetGenderList((message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setGenderList(resp.list)
            }
        }, (message: string) => {
            // toast.error(message)
        })
    }

    const hideAlert = () => {
        setAlert(null);
    }

    const showAddAlert = (id: number) => {
        // e && e.preventDefault()
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
                title={'Add to contact list'}
                onConfirm={() => handleAddToContactList(id)}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {`Are you sure you want to add to your Contact List?`}
            </SweetAlert>
        );
    }

    const showDeleteAlert = (id: number) => {
        // e && e.preventDefault()
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
                title={'Add to Blocked List'}
                onConfirm={() => handelAddToBlockList(id)}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {`Are you sure you want to add to your Blocked List?`}
            </SweetAlert>
        );
    }


    const onSubmit = (values: SearchFieldFormValues) => {

        var isEmpty = Object.entries(values).reduce((a: any, [k, v]) => (v == null || v == undefined || v == "" ? a : (a[k] = v, a)), {})

        if (!Object.keys(isEmpty).length) {
            toast.error(CUSTOM_MESSAGE.OTHERS.FIND_AND_ADD_USER)
            setSearchParams(null)
        } else {
            const params = {
                user_id: findAndAddUserModalOpenSelector.user_id ? findAndAddUserModalOpenSelector.user_id : userSelector?.id,
                nickname: values.nickname,
                email: values.email,
                age: values.age ? parseInt(values.age) : null,
                max_age: values && values.max_age ? parseInt(values.max_age) : null,
                language: values.language ? parseInt(values.language.value) : null,
                country: values.country ? parseInt(values.country.value) : null,
                gender: values.gender ? parseInt(values.gender.value) : null
            }
            setSearchParams(params)

            userApi.callFindAndAddUser(removeEmptyObjectKey(params), (message: string, resp: any) => {
                if (resp && resp.list && resp.list.length) {
                    setUserList(resp.list)
                    setInitialState(1)
                } else {
                    setUserList([])
                    setInitialState(1)
                }
            }, (message: string) => {
                toast.error(message)
            })
        }
    }

    const getAllUserList = () => {
        const params = searchParams
        userApi.callFindAndAddUser(removeEmptyObjectKey(params), (message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setUserList(resp.list)
                setInitialState(1)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleCloseModal = () => {
        userAction.showFindAndAddUserModal(false, null, null)
    }

    const handleReset = (e: React.MouseEvent) => {
        e && e.preventDefault();
        setUserList([])
        setInitialState(null)
        reset({
            nickname: '',
            email: '',
            age: '',
            max_age: '',
            language: '',
            country: '',
            gender: ''
        })
        setSearchParams({
            nickname: null,
            email: null,
            age: null,
            max_age: null,
            language: null,
            country: null,
            gender: null
        })
    }

    const handleAddToContactList = (id: number) => {
        const params = {
            user_id: findAndAddUserModalOpenSelector.user_id ? findAndAddUserModalOpenSelector.user_id : userSelector?.id,
            contact_user_id: id
        }
        groupCategoryApi.callAddtoContactList(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                hideAlert()
                getAllUserList()
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handelAddToBlockList = (id: number) => {
        const params = {
            user_id: findAndAddUserModalOpenSelector.user_id ? findAndAddUserModalOpenSelector.user_id : userSelector?.id,
            block_user_id: id
        }
        groupCategoryApi.callAddToBlockList(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                hideAlert()
                getAllUserList()
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    useEffect(() => {
        getLanguageList()
        getCountryList()
        getGenderList()
        // getAllUserList()
    }, [])

    const handleSelectRow = (e: any, id: any) => {
        e.preventDefault()
        var elements = document.querySelectorAll('.selected');
        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove('selected');
        }
        var element = document.getElementById('row-' + id);
        if (element) {
            element.classList.add("selected");
        }
    }

    const handleViewProfile = (e: any, id: any) => {
        e.preventDefault()
        e.stopPropagation();
        handleSelectRow(e, id);
        setSelectedUserId(id)
        setShowModal(true)
    }

    const onModalClose = () => {
        setShowModal(false)
    }

    return (
        <React.Fragment>
            {alert}
            <Modal
                show={shouldShow}
                backdrop="static"
                // onHide={() => onClose()}
                keyboard={false}
                className="theme-custom-modal"
                dialogClassName="modal-dialog-scrollable"
                size="xl"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h5 className="modal-title mt-0">
                        Find and Add User
                    </h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'find-and-add-user'} className="modal-body pl-0 pr-0 admin-room-setting-wrap">
                    <div className="manage-video-message-panel">
                        <div className="row justify-content-center create-manager-panel">
                            <div className="col-lg-12">
                                {/* <div className=""> */}
                                <h2 className="white-text">Search Criteria</h2>
                                <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label>Nickname</label>
                                                <Controller
                                                    control={control}
                                                    name="nickname"
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <FormTextInput
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            inputRef={ref}
                                                            type="text"
                                                            error={errors.nickname}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <label>Email</label>
                                                <Controller
                                                    control={control}
                                                    name="email"
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <FormTextInput
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            inputRef={ref}
                                                            type="text"
                                                            error={errors.email}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Min Age</label>
                                                <Controller
                                                    control={control}
                                                    name="age"
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <FormTextInput
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            inputRef={ref}
                                                            type="text"
                                                        // error={errors.age}
                                                        // placeholder="Min age"
                                                        />
                                                    )}
                                                />
                                                {
                                                    errors && errors.age && errors.age.message ? <>
                                                        <Form.Control.Feedback type="invalid" >
                                                            {
                                                                errors.age.type === "typeError" ?
                                                                    "Min age should be a number" : "Min age is required"
                                                            }
                                                        </Form.Control.Feedback>
                                                    </> : null
                                                }
                                            </div>
                                        </div>
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Max Age</label>
                                                <Controller
                                                    control={control}
                                                    name="max_age"
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <FormTextInput
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            inputRef={ref}
                                                            type="text"
                                                        // placeholder="Max age"
                                                        />
                                                    )}
                                                />
                                                {
                                                    errors && errors.max_age && errors.max_age.message ? <>
                                                        <Form.Control.Feedback type="invalid" >
                                                            {
                                                                errors.max_age.type === "typeError" ?
                                                                    "Max age should be a number" : "Max age is required"
                                                            }
                                                        </Form.Control.Feedback>
                                                    </> : null
                                                }
                                            </div>
                                        </div>

                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Language</label>
                                                <Controller
                                                    control={control}
                                                    name="language"
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <SelectInput
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            inputRef={ref}
                                                            dark={true}
                                                            options={LanguageList ? LanguageList.map((c: any) => ({
                                                                value: String(c.id),
                                                                label: c.language_title,
                                                            })) : []}
                                                            error={errors.language}
                                                            placeholder="Choose a Language"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Country</label>
                                                <Controller
                                                    control={control}
                                                    name="country"
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <SelectInput
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            inputRef={ref}
                                                            dark={true}
                                                            isDisabled={userSelector?.is_subscribed ? false : true}
                                                            options={countryList ? countryList.map((c: any) => ({
                                                                value: String(c.id),
                                                                label: c.country_name,
                                                            })) : []}
                                                            error={errors.country}
                                                            placeholder="Choose a Country"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Gender</label>
                                                <Controller
                                                    control={control}
                                                    name="gender"
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <SelectInput
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            value={value}
                                                            inputRef={ref}
                                                            dark={true}
                                                            options={genderList ? genderList.map((c: any) => ({
                                                                value: String(c.id),
                                                                label: c.title,
                                                            })) : []}
                                                            error={errors.gender}
                                                            placeholder="Choose a Gender"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="light-hr" />
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="d-flex justify-content-end w-100">
                                                <div className="right-btns">
                                                    <a href="#" className="btn theme-btn btn-danger waves-effect mr-2" onClick={(e) => handleReset(e)}>Clear</a>
                                                    <button type="submit" className="btn theme-btn btn-primary waves-effect">Search</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                {
                                    initialState ?
                                        <>

                                            <h2 className="white-text">Search Results</h2>
                                            <div className="row">
                                                <div className="col-sm-12 ">
                                                    <div className="list-users-wrap voicemail-table mt-3 mb-4">
                                                        <div className="table-responsive mb-0" data-pattern="priority-columns">
                                                            <table className="table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Nickname</th>
                                                                        <th>Gender</th>
                                                                        <th>Age</th>
                                                                        <th>Country</th>
                                                                        <th>Language</th>
                                                                        <th>Email</th>
                                                                        <th>Add to</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {
                                                                        userList && userList.length ? userList.map((x: any, index: number) => (
                                                                            <tr key={index} onClick={(e) => handleSelectRow(e, x.id)} id={'row-' + x.id}>
                                                                                {/* <td onClick={(e) => handleViewProfile(e, x.id)}>{x.nickname}</td> */}
                                                                                <td>
                                                                                    <a href="#"
                                                                                        onClick={(e) => handleViewProfile(e, x.id)}
                                                                                        style={{
                                                                                            color: getSubscriptionColor(x && x.is_subscribed ? {
                                                                                                ...x,
                                                                                                subscription_info: x.is_subscribed
                                                                                            } : null)
                                                                                        }}
                                                                                    >
                                                                                        {x.nickname}
                                                                                    </a>
                                                                                </td>
                                                                                <td>
                                                                                    {
                                                                                        x.visible_option && x.visible_option.find((z: any) => z.key == "gender_visible")?.value == 0 ?
                                                                                            x.gender_name ? x.gender_name.title : '--' : '--'

                                                                                    }
                                                                                </td>
                                                                                {/* <td>{x.age}</td> */}
                                                                                <td>
                                                                                    {
                                                                                        x.visible_option && x.visible_option.find((z: any) => z.key == "dob_visible")?.value == 0 ?
                                                                                            x.age ? x.age : '--' : '--'
                                                                                    }
                                                                                </td>
                                                                                <td>
                                                                                    {
                                                                                        x.visible_option && x.visible_option.find((z: any) => z.key == "country_visible")?.value == 0 ?
                                                                                            x.country_name ? x.country_name.country_name : '--' : '--'
                                                                                    }
                                                                                </td>
                                                                                <td>{x.language ? x.language : '--'}</td>
                                                                                <td>{
                                                                                    x.visible_option && x.visible_option.find((z: any) => z.key == "email_visible")?.value == 0 ?
                                                                                        x.email : '--'

                                                                                }</td>
                                                                                <td className="actions">
                                                                                    {
                                                                                        findAndAddUserModalOpenSelector.type === FIND_AND_ADD_USER_TYPE.BOTH || findAndAddUserModalOpenSelector.type === FIND_AND_ADD_USER_TYPE.ADD_CONTACT_USER ?
                                                                                            <button type="button"
                                                                                                onClick={() => showAddAlert(x.id)}
                                                                                                disabled={x.add_contact_list ? true : false}
                                                                                                className="btn-join-room">
                                                                                                {x.add_contact_list ? 'Added to Contact List' : 'Contact List'}
                                                                                            </button>
                                                                                            : null
                                                                                    }

                                                                                    {
                                                                                        findAndAddUserModalOpenSelector.type === FIND_AND_ADD_USER_TYPE.BOTH || findAndAddUserModalOpenSelector.type === FIND_AND_ADD_USER_TYPE.ADD_BLOCK_USER ?
                                                                                            <button type="button"
                                                                                                onClick={() => showDeleteAlert(x.id)}
                                                                                                className="btn-add-blocklist ml-2">
                                                                                                Block List
                                                                                            </button>
                                                                                            : null
                                                                                    }
                                                                                </td>
                                                                            </tr>
                                                                        )) :
                                                                            <tr>
                                                                                <td colSpan={50}>No user found</td>
                                                                            </tr>
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </> : null
                                }
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            {
                showModal &&
                <ViewProfileModal
                    onClose={onModalClose}
                    shouldShow={showModal}
                    // userDetails={currentUser}
                    addToContactList={() => { }}
                    isAddedToContactList={true}
                    userId={selectedUserId}
                />
            }
        </React.Fragment>
    )
}
