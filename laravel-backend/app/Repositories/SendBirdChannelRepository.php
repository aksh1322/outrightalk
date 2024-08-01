<?php

namespace App\Repositories;

use Auth;
use App\Helpers\Helper;
use Illuminate\Support\Facades\Http;

class SendBirdChannelRepository
{

    protected $_HTTP;


    public function __construct()
    {
        $this->_HTTP = app('SendBirdHttp');
    }

    public function getUserPMChannels()
    {

        $response = $this->_HTTP->get('group_channels', [
            'user_id' => 'user123',
        ]);

        if ($response->ok()) {
            return $response->object();
        }

        return [
            'channels' => [],
            'next' => "",
            'ts' => optional($response->object())?->ts ?: now()->timestamp
        ];
    }

    public function createSuperPublicChannel($users, $channelName, $operators = [])
    {

        $channelUrl = str_slug($channelName);

        $params = [
            'user_ids' => $users,
            "name" => $channelName,
            'send_push' => true,
            "channel_url" => $channelUrl,
            "is_distinct" => false,
            "is_super" => true,
        ];

        if (count($operators)) {
            $params['operator_ids'] = $operators;
        }

        $response = $this->_HTTP->post('group_channels', $params);

        info("super channel", [$response->object()]);
        return $response;
    }


    public function createUserPMChannel($users, $type)
    {

        $channelName = implode($users) . '-Single';
        $channelUrl = $channelName . '-' . rand();
        //Helper::getUniqueSlug($channelName, 'pms', 'send_bird_channel_url', true);
        $channelName = str_replace('-', ' ', $channelUrl);

        $response = $this->_HTTP->post('group_channels', [
            'user_ids' => array_unique($users),
            "name" => $channelName,
            'send_push' => true,
            "channel_url" => $channelUrl,
            "custom_type" => $type,
        ]);

        return $response;
    }

    public function createUserPrivateRoom($users, $channelName, $operators = [])
    {

        $channelUrl = str_slug($channelName);

        $params = [
            'user_ids' => $users,
            "name" => $channelName,
            'send_push' => true,
            "channel_url" => $channelUrl,
            "is_distinct" => false,
            'is_ephemeral' => true,
            "custom_type" => 'PrivateRoom',
        ];

        if (count($operators)) {
            $parms['operator_ids'] = $operators;
        }

        $response = $this->_HTTP->post('group_channels', $params);

        info("Private Room channel", [$response->object()]);

        return $response;
    }

    public function addUserToBanListChannel($user_id, $seconds, $channelURL)
    {

        $response = $this->_HTTP->post('group_channels/' . $channelURL . '/ban', [
            'user_id' => $user_id,
            'seconds' => $seconds
        ]);

        info("Ban User in Room channel", [$response->object()]);
        if ($response->ok()) {
            return $response->object();
        }
    }


    public function removeUserFromBanListChannel($user_id, $channelURL)
    {

        $response = $this->_HTTP->DELETE('group_channels/' . $channelURL . '/ban/' . $user_id);

        info("Remove Ban User from Room channel", [$response->object()]);
        if ($response->ok()) {
            return $response->object();
        }
    }


    public function deleteGroupChannel($channelUrl, $room)
    {

        $response = $this->_HTTP->delete('group_channels/' . $channelUrl);

        if ($response->ok() && $room) {
            dispatch(function () use ($room) {
                if ($room->send_bird_audio_call_room_id) {
                    $this->deleteAudioVideoRoom($room->send_bird_audio_call_room_id);
                }

                if ($room->send_bird_video_call_room_id) {
                    $this->deleteAudioVideoRoom($room->send_bird_video_call_room_id);
                }


            })->afterResponse();

            return $response->object();
        }
    }




    public function deleteUserPMChannel($channelUrl, $pm)
    {

        $response = $this->_HTTP->delete('group_channels/' . $channelUrl);


        if ($response->ok() && $pm) {
            dispatch(function () use ($pm) {
                if ($pm->send_bird_audio_call_room_id) {
                    $this->deleteAudioVideoRoom($pm->send_bird_audio_call_room_id);
                }

                if ($pm->send_bird_video_call_room_id) {
                    $this->deleteAudioVideoRoom($pm->send_bird_video_call_room_id);
                }


            })->afterResponse();

            return $response->object();
        }
    }


