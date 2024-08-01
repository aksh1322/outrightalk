import { log } from "console";
import SendbirdChat, { UserUpdateParams } from "@sendbird/chat";
import { GroupChannelModule, MessageFilter } from "@sendbird/chat/groupChannel";
import { UserMessageCreateParams } from "@sendbird/chat/message";
import { LiveEventType, SendbirdLive } from "@sendbird/live";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SendBirdCall, { Room } from "sendbird-calls";
import { LOGIN_STORAGE, SENDBIRD_APP_ID } from "src/_config";
import { useCallContext, useChatContext } from "../hooks";

import { cloneDeep } from "lodash";
import { useCommonApi } from "src/_common/hooks/actions/commonApiCall/appCommonApiCallHook";
const connectToSBServer = async (sb: any, userId: number, token: string) => {
  try {
    // // const testingToken =
    // //   userId === 236
    // //     ? "16e50fc2558895e435eedec6404456eea098ae46"
    // //     : userId === 234
    // //     ? "9c31e9347d486ae8fba3788353595deb19a1f076"
    // //     : ""
    // .
    const user = await sb.connect(`${userId}`, token);
    return user;
  } catch (error) {
    console.error("useSendBird >> connectToSBServer", { error });
  }
};

// let appId: string = "EFA9AE7F-A2CE-4DDB-BC8D-136F87A6C831"
let appId: string = SENDBIRD_APP_ID;
export const useSendBird = (scrollToBottom?: () => void) => {
  const {
    currentRoomURL,
    currentRoomChat,
    currentSuperRoomChat,
    currentRoomMembers,
    setCurrentRoomMembers,
    setCurrentRoomURL,
    setCurrentRoomChat,
    setCurrentSuperRoomChat,
    clearCurrentRoomURL,
    currentSuperRoomURL,
    setCurrentSuperRoomURL,
    clearCurrentSuperRoomURL,
  } = useChatContext();
  const commonApi = useCommonApi();

  const sb = SendbirdChat.init({
    appId,
    modules: [new GroupChannelModule()],
  });

  // update Profile Url at sendbird
  const updateProfileUrl = async (nickname: string, profile_url: string) => {
    const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
    const {
      id: userId,
      send_bird_user: { sb_access_token },
    } = value
      ? JSON.parse(value)
      : {
          id: null,
          send_bird_user: { sb_access_token: null },
        };
    const sb_user = await connectToSBServer(sb, userId, sb_access_token);
    const params: UserUpdateParams = {
      nickname: nickname,
      profileUrl: profile_url,
    };
    const user = await sb.updateCurrentUserInfo(params);
  };
  const joinARoom = async (
    roomUrl: string,
    variant: "chat" | "group" = "chat"
  ) => {
    try {
      // debugger
      if (roomUrl === "") return toast.error("No room Url found!");
      // if(!sbUser && !sbUser?.isActive) {
      const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);

      const {
        id: userId,
        send_bird_user: { sb_access_token },
      } = value
        ? JSON.parse(value)
        : {
            id: null,
            send_bird_user: { sb_access_token: null },
          };
      const sb_user = await connectToSBServer(sb, userId, sb_access_token);

      //   setSbUser(sb_user)
      // }
      const room = await sb.groupChannel.getChannel(roomUrl);

      if (variant === "chat") {
        if (currentRoomURL !== roomUrl) setCurrentRoomURL(roomUrl);
        // if (currentRoomURL !== roomUrl) setCurrentRoomURL("testing-channel")
      } else if (variant === "group") {
        if (currentSuperRoomURL !== roomUrl) setCurrentSuperRoomURL(roomUrl);
        // if (currentSuperRoomURL !== roomUrl) setCurrentSuperRoomURL("testing-channel")
      }

      setCurrentRoomMembers(room?.members);

      if (room?.isPublic) {
        await room?.join();
      }

      return room;
    } catch (error) {
      console.error("useSendBird >> joinARoom", { error });
    }
  };

  const populateCurrentRoomChat = async (
    variant: "chat" | "group" = "chat"
  ) => {
    try {
      const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
      const {
        id: userId,
        send_bird_user: { sb_access_token },
      } = value
        ? JSON.parse(value)
        : {
            id: null,
            send_bird_user: { sb_access_token: null },
          };
      const sb_user = await connectToSBServer(sb, userId, sb_access_token);
      let currentURL: string;
      let current_room_url = localStorage.getItem("CURRENT_ROOM_URL") as string;
      if (current_room_url) {
        current_room_url = JSON.parse(current_room_url);
      } else {
        current_room_url = "";
      }
      let current_super_room_url = localStorage.getItem(
        "CURRENT_SUPER_ROOM_URL"
      ) as string;
      if (current_super_room_url) {
        current_super_room_url = JSON.parse(current_super_room_url);
      } else {
        current_super_room_url = "";
      }
      currentURL =
        variant === "chat"
          ? current_room_url
          : variant === "group"
          ? current_super_room_url
          : "";

      const room = await sb.groupChannel.getChannel(currentURL);

      const filter = new MessageFilter();
      const limit = 300;
      const startingPoint = Date.now();

      if (room && typeof room !== "string") {
        const collection = room?.createMessageCollection({
          filter,
          limit,
          startingPoint,
        });

        if (collection?.hasNext) {
          const messages = await collection.loadNext();
          const sortedMessages = [...messages].sort(
            (a: any, b: any) => a.createdAt - b.createdAt
          );

          // const channelType = room?.channelType;
          // const channelUrl = currentRoomURL;
          // const messageId = sortedMessages[0]?.messageId;
          // const translatedMessage = await translateMessage(
          //   channelType,
          //   channelUrl,
          //   messageId,
          //   targetLanguages,
          // );

          // if (translatedMessage) {
          //   console.log("Translated message:", translatedMessage);
          // } else {
          //   console.log("Translation failed");
          // }

          if (variant === "chat") {
            setCurrentRoomChat(sortedMessages);
          } else if (variant === "group") {
            setCurrentSuperRoomChat(sortedMessages);
          }
        }

        // if (collection?.hasPrevious) {
        //   const messages = await collection.loadPrevious()
        // }
      }
    } catch (error) {
      console.error("useSendBird << populateCurrentRoomChat", { error });
    }
  };

  async function checkTranslate(chat: any, targetLang: any) {
    try {
      let room;
      const currentRoomUrl = localStorage.getItem("CURRENT_ROOM_URL");
      if (currentRoomUrl) {
        const roomURL = JSON.parse(currentRoomUrl);
        room = await sb.groupChannel.getChannel(roomURL);
      }
      if (!room) {
        throw new Error("Room not found");
      }
      const message = await room.translateUserMessage(chat, [targetLang]);
      return message;
    } catch (error) {
      throw error; // Rethrow the error to be caught by the caller
    }
  }

  // Function to perform message translation
  async function translateMessage(
    channelType: any,
    channelUrl: any,
    messageId: any,
    targetLangs: any
  ) {
    const applicationId = "E5E1BF93-99E3-4A93-84C3-D925555EA3BF";

    const requestBody = {
      target_langs: targetLangs,
    };

    const url = `https://api-${applicationId}.sendbird.com/v3/${channelType}/${channelUrl}/messages/${messageId}/translation`;
    const token = "2b525def06d36c4f10728c316712093292a5376d";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Translation request failed");
      }

      const translatedMessage = await response.json();
      return translatedMessage;
    } catch (error) {
      console.error("Error translating message:", error);
      return null;
    }
  }

  async function handleTranslateMessage() {
    const channelType = "open_channels";
    const channelUrl = "YOUR_CHANNEL_URL";
    const messageId = 123456;
    const targetLanguages = ["de"];

    const translatedMessage = await translateMessage(
      channelType,
      channelUrl,
      messageId,
      targetLanguages
    );
    if (translatedMessage) {
      // console.log("Translated message:", translatedMessage);
    } else {
      // console.log("Translation failed");
    }
  }

  // const leaveCurrentRoom = async () => {
  //   try {
  //     // setOpenRooms(prev => prev?.filter(openRoom => openRoom.channel_url !== currentRoom.channel_url))
  //     if (currentRoomURL) {
  //       const room = await sb.groupChannel.getChannel(currentRoomURL);
  //       await room.leave();
  //       setCurrentRoomURL("");
  //     }
  //   } catch (error) {
  //     console.error("useSendBird >> leaveCurrentRoom", { error });
  //   }
  // };

  // const sendMessageInRoom = async (
  //   message: string,
  //   variant: "chat" | "group" = "chat",
  //   type: "text" | "file" | "sticker" = "text",
  //   file?: File
  // ) => {
  //   try {
  //     let messageId: any = null;
  //     // debugger
  //     if (message.trim() === "") throw new Error("No message found");
  //     const params: UserMessageCreateParams = {
  //       message,
  //       customType: type,
  //     };
  //     const currentRoomUrl = localStorage.getItem(
  //       variant === "chat" ? "CURRENT_ROOM_URL" : "CURRENT_SUPER_ROOM_URL"
  //     );
  //     if (currentRoomUrl) {
  //       const roomURL = JSON.parse(currentRoomUrl);
  //       const room = await sb.groupChannel.getChannel(roomURL);
  //       if (room) {
  //         if (type === "text" || type === "sticker") {
  //           room?.sendUserMessage(params).onSucceeded(async (message) => {
  //             console.log("message in sendbird file ", message);
  //             await populateCurrentRoomChat(variant);
  //             console.log("message in sendbird file ", message.messageId);
  //             messageId = message?.messageId;
  //           });
  //         } else if (type === "file" && file) {
  //           room
  //             ?.sendFileMessage({
  //               file: file,
  //               fileName: file.name,
  //               mimeType: file.type,
  //             })
  //             .onSucceeded(() => {
  //               return (messageId = null);
  //             })
  //             .onFailed(() => {});
  //         }
  //       }
  //       return messageId;
  //     }
  //   } catch (error: any) {
  //     if (type === "text") {
  //       console.error("useSendBird >> sendMessageInRoom", { error });
  //     } else if (type === "file") {
  //       console.error(
  //         "useSendBird >> sendMessageInRoom >> error while sending the file",
  //         { error }
  //       );
  //     }
  //     toast.error(error.message);
  //   }
  // };

  const sendMessageInRoom = async (
    message: string,
    variant: "chat" | "group" = "chat",
    newParamas: any,
    type: "text" | "file" | "sticker" = "text",
    file?: File
  ): Promise<any> => {
    try {
      if (message.trim() === "") throw new Error("No message found");
      const params: UserMessageCreateParams = {
        message,
        customType: type,
      };
      const currentRoomUrl = localStorage.getItem(
        variant === "chat" ? "CURRENT_ROOM_URL" : "CURRENT_SUPER_ROOM_URL"
      );
      if (currentRoomUrl) {
        const roomURL = JSON.parse(currentRoomUrl);
        const room = await sb.groupChannel.getChannel(roomURL);
        if (room) {
          if (type === "text" || type === "sticker") {
            return new Promise((resolve, reject) => {
              room
                .sendUserMessage(params)
                .onSucceeded(async (message) => {
                  await populateCurrentRoomChat(variant);
                  // console.log("message in sendbird file ", message.messageId);
                  resolve(message.messageId);
                })
                .onFailed((error) => {
                  reject(error);
                });
            });
          } else if (type === "file" && file) {
            return new Promise((resolve, reject) => {
              room
                .sendFileMessage({
                  file: file,
                  fileName: file.name,
                  mimeType: file.type,
                })
                .onSucceeded((message) => {
                  resolve(null);
                })
                .onFailed((error) => {
                  reject(error);
                });
            });
          }
        }
      }
    } catch (error: any) {
      if (type === "text") {
        createchannel(newParamas, variant);
        console.error("useSendBird >> sendMessageInRoom", { error });
      } else if (type === "file") {
        console.error(
          "useSendBird >> sendMessageInRoom >> error while sending the file",
          { error }
        );
      }
      // toast.error(error.message);
      toast.error("Something went wrong");

      throw error;
    }
  };

  const createchannel = async (data: any, variant: any) => {
    const currentRoomUrl = localStorage.getItem(
      variant === "chat" ? "CURRENT_ROOM_URL" : "CURRENT_SUPER_ROOM_URL"
    );

    if (currentRoomUrl) {
      const roomURL = JSON.parse(currentRoomUrl);
      var params = {
        entity_id: data.entity_id,
        room_type_id: data.room_type_id,
        channel_url: roomURL,
      };
      commonApi.callCreateChannel(
        params,
        (message: string, resp: any) => {
          toast.success(message);
        },
        (message: string) => {
          toast.error(message);
        }
      );
    }

  };

  const clearCurrentRoomChatInfo = () => {
    setCurrentRoomChat(null);
    setCurrentRoomMembers(null);
    setCurrentSuperRoomChat(null);
    clearCurrentRoomURL();
    setCurrentRoomURL("");
    clearCurrentSuperRoomURL();
    setCurrentSuperRoomURL("");
  };

  useEffect(() => {
    if (scrollToBottom) {
      scrollToBottom();
    }
  }, [currentRoomChat, currentSuperRoomChat]);

  return {
    updateProfileUrl,
    joinARoom,
    sendMessageInRoom,
    // leaveCurrentRoom,
    populateCurrentRoomChat,
    clearCurrentRoomChatInfo,
    checkTranslate,
    // handleTranslateMessage,
  };
};

