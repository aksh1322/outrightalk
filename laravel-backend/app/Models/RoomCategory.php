<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Group;

class RoomCategory extends Model {
    
    use SoftDeletes;

    protected $table = 'room_categories';
    
    protected $fillable = [ 
        'category_title'
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
   public function groups()
   {
       return $this->hasMany(Group::class, 'categories_id');
   }
   
   public function getListing($srch_params = [], $offset = 0) {
        $listing = self::select(
                $this->table . ".*"
                )
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['category_title']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".category_title", "LIKE", "%{$srch_params['category_title']}%");
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

    public function subcategories()
    {
        return $this->hasMany(Group::class, 'category_id', 'id');
    }

}
