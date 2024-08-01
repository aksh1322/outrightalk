<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pm extends Model
{

    use SoftDeletes;

    protected $table = "pms";

    protected $fillable = [
        'is_initialize',
        'is_initiated_by',
        'tot_user',
        'pm_type',
        'is_video_on',
        'is_voice_on',
        'is_webcam_on',
        'send_bird_channel_url',
        'send_bird_channel_name',
        'send_bird_audio_call_room_id',
        'send_bird_video_call_room_id'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    protected $appends = [
        'users',
        'total_pm_users',
        'opentalk_info',
        'pm_settings'
    ];

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['is_initialize']), function ($q) use ($srch_params) {
                return $q->where('is_initialize', $srch_params['is_initialize']);
            })
            ->when(isset($srch_params['active_pm']), function ($q) use ($srch_params) {
                return $q->join("pm_users", function ($join) use ($srch_params) {
                    $join->on("pm_users.pm_id", $this->table . ".id")
                        ->where("pm_users.user_id", $srch_params['active_pm'])
                        //->where('pm_users.is_read', 1)
                        ->where('pm_users.is_close', 0)
                        ->whereNull("pm_users.deleted_at");
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
            $listing->orderBy($this->table . '.id', 'ASC');
        }

        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }



    public function getUsersAttribute()
    {
        return PmUser::where('pm_id', $this->id)
            ->with([
                'userInfo' => function ($q) {
                    $q->select('id', 'username', 'visible_status', 'is_loggedout');
                }
            ])->get();
    }

    public function getTotalPmUsersAttribute()
    {
        return PmUser::where('pm_id', $this->id)->count();
    }

    public function getOpenTalkInfoAttribute()
    {
        return PmOpentalk::where('pm_id', $this->id)->first();
    }

    public function getPmSettingsAttribute()
    {
        $settings = new \App\Models\SiteSettingUserStructure();
        $listings = $settings->getListing([
            'group_name' => 'room',
            'user_id' => \Auth::id()
        ]);

        $pmSettings = null;

        if ($listings) {
            foreach ($listings as $item) {
                if (str_contains($item->key, "_pm") || str_contains($item->key, "pm_")) {
                    $pmSettings[$item->key] = $item->val;
                }

            }
        }

        return $pmSettings;
    }
}
