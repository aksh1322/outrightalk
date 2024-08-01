<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PlayVideo extends Model {
    
    use SoftDeletes;
    
    protected $table = 'play_videos';
    
    protected $fillable = [
        'room_id',
        'user_id',
        'is_accepted',
        'accepted_at'
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
        'video_file',
        'video_thumb_file',
    ];
   
    protected $appends = [        
        'play_video_file',
        'play_video_thumb_file',
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
                })
                ->when(isset($srch_params['is_accepted']), function ($q) use ($srch_params) {
                    return $q->whereIn($this->table . ".is_accepted", $srch_params['is_accepted']);
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
        
        if (isset($srch_params['get_sql']) && $srch_params['get_sql']) {
            return [
                $listing->toSql(),
                $listing->getBindings(),
            ];
        }

        if ($offset) {
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }

    public function getPlayVideoFileAttribute() {
        return File::file($this->video_file, 'no-profile.jpg');
    }
    
    public function getPlayVideoThumbFileAttribute() {
        return File::file($this->video_thumb_file, 'no-profile.jpg');
    }
    
    public function video_file()
    {
        $entityType = isset(File::$fileType['play_video']['type']) ? File::$fileType['play_video']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
                ->where('entity_type', $entityType);
    }
    
    public function video_thumb_file()
    {
        $entityType = isset(File::$fileType['play_video_thumb']['type']) ? File::$fileType['play_video_thumb']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
                ->where('entity_type', $entityType);
    }
    
    public function users() {
        return $this->hasMany(PlayVideoShare::class, 'play_video_id');
    }
}
