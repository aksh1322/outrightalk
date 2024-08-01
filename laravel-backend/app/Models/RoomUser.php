<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Auth;

class RoomUser extends Model
{

    use SoftDeletes;

    protected $table = 'room_users';

    protected $fillable = [
        'room_id',
        'user_id',
        'is_admin',
        'is_accepted',
        'red_dot_text',
        'is_mic',
        'red_dot_mic',
        'is_cemera',
        'video_stream_id',
        'red_dot_camera',
        'is_raise_hand',
        'added_by',
        'ip_addr',
        'timezone',
        'audio_stream_id',
        'deleted_at'
    ];

    public $orderBy = [];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        // 'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $appends = [
        'added_on'
    ];

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id', 'id');
    }
    public function allowCreateRoom()
    {
        //$vipRoomCategory = RoomCategory::where('category_title', 'VIP')->first();
        $user = Auth::user();
        /*$check_room_created = self::where($this->table . ".user_id", $user->id)
                ->where($this->table . ".is_admin", 3)
                ->count();*/
        $check_room_created = Room::join($this->table, function ($join) {
            $join->on($this->table . ".room_id", "rooms.id");
        })
            ->where($this->table . ".user_id", $user->id)
            ->where($this->table . ".is_admin", 3)
            //->where('room_category_id', '!=', $vipRoomCategory->id)
            ->where('room_type_id', 1)
            ->count();

        //dd($check_room_created);
        if ($check_room_created) {
            return 0;
        } else {
            return 1;
        }
    }

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['withCount']), function ($q) use ($srch_params) {
                return $q->withCount($srch_params['withCount']);
            })
            ->when(isset($srch_params['room_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".room_id", "=", $srch_params['room_id']);
            })
            ->when(isset($srch_params['is_admin']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".is_admin", "=", $srch_params['is_admin']);
            })
            ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                if (is_array($srch_params['user_id'])) {
                    return $q->whereIn($this->table . ".user_id", $srch_params['user_id']);
                } else {
                    return $q->where($this->table . ".user_id", "=", $srch_params['user_id']);
                }
            })
            ->when(isset($srch_params['user_id_not']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".user_id", "<>", $srch_params['user_id_not']);
            })
            ->when(isset($srch_params['block_user']), function ($q) use ($srch_params) {
                return $q->where(function ($q) use ($srch_params) {
                    $q->whereNotIn('user_id', BlockList::select('user_id')
                        ->where('block_user_id', $srch_params['block_user'])
                        ->get());
                });
            })
            ->when(isset($srch_params['chat_block_user']), function ($q) use ($srch_params) {
                return $q->where(function ($q) use ($srch_params) {
                    $q->whereNotIn('user_id', BlockList::selectRaw("("
                        . "CASE "
                        . "WHEN user_id = " . $srch_params['chat_block_user'] . " THEN block_user_id "
                        . "ELSE user_id "
                        . "END) AS u_id")
                        ->where('user_id', $srch_params['chat_block_user'])
                        ->orWhere('block_user_id', $srch_params['chat_block_user'])
                        ->get());
                });
            })
            ->when(isset($srch_params['chat_ignore_user']), function ($q) use ($srch_params) {
                return $q->where(function ($q) use ($srch_params) {
                    $q->whereNotIn('user_id', RoomIgnore::select("user_id")
                        ->where("ignore_user_id", $srch_params['chat_ignore_user'])
                        ->get());
                });
            })
            ->when(isset($srch_params['left_user']), function ($q) use ($srch_params) {
                return $q->where(function ($q) use ($srch_params) {
                    $q->whereNotIn('user_id', self::select('user_id')
                        ->where('room_id', $srch_params['room_id'])
                        ->get()->makeHidden(['added_on']));
                })
                    ->onlyTrashed()
                    ->take(30)
                    ->groupBy('user_id');
            });

        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                ->first();
        }

        if (isset($srch_params['room_owner'])) {
            return $listing->where($this->table . '.is_admin', 3)
                ->withTrashed()
                ->latest()
                ->first();
        }

        if (isset($srch_params['get_sql']) && $srch_params['get_sql']) {
            return [
                $listing->toSql(),
                $listing->getBindings(),
            ];
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

    public function details()
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    public function addedBy()
    {
        return $this->hasOne(User::class, 'id', 'added_by');
    }

    public function roomDetails()
    {
        return $this->hasOne(Room::class, 'id', 'room_id');
    }


    public function detailsWithTrashed()
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    public function customizeNickname()
    {
        return $this->hasOne(CustomizeNickname::class, 'for_user_id', 'user_id');
    }

    public function whisperChannel()
    {
        return $this->hasOne(WhisperChannel::class, 'to_user_id', 'user_id');
    }

    public function addContactList()
    {
        return $this->hasOne(ContactList::class, 'contact_user_id', 'user_id');
    }

    public function getAddedOnAttribute()
    {
        return \App\Helpers\Helper::showdate($this->created_at);
    }

    public function isBlock()
    {
        return $this->hasOne(BlockList::class, 'block_user_id', 'user_id');
    }

    public function isUploadvideo()
    {
        return $this->hasOne(UploadVideo::class, 'user_id', 'user_id')->latest();
    }

    public function isIgnore()
    {
        return $this->hasOne(RoomIgnore::class, 'ignore_user_id', 'user_id');
    }


}
