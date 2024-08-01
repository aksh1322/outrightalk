<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserCredit extends Model {
    
    use SoftDeletes;
    
    protected $table = "user_credits";
    
    protected $fillable = [
        'user_id',
        'points',
        'point_redeemed',
        'credit_type',
        'process',
        'expire_at'
    ];
    
    protected $hidden = [
        'created_at',
        'updated_at'
    ];
    
}
