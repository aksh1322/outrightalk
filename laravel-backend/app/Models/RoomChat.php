<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoomChat extends Model {
    
    use SoftDeletes;

    protected $table = 'room_chats';
    
    protected $fillable = [
        'room_id',
        'user_id',
        'chat_body',
        'to_user_id',
        'type'
    ];
    
    public $orderBy = [];
    
    /**
    * The attributes that should be hidden for arrays.
    *
    * @var array
    */
   protected $hidden = [        
        'updated_at',
        'deleted_at',
   ];
   
   protected $appends = [
       'user_details',
       'to_user_details',
       'post_timestamp'
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
                })
                ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                    return $q->where(function ($q) use ($srch_params) {
                            $q->where($this->table . ".user_id", "=", $srch_params['user_id'])
                                ->orWhere(function ($q) use ($srch_params) {
                                    $q->where($this->table . ".to_user_id", "=", $srch_params['user_id'])
                                        ->orWhere($this->table . ".to_user_id", "=", 0);
                                });
                    });			
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
            $listing->orderBy($this->table . '.id', 'DESC');
        }
        
        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }
    
    public function getUserDetailsAttribute() {        
        return User::select('id', 'username', 'first_name', 'last_name')->find($this->user_id);
    }
    
    public function getToUserDetailsAttribute() {
        return User::select('id', 'username', 'first_name', 'last_name')->find($this->to_user_id);
    }

    public function getPostTimestampAttribute() {
        return date("Y-m-d H:i:s", strtotime($this->created_at));
    }
}
