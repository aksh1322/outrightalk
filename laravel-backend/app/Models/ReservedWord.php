<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Auth;

class ReservedWord extends Model {
    
    use SoftDeletes;

    protected $table = 'reserved_words';
    
    protected $fillable = [ 
        'id',       
        'type',
        'words',
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
