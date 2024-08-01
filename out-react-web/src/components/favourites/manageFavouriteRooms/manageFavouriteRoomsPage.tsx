// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import SweetAlert from 'react-bootstrap-sweetalert';
import BannerShow from '../../common/banner';
import { toast } from 'react-toastify';
import { useFavouritesApi } from 'src/_common/hooks/actions/favourites/appFavouritesApiHook';
import FavouritesModal from './favouritesModal';
import { useAppFavouriteFolderListSelector, useAppRoomListSelector } from 'src/_common/hooks/selectors/favouritesSelector';
import TreeView from 'devextreme-react/tree-view';
import ContextMenu from 'devextreme-react/context-menu';

function ManageFavouriteRoomsPage() {

    const roomList = useAppRoomListSelector()
    const [roomId, setRoomId] = useState<number>(0)
    const [roomName, setRoomName] = useState<string>('')
    const history = useHistory()
    const favouritesApi = useFavouritesApi()
    // const [ favouriteFolders, setFavouriteFolders ] = useState<any>(null)
    const favouriteFolders = useAppFavouriteFolderListSelector()
    const [selectedFolderId, setSelectedFolderId] = useState<any>(null)
    const [selectedFolderName, setSelectedFolderName] = useState<any>(null)

    const [showFavouritesModal, setShowFavouritesModal] = useState<boolean>(false)
    const [assignRoom, setAssignRoom] = useState<boolean>(false)

    const contextMenuRef = useRef();
    const treeViewRef = useRef();
    const [getFolderId, setGetFolderId] = useState<any>(null)
    const [treeStructure, setTreeStructure] = useState<any>([])
    const [alert, setAlert] = useState<any>(null);

    const getFavouriteRooms = (id: number) => {
        var params = {
            folder_id: id
        }
        favouritesApi.callGetMyFavouriteRooms(params,
            (message: string, resp: any) => {
            }, (message: string) => {
                toast.error(message)
            }
        )
    }

    const getFavouriteFolders = () => {
        favouritesApi.callGetFavouriteFolders(
            (message: string, resp: any) => {
            }, (message: string) => {
            }
        )
    }

    const onCloseFavouritesModal = () => {
        setRoomId(0)
        setShowFavouritesModal(false)
        setRoomName('')
        setAssignRoom(false)
    }

    const handleCreateFolder = () => {
        setShowFavouritesModal(true)
    }

    // const handleSelectedFolderId = (id: number) => {
    //     setSelectedFolderId(id)
    // }

    const handleCustomizeRoomName = (id: number, name: string) => {
        setRoomId(id)
        setRoomName(name)
        setShowFavouritesModal(true)
    }

    const handleAssignRoomToFolder = (id: number, name: string) => {
        setAssignRoom(true)
        setRoomId(id)
        setRoomName(name)
        setShowFavouritesModal(true)
    }

    useEffect(() => {
        getFavouriteFolders()
        getFavouriteRooms(1)
    }, [])

    useEffect(() => {
        let jstring = JSON.parse(JSON.stringify(favouriteFolders).split('"folder_name":').join('"text":').split('"children":').join('"items":'))
        setTreeStructure(jstring)
    }, [favouriteFolders])




    const handleOnClick = (e: any) => {
        // var element = document.querySelector('[aria-level="' + e.itemData.id + '"]');
        // console.log(' element@@##', element)
        // if (element) {
        //     for (var i = 0; i < element.length; i++) {
        //         element[i].classList.remove('dxselected');
        //     }
        //     element.classList.add("dxselected");
        // }

        setSelectedFolderId(e.itemData.id)
        setSelectedFolderName(e.itemData.text)
        getFavouriteRooms(e.itemData.id)

    }



    const handleContextMenu = (e: any) => {
        // e.event.preventDefault()        
        setGetFolderId(e.itemData.id)
    }

    const handleOnItemExpand = () => {
        // ('dx-state-focused')
        // var elements = document.getElementsByClassName('dx-treeview-node');
        // console.log(elements);
        // elements.classList.remove("dx-state-focused");

        var elements = document.querySelectorAll('.dx-state-focused');
        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove('dx-state-focused');
        }

        // var element = document.getElementById('row-' + id);
        // if (element) {
        //     element.classList.add("selected");
        // }
    }

    const handleOnItemCollapsed = () => {
        var elements = document.querySelectorAll('.dx-state-focused');
        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove('dx-state-focused');
        }
    }


    const contextMenuItemClick = (e) => {
        console.log('context menu click e', e)
        // let logEntry = '';
        switch (e.itemData.id) {
            case 'delete': {
                showFolderDeleteAlert()
                break;
            }

            default:
                break;
        }
    }

    const handleDeleteFolder = () => {
        const params = {
            folder_id: getFolderId
        }
        favouritesApi.callDeleteFavouriteFolder(params,
            (message: string, resp: any) => {
                if (resp) {
                    toast.success(message)
                    hideAlert()
                    getFavouriteFolders()
                    getFavouriteRooms(1)
                }
            }, (message: string) => {
                hideAlert()
                toast.error(message)
            }
        )
    }

    const hideAlert = () => {
        setAlert(null);
    }

    const showFolderDeleteAlert = () => {
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
                title={`Delete Folder`}
                onConfirm={handleDeleteFolder}
                onCancel={hideAlert}
                focusCancelBtn={true}
            >
                {`Are you sure you want to delete this folder and all the rooms in from your Favorites?`}
            </SweetAlert>
        );
    }

    return (
        <React.Fragment>
            {alert}
            <div className="page-heading-panel d-flex justify-content-between">
                <h1>Favourite Rooms</h1>
                <div className="d-flex">
                    <button
                        onClick={handleCreateFolder}
                        className="mail-action-btn waves-effect send-voice-btn">
                        <i className="create-room-icon" /> Create Folder
                    </button>
                </div>
            </div>
            {/* <div className="search-box-inner">
                <FavouriteFolderDropdown
                    onClose={() => { }}
                    favouriteFolders={favouriteFolders}
                    getFavouriteRooms={getFavouriteRooms}
                    handleSelectedFolderId={handleSelectedFolderId}
                />
            </div> */}
            {/* <div className="custom-control custom-checkbox custom-checkbox-outline theme-custom-checkbox group-checkbox custom-checkbox-success mb-4 d-inline-block" data-toggle="modal" data-target="#adultContent">
                <input type="checkbox"
                    className="custom-control-input"
                    id="customCheck-outlinecolor2"
                />
                <label className="custom-control-label" htmlFor="customCheck-outlinecolor2">Show +18 rooms</label>
            </div> */}
            <div className="table-panel voicemail-table">
                <div className="row">
                    <div className="col-sm-4 tree_view">
                        <TreeView
                            id="treeview"
                            items={treeStructure}
                            width={300}
                            // expandItem={1}
                            onItemClick={(e: any) => handleOnClick(e)}
                            onItemContextMenu={(e: any) => handleContextMenu(e)}
                            onItemExpanded={handleOnItemExpand}
                            onItemCollapsed={handleOnItemCollapsed}
                        />
                        {
                            getFolderId === 1 ? null :
                                <ContextMenu
                                    ref={contextMenuRef}
                                    dataSource={[
                                        { id: 'delete', text: 'Delete Folder' },
                                    ]}
                                    target="#treeview .dx-treeview-item"
                                    onItemClick={contextMenuItemClick} />
                        }
                    </div>
                    <div className="col-sm-8">
                        <div className='table-responsive'>
                            <table className="table">
                                <thead>
                                    {/* <tr>
                                    <th data-priority={1} colSpan={7}>
                                        <div className="group-name-wrap">

                                        </div>
                                    </th>
                                </tr> */}
                                    <tr>
                                        <th data-priority={1} className="text-center">Lock</th>
                                        <th data-priority={2} className="text-center">Type</th>
                                        <th data-priority={3}>Room Name</th>
                                        <th data-priority={4} className="text-center">Users</th>
                                        <th data-priority={5} className="text-center">Cams On</th>
                                        <th data-priority={6} className="text-center">Favourite</th>
                                        <th data-priority={7} className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        roomList && roomList.list && roomList.list.length ? (roomList.list.map((listValue: any, index: number) => (
                                            <tr key={index}>
                                                <td align="center">
                                                    <a href="#">
                                                        {
                                                            listValue && listValue.locked_room === 1 ?
                                                                <img src="/img/lock-icon.png" alt={`Private-${index}`} /> :
                                                                <img src="/img/public-icon.png" alt={`Public-${index}`} />
                                                        }
                                                    </a>
                                                </td>
                                                <td align="center">{listValue.type ? listValue.type : '--'}</td>
                                                <td>
                                                    <div className="room-name">
                                                        {listValue.room_name ? listValue.room_name : '--'}
                                                    </div>
                                                </td>
                                                <td align="center">{listValue.total_user ? listValue.total_user : 0}</td>
                                                <td align="center">{listValue.total_camera_on ? listValue.total_camera_on : 0}</td>
                                                <td align="center">{listValue.total_favourite ? listValue.total_favourite : 0}</td>
                                                <td align="center">
                                                    <button className="btn btn-primary" onClick={() => handleCustomizeRoomName(listValue.id, listValue.room_name)}><i className="fa fa-edit"></i></button>
                                                    <button className="btn btn-success ml-2" onClick={() => handleAssignRoomToFolder(listValue.id, listValue.room_name)}><i className="fa fa-cog"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                        ) : (
                                            <tr>
                                                <td colSpan={50} align="center"> No Rooms Available</td>
                                            </tr>
                                        )}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showFavouritesModal ?
                <FavouritesModal
                    shouldShow={showFavouritesModal}
                    onClose={onCloseFavouritesModal}
                    getFavouriteFolders={getFavouriteFolders}
                    favouriteFolders={treeStructure}
                    roomId={roomId}
                    roomName={roomName}
                    getFavouriteRooms={getFavouriteRooms}
                    selectedFolderId={selectedFolderId}
                    selectedFolderName={selectedFolderName}
                    assignRoom={assignRoom}
                /> : null}

        </React.Fragment>
    )
}

export default ManageFavouriteRoomsPage