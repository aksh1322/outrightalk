<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\ChatDetail;

class SendGrabMicCountJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $room_id;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($room_id)
    {
        $this->room_id = $room_id;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {        
        $roomSettingObj = new \App\Models\RoomSetting();
        $settings_value = $roomSettingObj->getListing(['room_id' => $this->room_id]);   
        $param = [
            'allow_mic' => 1,
            'room_id' => $this->room_id
        ];
        if ($settings_value && $settings_value->simultaneous_mics) {
            $count_mic = \App\Models\RoomUser::where(['room_id' => $this->room_id, 'is_mic' => 1])->count();
            if ($settings_value->simultaneous_mics <= $count_mic) {
                $param['allow_mic'] = 0;
            }
        }
        \App\Helpers\Helper::emit($param, 'grabMic');
    }
}
