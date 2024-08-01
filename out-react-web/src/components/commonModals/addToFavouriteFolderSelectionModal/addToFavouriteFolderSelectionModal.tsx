import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { useFavouritesApi } from 'src/_common/hooks/actions/favourites/appFavouritesApiHook';
import { toast } from 'react-toastify';
import TreeView from 'devextreme-react/tree-view';
import { useAppFavouriteFolderListSelector } from 'src/_common/hooks/selectors/favouritesSelector';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { CUSTOM_MESSAGE } from 'src/_config';

interface FavouritesModalProps {
    onClose: (success: any) => void;
    onSuccess: (success: any) => void;
    shouldShow: boolean;
    roomId: number;
}

export default function AddToFavouriteFolderSelectionModal({ onClose, onSuccess, shouldShow, roomId }: FavouritesModalProps) {

    const favouritesApi = useFavouritesApi()
    const groupCategoryApi = useGroupCategoryApi();
    const [parentId, setParentId] = useState<any>(0)
    const [parentFolderInfo, setParentFolderInfo] = useState<any>(null)
    const favouriteFolders = useAppFavouriteFolderListSelector()
    const [treeStructure, setTreeStructure] = useState<any>()

    const handleOnClick = (e: any) => {
        setParentId(e.itemData.id)
        setParentFolderInfo(e.itemData)
    }

    //Get list of favourite folders
    const getFavouriteFolders = () => {
        favouritesApi.callGetFavouriteFolders(
            (message: string, resp: any) => {
            }, (message: string) => {
            }
        )
    }

    useEffect(() => {
        getFavouriteFolders()
    }, [])

    //Manipulate tree structure
    useEffect(() => {
        let jstring = JSON.parse(JSON.stringify(favouriteFolders).split('"folder_name":').join('"text":').split('"children":').join('"items":'))
        setTreeStructure(jstring)
    }, [favouriteFolders])

    const getRoomFavouriteRoomList = () => {
        favouritesApi.callGetRommFavouriteFoldersList((message: string, resp: any) => {
            if (resp) {
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const addAsFavourite = () => {
        if (parentId) {
            const params = {
                room_id: roomId,
                folder_id: parentId
            };
            groupCategoryApi.callAddAsFavourite(params, (message: string, resp: any) => {
                if (resp) {
                    getRoomFavouriteRoomList()
                    onSuccess(true)
                    onClose(true)
                    toast.success(message)
                }
            }, (message: string) => {
                onClose(true)
                toast.error(message)
            })
        } else {
            toast.error(CUSTOM_MESSAGE.OTHERS.FOLDER_SELECT_FIRST)
        }
    }

    // const handleSavedToFolder = () => {
    //     if (parentId) {
    //         var sparams = {
    //             folder_id: parentId ? parentId : 1,
    //             room_id: roomId
    //         }
    //         favouritesApi.callAssignRoomToFolder(sparams,
    //             (message: string, resp: any) => {
    //                 toast.success(message)
    //                 onSuccess(true)
    //                 onClose(true)
    //             }, (message: string) => {
    //                 toast.error(message)
    //             }
    //         )
    //     } else {
    //         toast.error('please choose folder')
    //     }
    // }

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
                        <h2>Select Favourite Folder</h2>
                        <button type="button" className="close" onClick={onClose}>
                            <i className="modal-close"></i>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body bsPrefix={'favourite-folder-selection'}>
                    <div className="modal-body pl-0 pr-0">
                        <div className="manage-video-message-panel out_inner_folder">
                            <div className="row">
                                <div className="col-sm-12">
                                    <TreeView
                                        id="treeview"
                                        items={treeStructure}
                                        width={250}
                                        expandedExpr="false"
                                        onItemClick={(e: any) => handleOnClick(e)}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <button className="btn btn-primary"
                                        onClick={addAsFavourite}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}