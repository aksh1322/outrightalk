<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

//use Illuminate\Database\Eloquent\SoftDeletes;

class UserCustomizeSound extends Model
{

    //use SoftDeletes;

    protected $table = 'user_customize_sounds';

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
        'customize_sound'
    ];

    protected $appends = [
        'sound',
    ];

    public function getSoundAttribute()
    {
        return File::file($this->customize_sound, 'no-profile.jpg');
    }

    public function customize_sound()
    {
        $entityType = isset(File::$fileType['customize_sound']['type']) ? File::$fileType['customize_sound']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
            ->where('entity_type', $entityType);
    }

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
            $this->table . ".*"
        )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            })
            ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
                return $q->where($this->table . ".user_id", "=", $srch_params['user_id']);
            })
            ->when(isset($srch_params['is_default']), function ($q) use ($srch_params) {
                return $q->orWhere($this->table . ".is_default", "=", $srch_params['is_default']);
            });

        if (isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                ->first();
        }

        if (isset($srch_params['ids'])) {
            return $listing->whereIn($this->table . '.id', $srch_params['ids'])->orWhere($this->table . ".user_id", "=", 0)->get();
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
