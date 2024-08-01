<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Auth;

class NoteBookShare extends Model {
    
    use SoftDeletes;

    protected $table = 'note_book_shares';
    
    protected $fillable = [        
        'notebook_id',
        'share_user_id',
        'is_viewed',
        'is_sharable'
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
    
    public function userdtls() {
        return $this->hasOne(User::class, 'id', 'share_user_id');
    }
}
