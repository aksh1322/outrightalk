<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Auth;

class BlockList extends Model {

    protected $table = 'block_lists';

    protected $fillable = [
        'user_id',
        'block_user_id'
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
        'block_user'
    ];

    protected $appends = [
        'block_user'
    ];

    public function getBlockUserAttribute() {
        return User::select('id', 'username','email', 'visible_status', 'is_loggedout')->find($this->block_user_id);
    }

    public function customizeNickname() {
        return $this->hasOne(CustomizeNickname::class, 'for_user_id', 'block_user_id');
    }

    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
                )
                ->when(isset($srch_params['visible_status']), function ($q) {
                    return $q->addSelect('u.visible_status','u.is_loggedout')
                                ->join('users AS u', function ($q) {
                                    $q->on("u.id", $this->table . ".block_user_id");
                                });
                })
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['withCount']), function ($q) use ($srch_params) {
                    return $q->withCount($srch_params['withCount']);
                })
                ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".user_id", "=", $srch_params['user_id']);
                })
                ->when((isset($srch_params['visible_status']) && isset($srch_params['is_loggedout'])), function ($q) use ($srch_params) {
                    if (is_array($srch_params['visible_status'])) {
                        return $q->where(function ($q) use ($srch_params) {
                            $q->whereIn("u.visible_status", $srch_params['visible_status'])
                                ->where("u.is_loggedout", "=", $srch_params['is_loggedout']);
                        });
                    } else {
                        return $q->where(function ($q) use ($srch_params) {
                            $q->where("u.visible_status", "=", $srch_params['visible_status'])
                                ->orWhere("u.is_loggedout", "=", $srch_params['is_loggedout']);
                        });
                    }
                })
                /*->when(isset($srch_params['is_loggedout']), function ($q) use ($srch_params) {
                    if (isset($srch_params['visible_status']) && is_array($srch_params['visible_status'])) {
                        return $q->where("u.is_loggedout", "=", $srch_params['is_loggedout']);
                    } else {
                        return $q->orWhere("u.is_loggedout", "=", $srch_params['is_loggedout']);
                    }
                })*/;

        if (isset($srch_params['block_user_id'])) {
            return $listing->where($this->table . '.block_user_id', '=', $srch_params['block_user_id'])
                    ->first();
        }

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
}
