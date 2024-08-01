<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserTranslationChar extends Model
{

    use SoftDeletes;

    protected $table = "user_translation_chars";

    protected $fillable = [
        'user_id',
        'chars',
        'redeemed_chars',
        'process'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

}
