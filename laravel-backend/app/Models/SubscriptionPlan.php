<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionPlan extends Model {

    use SoftDeletes;

    protected $table = 'subscription_plans';

    protected $fillable = [
        'type',
        'title',
        'color_title',
        'color_code',
        'room_capacity',
        'ban_limit',
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
    ];

    public $types = [
        0 => [
                'id' => 'room',
                'name' => 'Room',
                'badge' => 'warning'
        ],
        1 => [
                'id' => 'nickname',
                'name' => 'Nickname',
                'badge' => 'success'
        ],
    ];

    protected $appends = [
        'icon',
    ];

    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
            )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['type']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".type", "=", $srch_params['type']);
            })->when(isset($srch_params['plan']) && $srch_params['plan'] != null, function ($q) use ($srch_params) {
                return $q->whereHas('plans',function ($q) use ($srch_params){
                    $q->where('type',$srch_params['plan']);
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

    public function plans() {
        return $this->hasMany(SubscriptionPrice::class, 'subscription_id', 'id');
    }

    public function getFilters()
    {
        $type = \App\Helpers\Helper::makeSimpleArray($this->types, 'id,name');

        return [
            'reset'  => route('subscription.index'),
            'fields' => [
                'type' => [
                    'type'       => 'select',
                    'label'      => 'Type',
                    'attributes' => [
                        'id' => 'select-type',
                    ],
                    'options'    => $type,
                ],
            ],
        ];
    }

    public function uploadIcon($data = [], $id, $request)
    {
        $icon = $data->icon_pic;
        $file   = \App\Models\File::upload($request, 'image', 'subscription_icon', $data->id);

        // if file has successfully uploaded
        // and previous file exists, it will
        // delete old file.
        if ($file && $icon) {
            \App\Models\File::deleteFile($icon, true);
        }
        return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $file);
    }

    public function getIconAttribute()
    {
        return File::file($this->icon_pic, 'no-profile.jpg');
    }

    public function icon_pic()
    {
        $entityType = isset(File::$fileType['subscription_icon']['type']) ? File::$fileType['subscription_icon']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
                ->where('entity_type', $entityType);
    }


    public function store($input = [], $id = 0, $request = null)
    {
        $data = null;
        if ($id) {
            $data = $this->getListing(['id' => $id]);

            if(!$data) {
                return \App\Helpers\Helper::resp('Not a valid data', 400);
            }

            $data->update($input);
        } else {
            $data   = $this->create($input);
        }
        $this->uploadIcon($data, $id, $request);
        return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $data);

    }

    public function remove($id = null)
    {
        $data = $this->getListing([
            'id' => $id,
        ]);

        if (!$data) {
            return \App\Helpers\Helper::resp('Not a valid data', 400);
        }

        $data->delete();
        return \App\Helpers\Helper::resp('Record has been successfully deleted.', 200, $data);
    }
}
