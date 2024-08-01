<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
	protected $table = 'site_contents';

    protected $fillable = [
        'slug',
		'type',
        'title',
        'short_description',
        'long_description',
        'meta_title',
        'meta_keyword',
        'meta_description'
    ];

    public $orderBy = [];

    public function getListing($srch_params = [], $offset = 0) {
		$listing = self::select(
				$this->table . ".*"
			)
			->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
			->when(isset($srch_params['title']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".title", "LIKE", "%{$srch_params['title']}%");
			})
			->when(isset($srch_params['type']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".type", $srch_params['type']);
			});

		if (isset($srch_params['slug'])) {
			return $listing->where($this->table . '.slug', '=', $srch_params['slug'])
				->first();
		}
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
			$listing->orderBy($this->table . '.id', 'DESC');
		}

		if ($offset) {
			$listing = $listing->paginate($offset);
		} else {
			$listing = $listing->get();
		}

		return $listing;
	}

	public function store($input = [], $id = 0, $request = null)
	{
		// if seo not given then, it will get from
        // title and short description
        $input['meta_title']       	= !$input['meta_title'] ? $input['title'] : $input['meta_title'];
        $input['meta_keyword']     	= !$input['meta_keyword'] ? $input['short_description'] : $input['meta_keyword'];
        $input['meta_description'] 	= !$input['meta_description'] ? $input['short_description'] : $input['meta_description'];
		$data 						= null;
        if ($id) {
            $data = $this->getListing(['id' => $id]);

            if(!$data) {
				return \App\Helpers\Helper::resp('Not a valid data', 400);
			}

            $data->update($input);
        } else {
            $input['slug'] = \App\Helpers\Helper::getcleanurl($input['title']);
            $data   = $this->create($input);
		}
		
		return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $data);
	}

}
