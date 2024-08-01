<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Helpers\Helper;
use Cache;
use App\Services\SendBirdChannelService;
use App\Repositories\SendBirdChannelRepository;

class CronController extends Controller
{
    public function getUserOnlineStatus()
    {
        $users = \App\Models\User::whereNotNull('last_seen')->get();
        if (count($users)) {
            foreach ($users as $user) {
                if( Cache::has('user-is-online-' . $user->id) ) {
                    echo 'has==>' . $user->id . '<br>';
                } else {
                    echo 'no==>' . $user->id . '<br>';
                }
            }
        }
    }

    /*
     * Run at every minute
     */
    public function deleteBannedUser() {
        $current_time = (new \DateTime())->format("Y-m-d H:i:s");
        $banned_users = \App\Models\RoomBannedUser::where('is_unlimited_banned', '=', 0)
                ->where('banned_date', '<', $current_time)
                ->get();
        if (count($banned_users)) {
            $sendBirdChannelService= new SendBirdChannelService(new SendBirdChannelRepository());
            $room=\App\Models\Room::find($banned_users->first()->room_id);
            foreach ($banned_users as $b_user) {
                dispatch(function () use ($b_user,$room,$sendBirdChannelService) {
                    $sendBirdChannelService->removeUserFromBanListChannel($b_user,$room->send_bird_channel_url);
                });
                $b_user->delete();
            }
        }
    }

}
