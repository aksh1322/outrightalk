import { ActionExtended } from 'src/_common/interfaces/ActionExtended';
import { ACTIONS, PM_WINDOW_SOCKET_TYPE } from 'src/_config'
import { } from 'src/_common/interfaces/models/pmWindow';

export interface PmWindowReducer {
    pmWindowDetails: any;
    pmWindowRoomChat: any;
    isOpenMyActivePmWindowPopDown: boolean;
    activePmWindowList: any[];
    chatDataSelectDeselect: any;
    pmWindowIncomingCall: any;
    fromRoute: any;
    pmChatTimestampToogle: boolean;
    pmTypingNotification: any;
    pmDigSound: any,
    pmCallAlertModal: any,
    pmCallAccepted: any,
    startingCallOnClick: any,
    startCheckTimeStamp:any
}

const initialState: PmWindowReducer = {
    pmWindowDetails: null,
    pmWindowRoomChat: [],
    isOpenMyActivePmWindowPopDown: false,
    activePmWindowList: [],
    chatDataSelectDeselect: null,
    pmWindowIncomingCall: null,
    fromRoute: null,
    pmChatTimestampToogle: false,
    pmTypingNotification: [],
    pmDigSound: null,
    pmCallAlertModal: null,
    pmCallAccepted: null,
    startingCallOnClick: null,
    startCheckTimeStamp:null
}
const PmWindowReducer = (state = initialState, action: ActionExtended) => {

   
    switch (action.type) {

        case ACTIONS.PM_WINDOW.START_CALL_ON_CLICK:
            return {
                ...state,
                startingCallOnClick: action.payload
            }
            case ACTIONS.PM_WINDOW.SET_TIMESTAMP_DATA:  
            return {
                    ...state,
                    startCheckTimeStamp: action.payload
                }

        case ACTIONS.PM_WINDOW.UPDATE_PM_DETAILS:
           
            
            return {
                ...state,
                pmWindowDetails: { ...((state && state.pmWindowDetails && state.pmWindowDetails.pm_settings) ? { pm_settings: state.pmWindowDetails.pm_settings } : {}), ...action.payload.socketData }
            }

        case ACTIONS.PM_WINDOW.SEND_PM:

            return {
                ...state,
                pmWindowDetails: action.payload
            }
        case ACTIONS.PM_WINDOW.GET_CHAT:
            return {
                ...state,
                pmWindowRoomChat: action.payload ? action.payload : []
            }

        case ACTIONS.PM_WINDOW.MY_ACTIVE_PMS_FROM_ROUTE:
            return {
                ...state,
                fromRoute: action.payload
            }

        //PM chat time stamp toogle
        case ACTIONS.PM_WINDOW.MENU.PM_CHAT_TIMESTAMP_TOOGLE:
            return {
                ...state,
                pmChatTimestampToogle: action.payload
            }

        //Chat data select deselect
        case ACTIONS.PM_WINDOW.CHAT.SELECT_DESELECT_PM_CHAT_DATA:

            return {
                ...state,
                chatDataSelectDeselect: action.payload
            }

        //Open Pm i'm in popdown modal
        case ACTIONS.PM_WINDOW.MY_ACTIVE_PM_WINDOW_ISOPEN_HANDLER:
            return {
                ...state,
                isOpenMyActivePmWindowPopDown: action.payload
            }

        //Open Pm call alert modal
        case ACTIONS.PM_WINDOW.OPEN_PM_CALL_ALERT_MODAL:
            return {
                ...state,
                pmCallAlertModal: action.payload
            }


        //Accept Reject PM call
        case ACTIONS.PM_WINDOW.PM_CALL_ACCEPTED:
            return {
                ...state,
                pmCallAccepted: action.payload
            }


        //PM i'm in list
        case ACTIONS.PM_WINDOW.GET_MY_ACTIVE_PM_WINDOWS:
            return {
                ...state,
                activePmWindowList: action.payload && action.payload.active_pms && action.payload.active_pms.length ? action.payload.active_pms : []
            }

        //PM chat socket data
        case ACTIONS.PM_WINDOW.CHAT.GET_SOCKET_DATA_AND_PUSH_TO_CHAT_LIST:
            var pm_id = state.pmWindowDetails?.id;

            var { socketData, userId } = action.payload;

            var prevChatData = state.pmWindowRoomChat;
            var filterData = socketData && socketData.msgs && socketData.msgs.length ? socketData.msgs.filter((x: any) => x.view_user_id == userId && x.pm_id == pm_id) : []
            if (filterData && filterData.length) {
                prevChatData.push(filterData[0])
            }

            //update admin when chat initiate via chat msg
            let tempPmDetails = { ...state.pmWindowDetails }
            if (tempPmDetails && tempPmDetails.users && !tempPmDetails.is_initialize) {
                if (socketData && socketData.pm_admin_user && socketData.pm_admin_user.user_id) {
                    for (let i = 0; i < tempPmDetails.users.length; i++) {

                        if (tempPmDetails.users[i].user_id == socketData.pm_admin_user.user_id) {
                            //update admin 
                            tempPmDetails.users[i].is_admin = 1;
                            tempPmDetails.users[i].joined_by_id = socketData.pm_admin_user.user_id;
                        }
                        else {
                            tempPmDetails.users[i].is_admin = 0;
                            tempPmDetails.users[i].joined_by_id = socketData.pm_admin_user.user_id;
                        }
                    }
                }
            }
            return {
                ...state,
                pmWindowRoomChat: prevChatData.map((x: any) => Object.assign(x)),
                pmWindowDetails: {
                    ...tempPmDetails,
                    users: tempPmDetails.users.map((z: any) => Object.assign(z))
                }
            }

        //Add - Remove users from pm window
        case ACTIONS.PM_WINDOW.ADD_REMOVE_USERS:

            let tempPmWindowDetails = { ...state.pmWindowDetails }
            var { socketData, userId } = action.payload;

            



            switch (socketData.type) {
                case PM_WINDOW_SOCKET_TYPE.ADD_USER:
                    if (tempPmWindowDetails.id == socketData.pm_id) {
                        if (socketData.user && socketData.user[userId]) {
                            tempPmWindowDetails.users.push(socketData.user[userId][0].new_user)
                        }
                    }
                    break;

                case PM_WINDOW_SOCKET_TYPE.REMOVE_USER:
                    if (tempPmWindowDetails.id == socketData.pm_id) {
                        if (socketData.user && socketData.user.length) {
                            socketData.user.map((users: any) => {
                                let remove_member_index: number = tempPmWindowDetails && tempPmWindowDetails.users && tempPmWindowDetails.users.length ? tempPmWindowDetails.users.findIndex((x: any) => x.user_id == users) : -1
                                if (remove_member_index >= 0) {
                                    tempPmWindowDetails.users.splice(remove_member_index, 1)
                                }
                            })
                        }
                    }
                    break;

                case PM_WINDOW_SOCKET_TYPE.EXIT:
                    if (tempPmWindowDetails.id == socketData.pm_id) {
                        if (socketData.user_id) {
                            // socketData.user.map((users: any) => {
                            let exit_member_index: number = tempPmWindowDetails && tempPmWindowDetails.users && tempPmWindowDetails.users.length ? tempPmWindowDetails.users.findIndex((x: any) => x.user_id == socketData.user_id) : -1

                            if (exit_member_index >= 0) {
                                tempPmWindowDetails.users.splice(exit_member_index, 1)
                            }
                            // })
                        }
                    }
                    break;

                default:
                    break;
            }
            return {
                ...state,
                pmWindowDetails: {
                    ...tempPmWindowDetails,
                    users: tempPmWindowDetails && tempPmWindowDetails.users && tempPmWindowDetails.users.length ? tempPmWindowDetails.users.map((x: any) => Object.assign(x)) : []
                },
            }

        //PM Window incoming call
        case ACTIONS.PM_WINDOW.CALL.INCOMING_CALL_DETAILS:
            return {
                ...state,
                pmWindowIncomingCall: action.payload
            }

        case ACTIONS.PM_WINDOW.TYPEING_NOTIFICATION:
            var { socketData, userId } = action.payload;
            let tempTyping = [...state.pmTypingNotification];
            let tempPmWindow = { ...state.pmWindowDetails }

            if (socketData.pmId == tempPmWindow.id) {
                if (socketData.typing) {
                    let foundIndex = tempTyping.findIndex((x: any) => x.userId == socketData.userId)
                    if (foundIndex == -1) {
                        tempTyping.push(socketData)
                    }

                } else {
                    let foundIndex = tempTyping.findIndex((x: any) => x.userId == socketData.userId)
                    if (foundIndex >= 0) {
                        tempTyping.splice(foundIndex, 1)
                    }
                }
            }

            return {
                ...state,
                pmTypingNotification: tempTyping.map((z: any) => Object.assign(z))
            }

        case ACTIONS.PM_WINDOW.DIG_SOUND:
            return {
                ...state,
                pmDigSound: action.payload
            }

        default:
            return state;
    }
}

export default PmWindowReducer;