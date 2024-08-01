<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Auth;

class VoiceVideoMessage extends Model {
    
    use SoftDeletes;
    
    protected $table = 'voice_video_messages';
    
    protected $fillable = [
        'from_user_id',
        'to_user_id',
        'type',
        'posted_time',
        'title',
        'is_view'
    ];
    
    public $orderBy = [];
    
    /**
    * The attributes that should be hidden for arrays.
    *
    * @var array
    */
    protected $hidden = [        
        'updated_at',
        'created_at',
        'msg_file',
    ];
    
    protected $appends = [
        'converted_posted_time',
        'message_file'
    ];
    
    public function getListing($srch_params = [], $offset = 0) {
        
        $select = [
            $this->table . ".*"
        ];
        
        if(isset($srch_params['select'])) {
            $select = $srch_params['select'];//implode(',',$srch_params['select']);
        }
        
        $listing = self::select($select)
        ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
            return $q->with($srch_params['with']);
        })
        ->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
            return $q->where($this->table .'.to_user_id', $srch_params['user_id']);
        })
        ->when(isset($srch_params['is_view']), function ($q) use ($srch_params) {
            return $q->where($this->table .'.is_view', $srch_params['is_view']);
        })
        ->when(isset($srch_params['type']), function ($q) use ($srch_params) {
            return $q->where($this->table .'.type', $srch_params['type']);
        })
        ->when(isset($srch_params['current_time']), function ($q) use ($srch_params) {
            return $q->where($this->table .'.posted_time', '<=', $srch_params['current_time']);
        });
        
        if (isset($srch_params['id'])) {
                return $listing->where($this->table . '.id', '=', $srch_params['id'])
                        ->first();
        }

        if (isset($srch_params['count'])) {
                return $listing->count();
        }
        
        if (isset($srch_params['is_deleted'])) {
            $listing->onlyTrashed();
        }

        if (isset($srch_params['orderBy'])) {
            $orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
            foreach ($orderBy as $key => $value) {
                    $listing->orderBy($key, $value);
            }
        } else {
            $listing->orderBy($this->table . '.id', 'DESC');
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
    
    public function fromUser() {
        return $this->hasOne(User::class, 'id', 'from_user_id');
    }
    
    public function getConvertedPostedTimeAttribute(){
        return \App\Helpers\Helper::showdate(\App\Helpers\Helper::convertGMTToLocalTimezone($this->posted_time, Auth::user()->timezone), true);
    }
    
    public function getMessageFileAttribute() {
        return File::file($this->msg_file, 'no-profile.jpg');
    }
    
    public function msg_file()
    {
        $entityType = isset(File::$fileType['audio_video_message']['type']) ? File::$fileType['audio_video_message']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
                ->where('entity_type', $entityType);
    }
}
