<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ReceieveRoomGiftNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $room_id;
    protected $users;
    protected $sticker_id;
    protected $login_user;


    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($room_id, $users, $sticker_id, $login_user)
    {
        $this->room_id = $room_id;
        $this->users = $users;
        $this->sticker_id = $sticker_id;
        $this->login_user = $login_user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {        
        $room_id = $this->room_id;
        $roomUserObj = new \App\Models\RoomUser();
        $room_users = $roomUserObj->getListing([
            'room_id' => $room_id,
            'user_id_not' => $this->login_user->id
        ]);                
        $room_users = count($room_users) ? $room_users->pluck('user_id')->toArray() : [];
        $chatdtls = $data = [];
        
        if (count($this->users)) {
            foreach ($this->users as $gu) {
                $to_user = (int)$gu;
                $to_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                        ->where(['for_user_id' => $gu, 'user_id' => $this->login_user->id])
                        ->first();                            
                $record = \App\Models\Notification::create([
                    'from_user_id' => $gu,
                    'to_user_id' => $this->login_user->id,
                    'type' => 'gift',
                    'message' => (($to_customized_nickname) ? $to_customized_nickname->nickname : $this->login_user->username) . ' has sent a gift to you.',
                ]);
                $data['user'][] = $record;
            }
        }
        \App\Helpers\Helper::emit($chatdtls, 'chatMessage');
        \App\Helpers\Helper::emit($data, 'Invite');
    }
}
