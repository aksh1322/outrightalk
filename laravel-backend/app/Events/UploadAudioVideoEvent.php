<?php

namespace App\Events;

//use Illuminate\Broadcasting\Channel;
//use Illuminate\Broadcasting\InteractsWithSockets;
//use Illuminate\Broadcasting\PresenceChannel;
//use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
//use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Http\Request;

class UploadAudioVideoEvent
{
    //use Dispatchable, InteractsWithSockets, SerializesModels;
    use SerializesModels;

    public $request;
    public $input_file;
    public $entity_ids;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Request $request, $input_file, $entity_ids)
    {
        $this->request = $request;
        $this->input_file = $input_file;
        $this->entity_ids = $entity_ids;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        //return new PrivateChannel('channel-name');
        return [];
    }
}
