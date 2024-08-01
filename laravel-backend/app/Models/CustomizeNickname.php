<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Auth;

class CustomizeNickname extends Model {
    
    protected $table = 'customize_nicknames';
    
    protected $fillable = [
        'user_id',
        'for_user_id',
        'nickname'
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
