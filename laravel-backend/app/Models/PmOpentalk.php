<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PmOpentalk extends Model {
    
    protected $table = 'pm_opentalks';
    
    protected $fillable = [
        'pm_id',
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
