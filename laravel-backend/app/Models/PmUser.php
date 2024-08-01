<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PmUser extends Model
{

    use SoftDeletes;

    protected $table = "pm_users";

    protected $fillable = [
        'pm_id',
        'user_id',
        'joined_by_id',
        'is_admin',
        'is_self',
        'is_added',
        'is_read',
        'is_accept_audio_video',
        'ip_addr',
        'timezone'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    protected $appends = [
        'stream',
    ];

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['pm_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".pm_id", "=", $srch_params['pm_id']);
            })
            ->when(isset($srch_params['is_added']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".is_added", "=", $srch_params['is_added']);
            })
            ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".user_id", "=", $srch_params['user_id']);
            })
            ->when(isset($srch_params['user_id_not']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".user_id", "<>", $srch_params['user_id_not']);
            });

        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])->first();
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

    public function getStreamAttribute()
    {
        return Stream::where('user_id', $this->user_id)->whereNotNull('stream_id')->first();
    }

    public function userInfo()
    {
        return $this->hasOne(User::class, 'id', 'user_id')
            ->with([
                'customizeNickname' => function ($q) {
                    $q->where('user_id', \Auth::user()->id);
                },
            ]);
    }

    // public function user()
    // {
    //     return $this->hasOne(User::class, 'id', 'user_id');
    // }

    public function pmSettings()
    {
        return $this->hasOne(UserPmSetting::class, 'user_id', 'user_id');
    }

    public function pm()
    {
        return $this->belongsTo(Pm::class, 'pm_id', 'id');
    }
}