export const useSendBirdCall = (variant: "pm" | "group") => {
  const {
    openCall,
    setOpenCall,
    setOpenAudioCall,
    openAudioCall,
    audioAccess,
    videoAccess,
    setAudioAccess,
    setVideoAccess,
    remoteParticipants,
    setRemoteParticipants,
    setLocalParticipant,
    setCurrentCallMembers,
    currentCallMembers,
    currentCallRoomId,
    currentAudioCallRoomId,
    setCurrentCallRoomId,
    callRoom,
    audioCallRoom,
    setAudioCallRoom,
    setCallRoom,
    setInvitationRec,
    invitationRec,
    setShowAlert,
    acceptedFromInvite,
    setAcceptedFromInvite,
    setCallAcceptType,
    callAcceptType,
  } = useCallContext();

  const { currentRoomMembers: chatMembers } = useChatContext();
  const [callType, setCallType] = useState<"audio" | "video">("video");
  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: userId,
    send_bird_user: { sb_access_token },
  } = value
    ? JSON.parse(value)
    : {
        id: null,
        send_bird_user: { sb_access_token: null },
      };
  // // const testingToken =
  // //   userId === 236
  // //     ? "16e50fc2558895e435eedec6404456eea098ae46"
  // //     : userId === 234
  // //     ? "9c31e9347d486ae8fba3788353595deb19a1f076"
  // //     : ""
  //  .
  const authOption = { userId, accessToken: sb_access_token };

  function collectCurrentMembers(room: SendBirdCall.Room) {
    const mems: (
      | SendBirdCall.RemoteParticipant
      | SendBirdCall.LocalParticipant
    )[] = [room.localParticipant, ...room.remoteParticipants];
    setCurrentCallMembers(mems);
  }

  async function handleParticipantsMedia(room: SendBirdCall.Room) {
    if (!room) return;
    if (callType === "audio") {
      room?.participants.forEach((participant) => {
        participant.setMediaView(
          document.getElementById(
            `memberAudioBox-${participant.user.userId}`
          ) as HTMLAudioElement
        );
      });
    } else if (callType === "video") {
      const localMediaView: HTMLVideoElement = document.getElementById(
        `memberVideoBox-${userId}`
      ) as HTMLVideoElement;
      await room?.localParticipant.setMediaView(localMediaView);
      room?.remoteParticipants
        .filter(
          (participant) =>
            participant.isVideoEnabled && participant?.user?.userId !== userId
        )
        .forEach(async (participant) => {
          await participant.setMediaView(
            document.getElementById(
              `memberVideoBox-${participant.user.userId}`
            ) as HTMLVideoElement
          );
        });
    }
  }

  async function init(currentCallType: "video" | "audio" = "video") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mediaAccess = SendBirdCall.useMedia({
      audio: true,
      video: currentCallType === "video",
    });

    try {
      mediaAccess?.dispose();
    } catch (error) {}
    // @ts-ignore
    mediaAccess.on("streamChanged", (stream) => {});

    try {
      // setTimeout(async () => {
      if (currentCallType === "video") {
        const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
        if (variant === "group") {
          await room?.enter({
            videoEnabled: false,
            audioEnabled: false,
            kickSiblings: true,
          });
          const localMediaView: HTMLVideoElement = document.getElementById(
            `memberVideoBox-${userId}`
          ) as HTMLVideoElement;
          await room?.localParticipant.setMediaView(localMediaView);
          setVideoAccess(false);
          setAudioAccess(false);
        } else if (variant === "pm") {
          await room?.enter({
            videoEnabled: videoAccess,
            audioEnabled: true,
            kickSiblings: true,
          });

          setAudioAccess(true);
        }
        setOpenCall(true);
      } else if (currentCallType === "audio") {
        const roomAudio = await SendBirdCall.fetchRoomById(
          currentAudioCallRoomId
        );
        if (variant === "pm") {
          await roomAudio?.enter({
            videoEnabled: false,
            audioEnabled: true,
            kickSiblings: true,
          });
          const audio_call_element: HTMLAudioElement | null =
            document.getElementById("audio_call_element") as HTMLAudioElement;
          await roomAudio?.setAudioForLargeRoom(
            audio_call_element as HTMLAudioElement
          );
          setAudioAccess(true);
          setVideoAccess(false);
          // .catch(error => console.error('Error while joining the audio call, ', {error}))
        } else if (variant === "group") {
        }
        setOpenAudioCall(true);
      }
      // }, 1000);
    } catch (error) {
      toast.error("useSendBirdCall >> init >> error >>");
      console.error("useSendBirdCall >> init >> error >>", { error });
    }
  }

  async function exit(currentCallType: "video" | "audio" = "video") {
    try {
      if (currentCallType === "video") {
        const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
        if (room) {
          const currentUser = room?.participants?.find(
            (p) => +p?.user?.userId === +userId
          );
          if (currentUser) {
            room?.exit();
            setOpenCall(false);
          }
        }
      } else if (currentCallType === "audio") {
        const roomAudio = await SendBirdCall.fetchRoomById(
          currentAudioCallRoomId
        );
        if (roomAudio) {
          roomAudio?.exit();
          setOpenAudioCall(false);
        }
      }
    } catch (error) {
      console.error("useSendBirdCall >> Error occured while exiting room", {
        error,
      });
    }
  }

  async function mute() {
    try {
      const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
      if (room) {
        room?.localParticipant.muteMicrophone();
        setAudioAccess(false);
      }
    } catch (error) {
      console.error("useSendBirdCall >> Error occured while muteing", error);
    }
  }

  async function unmute() {
    try {
      const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
      if (room) {
        room?.localParticipant.unmuteMicrophone();
        setAudioAccess(true);
      }
    } catch (error) {
      console.error("useSendBirdCall >> Error occured while unmuteing", error);
    }
  }

  async function stopVideo() {
    if (callType === "audio") return;
    try {
      const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
      if (room) {
        room?.localParticipant.stopVideo();
        setVideoAccess(false);
      }
    } catch (error) {
      console.error("onStopVideo", error);
    }
  }

  async function startVideo() {
    if (callType === "audio") return;
    try {
      const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
      if (room) {
        room?.localParticipant.startVideo();
        setVideoAccess(true);
      }
    } catch (error) {
      console.error("onStartVideo", error);
    }
  }

  async function startCall() {
    try {
      const room = await SendBirdCall.fetchRoomById(currentCallRoomId);

      setCallType("video");
      if (room) {
        init();
      }
      setTimeout(async () => {
        if (variant === "group") return;
        await sendInvitation();
        const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
        if (room?.remoteParticipants?.length == 0) {
          let finalChatMem = chatMembers?.filter(
            (member: any) => +member?.userId !== +userId
          );
          const memberNames = finalChatMem?.map(
            (member: any) => member?.nickname
          );
          // Showing toast message
          toast.success(
            `You have invited ${memberNames.join(
              ", "
            )} to start the video session.`
          );
        }
      }, 5000);
    } catch (error) {
      console.error("useSendBirdCall >> startCall", error);
    }
  }

  async function startCallAudio() {
    try {
      const roomAudio = await SendBirdCall.fetchRoomById(
        currentAudioCallRoomId
      );
      setCallType("audio");
      if (roomAudio) {
        init("audio");
      }
      setTimeout(async () => {
        await sendInvitation("audio");

        if (roomAudio?.remoteParticipants?.length === 0) {
          let finalChatMem = chatMembers?.filter(
            (member: any) => +member?.userId !== +userId
          );
          const memberNames = finalChatMem?.map(
            (member: any) => member?.nickname
          );

          // Showing toast message
          toast.success(
            `You have invited ${memberNames.join(
              ", "
            )} to start the audio conversation.`
          );
        }
      }, 5000);
    } catch (error) {
      console.error("useSendBirdCall >> startAudioCall", error);
    }
  }

  async function sendInvitation(currentCallType: "audio" | "video" = "video") {
    try {
      if (variant === "group") return;
      chatMembers?.forEach(async (member: any) => {
        if (!member) return;
        if (+member?.userId !== +userId) {
          if (currentCallType === "video") {
            const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
            await room?.sendInvitation(`${member?.userId}`);
          } else if (currentCallType === "audio") {
            const roomAudio = await SendBirdCall.fetchRoomById(
              currentAudioCallRoomId
            );
            await roomAudio?.sendInvitation(`${member?.userId}`);
          }
        }
      });
    } catch (e) {
      // handle an error.
    }
  }

  async function endCall() {
    try {
      const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
      if (room) {
        exit();
        if (variant === "group") return;
        toast.success("You have ended the video session.");
      }
    } catch (error) {
      console.error("useSendBirdCall >> endCall", error);
    }
  }

  async function endAudioCall() {
    try {
      if (audioCallRoom) {
        exit("audio");
      }
    } catch (error) {
      console.error("useSendBirdCall >> endCall", error);
    }
  }

  useEffect(() => {
    let room: Room | null = null;
    // const cancelOrDecline = async () => {
    //   if (callRoom.current) {
    //     exit()
    //   }
    // }

    // callRoom.current?.on("invitationAccepted", async () => {
    //   if (callRoom.current) {
    //     init()
    //   }
    // })
    // callRoom.current?.on("invitationCanceled", cancelOrDecline)
    // callRoom.current?.on("invitationDeclined", cancelOrDecline)
    // callRoom.current?.on("error", () => {
    //   toast.error("Error with call room")
    // })

    // // //!
    // // TODO:
    // setCurrentCallRoomId("a220a8d6-8841-4027-b44b-ece7df024d37")
    // // TODO:
    // //!

    return () => {
      if (!callRoom) return;
      callRoom?.removeAllEventListeners();
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (callType === "audio") {
          const roomAudio = await SendBirdCall.fetchRoomById(
            currentAudioCallRoomId
          );
          roomAudio?.participants.forEach((participant) => {
            participant.setMediaView(
              document.getElementById(
                `memberAudioBox-${participant.user.userId}`
              ) as HTMLAudioElement
            );
          });
        } else if (callType === "video") {
          const room = await SendBirdCall.fetchRoomById(currentCallRoomId);
          room?.remoteParticipants
            .filter((participant) => participant.isVideoEnabled)
            .forEach((participant) => {
              participant.setMediaView(
                document.getElementById(
                  `memberVideoBox-${participant.user.userId}`
                ) as HTMLVideoElement
              );
            });
        }
      } catch (error) {
        console.log("error while setting remote participant view", error);
      }
    })();
  }, [callRoom, remoteParticipants, callType]);

  useEffect(() => {
    if (variant === "group") return;
    if (currentCallRoomId?.length <= 0) return;
    if (currentAudioCallRoomId?.length <= 0) return;

    // if(callType === "video" && currentCallRoomId.length <=0) return
    // if(callType === "audio" && currentAudioCallRoomId.length <=0) return
    let room: Room | null = null;
    let roomAudio: Room | null = null;
    (async () => {
      SendBirdCall.init(appId);
      SendBirdCall.authenticate(authOption, async (result, error) => {
        if (error) {
          toast.error("Authentication failed for SendBirdCall");
          return;
        } else {
          try {
            await SendBirdCall.connectWebSocket();
          } catch (error) {}
          room = await SendBirdCall.fetchRoomById(currentCallRoomId);
          roomAudio = await SendBirdCall.fetchRoomById(currentAudioCallRoomId);

          setCallRoom(room);
          setAudioCallRoom(roomAudio);
          collectCurrentMembers(room);

          if (acceptedFromInvite) {
            if (callAcceptType === "video") {
              if (room) {
                setTimeout(async () => {
                  await startCall();
                  await startVideo();
                }, 1000);

                setAcceptedFromInvite(false);
                setCallAcceptType(null);
              }
            } else if (callAcceptType === "audio") {
              if (roomAudio) {
                setTimeout(async () => {
                  await startCallAudio();
                }, 1000);

                setAcceptedFromInvite(false);
                setCallAcceptType(null);
              }
            }
          }

          room.on("localParticipantDisconnected", () => {
            if (room) {
              const videoEl: HTMLVideoElement = document.createElement(
                "video"
              ) as HTMLVideoElement;
              room?.localParticipant.setMediaView(videoEl);
              collectCurrentMembers(room);
            }
          });
          room.on("remoteVideoSettingsChanged", () => {
            if (room) {
              handleParticipantsMedia(room);
              collectCurrentMembers(room);
              startVideo();
            }
          });
          room.on("remoteAudioSettingsChanged", () => {
            if (room) {
              handleParticipantsMedia(room);
              collectCurrentMembers(room);
            }
          });
          room.on("remoteParticipantEntered", () => {
            if (room) {
              handleParticipantsMedia(room);
              collectCurrentMembers(room);
            }
          });
          room.on("localParticipantReconnected", () => {
            if (room) {
              handleParticipantsMedia(room);
              collectCurrentMembers(room);
            }
          });
          room.on("remoteParticipantExited", (remoteParticipant) => {
            try {
              if (room) {
                let remoteParticipantsList = room?.remoteParticipants?.filter(
                  (participant) => participant?.user?.userId !== userId
                );

                if (remoteParticipantsList?.length > 0) {
                  if (variant === "pm")
                    toast.error(
                      `${remoteParticipant?.user?.nickname} has left the video session.`
                    );
                } else {
                  toast.success("The video session has been ended.");
                }
                let clonedRemoteParticipants = cloneDeep(
                  room?.remoteParticipants
                );
                setRemoteParticipants(clonedRemoteParticipants);
                collectCurrentMembers(room);
              }
            } catch (error) {
              console.error(error);
            }
          });
          room.on("remoteParticipantStreamStarted", (remoteParticipant) => {
            if (room) {
              const clonedRemoteParticipants = cloneDeep(
                room?.remoteParticipants
              );
              handleParticipantsMedia(room);
              setLocalParticipant(room?.localParticipant);
              setRemoteParticipants(clonedRemoteParticipants);
              collectCurrentMembers(room);
            }
          });
          room.on("invitationAccepted", (item) => {
            if (openCall || openAudioCall) return;
            toast.success(
              `The audio conversation with ${item?.invitee?.nickname} has been established.`
            );
          });
          room.on("invitationDeclined", (item) => {
            toast.error(
              `${item?.invitee?.nickname} has declined your invitation to start a private video session.`
            );
          });
          roomAudio.on("localParticipantDisconnected", () => {
            if (roomAudio) {
              // const videoEl: HTMLVideoElement = document.createElement("video") as HTMLVideoElement
              // roomAudio?.localParticipant.setMediaView(videoEl)
              // collectCurrentMembers(roomAudio)
            }
          });
          roomAudio.on("remoteAudioSettingsChanged", () => {
            if (roomAudio) {
              handleParticipantsMedia(roomAudio);
              collectCurrentMembers(roomAudio);
            }
          });
          roomAudio.on("remoteParticipantEntered", () => {
            if (roomAudio) {
              handleParticipantsMedia(roomAudio);
              collectCurrentMembers(roomAudio);
            }
          });
          roomAudio.on("localParticipantReconnected", () => {
            if (roomAudio) {
              handleParticipantsMedia(roomAudio);
              collectCurrentMembers(roomAudio);
            }
          });
          roomAudio.on("remoteParticipantExited", (remoteParticipant) => {
            try {
              if (roomAudio) {
                let finalPart = roomAudio?.remoteParticipants?.filter(
                  (e) => e?.user?.userId !== userId
                );

                if (finalPart?.length > 0) {
                  toast.error(
                    `${remoteParticipant?.user?.nickname} has left the audio conversation.`
                  );
                } else {
                  toast.success("The audio conversation has been ended.");
                }
                const copy = cloneDeep(roomAudio?.remoteParticipants);
                setRemoteParticipants(copy);
                collectCurrentMembers(roomAudio);
              }
            } catch (error) {
              console.error(error);
            }
          });
          roomAudio.on(
            "remoteParticipantStreamStarted",
            (remoteParticipant) => {
              if (roomAudio) {
                const copy = cloneDeep(roomAudio?.remoteParticipants);
                handleParticipantsMedia(roomAudio);
                setLocalParticipant(roomAudio?.localParticipant);
                setRemoteParticipants(copy);
                collectCurrentMembers(roomAudio);
              }
            }
          );
          roomAudio.on("invitationAccepted", (item) => {
            toast.success(
              `The audio conversation with ${item?.invitee?.nickname} has been established.`
            );
          });
          roomAudio.on("invitationDeclined", (item) => {
            toast.error(
              `${item?.invitee?.nickname} has declined your invitation to start a private audio conversation.`
            );
          });

          SendBirdCall.addListener("", {
            onInvitationReceived: async (invitation) => {
              setInvitationRec(invitation);
              setShowAlert(true);
            },
          });
        }
      });
    })();

    return () => {
      try {
        room?.removeAllEventListeners();
        roomAudio?.removeAllEventListeners();
      } catch (error) {
        console.log(
          "%cError while removing event listeners from room",
          "background: red; padding: 0.5rem; color: white; font-size: 1rem;"
        );
      }
    };
  }, [currentAudioCallRoomId, currentCallRoomId, variant]);

  useEffect(() => {
    if (variant === "pm") return;
    if (currentCallRoomId?.length <= 0) return;
    let room: Room | null = null;
    (async () => {
      SendBirdCall.init(appId);
      SendBirdCall.authenticate(authOption, async (result, error) => {
        if (error) {
          toast.error("Authentication failed for SendBirdCall");
          return;
        } else {
          SendBirdCall.connectWebSocket()
            .then(async function () {
              /* Succeeded to connect*/
              room = await SendBirdCall.fetchRoomById(currentCallRoomId);
              setCallRoom(room);
              // callRoom = room
              collectCurrentMembers(room);
              room.on("localParticipantDisconnected", () => {
                if (room) {
                  // if(callType === 'audio') return
                  // const videoEl: HTMLVideoElement = document.createElement("video") as HTMLVideoElement
                  // room?.localParticipant.setMediaView(videoEl)
                  // collectCurrentMembers(room)
                }
              });
              room.on("remoteVideoSettingsChanged", (remoteParticipant) => {
                if (room) {
                  handleParticipantsMedia(room);
                  collectCurrentMembers(room);
                }
              });
              room.on("remoteAudioSettingsChanged", () => {
                if (room) {
                  handleParticipantsMedia(room);
                  collectCurrentMembers(room);
                }
              });
              room.on("remoteParticipantEntered", () => {
                if (room) {
                  handleParticipantsMedia(room);
                  collectCurrentMembers(room);
                }
              });
              room.on("localParticipantReconnected", () => {
                if (room) {
                  handleParticipantsMedia(room);
                  collectCurrentMembers(room);
                }
              });
              room.on("remoteParticipantExited", (remoteParticipant) => {
                try {
                  if (room) {
                    const copy = cloneDeep(room?.remoteParticipants);
                    setRemoteParticipants(copy);
                    collectCurrentMembers(room);
                  }
                } catch (error) {
                  console.error(error);
                }
              });
              room.on("remoteParticipantStreamStarted", (remoteParticipant) => {
                if (room) {
                  handleParticipantsMedia(room);
                  // console.log(remoteParticipant)
                  setLocalParticipant(room?.localParticipant);
                  const copy = cloneDeep(room?.remoteParticipants);
                  setRemoteParticipants(copy);
                  collectCurrentMembers(room);
                }
              });
            })
            .catch(function (error) {
              /* Failed to connect */
            });
        }
      });
    })();

    return () => {
      try {
        room?.removeAllEventListeners();
      } catch (error) {
        console.log(
          "%cError while removing event listeners from room",
          "background: red; padding: 0.5rem; color: white; font-size: 1rem;"
        );
      }
    };
  }, [currentCallRoomId, variant, callType]);

  useEffect(() => {
    if (variant === "pm") return;
    if (callRoom) {
      startCall();
    }
    return () => {
      endCall();
    };
  }, [callRoom, variant]);

  return {
    startCall,
    startCallAudio,
    endCall,
    endAudioCall,
    remoteParticipants,
    onMute: mute,
    onUnmute: unmute,
    onStartVideo: startVideo,
    onStopVideo: stopVideo,
    authOption,
  };
};

export const useSendBirdLive = async () => {
  const value = localStorage.getItem(LOGIN_STORAGE.SIGNED_IN_AS);
  const {
    id: userId,
    send_bird_user: { sb_access_token },
  } = value ? JSON.parse(value) : "";

  useEffect(() => {
    (async () => {
      try {
        await SendbirdLive.init({ appId });
        await SendbirdLive.authenticate(userId, sb_access_token);
      } catch (error) {
        console.error(
          "Error initializing or authenticating Sendbird Live:",
          error
        );
      }
    })();
  }, []);

  const createFirstLiveEvent = async (CURRENT_USER_ID: any) => {
    let liveEvent = null;

    const params = {
      userIdsForHost: [CURRENT_USER_ID],
      type: LiveEventType.LIVE_EVENT_FOR_VIDEO,
      title: "New Event",
      coverUrl: "", // or coverFile: IMAGE_FILE
    };

    try {
      liveEvent = await SendbirdLive.createLiveEvent(params);
    } catch (e) {
      // Handle error.
      console.log(e);
    }
  };
  return {
    createFirstLiveEvent,
  };
};
