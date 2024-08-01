<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sticker extends Model {

    use SoftDeletes;

    protected $table = "stickers";

    // protected $fillable = [
    //     'category_id',
    //     'sub_category_id',
    //     'title',
    //     'credit_points',
    //     'width',
    //     'height',
    // ];

    protected $guarded = [
        'id',
    ];


    protected $hidden = [
        'created_at',
        'updated_at',
        'icon_pic'
    ];

    protected $appends = [
        'icon',
        'sticker_type_name',
        //'sticker_packs',
        'sticker_pack_name'
    ];

    public $orderBy = [];

    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
                )
                ->addSelect('sticker_categories.title AS cat_title', 'sticker_categories.type')
                ->join("sticker_categories", function ($q) {
                    $q->on("sticker_categories.id", $this->table . '.category_id');
                })
                // ->addSelect('sticker_packs.title AS pack_title')
                // ->join("sticker_packs", function ($q) {
                //     $q->on("sticker_packs.id", $this->table . '.sticker_pack_id');
                // })
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['title']), function ($q) use ($srch_params) {
                    return $q->whereRaw("{$this->table}.title LIKE '%{$srch_params['title']}%'");
                })
                ->when(isset($srch_params['type']), function ($q) use ($srch_params) {
                    return $q->where(".type", "=", $srch_params['type']);
                })
                ->when(isset($srch_params['category_id']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".category_id", "=", $srch_params['category_id']);
                })
                ->when(isset($srch_params['sub_category_id']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".sub_category_id", "=", $srch_params['sub_category_id']);
                });

        if (isset($srch_params['id'])) {
            // Check if $srch_params['id'] is an array
            if (is_array($srch_params['id'])) {
                return $listing->whereIn($this->table . '.id', $srch_params['id'])->get();
            } else {
                return $listing->where($this->table . '.id', '=', $srch_params['id'])
                    ->first();
            }
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

    public function getFilters()
    {
        $stickerCatObj = new StickerCategory();
        $type = \App\Helpers\Helper::makeSimpleArray($stickerCatObj->types, 'id,name');
        return [
            'reset'  => route('sticker.index'),
            'fields' => [
                'title' => [
                    'type'  => 'text',
                    'label' => 'Sticker Title',
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

    public function uploadIcon($data = [], $id, $request)
    {
        $icon = $data->icon_pic;
        $file   = \App\Models\File::upload($request, 'image', 'sticker_icon', $data->id);

        if ($file) {
            $record = self::find($data->id);
            $raw = self::getImage($record->icon['thumb']);
            $im = imagecreatefromstring($raw);
            $width = imagesx($im);
            $height = imagesy($im);
            $record->update(['width' => $width, 'height' => $height]);
        }

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

    public function getStickerTypeNameAttribute()
    {
        return $this->sticker_type == 1 ? 'In Pack' : 'Single';
    }

    public function getStickerPackNameAttribute()
    {
        return $this->sticker_pack_id !=0 ? $this->stickerpack()->first()->title :'No pack';
    }


    public function stickerpack(){

       return  $this->belongsTo(StickerPack::class,'sticker_pack_id');

    }

    public function icon_pic()
    {
        $entityType = isset(File::$fileType['sticker_icon']['type']) ? File::$fileType['sticker_icon']['type'] : 0;
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

    public function is_buy() {
        return $this->hasOne(StickerBuyUser::class, 'sticker_id', 'id');
    }

    public function is_pack_buy() {
        return $this->hasOne(StickerBuyUser::class, 'sticker_pack_id', 'id');
    }

    public static function getImage($url) {
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $data = curl_exec($curl);
        curl_close($curl);
        return $data;
    }

}
