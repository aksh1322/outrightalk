import React, { useContext, useEffect, useState } from 'react';
import Slider from "react-slick";
// import clsx from 'clsx';
import { useAppGroupCategoryAction } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook';
import { useGroupCategoryApi } from 'src/_common/hooks/actions/groupCategory/appGroupCategoryApiHook';
import { useAppActiveRoomsListSelector } from 'src/_common/hooks/selectors/groupCategorySelector';
import { toast } from 'react-toastify';
import { CRYPTO_SECRET_KEY, getSubscriptionColor } from 'src/_config';
import { useHistory, useLocation } from 'react-router-dom';
import { useParams } from 'react-router';
// import { AntmediaContext } from 'src';
// import { MediaSettingsContext } from 'src/containers/groupsCategory/roomsDetail/roomsDetails';

const Cryptr = require('cryptr');
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const settings = {
    dots: false,
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    swipeToSlide: true,
    autoplay: false,
};

interface ActiveRoom {
    id: number;
    room_picture?: {
        thumb?: string;
    };
    room_name: string;
    send_bird_channel_url?: string;
    group_id: number;
}

function ActiveRoomPopDown() {
    // const antmedia = useContext<any>(AntmediaContext);
    // const mediaSettings = useContext<any>(MediaSettingsContext);

    const [selectedSlider, setSelectedSlider] = useState(0);
    const groupCategoryAction = useAppGroupCategoryAction();
    const groupCategoryApi = useGroupCategoryApi();
    const activeRoomSelector = useAppActiveRoomsListSelector();
    const history = useHistory();
    const location = useLocation();
    const { roomId } = useParams<any>();
    const r_id: any = roomId ? parseInt(cryptr.decrypt(roomId)) : null;

    const handleCloseActiveRoom = (e: any) => {
        e.preventDefault()
        groupCategoryAction.activeRoomsPopDownHandler(false)
    }

    const handleExitRoom = (e: any, data: any) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSlider(data)
        var params = {
            room_id: data,
        }
        groupCategoryApi.callExitFromRoom(params, (message: string, resp: any) => {
            toast.success(message)
            if (r_id == data) {
                history.replace('');
                history.push(`groups`);
            }

            getActiveRoom()
            localStorage.removeItem("sortNicknameAlphabetically");
        }, (message: string) => {
            toast.error(message)
        })
    }

    const handleEnterRoom = (e: any, data: any) => {
        localStorage.removeItem('CURRENT_SUPER_ROOM_URL');
        localStorage.setItem('CURRENT_SUPER_ROOM_URL',JSON.stringify(data?.send_bird_channel_url))
        e.preventDefault();
        let pageUrl = history.location.pathname.split("/")
        if (pageUrl && pageUrl.length && pageUrl.includes('room-details')) {
            if (r_id && r_id != data.id) {
                setSelectedSlider(data.id)
                // let path = history.location.pathname.split('/').pop();
                groupCategoryAction.emptyRoomDetails()
                groupCategoryAction.activeRoomsPopDownHandler(false)
                groupCategoryAction.fromRouteHandler(data.id)
                const groupId = cryptr.encrypt(data.group_id)
                const roomId = cryptr.encrypt(data.id)
                // groupCategoryAction.roomMembersLargeViewMembersStreamData([])
                history.replace('');
                history.push(`${groupId}/${roomId}/room-details`);
            }
            else {
                groupCategoryAction.activeRoomsPopDownHandler(false)
            }
        }
        else {
            setSelectedSlider(data.id)
            // let path = history.location.pathname.split('/').pop();
            groupCategoryAction.emptyRoomDetails()
            groupCategoryAction.activeRoomsPopDownHandler(false)
            groupCategoryAction.fromRouteHandler(data.id)
            const groupId = cryptr.encrypt(data.group_id)
            const roomId = cryptr.encrypt(data.id)
            // groupCategoryAction.roomMembersLargeViewMembersStreamData([])
            history.replace('');
            history.push(`${groupId}/${roomId}/room-details`);
        }

    }

    // const renderSlides = () =>
    //     activeRoomSelector && activeRoomSelector.length && activeRoomSelector.map((activeRoom: any, index: any) => (
    //         <div key={index}>
    //             <div className="room-box" onClick={async (e) => {

    //                 // if (antmedia.publishStreamId) await antmedia.handleLeaveFromRoom();
                    
    //                 handleEnterRoom(e, activeRoom)
    //             }}>
    //                 <a href="#" onClick={(e) => handleExitRoom(e, activeRoom.id)} className="exit-room">
    //                     <img src="/img/exit-small-icon.png" alt="" /></a>
    //                 <img src={activeRoom.room_picture && activeRoom.room_picture.thumb ? activeRoom.room_picture.thumb : "/img/room-img.jpg"} alt={activeRoom.room_name} />
    //                 {/* <img src="/img/room-img01.jpg" alt={activeRoom.room_name} /> */}
    //                 <div className="room-box-name" style={{ color: getSubscriptionColor(activeRoom) }}>{activeRoom.room_name}</div>
    //             </div>
    //         </div>
    //     ));

    
    // To remove few cases of duplicate active rooms appearing in the popdown window 
    const getUniqueRooms = (rooms: ActiveRoom[]): ActiveRoom[] => {
        const uniqueRooms: ActiveRoom[] = [];
        const roomIds = new Set<number>();

        rooms.forEach((room) => {
            if (!roomIds.has(room.id)) {
                uniqueRooms.push(room);
                roomIds.add(room.id);
            }
        });

        return uniqueRooms;
    };

    const renderSlides = () => {
        if (!activeRoomSelector) return null;

        const uniqueRooms = getUniqueRooms(activeRoomSelector);

        return (
            uniqueRooms.length > 0 && uniqueRooms.map((activeRoom, index) => (
                <div key={index}>
                    <div className="room-box" onClick={(e) => handleEnterRoom(e, activeRoom)}>
                        <a href="#" onClick={(e) => handleExitRoom(e, activeRoom.id)} className="exit-room">
                            <img src="/img/exit-small-icon.png" alt="" />
                        </a>
                        <img
                            src={activeRoom.room_picture?.thumb ?? "/img/room-img.jpg"}
                            alt={activeRoom.room_name}
                        />
                        <div className="room-box-name" style={{ color: getSubscriptionColor(activeRoom) }}>
                            {activeRoom.room_name}
                        </div>
                    </div>
                </div>
            ))
        );
    };

    //call get my active rooms
    useEffect(() => {
        getActiveRoom()
    }, [])

    const getActiveRoom = () => {
        groupCategoryApi.callGetMyActiveRooms((message: string, resp: any) => {
        }, (message: string) => {
        })
    }
    
    return (
        <React.Fragment>
            <div className="active-room-wrapper">
                <a href="#" onClick={(e) => handleCloseActiveRoom(e)} className="close-box">
                    <img src="/img/close-icon.png" alt="close" /></a>
                <div className="room-list">
                    {activeRoomSelector && activeRoomSelector.length ?
                        <Slider {...settings}>
                            {
                                renderSlides()
                            }
                        </Slider> :
                        // <div className="room-box">
                        //     <img src="/img/room-img.jpg" alt="no-room" />
                        //     <div className="room-box-name">No Active Room</div>
                        // </div>
                        <div className="no-active-room-container">
                            <p className="no-active-room">No Active Room</p>
                        </div>
                    }
                </div>
            </div>
        </React.Fragment >
    )
}

export default ActiveRoomPopDown
