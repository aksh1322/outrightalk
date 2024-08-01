import React, { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, Modal } from 'react-bootstrap';
import { useHistory } from 'react-router';
import * as yup from 'yup';
import BannerShow from 'src/components/common/banner';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import { useAppUserDetailsSelector } from 'src/_common/hooks/selectors/userSelector'
import { useUserApi } from 'src/_common/hooks/actions/user/appUserApiHook';
import { useToaster } from 'src/_common/hooks/actions/common/appToasterHook';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import ViewProfileModal from '../commonModals/viewProfileModal/viewProfileModal';
import MapComponent from './MapComponent';
import { CUSTOM_MESSAGE } from 'src/_config';

interface FindNearbyUserFormValues {
    radius: number;
    age: any;
    max_age: any;
    range: number;
}

const findNearbyUserFormSchema = yup.object().shape({
    radius: yup
        .number()
        .required('Radius is required'),
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
        .nullable(true)

})

export default function FindNearByUserPage() {

    const { register, control, setValue, handleSubmit, errors } = useForm<FindNearbyUserFormValues>({
        resolver: yupResolver(findNearbyUserFormSchema),
        defaultValues: {
            range: 20,
            radius: 500,
            age: null,
            max_age: null
        },
    })


    const [showInfo, setShowInfo] = useState<boolean>(false)
    const [showModal, setShowModal] = useState<boolean>(false)
    const [currentLat, setCurrentLat] = useState<number>(0)
    const [currentLng, setCurrentLng] = useState<number>(0)
    const [range, setRange] = useState<number>(500)
    const [age, setAge] = useState('')
    const [usersList, setUsersList] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const history = useHistory()
    const userDetails = useAppUserDetailsSelector()
    const userApi = useUserApi()
    const toast = useToaster()
    const groupCategoryApi = useGroupCategoryApi()
    const [selectedUserId, setSelectedUserId] = useState<number>()

    const handleViewProfile = (user: any) => {
        setSelectedUserId(user.id)
        setShowModal(true)
        setShowInfo(false)
    }

    const handleAddToContactList = (user: any) => {
        const params: any = {
            contact_user_id: user.id
        }
        groupCategoryApi.callAddtoContactList(params, (message: string, resp: any) => {
            if (resp) {
                toast.success(message)
                setShowModal(false)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleRange = (e: any) => {
        if (e < 1)
            e = 1
        setRange(e * 20)
        setValue('radius', e * 20)
        setValue('range', range / 20)
        setUsersList([])
    }

    const handleAge = (e: any) => {
        setAge(e)
    }

    const handleShowUsers = (values: FindNearbyUserFormValues) => {
        setCurrentUser(null)
        let params = {
            current_lat: currentLat,
            current_lon: currentLng,
            radius: values.radius,
            age: values.age ? values.age : null,
            max_age: values.max_age ? values.max_age : null
        }
        userApi.callFindNearbyUser(params, (message: string, resp: any) => {
            if (resp && resp.list && resp.list.length) {
                setUsersList(resp.list)
            } else {
                toast.error(CUSTOM_MESSAGE.OTHERS.NO_NEARBY_USERS)
                setUsersList([])
            }
        }, (message: string, resp: any) => {
            toast.error(message)
        }
        )
    }

    const changeShowInfo = (inf: boolean) => {
        setShowInfo(inf)
    }

    const changeCurrentUser = (user: any) => {
        setCurrentUser(user)
    }

    const onModalClose = () => {
        setShowModal(false)
    }

    const onSuccess = (location: any) => {
        setCurrentLat(location.coords.latitude)
        setCurrentLng(location.coords.longitude)
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(onSuccess, () => { })
    }, [])

    return (
        <React.Fragment>
            <h3 style={{ color: "white" }}>Find Nearby Users</h3>
            <div className="select-filter-wrap">
                <div className="row">
                    <div className="col-sm-12 mb-3">
                        <div className="row">
                            <div className="col-sm-4">
                                <div className="form-group">
                                    <label htmlFor="" className="text-white d-block">Filter by Age</label>
                                    <div className="row no-gutters">
                                        <div className="col-sm-6">
                                            {/* <input type="number" value={age} onChange={handleAge} className="form-control" /> */}
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
                                                    // placeholder="Min age"
                                                    />
                                                )}
                                            />
                                            {
                                                errors && errors.age && errors.age.message ? <>
                                                    <Form.Control.Feedback type="invalid" >
                                                        {
                                                            errors.age.type === "typeError" ?
                                                                "Age should be a number" : "Age is required"
                                                        }
                                                    </Form.Control.Feedback>
                                                </> : null
                                            }
                                        </div>
                                        <div className="col-sm-6">
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
                                                                "Max age should be a number" : ""
                                                        }
                                                    </Form.Control.Feedback>
                                                </> : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="form-group">
                                    <label htmlFor="" className="text-white d-block">Radius</label>
                                    {/* <input type="range" className="form-control" onChange={handleRange} value={range / 20} /> */}
                                    <Controller
                                        control={control}
                                        name="range"
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <FormTextInput
                                                // name={name}
                                                onChange={(e) => {
                                                    onChange(e)
                                                    handleRange(e)
                                                }}
                                                onBlur={onBlur}
                                                value={value}
                                                inputRef={ref}
                                                type="range"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-2">
                                <label htmlFor="" className="text-white">Range (miles)</label>
                                {/* <input type="text" className="form-control" value={range} /> */}
                                <Controller
                                    control={control}
                                    name="radius"
                                    render={({ onChange, onBlur, value, name, ref }) => (
                                        <FormTextInput
                                            // name={name}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            inputRef={ref}
                                            type="text"
                                            disabled={true}
                                            error={errors.radius}
                                            placeholder="Radius"
                                        />
                                    )}
                                />
                                {
                                    errors && errors.radius && errors.radius.message ? <>
                                        <Form.Control.Feedback type="invalid" >
                                            {errors.radius.message}
                                        </Form.Control.Feedback>
                                    </> : null
                                }
                            </div>
                            <div className="col-sm-2">
                                <button className="btn theme-btn btn-success w-100 mt-20" onClick={handleSubmit(handleShowUsers)}>Show Users</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12">
                        <div style={{ height: "80vh" }}>
                            <MapComponent
                                range={range}
                                currentLat={currentLat}
                                currentLng={currentLng}
                                userDetails={userDetails}
                                usersList={usersList}
                                changeShowInfo={changeShowInfo}
                                showInfo={showInfo}
                                changeCurrentUser={changeCurrentUser}
                                currentUser={currentUser}
                                handleViewProfile={handleViewProfile}
                                handleAddToContactList={handleAddToContactList}
                            />
                        </div>
                    </div>
                    <hr />
                </div>
            </div>
            {
                showModal &&
                <ViewProfileModal
                    onClose={onModalClose}
                    shouldShow={showModal}
                    userId={selectedUserId}
                    addToContactList={handleAddToContactList}
                />
            }
        </React.Fragment>
    )
}