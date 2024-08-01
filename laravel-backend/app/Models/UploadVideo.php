<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UploadVideo extends Model {
    
    protected $table = 'upload_videos';
    
    protected $fillable = [
        'room_id',
        'user_id',
        'video_duration',
        'upload_time',
        'video_end_time'
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
        'vdeo_file'
    ];
   
    protected $appends = [
        'video_file'
    ];
   
    public function getListing($srch_params = [], $offset = 0) {
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

    public function getVideoFileAttribute() {
        return File::file($this->vdeo_file, 'no-profile.jpg');
    }
    
    public function vdeo_file()
    {
        $entityType = isset(File::$fileType['upload_video']['type']) ? File::$fileType['upload_video']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
                ->where('entity_type', $entityType);
    }
}
