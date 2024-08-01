<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{

    use SoftDeletes;

    protected $table = "notifications";

    protected $fillable = [
        'from_user_id',
        'to_user_id',
        'type',
        'message',
        'entity_id',
        'group_id',
        'is_accepted',
        'expire_at',
        'notification_for',
        'data'
    ];

    protected $hidden = [
        'updated_at',
    ];

    protected $appends = [
        'formated_date',
    ];

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['to_user_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".to_user_id", "=", $srch_params['to_user_id']);
            })
            ->when(isset($srch_params['is_accepted']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".is_accepted", "=", $srch_params['is_accepted']);
            });

        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                ->first();
        }

        if (isset($srch_params['expire_at']) && isset($srch_params['expire_at_operator'])) {
            $listing->where($this->table . ".expire_at", null)->orWhereDate($this->table . ".expire_at", $srch_params['expire_at_operator'], $srch_params['expire_at'])->get();
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

    public function fromUserInfo()
    {
        return $this->hasOne(User::class, 'id', 'from_user_id');
    }

    public function getFormatedDateAttribute()
    {
        return \App\Helpers\Helper::showdate($this->created_at);
    }
}
