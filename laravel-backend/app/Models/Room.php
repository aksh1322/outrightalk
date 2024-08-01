<?php

namespace App\Models;

use App\Models\File;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Auth;

class Room extends Model
{

    use SoftDeletes;

    protected $table = 'rooms';

    protected $fillable = [
        'text_enabled',
        'video_enabled',
        'voice_enabled',
        'locked_room',
        'room_type_id',
        'group_id',
        'room_category_id',
        'language_id',
        'room_name',
        'topic',
        'banner_url',
        'lockword',
        'admin_code',
        'room_password',
        'post_url',
        'welcome_message',
        'filter_words',
        'is_comma_separated',
        'is_closed',
        'send_bird_channel_url',
        'send_bird_audio_call_room_id',
        'send_bird_video_call_room_id',
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
        'profile_pic',
        'lockword',
        'admin_code',
        'room_password'
    ];

    protected $appends = [
        'room_picture',
        'total_user',
        'type',
        'total_camera_on',
        'total_favourite',
        'total_like',
        'room_settings'
    ];
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }
    public function getListing($srch_params = [], $offset = 0)
    {

        $listing = self::select(
            $this->table . ".*"
        )
            ->addSelect(\DB::raw("IF(crn.customize_name IS NULL, {$this->table}.room_name, crn.customize_name) AS room_name"))
            ->where($this->table . ".is_closed", 0)
            ->leftJoin("customized_room_names as crn", function ($join) use ($srch_params) {
                $join->on("crn.room_id", $this->table . ".id")
                    ->where("crn.user_id", Auth::user()->id);
            })
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['withCount']), function ($q) use ($srch_params) {
                return $q->withCount($srch_params['withCount']);
            })
            ->when(isset($srch_params['my_room']), function ($q) use ($srch_params) {
                return $q->join("room_users", function ($join) use ($srch_params) {
                    $join->on("room_users.room_id", $this->table . ".id")
                        ->where("room_users.user_id", $srch_params['my_room'])
                        ->where("room_users.is_admin", "=", 3);
                })->groupBy($this->table . ".id");
            })
            ->when(isset($srch_params['favourite_room']), function ($q) use ($srch_params) {
                return $q->join("room_favourities", function ($join) use ($srch_params) {
                    $join->on("room_favourities.room_id", $this->table . ".id")
                        ->where("room_favourities.user_id", $srch_params['favourite_room'])
                        ->where("room_favourities.folder_id", $srch_params['folder_id']);
                });
            })
            ->when(isset($srch_params['active_room']), function ($q) use ($srch_params) {
                return $q->join("room_users", function ($join) use ($srch_params) {
                    $join->on("room_users.room_id", $this->table . ".id")
                        ->where("room_users.user_id", $srch_params['active_room'])
                        ->whereNull("room_users.deleted_at");
                });
            })
            ->when(isset($srch_params['room_name']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".room_name", "LIKE", "%{$srch_params['room_name']}%");
            })
            ->when(isset($srch_params['group_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".group_id", "=", $srch_params['group_id']);
            })
            ->when(isset($srch_params['language_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".language_id", "=", $srch_params['language_id']);
            })
            ->when(isset($srch_params['lockword']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".lockword", $srch_params['lockword']);
            })
            ->when(isset($srch_params['admin_code']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".admin_code", $srch_params['admin_code']);
            })
            ->when(isset($srch_params['room_password']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".room_password", $srch_params['room_password']);
            })
            ->when(isset($srch_params['18plus_room']), function ($q) use ($srch_params) {
                if (!$srch_params['18plus_room']) {
                    return $q->whereIn($this->table . ".room_category_id", [2, 3, 5]);
                }
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
            if (isset($srch_params['active_room'])) {
                $listing->orderBy('room_users.id', 'ASC');
            } else {
                $listing->orderBy($this->table . '.id', 'ASC');
            }
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

    public function getTotalUserAttribute()
    {
        return $this->hasMany(RoomUser::class)->whereRoomId($this->id)->count();
    }

    public function getTotalCameraOnAttribute()
    {
        return $this->hasMany(RoomUser::class)->whereRoomId($this->id)->where('is_cemera', 1)->count();
    }

    public function getTotalFavouriteAttribute()
    {
        return $this->hasMany(RoomFavourite::class)->whereRoomId($this->id)->count();
    }

    public function getTotalLikeAttribute()
    {
        return $this->hasMany(RoomLike::class)->whereRoomId($this->id)->count();
    }


    public function getRoomPictureAttribute()
    {
        return File::file($this->profile_pic, 'no-profile.jpg');
    }

    public function roomCategory()
    {
        return $this->hasOne(RoomCategory::class, 'id', 'room_category_id');
    }

    public function roomGroup()
    {
        return $this->hasOne(Group::class, 'id', 'group_id');
    }

    public function joinStatus()
    {
        return $this->hasOne(RoomUser::class, 'room_id', 'id');
    }

    public function roomOwner()
    {
        return $this->hasOne(RoomUser::class, 'room_id', 'id')->with([
            'details' => function ($q) {
                return $q->select('id', 'username');
            }
        ]);
    }

    public function roomOwnerWithTrashed()
    {
        return $this->hasOne(RoomUser::class, 'room_id', 'id')->with([
            'details' => function ($q) {
                return $q->select('id', 'username');
            }
        ])->where('is_admin', 3)->latest()->withTrashed();
    }

    public function opentalkInfo()
    {
        return $this->hasOne(RoomOpentalk::class, 'room_id', 'id');
    }

    public function getRoomSettingsAttribute()
    {
        //return $this->hasOne(RoomSetting::class, 'room_id', 'id');

        $settings = new \App\Models\SiteSettingUserStructure();
        $listings = $settings->getListing([
            'group_name' => 'room',
            'user_id' => \Auth::id()
        ]);

        $roomSettings = null;

        if ($listings) {
            foreach ($listings as $item) {
                if (str_contains($item->key, "_room") || str_contains($item->key, "room_")) {
                    $roomSettings[$item->key] = $item->val;
                }
            }
        }

        //dd($roomSettings);

        return $roomSettings;
    }

    public function isFavourite()
    {
        return $this->hasMany(RoomFavourite::class, 'room_id', 'id');
    }

    public function isLike()
    {
        return $this->hasMany(RoomLike::class, 'room_id', 'id');
    }

    public function isFavorites()
    {
        return $this->hasOne(RoomFavourite::class, 'room_id', 'id');
    }

    public function getTypeAttribute()
    {
        if ($this->text_enabled || $this->video_enabled || $this->voice_enabled) {
            $str = '';
            if ($this->text_enabled) {
                $str .= 'T';
            }
            if ($this->voice_enabled) {
                $str .= 'A';
            }
            if ($this->video_enabled) {
                $str .= 'V';
            }
            return $str;
        } else {
            return null;
        }
    }

    public function profile_pic()
    {
        $entityType = isset(File::$fileType['room']['type']) ? File::$fileType['room']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
            ->where('entity_type', $entityType);
    }

    public function uploadAvatar($data = [], $id, $request)
    {
        $avatar = $data->profile_pic;
        $file = \App\Models\File::upload($request, 'room_pic', 'room', $data->id);

        // if file has successfully uploaded
        // and previous file exists, it will
        // delete old file.
        if ($file && $avatar) {
            \App\Models\File::deleteFile($avatar, true);
        }

        return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $file);
    }

    public function subscriptionInfo()
    {
        return $this->hasOne(UserSubscription::class, 'room_id', 'id')
            ->with(['planInfo', 'priceInfo']);
    }
}
