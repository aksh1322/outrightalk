<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class Role extends Authenticatable {
	use HasApiTokens, Notifiable;

	protected $table = 'roles';

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [
		'pid',
		'user_id',
		'title',
		'slug',
		'level',
		'status',
	];

	public $orderBy = [];

	public function getUser() {
		return $this->belongsTo('App\Models\User', 'user_id');
	}

	public function users() {
		return $this->hasMany('App\Models\UserRole', 'role_id', 'id');
	}

	public function permissions() {
		return $this->hasMany('App\Models\PermissionRole', 'rid', 'id');
	}

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
			->when(isset($srch_params['user_id']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".user_id", $srch_params['user_id']);
			})
			->when(isset($srch_params['status']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".status", $srch_params['status']);
			})
			->when(isset($srch_params['level_gt']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".level", ">", $srch_params['level_gt']);
			})
			->when(isset($srch_params['level_gte']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".level", ">=", $srch_params['level_gte']);
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
}
