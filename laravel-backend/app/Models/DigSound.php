<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
//use Illuminate\Database\Eloquent\SoftDeletes;

class DigSound extends Model
{
    //use SoftDeletes;

    protected $table    = 'dig_sounds';
    
    protected $fillable = [
        'name',
    ];

    protected $hidden = [
        'created_at',
    	'updated_at',
        'dig_sound',
    ];
    
    // for sounds
    protected $appends = [
        'sound',
    ];

    public $orderBy = [];
    
    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
                $this->table . ".*"
            )
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            });

        if(isset($srch_params['id'])){
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                            ->first();
        }
        
        if(isset($srch_params['orderBy'])){
            $this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
            foreach ($this->orderBy as $key => $value) {
                $listing->orderBy($key, $value);
            }
        } else {
            $listing->orderBy($this->table . '.id', 'ASC');
        }

        if($offset){
            $listing = $listing->paginate($offset);
        } else {
            $listing = $listing->get();
        }

        return $listing;
    }

    public function store($input = [], $id = 0, $request = null)
    {
        $data = null;
        if ($id) {
            $data = $this->getListing(['id' => $id]);
            if(!$data) {
                return \App\Helpers\Helper::resp('Not a valid data', 400);
            }
            $data->update($input);
        } else {
            $data   = $this->create($input);
        }
        $this->uploadDigSound($data, $id, $request);	
        return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $data);
    }
    
    public function uploadDigSound($data = [], $id, $request)
    {
        $sound = $data->dig_sound;
        $file   = \App\Models\File::upload($request, 'sound_file', 'dig_sound', $data->id);

        // if file has successfully uploaded
        // and previous file exists, it will
        // delete old file.
        if ($file && $sound) {
            \App\Models\File::deleteFile($sound, true);
        }

        return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $file);
    }
    
    public function getSoundAttribute()
    {
        return File::file($this->dig_sound, 'no-profile.jpg');
    }
    
    public function dig_sound()
    {
        $entityType = isset(File::$fileType['dig_sound']['type']) ? File::$fileType['dig_sound']['type'] : 0;
        return $this->hasOne('App\Models\File', 'entity_id', 'id')
                ->where('entity_type', $entityType);
    }
    
    public function remove($id = null)
    {
        $data = $this->getListing([
            'id'    => $id,
        ]);

        if(!$data) {
            return \App\Helpers\Helper::resp('Not a valid data', 400);
        }

        $data->delete();

        return \App\Helpers\Helper::resp('Record has been successfully deleted.', 200, $data);
    }
}
