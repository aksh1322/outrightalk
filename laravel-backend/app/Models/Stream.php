<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stream extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'pm_id',
        'stream_id'
    ];

    protected $hidden = [
        'created_at',
    	'updated_at',
    	//'user_id',
    	'pm_id',
    	'id',
    ];
}
