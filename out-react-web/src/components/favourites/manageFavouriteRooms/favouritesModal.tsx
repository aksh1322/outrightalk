import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormTextInput from 'src/_common/components/form-elements/textinput/formTextInput';
import SelectInput from 'src/_common/components/form-elements/selectinput/selectInput';
import { useFavouritesApi } from 'src/_common/hooks/actions/favourites/appFavouritesApiHook';
import { toast } from 'react-toastify';
import FavouriteFolderDropdown from './favouriteFolderDropdown';
import TreeView from 'devextreme-react/tree-view';

interface FavouritesModalProps {
    onClose: (success: any) => void;
    shouldShow: boolean;
    getFavouriteFolders: () => void;
    favouriteFolders: any;
    roomId: number;
    roomName?: string;
    selectedFolderId: number;
    selectedFolderName: string;
    getFavouriteRooms: (success: any) => void;
    assignRoom: boolean;
}

interface FavouritesModalValues {
    name: string;
}

const FavouritesModalSchema = yup.object().shape({
    name: yup
        .string()
        .required("Name field is required"),
})

export default function FavouritesModal({ onClose, shouldShow, getFavouriteFolders, getFavouriteRooms, selectedFolderName, favouriteFolders, roomId, roomName, selectedFolderId, assignRoom }: FavouritesModalProps) {

    const { register, control, setValue, handleSubmit, reset, errors } = useForm<FavouritesModalValues>({
        resolver: yupResolver(FavouritesModalSchema),
        defaultValues: {
            name: ''
        },
    })
    const [parentId, setParentId] = useState<any>(0)
    const [parentFolderInfo, setParentFolderInfo] = useState<any>(null)

    const favouritesApi = useFavouritesApi()

    // const createFavouriteFolder = (name: string) => {
    // }
    // const renameRoomName = (room_id: number, name: string) => {
    //     var params = {
    //         room_id: room_id,
    //         customize_name: name
    //     }
    //     favouritesApi.callRenameRoomName(params,
    //         (message: string, resp: any) => {
    //             getFavouriteRooms(selectedFolderId)
    //             toast.success(message)
    //         }, (message: string) => {
    //             toast.error(message)
    //         }
    //     )
    // }

    const onSubmit = (values: FavouritesModalValues) => {
        if (!roomId && roomName == '') {
            var params = {
                folder_name: values.name,
                pid: parentId
            }
            favouritesApi.callCreateFavouriteFolder(params,
                (message: string, resp: any) => {
                    onClose(false)
                    getFavouriteFolders()
                    toast.success(message)
                }, (message: string) => {
                    toast.error(message)
                }
            )
        } else if (roomId && !assignRoom) {
            var paramss = {
                room_id: roomId,
                customize_name: values.name
            }
            favouritesApi.callRenameRoomName(paramss,
                (message: string, resp: any) => {
                    onClose(false)
                    getFavouriteRooms(selectedFolderId)
                    toast.success(message)
                }, (message: string) => {
                    toast.error(message)
                }
            )
        }

    }

    const handleChangeFolder = () => {
        if (roomId && assignRoom) {
            if (parentId) {
                var sparams = {
                    folder_id: parentId ? parentId : selectedFolderId,
                    room_id: roomId
                }
                favouritesApi.callAssignRoomToFolder(sparams,
                    (message: string, resp: any) => {
                        onClose(false)
                        getFavouriteRooms(selectedFolderId)
                        toast.success(message)
                    }, (message: string) => {
                        toast.error(message)
                    }
                )
            } else {
                toast.error('please choose folder')
            }
        }
    }



    useEffect(() => {
        if (roomId != 0)
            setValue('name', roomName)
    }, [roomId])



    const handleOnClick = (e: any) => {
        setParentId(e.itemData.id)
        setParentFolderInfo(e.itemData)
    }

    const handleSelectionChanged = (e: any) => {
        // console.log('handleSelectionChanged', e)
    }

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="groupCategory show-adult-rooms theme-custom-modal"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <div className="modal-logo d-flex justify-content-center w-100">
                        <h2> {!roomId && roomName == '' ? 'Create Folder' : assignRoom && roomId ? 'Change Room Folder' : 'Rename Room'}</h2>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="modal-close"></i>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'sendvoice-mail'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel out_inner_folder">
                            {/* {!assignRoom ? */}
                            <form className="form-horizontal" onSubmit={handleSubmit(onSubmit)} noValidate>
                                <div className="row">
                                    {assignRoom && roomId ? <span>{roomName} is under {selectedFolderName} folder</span> : null}
                                    {parentFolderInfo && assignRoom && roomId ? <span>{roomName} will move from {selectedFolderName} to {parentFolderInfo.text}</span> : null}
                                    {
                                        !roomId && roomName == '' || assignRoom && roomId ?
                                            <div className="col-sm-12">

                                                <TreeView
                                                    id="treeview"
                                                    items={favouriteFolders}
                                                    width={250}
                                                    expandedExpr="false"
                                                    // showCheckBoxesMode="normal"
                                                    // selectionMode="single"
                                                    // selectByClick={true}
                                                    onItemClick={(e: any) => handleOnClick(e)}
                                                // onSelectionChanged={handleSelectionChanged}
                                                />
                                            </div> : null
                                    }
                                    {
                                        assignRoom && roomId ? null :
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <Controller
                                                        control={control}
                                                        name="name"
                                                        render={({ onChange, onBlur, value, name, ref }) => (
                                                            <FormTextInput
                                                                onChange={onChange}
                                                                onBlur={onBlur}
                                                                value={value}
                                                                inputRef={ref}
                                                                type="text"
                                                                error={errors.name}
                                                                placeholder={"Type Folder Name..."}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                    }

                                    {
                                        !roomId && roomName == '' ? <span> Note: {parentFolderInfo ? 'New create folder is under ' + parentFolderInfo.text : 'New create folder Root Folder'}</span> : null
                                    }
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        {
                                            assignRoom && roomId ?
                                                null : <button className="btn btn-primary">Submit</button>
                                        }
                                    </div>
                                </div>
                            </form>

                            <div className="row">
                                <div className="col-sm-12">
                                    {
                                        assignRoom && roomId ?
                                            <button type="button" onClick={handleChangeFolder} className="btn btn-primary">Submit</button> :
                                            null
                                    }
                                </div>
                            </div>

                            {/* :
                                <>
                                    <div className="row mb-2">
                                        <div className="col-sm-12 group-name-wrap">
                                            Room: {roomName}
                                        </div>
                                    </div>
                                    <FavouriteFolderDropdown
                                        favouriteFolders={favouriteFolders}
                                        getFavouriteRooms={getFavouriteRooms}
                                        handleSelectedFolderId={() => { }}
                                        roomId={roomId}
                                        onClose={onClose}
                                        selectedFolderId={selectedFolderId}
                                    />
                                </>
                            } */}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}