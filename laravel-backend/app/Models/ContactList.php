<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Auth;

class ContactList extends Model
{

    protected $table = 'contact_lists';

    protected $fillable = [
        'user_id',
        'contact_user_id',
        'is_favourite'
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
    ];

    protected $appends = [
        'contact_user',
        'privacy_setting'
    ];

    public function getContactUserAttribute()
    {
        return User::select('id', 'username', 'email', 'visible_status', 'is_loggedout', 'about')->find($this->contact_user_id);
    }

    public function customizeNickname()
    {
        return $this->hasOne(CustomizeNickname::class, 'for_user_id', 'contact_user_id');
    }

    public function isBlock()
    {
        return $this->hasOne(BlockList::class, 'block_user_id', 'contact_user_id');
    }

    public function isBlokedByThem()
    {
        return $this->hasOne(BlockList::class, 'user_id', 'contact_user_id');
    }

    public function getPrivacySettingAttribute()
    {
        $siteSettingObj = new SiteSettingUserStructure();
        return $siteSettingObj->getListing([
            'group_name' => 'privacy',
            'user_id' => $this->contact_user_id
        ]);
    }

    public function isInContact()
    {
        return $this->hasOne(self::class, 'user_id', 'contact_user_id');
    }

    public function firstRoom()
    {
        return $this->hasOne(RoomUser::class, 'user_id', 'contact_user_id')->with([
            'roomDetails' => function ($q) {
                return $q->select("id", "room_name", "group_id")
                    ->with([
                        'subscriptionInfo' => function ($q) {
                            return $q->whereDate("renew_at", ">=", date("Y-m-d H:i"));
                        },
                    ]);
            }
        ]);
    }

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )

            ->when(isset($srch_params['visible_status']), function ($q) {
                return $q->addSelect('u.visible_status', 'u.is_loggedout')
                    ->join('users AS u', function ($q) {
                        $q->on("u.id", $this->table . ".contact_user_id");
                    });
            })

            /*->when(isset($srch_params['settings']), function ($q) use($srch_params) {
                return $q->join('site_setting_users', function ($q) {
                            $q->on("site_setting_users.user_id", $this->table . ".contact_user_id")
                                ->where("site_setting_users.val", 1);
                        })
                        ->join('site_setting_user_structures', function ($q) use($srch_params) {
                            $q->on("site_setting_user_structures.id", "site_setting_users.site_setting_id")
                                ->where("site_setting_user_structures.key", $srch_params['settings']);
                        });
            })*/
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['withCount']), function ($q) use ($srch_params) {
                return $q->withCount($srch_params['withCount']);
            })
            ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".user_id", "=", $srch_params['user_id']);
            })
            ->when(isset($srch_params['is_favourite']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".is_favourite", "=", $srch_params['is_favourite']);
            })
            ->when((isset($srch_params['visible_status']) && isset($srch_params['is_loggedout'])), function ($q) use ($srch_params) {
                if (is_array($srch_params['visible_status'])) {
                    if (is_array($srch_params['is_loggedout'])) {

                        return $q->where(function ($q) use ($srch_params) {
                            $q->whereIn("u.visible_status", $srch_params['visible_status'])
                                ->whereIn("u.is_loggedout", $srch_params['is_loggedout']);
                        });
                    } else {
                        return $q->where(function ($q) use ($srch_params) {
                            $q->whereIn("u.visible_status", $srch_params['visible_status'])
                                ->where("u.is_loggedout", "=", $srch_params['is_loggedout']);
                        });
                    }

                } else {
                    return $q->where(function ($q) use ($srch_params) {
                        $q->where("u.visible_status", "=", $srch_params['visible_status'])
                            ->orWhere("u.is_loggedout", "=", $srch_params['is_loggedout']);
                    });
                }
            })
            // ->when(isset($srch_params['offline']) && $srch_params['offline'] == 0, function ($q) {
            //     return $q->orWhereHas('isBlokedByThem',function($q){
            //          $q->where('block_user_id', Auth::id());
            //     });
            // })
            /*->when(isset($srch_params['offline']) && $srch_params['offline'] == 1, function ($q) {
                return $q->orWhereHas('isBlokedByThem',function($q){
                     $q->where('block_user_id', Auth::id());
                });
            })*/
            /*->when(isset($srch_params['is_loggedout']), function ($q) use ($srch_params) {
                if (isset($srch_params['visible_status']) && is_array($srch_params['visible_status'])) {
                    return $q->where("u.is_loggedout", "=", $srch_params['is_loggedout']);
                } else {
                    return $q->orWhere("u.is_loggedout", "=", $srch_params['is_loggedout']);
                }
            })*/ ;

        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                ->first();
        }

        if (isset($srch_params['count'])) {
            return $listing->count();
        }

        if (isset($srch_params['orderBy'])) {
            if ($srch_params['orderBy'] == 'field') {
                $listing->orderBy(\DB::raw('FIELD(visible_status, "1", "3", "2", "4")'));
            } else {
                $this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
                foreach ($this->orderBy as $key => $value) {
                    $listing->orderBy($key, $value);
                }
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
