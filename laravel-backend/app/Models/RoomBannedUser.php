<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomBannedUser extends Model {
    
    protected $table = 'room_banned_users';
    
    protected $fillable = [
        'room_id',
        'user_id',
        'banned_date',
        'is_unlimited_banned',
        'message', 
        'added_by'
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
    
    protected $appends = [
        'expire_date',
        'ban_date'
    ];
   
    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
                )
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['room_id']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".room_id", "=", $srch_params['room_id']);			
                });        
        
        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                    ->first();
        }

        if (isset($srch_params['count'])) {
                return $listing->count();
        }

        if (isset($srch_params['orderBy'])) {
            $this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
            foreach ($this->orderBy as $key => $value) {
                    $listing->orderBy($key, $value);
            }
        } else {
            $listing->orderBy($this->table . '.id', 'ASC');
        }
        
        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }
    
    public function customizeNickname() {
        return $this->hasOne(CustomizeNickname::class, 'for_user_id', 'user_id');
    }
    
    public function details() {
        return $this->hasOne(User::class, 'id', 'user_id'); 
    }
    
    public function getBanDateAttribute() {
        return \App\Helpers\Helper::showdate($this->created_at, false);
    }
    
    public function getExpireDateAttribute() {
        return \App\Helpers\Helper::showdate($this->banned_date, false);
    }
   
}