<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use PhpParser\Node\Expr\FuncCall;

class Badge extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = "badges";

    protected $guarded = [
        'id',
    ];

    protected $appends = [
        'icon',
    ];

    public $orderBy = [];

    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
                )
                ->addSelect('badge_levels.title AS level_title')
                ->join("badge_levels", function ($q) {
                    $q->on("badge_levels.id", $this->table . '.level_id');
                })
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['level_title']), function ($q) use ($srch_params) {
                    return $q->where("badge_levels.title", "=", $srch_params['level_title']);
                })
                ->when(isset($srch_params['title']), function ($q) use ($srch_params) {
                    return $q->whereRaw("{$this->table}.title LIKE '%{$srch_params['title']}%'");
                })
                ->when(isset($srch_params['level_id']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".level_id", "=", $srch_params['level_id']);
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

    public function getFilters()
    {
        $badgeLevel = new BadgeLevel();
        $type = \App\Helpers\Helper::makeSimpleArray($badgeLevel->get()->toArray(), 'title,title');

        // $stickerCatObj = new StickerCategory();
        // $type = \App\Helpers\Helper::makeSimpleArray($stickerCatObj->types, 'id,name');
        // return $type ;

        return [
            'reset'  => route('badge.index'),
            'fields' => [
                'title' => [
                    'type'  => 'text',
                    'label' => 'Badge Title',
                ],
                'level_title' => [
                    'type'       => 'select',
                    'label'      => 'Level',
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
        $file   = \App\Models\File::upload($request, 'image', 'badge_icon', $data->id);

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

    public function icon_pic()
    {
        $entityType = isset(File::$fileType['badge_icon']['type']) ? File::$fileType['badge_icon']['type'] : 0;
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

    // public function is_buy() {
    //     return $this->hasOne(StickerBuyUser::class, 'sticker_id', 'id');
    // }
    public static function getImage($url) {
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $data = curl_exec($curl);
        curl_close($curl);
        return $data;
    }


    public function next(){
        // get next badge
        return self::where('id', '>', $this->id)->orderBy('id','asc')->first();

    }


    public function previous(){
        // get previous badge
        return self::where('id', '<', $this->id)->orderBy('id','desc')->first();

    }

    public function level(){

        return $this->belongsTo(BadgeLevel::class,'level_id');

    }

}
