<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoomSubCategory extends Model
{
   use SoftDeletes;

    protected $table = 'room_sub_categories';

    protected $fillable = [
        'categories_id',
        'sub_categories_title'
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

   public function getListing($srch_params = [], $offset = 0) {

        $listing = self::select(
                $this->table . ".*"
                )
                ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                    return $q->with($srch_params['with']);
                })
                ->when(isset($srch_params['sub_categories_title']), function ($q) use ($srch_params) {
                    return $q->where($this->table . ".sub_categories_title", "LIKE", "%{$srch_params['sub_categories_title']}%");
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