    // Add User to Channel Normal / Super
    public function addUserToChannel($user_ids, $channelUrl)
    {

        $response = $this->_HTTP->post('group_channels/' . $channelUrl . '/invite', [
            'user_ids' => $user_ids,
        ]);

        info(",func_get_args()", [func_get_args()]);
        info("Add User to channel", [$response->object()]);

        if ($response->ok()) {
            return $response->object();
        }
    }


    public function removeUsersFromChannel($user_ids, $channelUrl)
    {
        $response = $this->_HTTP->put('group_channels/' . $channelUrl . '/leave', [
            'user_ids' => $user_ids,
        ]);

        if ($response->ok()) {
            return $response->object();
        }
    }


    public function getChannelChat($channelUrl, $timestamp = null)
    {

        $response = $this->_HTTP->get('group_channels/' . $channelUrl . '/messages', [
            'message_ts' => $timestamp ?? now()->timestamp
        ]);

        // if($response->ok()){
        return $response->object();
        // }

        // return [
        //     'channels' => [],
        //     'next' => "",
        //     'ts' => optional($response->object())?->ts ?: now()->timestamp
        // ];
    }



    public function createAudioVideoRoom($sourceType, $type = 'video', $customKeys)
    {

        if ($type == 'video') {
            $type = 'small_room_for_video';
        } else {
            $type = 'large_room_for_audio_only';
        }

        $response = Http::withHeaders([
            'Api-Token' => config('services.sendBird.token'),
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->post('https://api-' . config('services.sendBird.key') . '.calls.sendbird.com/v1/rooms', [
                    'type' => $type,
                    'custom_items' => array_merge(["call_type" => $type], $customKeys)
                ]);

        info("Create Room For Audio Video Call", [$response->object()]);
        if ($response->ok()) {
            return $response->object();
        }
    }


    public function deleteAudioVideoRoom($roomID)
    {

        $response = Http::withHeaders([
            'Api-Token' => config('services.sendBird.token'),
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->delete('https://api-' . config('services.sendBird.key') . '.calls.sendbird.com/v1/rooms/' . $roomID);

        info("Delete Room For Audio Video Call", [$response->object()]);
        if ($response->ok()) {
            return $response->object();
        }
    }


    public function updateSendbirdUserDetails($userID, $updateData)
    {

        $response = Http::withHeaders([
            'Api-Token' => config('services.sendBird.token'),
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->put('https://api-' . config('services.sendBird.key') . '.sendbird.com/v3/users/' . $userID, $updateData);

        info("Update user details at sendbird", [$response->object()]);
        if ($response->ok()) {
            return $response->object();
        }
    }


    public function resetMyChatHistory($userID, $channelUrl)
    {
        //dd($channelUrl);
        $response = Http::withHeaders([
            'Api-Token' => config('services.sendBird.token'),
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->put('https://api-' . config('services.sendBird.key') . '.sendbird.com/v3/group_channels/' . $channelUrl . '/reset_user_history', [
                    'user_id' => $userID,
                    //'reset_all' => true
                ]);
        info("Chat history deleted for user", [$response->ok() ? $response->ok() : $response->reason()]);
        if ($response->ok()) {
            return $response->object();
        }
    }

    public function sendMessageToChannel($userID, $channelUrl, $message, $custom_type = null)
    {
        $response = Http::withHeaders([
            'Api-Token' => config('services.sendBird.token'),
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->post('https://api-' . config('services.sendBird.key') . '.sendbird.com/v3/group_channels/' . $channelUrl . '/messages', [
                    'message_type' => 'MESG',
                    'user_id' => $userID,
                    'message' => $message,
                    'custom_type' => $custom_type ? $custom_type : 'normal'
                ]);
        info("Messages sent by user request status", [$response->ok() ? $response->ok() : $response->reason()]);
        if ($response->ok()) {
            return $response->object();
        }
    }


    // public function getUserChannelMessages($channelUrl, $accessToken, $sessionKey) {

    // }
}
