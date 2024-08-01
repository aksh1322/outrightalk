import React from "react";
import ReactDOM from 'react-dom'
import { useParams } from "react-router";
import Slider from "react-slick";
import { CRYPTO_SECRET_KEY, getNameInitials, getSubscriptionColorInRoom } from "src/_config";
import SinglePmUser from "./SinglePmUser"

const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

interface OtherPmUsersProps {
  onWindowClose: () => void;
  streams: any[];
  // myLocalData: any;
  // participants: any;
  roomName: any;
  getPmWindowDetails: () => void;
  currentRoomMembers: any[];
  currentUsersInRoom: any[];
  pmUsers: any;
}

const settings = {
  dots: false,
  infinite: false,
  slidesToShow: 4,
  slidesToScroll: 4,
  swipeToSlide: true,
  autoplay: false,
};

export default function OtherPmUsers({ currentRoomMembers, currentUsersInRoom, pmUsers }: OtherPmUsersProps) {
  const { pmId } = useParams<any>();
  const pm_id: number = parseInt(cryptr.decrypt(pmId));

  return (
    <div className="in-room-wrapper">
      {/* <a href="#"
                className="close-box"
                onClick={(e) => handleCloseOthersRoomPmUsersWindow(e)}
            >
                {/* <img src="/img/close-icon.png" alt="close" /> 
                {/* Exit 
                </a> */}
      <div className="in-room-content">
        <div className="room-list">
          <Slider {...settings}>
            {
              // streamers.length > 0 &&
              // streamers.map(({ participant_id, videoLabel, participant_track, participant_name }: any, index: any) => {
              //     if (participant_id !== "localVideo") {
              //         return (
              //             <div className="unpinned" key={index}>
              //                 <div className="single-video-container">
              //                     <VideoCard
              //                         id={participant_id}
              //                         track={participant_track}
              //                         autoPlay
              //                         name={participant_name}
              //                     />
              //                 </div>
              //             </div>
              //         );
              //     }

              // })

              currentRoomMembers && currentRoomMembers?.length > 0
                ? currentRoomMembers.map((member: any, index: number) => {
                  const userColor = getSubscriptionColorInRoom(
                    member?.userId,
                    currentUsersInRoom
                  );
                
                  let data = {};
                    const newData = pmUsers?.find((ele: any) => { 
                      if(ele.user_id! == member?.userId){
                    return  data = {
                      userId:ele?.user_id,
                          isAdmin: ele?.is_admin,
                          profileCheck: ele?.user_info?.profile_display_preference?.val
                        }
                      } 
                    });
                  return (
                    <SinglePmUser
                      key={member?.nickname}
                      user={member}
                      userColor={userColor} // Pass the userColor as a prop
                      newData={newData}
                    />
                  );
                })
                : null}

          </Slider>
        </div>
      </div>
      {ReactDOM.createPortal(<audio
        style={{ position: 'absolute', opacity: 0.01, top: "200%", left: '200%' }}
        autoPlay
        id={`audio_call_element`}
      // muted={+userId === +signedInUserId}
      ></audio>, document.getElementById('root-audio-call') as Element)}
    </div>
  );
}
