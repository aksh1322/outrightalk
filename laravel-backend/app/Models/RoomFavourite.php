<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomFavourite extends Model
{

    protected $table = 'room_favourities';

    protected $fillable = [
        'room_id',
        'user_id',
        'folder_id'
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
            ->when(isset($srch_params['room_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".room_id", "=", $srch_params['room_id']);
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

    public function roomInfo()
    {
        return $this->hasOne(Room::class, 'id', 'room_id');
    }

    // public function folderInfo()
    // {
    //     return $this->hasOne(FavouriteFolder::class, 'id', 'folder_id');
    // }

}
