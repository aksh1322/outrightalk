<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LocationState extends Model
{
    use SoftDeletes;

    protected $table    = 'location_states';
    
    protected $fillable = [
        'country_id',
        'state_code',
        'status',
        'state_name',
        'timezone'
    ];

    protected $hidden = [
    	'country_id',
    	'updated_at',
    	'deleted_at'
    ];

    public $statuses = [
        0=> [
            'id' => 0,
            'name' => 'Disabled',
            'badge' => 'warning'
        ],
        1=> [
            'id' => 1,
            'name' => 'Enabled',
            'badge' => 'success'
        ],
    ];

    public $orderBy = [];

    public function getFilters($country = 0)
	{
        $status         = \App\Helpers\Helper::makeSimpleArray($this->statuses, 'id,name');
		return [
            'reset' => route('location.countries.states.index', ['country' => $country]),
			'fields' => [
				'state_name'          => [
		            'type'      => 'text',
		            'label'     => 'Name'
		        ],
		        'code'         => [
		            'type'      => 'text',
		            'label'     => 'State code'
		        ],
		        'country'        => [
		            'type'      => 'text',
		            'label'     => 'Country name'
		        ],
                'status'     => [
                    'type'       => 'select',
                    'label'      => 'Status',
                    'attributes' => [
                        'id' => 'select-status',
                    ],
                    'options'    => $status,
                ],
			]
		];
	}

    public function getListing($srch_params = [], $offset = 0)
    {
        $listing = self::select(
                $this->table . ".*",
                'c.country_name'
            )
            ->join("location_countries AS c", function($join){
                $join->on('c.id', $this->table . '.country_id')
                    ->whereNull('c.deleted_at');
            })
            ->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
            ->when(isset($srch_params['state_name']), function($q) use($srch_params){
                return $q->where($this->table . ".state_name", "LIKE", "%{$srch_params['state_name']}%");
            })
            ->when(isset($srch_params['code']), function($q) use($srch_params){
                return $q->where($this->table . ".state_code", "LIKE", "%{$srch_params['code']}%");
            })
            ->when(isset($srch_params['country']), function($q) use($srch_params){
                return $q->where("c.country_name", "LIKE", "%{$srch_params['country']}%");
            })
            ->when(isset($srch_params['status']), function($q) use($srch_params){
                return $q->where($this->table . '.status', '=', $srch_params['status']);
            })
            ->when(isset($srch_params['country_id']), function($q) use($srch_params){
                return $q->where($this->table . '.country_id', '=', $srch_params['country_id']);
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
            $listing->orderBy($this->table . '.state_name', 'ASC');
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
