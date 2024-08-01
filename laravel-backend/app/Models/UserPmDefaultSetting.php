<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPmDefaultSetting extends Model {
    
    protected $table = "user_pm_default_settings";
    
    protected $fillable = [
        'user_id',
        'pm_id',
        'autoscrool_text',        
        'timestamp',
        'disable_dig_sound',        
        'font',
        'change_pm_screen',
        'push_to_talk',
        'lock_mic'
    ];

    protected $hidden = [
        'created_at',
    	'updated_at'
    ];
}
