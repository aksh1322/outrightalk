<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomOpentalk extends Model {
    
    protected $table = 'room_opentalks';
    
    protected $fillable = [
        'room_id',
        'token',
        'session'
    ];
    
    public $orderBy = [];
    
    /**
    * The attributes that should be hidden for arrays.
    *
    * @var array
    */
    protected $hidden = [        
        'updated_at',
        'created_at',
    ];
          
}
