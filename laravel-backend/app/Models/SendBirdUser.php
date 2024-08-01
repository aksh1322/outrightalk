<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SendBirdUser extends Model
{
    use HasFactory;

    protected $fillable =['sb_user_id','sb_access_token','expires_at','system_user_id'];

    protected $hidden=['system_user_id'];
}
