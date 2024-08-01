<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StickerCategory extends Model
{

    use SoftDeletes;

    protected $table = "sticker_categories";

    protected $fillable = [
        'pid',
        'title',
        'type',
    ];

    public $types = [
        0 => [
            'id' => 'free',
            'name' => 'Free',
            'badge' => 'warning'
        ],
        1 => [
            'id' => 'credit',
            'name' => 'Credit',
            'badge' => 'success'
        ],
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'icon_pic'
    ];

    protected $appends = [
        'icon',
    ];

    public $orderBy = [];

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['title']), function ($q) use ($srch_params) {
                return $q->whereRaw("{$this->table}.title LIKE '%{$srch_params['title']}%'");
            })
            ->when(isset($srch_params['type']), function ($q) use ($srch_params) {
                if (is_array($srch_params['type'])) {
                    return $q->whereIn($this->table . ".type", $srch_params['type']);
                } else {
                    return $q->where($this->table . ".type", "=", $srch_params['type']);
                }
            })
            ->when(isset($srch_params['pid']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".pid", "=", $srch_params['pid']);
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

    public function getFilters()
    {
        $type = \App\Helpers\Helper::makeSimpleArray($this->types, 'id,name');
        return [
            'reset'  => route('stickercategory.index'),
            'fields' => [
                'title' => [
                    'type'  => 'text',
                    'label' => 'Category Title',
                ],
                'type' => [
                    'type'       => 'select',
                    'label'      => 'Category Type',
                    'attributes' => [
                        'id' => 'select-type',
                    ],
                    'options'    => $type,
                ],
            ],
        ];
    }

    public function store($input = [], $id = 0, $request = null)
    {
        $data = null;
        if ($id) {
            $data = $this->getListing(['id' => $id]);

            if (!$data) {
                return \App\Helpers\Helper::resp('Not a valid data', 400);
            }

            $data->update($input);
        } else {
            $data   = $this->create($input);
        }
        $this->uploadIcon($data, $id, $request);
        return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $data);
    }

    public function uploadIcon($data = [], $id, $request)
    {
        $icon = $data->icon_pic;
        $file   = \App\Models\File::upload($request, 'image', 'sticker_cat_icon', $data->id);

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
        $entityType = isset(File::$fileType['sticker_cat_icon']['type']) ? File::$fileType['sticker_cat_icon']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
            ->where('entity_type', $entityType);
    }

    public function remove($id = null)
    {
        $data = $this->getListing([
            'id'              => $id,
        ]);

        if (!$data) {
            return \App\Helpers\Helper::resp('Not a valid data', 400);
        }

        $data->delete();

        return \App\Helpers\Helper::resp('Record has been successfully deleted.', 200, $data);
    }

    public function children()
    {
        return $this->hasMany(self::class, 'pid');
    }

    public function subcategories()
    {
        return $this->hasMany(Sticker::class, 'category_id', 'id');
    }
}
