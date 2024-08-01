<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UploadVideoEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public $fileName;
    public $fileNameOriginal;
    public $fileExt;
    public $fileMime;
    public $fileSize;
    public $record;
    public $video_duration;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($fileName, $fileNameOriginal, $fileExt, $fileMime, $fileSize, $record, $video_duration)
    {
        $this->fileName = $fileName;
        $this->fileNameOriginal = $fileNameOriginal;
        $this->fileExt = $fileExt;
        $this->fileMime = $fileMime;
        $this->fileSize = $fileSize;
        $this->record = $record;
        $this->video_duration = $video_duration;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('channel-name');
    }
}
