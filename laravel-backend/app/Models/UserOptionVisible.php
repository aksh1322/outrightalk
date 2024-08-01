<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserOptionVisible extends Model {
    
    protected $fillable = [
        'user_id',
        'key',
        'value'
    ];

    protected $hidden = [
        'created_at',
    	'updated_at'
    ];
}
