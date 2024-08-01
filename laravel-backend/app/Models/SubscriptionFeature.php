<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionFeature extends Model {
    
    protected $table = 'subscription_features';
    
    protected $fillable = [
        'subscription_id',
        'type',
        'value',
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
    ];
}
