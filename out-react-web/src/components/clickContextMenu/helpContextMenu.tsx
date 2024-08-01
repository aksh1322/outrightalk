import React, { useState } from "react";
import { Menu, Item, Separator, Submenu } from "react-contexify";
import { useAppGroupCategoryAction } from "src/_common/hooks/actions/groupCategory/appGroupCategoryActionHook";
import { CRYPTO_SECRET_KEY, MENU_OPERATIONS } from "src/_config";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { useUserApi } from "src/_common/hooks/actions/user/appUserApiHook";
import InviteToRoomModal from "../commonModals/inviteToRoomModal/inviteToRoomModal";
const Cryptr = require("cryptr");
const cryptr = new Cryptr(CRYPTO_SECRET_KEY);

const HelpContextMenu = (props: any) => {
  const { groupId, roomId } = useParams<any>();
  const groupCategoryAction = useAppGroupCategoryAction();
  const history = useHistory();
  const [showInviteToFriendModal, setShowInviteToFriendModal] =
    useState<boolean>(false);
  const userApi = useUserApi();

  const handleItemClick = (e: any) => {};

  const handleRedirectoCmsPage = (type: string, url: string) => {
    history.replace("");
    history.push(`/cms/${type}/${url}`);
  };
  const inviteToFriend = (params: any) => {
    
    userApi.callInviteEmail(
      params,
      (message: string, resp: any) => {
        setShowInviteToFriendModal(false);
        toast.success(message);
      },
      (message: string) => {
        toast.error(message);
      }
    );
  };
  const handleInviteFriend = (type: string) => {
    switch (type) {
      case MENU_OPERATIONS.INVITE_A_FRIEND.EMAIL:
        setShowInviteToFriendModal(true);
        break;
      case MENU_OPERATIONS.INVITE_A_FRIEND.FACEBOOK:
        window.open("https://www.facebook.com/", "_blank");
        break;
      case MENU_OPERATIONS.INVITE_A_FRIEND.TWITTER:
        window.open("https://www.twitter.com/", "_blank");
        break;
      case MENU_OPERATIONS.INVITE_A_FRIEND.GOOGLE_TALK:
        window.open("https://hangouts.google.com/", "_blank");
        break;
      default:
        break;
    }
  };

  return (
    <React.Fragment>
      <Menu id="menu_header_help_id" className="header-click-menu">
        <Item onClick={(event) => handleItemClick(event)}>
          Join a Help Lobby
        </Item>
        <Item
          onClick={(event) => {
            handleItemClick(event);
            window.open("https://outrightalk.com/", "_blank");
          }}
        >
          OutrighTalk Homepage
        </Item>
        <Submenu label="Invite a Friend">
          <Item
            onClick={() =>
              handleInviteFriend(MENU_OPERATIONS.INVITE_A_FRIEND.EMAIL)
            }
          >
            Email
          </Item>
          <Item
            onClick={() =>
              handleInviteFriend(MENU_OPERATIONS.INVITE_A_FRIEND.FACEBOOK)
            }
          >
            Facebook
          </Item>
          <Item
            onClick={() =>
              handleInviteFriend(MENU_OPERATIONS.INVITE_A_FRIEND.TWITTER)
            }
          >
            Twitter
          </Item>
          <Item
            onClick={() =>
              handleInviteFriend(MENU_OPERATIONS.INVITE_A_FRIEND.GOOGLE_TALK)
            }
          >
            Google Talk
          </Item>
        </Submenu>
        <Item onClick={() => handleRedirectoCmsPage("general", "about-us")}>
          About OutrighTalk
        </Item>
        {/* <Item onClick={(event) => handleItemClick(event)}>Check for Updates</Item> */}
      </Menu>

      <Menu id="room_header_menu_help_id" className="header-click-menu">
        <Item
          onClick={() => {
            window.open("https://outrightalk.com/faq/#chat-room", "_blank");
            // handleRedirectoCmsPage('group', 'faq')
          }}
        >
          FAQ
        </Item>
        <Item onClick={(event) => handleItemClick(event)}>
          Join a Help Lobby
        </Item>
        <Item
          onClick={(event) => {
            handleItemClick(event);
            window.open("https://outrightalk.com/", "_blank");
          }}
        >
          OutrighTalk Homepage
        </Item>
        <Item
          onClick={() => handleRedirectoCmsPage("groups", "about-outrightalk")}
        >
          About OutrighTalk
        </Item>
      </Menu>

      <Menu id="pm_header_help_id" className="header-click-menu">
        {/* <Item onClick={() => handleRedirectoCmsPage('pm', 'faq')}>FAQ</Item> */}
        <Item
          onClick={() => {
            window.open(
              "https://outrightalk.com/faq/#private_message",
              "_blank"
            );
            // handleRedirectoCmsPage('pm', 'faq')
          }}
        >
          FAQ
        </Item>
        <Item onClick={(event) => handleItemClick(event)}>
          Join a Help Lobby
        </Item>
      </Menu>
      {showInviteToFriendModal && (
        <InviteToRoomModal
          shouldShow={showInviteToFriendModal}
          onClose={() => setShowInviteToFriendModal(false)}
          getParams={inviteToFriend}
        />
      )}
    </React.Fragment>
  );
};

export default HelpContextMenu;
