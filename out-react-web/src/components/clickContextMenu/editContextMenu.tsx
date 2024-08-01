import React, { createRef, useEffect, useRef, useState } from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { CRYPTO_SECRET_KEY, MENU_OPERATIONS, HEADER_MENU_SELECTION_TYPE, ACTIONS } from 'src/_config';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router';
import { useAppChatDataSelectDeselect, useTextEditorSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { useAppPmChatDataSelectDeselect } from 'src/_common/hooks/selectors/pmWindowSelector';
import { useAppPmWindowAction } from 'src/_common/hooks/actions/pmWindow/appPmWindowActionHook';
import { useDispatch } from 'react-redux';
// // @ts-ignore
// import { useScreenshot,createFileName } from 'use-react-screenshot';
//import { ScreenCapture } from 'react-screen-capture';

const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);
// const ref = createRef<any>()

const EditContextMenu = (props: any) => {

    // const [image, takeScreenshot] = useScreenshot()
    // const getImage = () => {
    //     const area = document.getElementById('my-full-page');
    //     console.log(ref.current);
    //     takeScreenshot(area).then(download)    
    // }
    // const download = (image:any, { name = Math.random().toFixed(2), extension = "jpg" } = {}) => {
    //     const a = document.createElement("a");
    //     a.href = image;
    //     a.download = createFileName(extension, name);
    //     a.click();
    // };

    const { groupId, roomId } = useParams<any>();
    const groupCategoryAction = useAppGroupCategoryAction()
    const pmWindowAction = useAppPmWindowAction()
    const chatDataSelectDeselectSelector = useAppChatDataSelectDeselect()
    const pmChatDataSelectDeselectSelector = useAppPmChatDataSelectDeselect()
    const history = useHistory()
    const dispatch = useDispatch()
    const textEditorSelector = useTextEditorSelector()

    // Screen Capture code

    // const [ captureConfig , setCaptureConfig ] = useState<any>({
    //     screenCapture: "",
    //     open: false,
    //     title: "no-title"
    // });

    // const handleScreenCapture = (screenCapture:any) => {
    //     setCaptureConfig((current:any) => {
    //       return{
    //         ...current,
    //         screenCapture:screenCapture
    //       }
    //     })

    //     openModal()
    // };

    // const openModal = () => {
    //     setCaptureConfig((current:any) => {
    //         return{
    //           ...current,
    //           open:true
    //         }
    //     })
    // };

    // const closeModal = () => {
    //     setCaptureConfig((current:any) => {
    //         return{
    //           ...current,
    //           open:false,
    //           ScreenCapture:""
    //         }
    //     })
    // };

    // const handleOnChange = (e:any) => {
    //     setCaptureConfig((current:any) => {
    //         return{
    //           ...current,
    //           [e.target.name]: e.target.value
    //         }
    //     })
    // };

    // const handleSave = () => {
    //     console.log(captureConfig.title, captureConfig.screenCapture);
    // };

    const handleItemClick = (e: any, type?: string) => {
        switch (type) {
            case HEADER_MENU_SELECTION_TYPE.SELECT:
                groupCategoryAction.chatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.SELECT)
                break;
            case HEADER_MENU_SELECTION_TYPE.DESELECT:
                groupCategoryAction.chatDataSelectDeselect(null)
                break;
            case HEADER_MENU_SELECTION_TYPE.SELECT_ALL:
                groupCategoryAction.chatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.SELECT_ALL)
                break;
            case HEADER_MENU_SELECTION_TYPE.DESELECT_ALL:
                groupCategoryAction.chatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.DESELECT_ALL)
                break;
            case HEADER_MENU_SELECTION_TYPE.COPY:
                groupCategoryAction.chatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.COPY)
                break;
            case HEADER_MENU_SELECTION_TYPE.PASTE:
                groupCategoryAction.chatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.PASTE)
                break;
            default:
                break;
        }
    }

    const handlePmItemClick = (e: any, type?: string) => {
        switch (type) {
            case HEADER_MENU_SELECTION_TYPE.SELECT:
                pmWindowAction.pmWindowChatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.SELECT)
                break;
            case HEADER_MENU_SELECTION_TYPE.DESELECT:
                pmWindowAction.pmWindowChatDataSelectDeselect(null)
                break;
            case HEADER_MENU_SELECTION_TYPE.SELECT_ALL:
                pmWindowAction.pmWindowChatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.SELECT_ALL)
                break;
            case HEADER_MENU_SELECTION_TYPE.DESELECT_ALL:
                pmWindowAction.pmWindowChatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.DESELECT_ALL)
                break;
            case HEADER_MENU_SELECTION_TYPE.COPY:
                pmWindowAction.pmWindowChatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.COPY)
                break;
            case HEADER_MENU_SELECTION_TYPE.PASTE:
                pmWindowAction.pmWindowChatDataSelectDeselect(HEADER_MENU_SELECTION_TYPE.PASTE)
                break;
            default:
                break;
        }
    }

    const handleOpenToolBarr = (e: any) => {
        dispatch({
            type: ACTIONS.USER.GROUPS_CATEGORY.CHAT.TEXT_EDITOR_STATUS,
            payload: !textEditorSelector
        })
    };

    return (
        <React.Fragment>
            <Menu id='room_header_menu_edit_id' className="header-click-menu">
                {/* {
                    chatDataSelectDeselectSelector && chatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.SELECT ?
                        <Item onClick={(event) => handleItemClick(event, HEADER_MENU_SELECTION_TYPE.DESELECT)}>
                            <i className="fa fa-check" aria-hidden="true"></i> Select
                        </Item> :
                        <Item onClick={(event) => handleItemClick(event, HEADER_MENU_SELECTION_TYPE.SELECT)}>
                            Select
                        </Item>
                }
                {
                    chatDataSelectDeselectSelector && chatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.SELECT_ALL ?
                        <Item onClick={(event) => handleItemClick(event, HEADER_MENU_SELECTION_TYPE.DESELECT_ALL)}>
                            <i className="fa fa-check" aria-hidden="true"></i> SelectAll
                        </Item> :
                        <Item onClick={(event) => handleItemClick(event, HEADER_MENU_SELECTION_TYPE.SELECT_ALL)}>SelectAll</Item>
                } */}

                {/* <Item onClick={(event) => handleItemClick(event, HEADER_MENU_SELECTION_TYPE.COPY)}>Copy</Item>
                <Item onClick={(event) => handleItemClick(event, HEADER_MENU_SELECTION_TYPE.PASTE)}>Paste</Item> */}
                {/* <Separator /> */}
                <Item onClick={(event) => handleOpenToolBarr(event)}>Tt</Item>
                <Item onClick={(event) => handleItemClick(event)} disabled={true}>Print Screen an Area</Item>
            </Menu>

            {/* <Menu id='pm_header_edit_id' className="header-click-menu">
            {
                    pmChatDataSelectDeselectSelector && pmChatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.SELECT ?
                        <Item onClick={(event) => handlePmItemClick(event, HEADER_MENU_SELECTION_TYPE.DESELECT)}>
                            <i className="fa fa-check" aria-hidden="true"></i> Select
                        </Item> :
                        <Item onClick={(event) => handlePmItemClick(event, HEADER_MENU_SELECTION_TYPE.SELECT)}>
                            Select
                        </Item>
                }
                {
                    pmChatDataSelectDeselectSelector && pmChatDataSelectDeselectSelector === HEADER_MENU_SELECTION_TYPE.SELECT_ALL ?
                        <Item onClick={(event) => handlePmItemClick(event, HEADER_MENU_SELECTION_TYPE.DESELECT_ALL)}>
                            <i className="fa fa-check" aria-hidden="true"></i> SelectAll
                        </Item> :
                        <Item onClick={(event) => handlePmItemClick(event, HEADER_MENU_SELECTION_TYPE.SELECT_ALL)}>SelectAll</Item>
                }

                <Item onClick={(event) => handlePmItemClick(event, HEADER_MENU_SELECTION_TYPE.COPY)}>Copy</Item>
                <Item onClick={(event) => handlePmItemClick(event, HEADER_MENU_SELECTION_TYPE.PASTE)}>Paste</Item>
                <Separator />
                <Item onClick={(event) => handlePmItemClick(event)}>Print Screen an Area</Item>
            </Menu> */}

        </React.Fragment>

    );
};

export default EditContextMenu;