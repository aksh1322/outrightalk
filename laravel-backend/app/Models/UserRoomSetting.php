<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRoomSetting extends Model {

    protected $table = "user_room_settings";

    protected $fillable = [
        'user_id',
        'room_id',
        'autoscrool_text',
        'incoming_text_format',
        'timestamp',
        'nickname_alphabetically',
        'disable_dig_sound',
        'notify_join_room',
        'notify_exit_room',
        'notify_start_webcam',
        'notify_stop_webcam',
        'font',
        'change_room_screen',
        'mute_incoming_sound',
        'push_to_talk',
        'lock_mic',
        'font_color',
        'font_family',
        'font_size',
        'text_decoration',
        'font_weight',
        'font_style',
        'save_default_room_settings'
    ];

    protected $hidden = [
        'created_at',
    	'updated_at'
    ];
}