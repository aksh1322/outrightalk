<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTemp extends Model {
    
    protected $table = "user_temp";
    
    protected $fillable = [
        'uid',
        'nickname',
        'password',
        'dob',
        'dob_visible',
        'gender',
        'gender_visible',
        'country',
        'country_visible',
        'state',
        'state_visible',
        'email',
        'email_visible',
        'about',
        'about_visible'
    ];

    protected $hidden = [
        'created_at',
    	'updated_at'
    ];
}
