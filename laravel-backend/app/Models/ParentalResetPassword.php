<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParentalResetPassword extends Model {
    
    protected $table = 'user_parental_reset_passwords';
    
    protected $fillable = [
        'user_id',
        'otp'
    ];
    
    public $orderBy = [];
    
    /**
    * The attributes that should be hidden for arrays.
    *
    * @var array
    */
   protected $hidden = [
        'updated_at',
   ];   
   
}
