<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\RoomCategory;

class Group extends Model {
    
    use SoftDeletes;

    protected $table = 'groups';
    
    protected $fillable = [
        'group_name',
        'group_type',
        'color_code',
        'categories_id',
        'status'
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
   
    protected $appends = [
        'total_room',
    ];
    public function roomCategory()
    {
        return $this->belongsTo(RoomCategory::class, 'categories_id');
    }
    public function rooms()
    {
        return $this->hasMany(Room::class, 'group_id');
    }
    public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
                )
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['group_name']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".group_name", "LIKE", "%{$srch_params['group_name']}%");
                })
                ->when(isset($srch_params['status']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".status", $srch_params['status']);
                })
                ->when(isset($srch_params['group_type']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".group_type", $srch_params['group_type']);
                })
                ->when((isset($srch_params['room_name']) || 
                        isset($srch_params['language_id'])), function ($q) use ($srch_params) {
                    return $q->join("rooms AS r", function ($join) use ($srch_params) {
                        $join->on("r.group_id", $this->table . ".id");
                    });
                })
                ->when(isset($srch_params['room_name']), function ($q) use ($srch_params) {
                    return $q->where("r.room_name", "LIKE", "%{$srch_params['room_name']}%");			
                })
                ->when(isset($srch_params['language_id']), function ($q) use ($srch_params) {
                    return $q->where("r.language_id", "=", $srch_params['language_id']);			
                })
                ->when(isset($srch_params['category_type']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".categoty_type", "=", $srch_params['category_type']);			
                })
                ->when(isset($srch_params['18plus_room']), function ($q) use ($srch_params) {   
                    if (!$srch_params['18plus_room']) {
                        return $q->where($this->table . ".categoty_type", 0);   
                    }                                         
                });
        $listing->groupBy($this->table . ".id");
        
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
    
    public function getTotalRoomAttribute() {
        return $this->hasMany(Room::class)->where(['is_closed' => 0])->whereGroupId($this->id)->count();
    }

}
