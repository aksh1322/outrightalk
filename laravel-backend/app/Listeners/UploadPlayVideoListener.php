<?php

namespace App\Listeners;

use App\Events\UploadPlayVideoEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UploadPlayVideoListener implements ShouldQueue
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  object  $event
     * @return void
     */
    public function handle(UploadPlayVideoEvent $event)
    {
        $convert = \App\Helpers\Helper::convertVideo($event, 'pv');             
        
        if ($convert) {            
            $cdn = \App\Models\Cdn::where("status", 1)->first();
            $play_video = \App\Models\PlayVideo::create([
                'user_id' => $event->user_id,
                'room_id' => $event->room_id,
                'is_accepted' => 0
            ]);

            $file = \App\Models\File::create([
                    'entity_id'          => $play_video->id,
                    'entity_type'        => 11,
                    'cdn_id'             => $cdn->id,
                    'file_name'          => $event->fileName . '.' . $event->fileExt,
                    'file_name_original' => $event->fileNameOriginal,
                    'file_ext'           => $event->fileExt,
                    'file_mime'          => $event->fileMime,
                    'location'           => 'pv',
                    'file_size'          => $event->fileSize,
            ]);

            if ($file) {                
                if (count($event->users)) {                                                           
                    foreach ($event->users as $user) {
                        \App\Models\PlayVideoShare::create([
                            'play_video_id' => $play_video->id,
                            'user_id' => $user
                        ]);
                    }
                    $playVideoObj = new \App\Models\PlayVideo(); 
                    $param['video_info'] = $playVideoObj->getListing(['id' => $play_video->id]);
                    $param['video_info']['users'] = \App\Models\PlayVideoShare::where('play_video_id', $play_video->id)->get();
                    \App\Helpers\Helper::emit($param, 'playVideoChnl');
                }                
            }
        }
    }
}
