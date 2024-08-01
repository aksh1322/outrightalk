<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VIPInvitation extends Model
{

    use SoftDeletes;

    protected $table = 'vip_invitations';

    protected $fillable = [
        'email',
        'nickname',
        'user_id',
        'room_id',
        'invitation_code',
        'invited_by',
        'start_at',
        'close_at',
        'expired_at'
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

    protected $appends = [];

    public function getListing($srch_params = [], $offset = 0)
    {

        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['nickname']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".nickname", "=", $srch_params['nickname']);
            })
            ->when(isset($srch_params['email']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".email", "=", $srch_params['email']);
            })
            ->when(isset($srch_params['room_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".room_id", "=", $srch_params['room_id']);
            })
            ->when(isset($srch_params['invitation_code']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".invitation_code", "=", $srch_params['invitation_code']);
            })
            ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".user_id", "=", $srch_params['user_id']);
            })
            ->when(isset($srch_params['invited_by']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".invited_by", "=", $srch_params['invited_by']);
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

    public function user()
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    public function invitedBy()
    {
        return $this->hasOne(User::class, 'id', 'invited_by');
    }

    public function room()
    {
        return $this->hasOne(Room::class, 'id', 'room_id');
    }
}
