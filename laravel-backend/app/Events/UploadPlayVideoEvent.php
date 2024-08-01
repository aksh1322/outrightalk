<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UploadPlayVideoEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public $fileName;
    public $fileNameOriginal;
    public $fileExt;
    public $fileMime;
    public $fileSize;
    public $room_id;
    public $users;
    public $user_id;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($fileName, $fileNameOriginal, $fileExt, $fileMime, $fileSize, $room_id, $users, $user_id)
    {
        $this->fileName = $fileName;
        $this->fileNameOriginal = $fileNameOriginal;
        $this->fileExt = $fileExt;
        $this->fileMime = $fileMime;
        $this->fileSize = $fileSize;
        $this->room_id = $room_id;
        $this->users = $users;
        $this->user_id = $user_id;
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
