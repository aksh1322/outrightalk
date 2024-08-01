<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FavouriteFolder extends Model
{

    protected $table = 'favourite_folders';

    protected $fillable = [
        'pid',
        'folder_name',
        'user_id'
    ];

    public $orderBy = [];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                return $q->whereIn($this->table . ".user_id", $srch_params['user_id']);
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

    //    public function getRecursiveListing($pid = 0, $user_id = []) {
//        $folders = $this->getListing(['pid' => $pid, 'user_id' => $user_id]);
//        dd($folders);
//        if (count($folders)) {
//            foreach ($folders as $folder) {
//                
//            }
//        }
//    }

    // One level child
    public function child()
    {
        return $this->hasMany(FavouriteFolder::class, 'pid');
    }

    // Recursive children
    public function children()
    {
        return $this->hasMany(FavouriteFolder::class, 'pid')->with('children');
    }

    // One level parent
    public function parent()
    {
        return $this->belongsTo(FavouriteFolder::class, 'pid');
    }

    // Recursive parents
    public function parents()
    {
        return $this->belongsTo(FavouriteFolder::class, 'pid')->with('parent');
    }

    public function rooms()
    {
        return $this->hasMany(RoomFavourite::class, 'folder_id', 'id');
    }

}
