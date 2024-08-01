<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
//use Illuminate\Database\Eloquent\SoftDeletes;

class UserGallery extends Model {

    //use SoftDeletes;

    protected $table = 'user_galleries';

    protected $fillable = [
        'user_id',
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
        'gallery_pic'
    ];

    protected $appends = [
        'gallery',
    ];

    public function getGalleryAttribute() {
        return File::file($this->gallery_pic, 'no-profile.jpg');
    }

    public function gallery_pic()
    {
        $entityType = isset(File::$fileType['user_gallery']['type']) ? File::$fileType['user_gallery']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
                ->where('entity_type', $entityType);
    }

    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
                )
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
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

}
