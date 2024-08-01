<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Gender extends Model
{
    use SoftDeletes;

    protected $table        = 'genders';
    
    protected $fillable = [
        'status',
        'title'
    ];

    protected $hidden = [
        'created_at',
    	'updated_at',
    	'deleted_at'
    ];

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select($this->table . ".*")            
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
                return $q->with($srch_params['with']);
            });

        if(isset($srch_params['id'])) {
            return $listing->where($this->table . '.id', '=', $srch_params['id'])
                            ->first();
        }
   
        if(isset($srch_params['orderBy'])){
            $this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
            foreach ($this->orderBy as $key => $value) {
                $listing->orderBy($key, $value);
            }
        } else {
            $listing->orderBy($this->table . '.title', 'ASC');
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
		$data 						= null;
        if ($id) {
            $data = $this->getListing(['id' => $id]);

            if(!$data) {
				return \App\Helpers\Helper::resp('Not a valid data', 400);
			}

            $data->update($input);
        } else {
            $data   = $this->create($input);
		}
		
		return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $data);
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
