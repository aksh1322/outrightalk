<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAutoReplyMessage extends Model {
    
    protected $table = 'user_auto_reply_messages';
    
    protected $fillable = [
        'user_id',
        'message'
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
    
    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
        )        
        ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
            return $q->where($this->table . ".user_id", $srch_params['user_id']);
        });

        if (isset($srch_params['id'])) {
                return $listing->where($this->table . '.id', '=', $srch_params['id'])
                        ->first();
        }

        if (isset($srch_params['count'])) {
                return $listing->count();
        }

        if (isset($srch_params['orderBy'])) {
            $orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
            foreach ($orderBy as $key => $value) {
                    $listing->orderBy($key, $value);
            }
        } else {
            $listing->orderBy($this->table . '.id', 'ASC');
        }

        if (isset($srch_params['get_sql']) && $srch_params['get_sql']) {
            return [
                    $listing->toSql(),
                    $listing->getBindings(),
            ];
        }

        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }
}
