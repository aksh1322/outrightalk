<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SiteSettingUserStructure extends Model
{

    use SoftDeletes;

    protected $table = 'site_setting_user_structures';

    protected $fillable = [
        'field_type',
        'display_order',
        'key',
        'default_val',
        'field_label',
        'field_help',
        'field_options',
        'group_name'
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
        'deleted_at',
    ];

    protected $appends = [
        'field_type_details',
    ];

    public static $fieldTypes = [
        '1' => 'text',
        '2' => 'textarea',
        '3' => 'email',
        '4' => 'number',
        '5' => 'select',
        '6' => 'radio',
        '7' => 'checkbox',
        '8' => 'password',
        '9' => 'file',
        '10' => 'switch',
    ];

    public function getFieldTypeDetailsAttribute()
    {
        return self::$fieldTypes[$this->field_type];
    }

    public function getFieldOptionsAttribute($value)
    {
        if ($value) {
            return json_decode($value);
        }
        return null;
    }

    public function getListing($srch_params = [], $offset = 0)
    {

        $select = [
            $this->table . ".id AS structure_id",
            $this->table . ".key",
            $this->table . ".field_type",
            $this->table . ".field_label",
            $this->table . ".field_help",
            $this->table . ".field_options",
            $this->table . ".group_name",
            "ssu.id AS user_setting_id"
        ];

        if (isset($srch_params['select'])) {
            $select = $srch_params['select'];//implode(',',$srch_params['select']);
        }

        $listing = self::select($select)
            ->addSelect(\DB::raw("IF(ssu.val IS NULL, {$this->table}.default_val, ssu.val) AS val"))
            ->leftJoin("site_setting_users AS ssu", function ($join) use ($srch_params) {
                $join->on("ssu.site_setting_id", $this->table . ".id")
                    ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                        return $q->where('ssu.user_id', $srch_params['user_id']);
                    })
                    ->when(defined('USER_ID') && USER_ID, function ($q) {
                        return $q->where("ssu.user_id", USER_ID);
                    });
            })
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['group_name']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".group_name", $srch_params['group_name']);
            })
            ->when(isset($srch_params['val']), function ($q) use ($srch_params) {
                return $q->where("val", $srch_params['val']);
            })
            ->when(isset($srch_params['key_in']), function ($q) use ($srch_params) {
                return $q->whereIn($this->table . ".key", $srch_params['key_in']);
            });

        if (isset($srch_params['key'])) {
            return $listing->where($this->table . '.key', '=', $srch_params['key'])
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
            $orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
            foreach ($orderBy as $key => $value) {
                $listing->orderBy($key, $value);
            }
        } else {
            $listing->orderBy($this->table . '.display_order', 'ASC');
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

    public function incoming_pm_file()
    {
        $entityType = isset(File::$fileType['incoming_pm_sound']['type']) ? File::$fileType['incoming_pm_sound']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'user_setting_id')
            ->where('entity_type', $entityType);
    }

    public function incoming_call_file()
    {
        $entityType = isset(File::$fileType['incoming_call_sound']['type']) ? File::$fileType['incoming_call_sound']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'user_setting_id')
            ->where('entity_type', $entityType);
    }

    public function contact_online_file()
    {
        $entityType = isset(File::$fileType['contact_online']['type']) ? File::$fileType['contact_online']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'user_setting_id')
            ->where('entity_type', $entityType);
    }

    public function contact_offline_file()
    {
        $entityType = isset(File::$fileType['contact_offline']['type']) ? File::$fileType['contact_offline']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'user_setting_id')
            ->where('entity_type', $entityType);
    }

    public function receive_invitations_file()
    {
        $entityType = isset(File::$fileType['receive_invitation']['type']) ? File::$fileType['receive_invitation']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'user_setting_id')
            ->where('entity_type', $entityType);
    }
}
