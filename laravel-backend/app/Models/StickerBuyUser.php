<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StickerBuyUser extends Model {

    use SoftDeletes;

    protected $table = "sticker_buy_users";

    protected $fillable = [
        'sticker_id',
        'title',
        'credit_points',
        'user_id',
        'is_gifted',
        'sticker_pack_id'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'icon_pic'
    ];

    protected $appends = [
        'icon',
        // 'width',
        // 'height'
    ];

    public $orderBy = [];

    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
                )
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['title']), function ($q) use ($srch_params) {
                    return $q->whereRaw("{$this->table}.title LIKE '%{$srch_params['title']}%'");
                })
                ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".user_id", "=", $srch_params['user_id']);
                });

        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                    ->first();
        }

        if (isset($srch_params['count'])) {
                return $listing->count();
        }
        // if (isset($srch_params['sticker_pack_id'])) {
        //         return $listing->whereNotNull('sticker_pack_id')->groupBy('sticker_pack_id')->get();
        // }

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

    public function getIconAttribute()
    {
        return File::file($this->icon_pic, 'no-profile.jpg');
    }

    public function stickerInfo(){

        return $this->belongsTo(Sticker::class,'sticker_id');

    }

    public function  packInfo(){

        return $this->belongsTo(StickerPack::class,'sticker_pack_id');

    }

    // public function getWidthAttribute()
    // {

    //     return $this->stickerInfo();

    // }

    // public function getHeightAttribute()
    // {

    //     return $this->stickerInfo();

    // }

    public function icon_pic()
    {
        $entityType = isset(File::$fileType['sticker_icon']['type']) ? File::$fileType['sticker_icon']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'sticker_id')
                ->where('entity_type', $entityType);
    }
}
