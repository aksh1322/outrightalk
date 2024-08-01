<?php

namespace App\Listeners;

use App\Events\UploadVideoEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UploadVideoListener implements ShouldQueue
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
    public function handle(UploadVideoEvent $event)
    {
        $convert = \App\Helpers\Helper::convertVideo($event, 'uv');             
        
        if ($convert) {            
            $cdn = \App\Models\Cdn::where("status", 1)->first();
            $event->record->update([
                'upload_time' => (new \DateTime())->format("Y-m-d H:i:s"), 
                'video_end_time' => (new \DateTime('+' . $event->video_duration . ' seconds'))->format("Y-m-d H:i:s")
            ]);

            $file = \App\Models\File::create([
                    'entity_id'          => $event->record->id,
                    'entity_type'        => 4,
                    'cdn_id'             => $cdn->id,
                    'file_name'          => $event->fileName . '.' . $event->fileExt,
                    'file_name_original' => $event->fileNameOriginal,
                    'file_ext'           => $event->fileExt,
                    'file_mime'          => $event->fileMime,
                    'location'           => 'uv',
                    'file_size'          => $event->fileSize,
            ]);

            if ($file) {                
                $uploadObj = new \App\Models\UploadVideo();
                $data = $uploadObj->getListing(['id' => $event->record->id]);
                $param = $data->toArray();
                $param['current_time'] = (new \DateTime())->format("Y-m-d H:i:s");
                \App\Helpers\Helper::emit($param, 'UploadVideo');                
            }
        }
    }
}
