import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNotebookApi } from 'src/_common/hooks/actions/notebook/appNotebookApiHook';
import { useAppNoteBookDetails } from 'src/_common/hooks/selectors/notebookSelector';
import { NotebookDetails, RemoveNotebookShare } from 'src/_common/interfaces/ApiReqRes';
import { getBooleanStatus, getNameInitials } from 'src/_config';

interface NoteDetailsProps {
    onClose: () => void;
    onSuccess: () => void;
    isNewMessageView: (status: boolean) => void
    viewedStatus: number;
    shouldShow: boolean;
    noteBookId: number;
}


export default function NoteDetailsModal({ onClose, onSuccess, shouldShow, noteBookId, isNewMessageView, viewedStatus }: NoteDetailsProps) {

    const notebookApi = useNotebookApi()
    const notebookDetailsSelector = useAppNoteBookDetails()

    function createMarkup(textString: string) {
        return { __html: textString };
    }

    const getNotebookDetails = () => {
        const params: NotebookDetails = {
            notebook_id: noteBookId
        }
        notebookApi.callNotebookDetails(params, (message: string, resp: any) => {
            if (resp) {

            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const removeNotebookShare = (e: React.MouseEvent, id: number) => {
        const params: RemoveNotebookShare = {
            share_user_id: id,
            notebook_id: noteBookId
        }
        notebookApi.callRemoveNotebookShare(params, (message: string, resp: any) => {
            if (resp) {
                getNotebookDetails()
                onSuccess()
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleCloseDetails = () => {
        onClose()
        if (viewedStatus === 1) {
            isNewMessageView(false)
        } else {
            isNewMessageView(true)
        }
    }

    useEffect(() => {
        getNotebookDetails()
    }, [])

    return (
        <React.Fragment>
            <Modal
                show={shouldShow}
                backdrop="static"
                keyboard={false}
                className="theme-custom-modal"
                size="lg"
                centered
                contentClassName='custom-modal'
            >
                <Modal.Header>
                    <h5 className="modal-title mt-0">Notebook Details</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseDetails}>
                        <i className="modal-close" />
                    </button>
                </Modal.Header>
                <Modal.Body bsPrefix={'details-notebook'}>
                    <div className="modal-body ">
                        <div className="account-data mt-0 pt-0">
                            <div className="form-group">
                                <div className="form-group">
                                    <label>Notebook Title </label>
                                    <div className="account-data-value">
                                        {
                                            notebookDetailsSelector ? notebookDetailsSelector.notebook_title : '--'
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notebook Details<title /></label>
                                <div className="account-data-value">
                                    {/* {
                                        notebookDetailsSelector ? notebookDetailsSelector.description : '--'
                                    } */}
                                    <p dangerouslySetInnerHTML={createMarkup(notebookDetailsSelector ? notebookDetailsSelector.description : '--')} />
                                </div>

                            </div>
                            {
                                notebookDetailsSelector && notebookDetailsSelector.share_with && notebookDetailsSelector.share_with.length ?
                                    <div className="share-with-wrap">
                                        <h2>Shared with</h2>
                                        <div className="share-list">
                                            {
                                                notebookDetailsSelector && notebookDetailsSelector.share_with && notebookDetailsSelector.share_with.length ? notebookDetailsSelector.share_with.map((x: any, index: number) => (
                                                    <div className="share-user" key={x.userdtls.id}>
                                                        <span className="remove-user">
                                                            <a href="#" onClick={(e) => removeNotebookShare(e, x.userdtls.id)}>
                                                                <img src="/img/close-btn.png" alt="remove" />
                                                            </a>
                                                        </span>
                                                        <div className="share-user-img">
                                                            {/* <img src="/img/user-01.jpg" alt="" /> */}
                                                            {
                                                                x && x.userdtls && x.userdtls.avatar && getBooleanStatus(x.userdtls.avatar && x.userdtls.avatar.visible_avatar ? x.userdtls.avatar.visible_avatar : 0) && x.userdtls.avatar.thumb ?
                                                                    <img src={x.userdtls.avatar.thumb} alt={x.userdtls.nickname} /> : (<span className="text-avatar">{getNameInitials(x.userdtls.nickname)}</span>)
                                                            }
                                                        </div>
                                                        <p>{x.userdtls.nickname}</p>
                                                    </div>
                                                )) :
                                                    null
                                            }
                                        </div>
                                    </div> : null
                            }
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </React.Fragment>
    )
}