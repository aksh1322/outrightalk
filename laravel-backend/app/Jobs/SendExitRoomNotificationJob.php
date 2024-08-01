<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendExitRoomNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $room_id;
    protected $user;


    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($room_id, $user)
    {
        $this->room_id = $room_id;
        $this->user = $user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {        
        $room_id = $this->room_id;
        $room_users = \App\Models\RoomUser::select('room_users.user_id')
            ->join('user_room_settings', function ($join) use ($room_id) {
                $join->on("user_room_settings.user_id", "room_users.user_id")
                    ->where('notify_exit_room', 1)
                    ->where('user_room_settings.room_id', $room_id);
            })                
            ->where('room_users.room_id', $room_id)->get();
        $chatdtls = [];
        if (count($room_users)) {
            $cdn = \App\Models\Cdn::where("status", 1)->first();
            $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
            foreach ($room_users as $u) {
                $file_name = "c_" . $room_id . "_" . $u->user_id . ".json";  
                $customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                        ->where(['for_user_id' => $this->user->id, 'user_id' => $u->user_id])
                        ->first();
                $chat_array = [
                    'room_id' => $room_id,
                    'chat_body' => (($customized_nickname) ? $customized_nickname->nickname : $this->user->username) . ' has just left the room.',
                    'to_user_id' => 0,
                    'type' => 'exit',
                    'user_id' => $this->user->id,
                ];
                if (file_exists(public_path($file_path) . $file_name)) {
                    $inp = file_get_contents(public_path($file_path) . $file_name);
                    $tempArray = json_decode($inp, true); 
                    array_push($tempArray, $chat_array);                    
                    $jsonData = json_encode($tempArray);                    
                    file_put_contents(public_path($file_path) . $file_name, $jsonData);
                    $chat_array['view_user_id'] = $u->user_id;
                    array_push($chatdtls, $chat_array);
                } else {                            
                    $fp = fopen(public_path($file_path) . $file_name, 'w');
                    $tempArray = [];
                    array_push($tempArray, $chat_array);
                    fwrite($fp, json_encode($tempArray));
                    fclose($fp);
                    $chat_array['view_user_id'] = $u->user_id;
                    array_push($chatdtls, $chat_array);
                }
            }
        }
        \App\Helpers\Helper::emit($chatdtls, 'chatMessage');
    }
}
