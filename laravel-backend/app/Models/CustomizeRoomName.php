<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Auth;

class CustomizeRoomName extends Model {
    
    protected $table = 'customized_room_names';
    
    protected $fillable = [
        'user_id',
        'room_id',
        'customize_name'
    ];
    
    public $orderBy = [];
    
    /**
    * The attributes that should be hidden for arrays.
    *
    * @var array
    */
    protected $hidden = [        
        'created_at',
        'updated_at',
        'deleted_at',
    ];

}
