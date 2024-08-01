<?php


namespace App\Services;

use App\Repositories\SendBirdChannelRepository;

class SendBirdChannelService
{


    public function __construct(protected SendBirdChannelRepository $sendBirdRepository)
    {

    }


    public function getUserPm()
    {
        return $this->sendBirdRepository->getUserPMChannels();
    }

    public function getPmChat($channelUrl, $timestamp = null)
    {
        return $this->sendBirdRepository->getChannelChat($channelUrl, $timestamp);
    }

    public function createUserPMChannel($users, $type)
    {
        return $this->sendBirdRepository->createUserPMChannel($users, $type);
    }

    public function deleteUserPMChannel($channelUrl, $pms)
    {
        return $this->sendBirdRepository->deleteUserPMChannel($channelUrl, $pms);
    }

    public function deleteGroupChannel($channelUrl, $room)
    {
        return $this->sendBirdRepository->deleteGroupChannel($channelUrl, $room);
    }


    public function createUserPrivateRoom($users, $channelName, $operators = [])
    {
        return $this->sendBirdRepository->createUserPrivateRoom($users, $channelName, $operators);
    }

    public function createAudioVideoRoom($sourceType, $type, $customKeys)
    {
        return $this->sendBirdRepository->createAudioVideoRoom($sourceType, $type, $customKeys);
    }

    public function createSuperPublicChannel($users, $channelName, $operators = [])
    {
        return $this->sendBirdRepository->createSuperPublicChannel($users, $channelName, $operators);
    }

    public function addUserToBanListChannel($user_id, $seconds, $channelURL)
    {
        return $this->sendBirdRepository->addUserToBanListChannel($user_id, $seconds, $channelURL);
    }

    public function removeUserFromBanListChannel($user_id, $channelURL)
    {
        return $this->sendBirdRepository->removeUserFromBanListChannel($user_id, $channelURL);
    }

    public function addUserToChannel($user_ids, $channelUrl)
    {
        return $this->sendBirdRepository->addUserToChannel($user_ids, $channelUrl);
    }

    public function removeUsersFromChannel(array $user_ids, string $channelUrl)
    {
        return $this->sendBirdRepository->removeUsersFromChannel($user_ids, $channelUrl);
    }

    public function updateSendbirdUserDetails($userID, $updateData)
    {
        return $this->sendBirdRepository->updateSendbirdUserDetails($userID, $updateData);
    }

    public function resetMyChatHistory($userID, $channelUrl)
    {
        return $this->sendBirdRepository->resetMyChatHistory($userID, $channelUrl);
    }

    public function sendMessageToChannel($userID, $channelUrl, $message, $custom_type = null)
    {
        return $this->sendBirdRepository->sendMessageToChannel($userID, $channelUrl, $message, $custom_type);
    }

    // public function getUserChannelMessages($channelUrl, $accessToken, $sessionKey)
    // {
    //     return $this->sendBirdRepository->getUserChannelMessages($channelUrl, $accessToken, $sessionKey);
    // }
}
