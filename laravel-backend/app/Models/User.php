<?php

namespace App\Models;

use App\Models\File;
use App\Helpers\Helper;
use Hash;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Passport\HasApiTokens;
use App\Models\RoomUser;
use App\Models\RoomCategory;

class User extends Authenticatable
{
	use HasApiTokens, Notifiable, SoftDeletes;

	protected $table = 'users';

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [
		'username',
		'first_name',
		'last_name',
		'email',
		'phone',
		'password',
		'remember_token',
		'otp',
		'status', // 0 = inactive and email unverified, 1 = active, 2 = inactive and email verified, 3 = user rejected by admin
		'verified',
		'visible_status',
		'prev_visible_status',
		'is_loggedout',
		'login_attempt',
		'dob',
		'gender',
		'country',
		'state',
		'about',
		'question',
		'answer',
		'last_seen',
		'ip_addr',
		'timezone',
		'curr_loc_lat',
		'curr_loc_lon'
	];

	public $statuses = [
		0 => [
			'id' => 0,
			'name' => 'Pending email verification',
			'badge' => 'warning'
		],
		1 => [
			'id' => 1,
			'name' => 'Approved',
			'badge' => 'success'
		],
		2 => [
			'id' => 2,
			'name' => 'Deactivated',
			'badge' => 'danger'
		],
		//		3=> [
//			'id' => 3,
//			'name' => 'Rejected',
//			'badge' => 'secondary'
//		],
//		4=> [
//			'id' => 3,
//			'name' => 'Blocked',
//			'badge' => 'secondary'
//		],
	];

	/**
	 * The attributes that should be hidden for arrays.
	 *
	 * @var array
	 */
	protected $hidden = [
		// 'email',
		'first_name',
		'last_name',
		'email_verified_at',
		'role_title',
		'password',
		'remember_token',
		'created_at',
		'updated_at',
		'deleted_at',
		'profile_pic',
		'visible_option',


		// hide attributes
		'visible_option',
		'all_subscribtions',
		'all_room_subscribtions',
		'profile_display_preference',
		'show_typing_pm_preference',
		'isVipOwner',
		'auto_reply_message',
		'is_set_parental',
		//'current_translation_language',
		'alerts_and_sounds',
		'user_badge'
	];





	/**
	 * The attributes that should be cast to native types.
	 *
	 * @var array
	 */
	protected $casts = [
		'email_verified_at' => 'datetime',
	];

	// for avatar
	protected $appends = [
		'avatar',
		//'full_name',
		'visible_option',
		'date_of_birth',
		'gender_name',
		'country_name',
		'is_subscribed',
		'all_subscribtions',
		'all_room_subscribtions',
		'profile_display_preference',
		'show_typing_pm_preference',
		'isVipOwner',
		'auto_reply_message',
		'is_set_parental',
		'current_translation_language',
		'alerts_and_sounds',
		'user_badge'
	];

	public static $passwordValidator = [
		'required',
		'min:8',
		'max:16',
		'regex:/[a-z]/',        // must contain at least one lowercase letter
		'regex:/[A-Z]/',        // must contain at least one uppercase letter
		'regex:/[0-9]/',        // must contain at least one digit
		'regex:/[@$!%*#?&]/'   // must contain a special character
	];

	public static $passwordRequirementText = 'Password must contain 8-16 characters in length, one lowercase letter, one uppercase letter, one digit and a special character(@$!%*#?&).';

	public $orderBy = [];

	public function getFilters()
	{
		$roleModel = new \App\Models\Role();
		$userMinRole = $this->myRoleMinLevel(\Auth::user()->id);
		$roles = $roleModel->getListing([
			'level_gte' => $userMinRole,
			'orderBy' => 'roles__level',
		])
			->pluck('title', 'slug')
			->all();
		$status = \App\Helpers\Helper::makeSimpleArray($this->statuses, 'id,name');
		return [
			'reset' => route('users.index'),
			'fields' => [
				'full_name' => [
					'type' => 'text',
					'label' => 'Name',
				],
				'email' => [
					'type' => 'text',
					'label' => 'Email',
				],
				'phone' => [
					'type' => 'text',
					'label' => 'Phone',
				],
				'role' => [
					'type' => 'select',
					'label' => 'Role',
					'options' => $roles,
				],
				'status' => [
					'type' => 'select',
					'label' => 'Status',
					'attributes' => [
						'id' => 'select-status',
					],
					'options' => $status,
				],
				'created_at' => [
					'type' => 'date',
					'label' => 'Created At',
				],
			],
		];
	}

	public function sendBirdUser()
	{
		return $this->hasOne(SendBirdUser::class, 'system_user_id')->withDefault([
			'sb_user_id' => null,
			'sb_access_token' => null,
			'expires_at' => null
		]);
	}

	public function getFullNameAttribute()
	{
		return $this->first_name . ' ' . $this->last_name;
	}

	public function getAvatarAttribute()
	{
		return File::file($this->profile_pic, 'no-profile.jpg');
	}

	public function getVisibleOptionAttribute()
	{
		return UserOptionVisible::where('user_id', $this->id)
			->get()->makeHidden(['id', 'user_id']);
	}

	public function profile_pic()
	{
		$entityType = isset(File::$fileType['user_avatar']['type']) ? File::$fileType['user_avatar']['type'] : 0;
		return $this->hasOne('App\Models\File', 'entity_id', 'id')
			->where('entity_type', $entityType);
	}

	/*public function getAppointmentAttribute() {
																																																																																																																																																																																													$appo = [];
																																																																																																																																																																																													foreach ($this->appointments as $key => $value) {
																																																																																																																																																																																														$appo[] = File::file($value);
																																																																																																																																																																																													}
																																																																																																																																																																																													return $appo;
																																																																																																																																																																																												}

																																																																																																																																																																																												public function appointments() {
																																																																																																																																																																																													return $this->hasMany('App\Models\File', 'entity_id', 'id')
																																																																																																																																																																																														->where('entity_type', 2);
																																																																																																																																																																																												}
																																																																																																																																																																																											*/

	public function verifyUser()
	{
		return $this->hasOne('App\Models\VerifyUser');
	}

	public function roles()
	{
		// return $this->hasMany('App\Models\UserRole');
		return $this->belongsToMany('App\Models\Role', 'user_roles');
	}

	public function secretQuestion()
	{
		return $this->hasOne(SecretQuestion::class, 'id', 'question');
	}

	public function AauthAcessToken()
	{
		return $this->hasMany('\App\Models\OauthAccessToken');
	}

	public function getFindUserListing($srch_params = [], $offset = 0)
	{
		$select = [
			$this->table . ".*",
			"r.title AS role_title",
		];

		if (isset($srch_params['select'])) {
			$select = $srch_params['select'];
		}

		$listing = self::select($select)
			->addSelect(\DB::raw("timestampdiff( YEAR, dob, now()) AS age"))
			->addSelect(\DB::raw("IF(cn.nickname IS NULL, {$this->table}.username, cn.nickname) AS nickname"))
			->leftJoin("customize_nicknames as cn", function ($join) use ($srch_params) {
				$join->on("cn.for_user_id", $this->table . ".id")
					->where("cn.user_id", $srch_params['not_user']);
			})
			->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
			->join("user_roles AS ur", function ($join) {
				$join->on($this->table . ".id", "ur.user_id");
			})
			->join("roles AS r", function ($join) {
				$join->on("r.id", "ur.role_id");
			})
			->when(isset($srch_params['role_slug']), function ($q) use ($srch_params) {
				return $q->where('r.slug', $srch_params['role_slug']);
			})
			->when(isset($srch_params['role']), function ($q) use ($srch_params) {
				return $q->where("r.slug", $srch_params['role']);
			})
			->when(isset($srch_params['not_user']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".id", '<>', $srch_params['not_user']);
			})
			// ->when(isset($srch_params['block_user']), function ($q) use ($srch_params) {
			//     return $q->where(function ($q) use ($srch_params) {
			//                 $q->whereNotIn($this->table . ".id", BlockList::selectRaw("("
			//                         . "CASE "
			//                         . "WHEN user_id = " . $srch_params['block_user'] . " THEN block_user_id "
			//                         . "ELSE user_id "
			//                         . "END) AS u_id")
			//                         ->where('user_id', $srch_params['block_user'])
			//                         ->orWhere('block_user_id', $srch_params['block_user'])
			//                         ->get());
			//     });
			// })
			->when(isset($srch_params['nickname']), function ($q) use ($srch_params) {
				return $q->havingRaw("nickname LIKE '%{$srch_params['nickname']}%'");
			})
			->when(isset($srch_params['email']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".email", $srch_params['email']);
			})
			->when((isset($srch_params['age']) && isset($srch_params['max_age'])), function ($q) use ($srch_params) {
				return $q->havingRaw("(age >= '{$srch_params['age']}' AND age <= '{$srch_params['max_age']}')");
			}, function ($q) use ($srch_params) {
				if (isset($srch_params['age'])) {
					return $q->having('age', '>=', $srch_params['age']);
				}
			})
			->when(isset($srch_params['country']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".country", $srch_params['country']);
			})
			->when(isset($srch_params['gender']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".gender", $srch_params['gender']);
			})
			->when(isset($srch_params['settings']), function ($q) use ($srch_params) {
				return $q->join('site_setting_users', function ($q) {
					$q->on("site_setting_users.user_id", $this->table . ".id")
						->where("site_setting_users.val", 1);
				})
					->join('site_setting_user_structures', function ($q) use ($srch_params) {
						$q->on("site_setting_user_structures.id", "site_setting_users.site_setting_id")
							->where("site_setting_user_structures.key", $srch_params['settings']);
					});
			})
			->when(isset($srch_params['has_lat_lon']), function ($q) use ($srch_params) {
				return $q->whereNotNull($this->table . ".curr_loc_lat")
					->whereNotNull($this->table . ".curr_loc_lon");
			})
			->when((isset($srch_params['current_lat'])
				&& isset($srch_params['current_lon'])
				&& (isset($srch_params['radius']) && $srch_params['radius'])), function ($q) use ($srch_params) {
					return $q->selectRaw("( 3956 * acos( cos( radians(?) ) * "
						. "cos( radians( " . $this->table . ".curr_loc_lat ) ) "
						. "* cos( radians( " . $this->table . ".curr_loc_lon ) - radians(?) "
						. ") + sin( radians(?) ) * "
						. "sin( radians( " . $this->table . ".curr_loc_lat ) ) ) ) "
						. "AS distance", [$srch_params['current_lat'], $srch_params['current_lon'], $srch_params['current_lat']])
						->having("distance", "<", $srch_params['radius']);
				});

		if (isset($srch_params['count'])) {
			return $listing->get()->count();
		}

		if (isset($srch_params['orderBy'])) {
			$this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
			foreach ($this->orderBy as $key => $value) {
				$listing->orderBy($key, $value);
			}
		} else {
			$listing->orderBy('id', 'ASC');
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

		if ($listing != null && $listing->isEmpty()) {
			$listing = [];
		}

		return $listing;
	}

	public function getListing($srch_params = [], $offset = 0)
	{
		$select = [
			$this->table . ".*",
			"r.title AS role_title",
			"r.id AS role_id",
		];

		if (isset($srch_params['select'])) {
			$select = $srch_params['select'];//implode(',',$srch_params['select']);
		}

		$listing = self::select($select)
			->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
			->addSelect(\DB::raw("CONCAT({$this->table}.first_name, ' ', {$this->table}.last_name) AS full_name"))
			->join("user_roles AS ur", function ($join) {
				$join->on($this->table . ".id", "ur.user_id");
			})
			->join("roles AS r", function ($join) {
				$join->on("r.id", "ur.role_id");
			})
			->when(isset($srch_params['role_slug']), function ($q) use ($srch_params) {
				return $q->where('r.slug', $srch_params['role_slug']);
			})
			->when(isset($srch_params['id_gte']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".id", ">=", $srch_params['id_gte']);
			})
			->when(isset($srch_params['name']), function ($q) use ($srch_params) {
				return $q->whereRaw("{$this->table}.first_name LIKE '{$srch_params['name']}%'");
			})
			->when(isset($srch_params['full_name']), function ($q) use ($srch_params) {
				return $q->whereRaw("CONCAT({$this->table}.first_name, ' ', {$this->table}.last_name) LIKE '%{$srch_params['full_name']}%'");
			})
			->when(isset($srch_params['email']), function ($q) use ($srch_params) {
				return $q->whereRaw("{$this->table}.email LIKE '%{$srch_params['email']}%'");
			})
			->when(isset($srch_params['account_email']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".email", $srch_params['account_email'])
					->withTrashed();
			})
			->when(isset($srch_params['role']), function ($q) use ($srch_params) {
				return $q->where("r.slug", $srch_params['role']);
			})
			->when(isset($srch_params['role_gte']), function ($q) use ($srch_params) {
				return $q->where("r.level", ">=", $srch_params['role_gte']);
			})
			->when(isset($srch_params['created_at']), function ($q) use ($srch_params) {
				return $q->whereDate($this->table . ".created_at", $srch_params['created_at']);
			})
			->when(isset($srch_params['status']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".status", $srch_params['status']);
			})
			->when(isset($srch_params['not_user']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".id", '<>', $srch_params['not_user']);
			})
			->when(isset($srch_params['settings']), function ($q) use ($srch_params) {
				return $q->join('site_setting_users', function ($q) {
					$q->on("site_setting_users.user_id", $this->table . ".id")
						->where("site_setting_users.val", 1);
				})
					->join('site_setting_user_structures', function ($q) use ($srch_params) {
						$q->on("site_setting_user_structures.id", "site_setting_users.site_setting_id")
							->where("site_setting_user_structures.key", $srch_params['settings']);
					});
			});

		if (isset($srch_params['username'])) {
			return $listing->where($this->table . '.username', '=', $srch_params['username'])
				->first();
		}
		if (isset($srch_params['id'])) {
			return $listing->where($this->table . '.id', '=', $srch_params['id'])
				->first();
		}

		if (isset($srch_params['count'])) {
			return $listing->get()->count();
		}

		if (isset($srch_params['orderBy'])) {
			$this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
			foreach ($this->orderBy as $key => $value) {
				$listing->orderBy($key, $value);
			}
		} else {
			$listing->orderBy('id', 'ASC');
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

		if ($listing != null && $listing->isEmpty()) {
			$listing = [];
		}

		return $listing;
	}

	public function myRoleMinLevel($user_id)
	{
		$levels = $this->myRoles([
			'user_id' => $user_id,
			'first' => true,
		], false);

		return $levels->level;
	}

	public function myRoles($srch_params = [], $requiredRoles = true)
	{
		if (!isset($srch_params['user_id'])) {
			$srch_params['user_id'] = \Auth::user()->id;
		}

		$roles = self::select("r.*")
			->join("user_roles AS ur", function ($join) use ($srch_params) {
				$join->on("users.id", "ur.user_id");
			})
			->join("roles AS r", function ($join) use ($srch_params) {
				$join->on("r.id", "ur.role_id");
			})
			->when($srch_params['user_id'], function ($q) use ($srch_params) {
				return $q->where("users.id", $srch_params['user_id']);
			})
			->orderBy('r.level', 'ASC');

		if (isset($srch_params['first']) && $srch_params['first']) {
			return $roles->first();
		}

		$roles = $roles->get();

		if ($requiredRoles) {
			return $roles->pluck('slug')->toArray();
		}

		return $roles;
	}

	public function store($input = [], $id = 0, $request = null)
	{
		if (!empty($input['password'])) {
			$input['password'] = Hash::make($input['password']);
		} else {
			$input = array_except($input, array('password'));
		}

		$data = null;
		$avatar = [];
		$user_id = \Auth::user()->id;
		$isOwnAcc = true;
		$responseStatus = 200;

		//
		// if this is not own account, it will
		// require role.
		//
		if ($user_id != $id) {
			$isOwnAcc = false;
		}

		if (!$id) {
			$input['username'] = Helper::randomString(15);
			$data = $this->create($input);

			$responseStatus = 201;
		} else {
			if (isset($input['email'])) {
				unset($input['email']);
			}
			$data = $this->getListing([
				'id' => $id,
				'id_greater_than' => $user_id,
			]);

			if (!$data) {
				return \App\Helpers\Helper::resp('Not a valid data', 400);
			}

			if ($data->update($input)) {
				$data = $this->getListing([
					'id' => $id,
					'id_greater_than' => $user_id,
				]);
			}
		}

		$this->uploadAvatar($data, $id, $request);

		if (isset($input['delete_files'])) {
			$entityType = isset(File::$fileType['user_avatar']['type']) ? File::$fileType['user_avatar']['type'] : 0;
			\App\Models\File::deleteFiles([
				'id_in' => $input['delete_files'],
				'entity_type' => $entityType,
				'entity_id' => $data->id
			], true);
		}



		//
		// if not owner changing their profile
		// then set role
		//
		if (!$isOwnAcc && isset($input['role_id']) && $input['role_id']) {
			if ($id) {
				\App\Models\UserRole::where('user_id', $id)->delete();
			}

			if (is_array($input['role_id'])) {
				$userRoles = [];
				foreach ($input['role_id'] as $roleId) {
					$userRoles[] = [
						'user_id' => $data->id,
						'role_id' => $roleId,
					];
				}

				\App\Models\UserRole::insert($userRoles);
			} else {
				\App\Models\UserRole::create([
					'user_id' => $data->id,
					'role_id' => $input['role_id'],
				]);
			}
		}

		return \App\Helpers\Helper::resp('Changes has been successfully saved.', $responseStatus, $data);
	}

	public function uploadAvatar($data = [], $id, $request)
	{
		$avatar = $data->profile_pic;
		$file = \App\Models\File::upload($request, 'avatar', 'user_avatar', $data->id);

		// if file has successfully uploaded
		// and previous file exists, it will
		// delete old file.
		if ($file && $avatar) {
			\App\Models\File::deleteFile($avatar, true);
		}

		return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $file);
	}

	public function remove($id = null)
	{
		$data = $this->getListing([
			'id' => $id,
			'id_greater_than' => \Auth::user()->id,
		]);

		if (!$data) {
			return \App\Helpers\Helper::resp('Not a valid data', 400);
		}

		$data->delete();

		return \App\Helpers\Helper::resp('Record has been successfully deleted.', 200, $data);
	}

	public function userInit($user, $requiredToken = true, $request = null)
	{
		$data = [];
		if ($requiredToken) {
			$data['token'] = $user->createToken('MyApp')->accessToken;
			$user->update(['is_loggedout' => 0]);
		}

		if (isset($request)) {
			if (isset($request->login_invisible) && $request->login_invisible) {
				\App\Models\SiteSettingUser::store('sign_in_mode', 4, \Auth::id());
				$user->update(['visible_status' => 4]);
			} else {
				\App\Models\SiteSettingUser::store('sign_in_mode', 1, \Auth::id());
				$user->update(['visible_status' => 1]);
			}
		}
		$param = [
			'id' => $user->id,
			'visible_status' => (int) $user->visible_status,
			'is_loggedout' => $user->is_loggedout,
			'type' => 'change_status'
		];
		// Helper::emit($param, 'userStatus');
		$roles = $user->roles->pluck('slug')->toArray();
		$user->makeVisible(['visible_option'])->makeHidden(['verified']);
		$roomUserObj = new \App\Models\RoomUser();
		$user['allow_create_room'] = $roomUserObj->allowCreateRoom();
		$user->roles->makeHidden([
			'id',
			'pid',
			'user_id',
			'status',
			'level',
			'created_at',
			'updated_at',
			'pivot',
		]);

		$data['user'] = $user;
		/*$data['site'] = \App\Models\SiteSetting::select("key", "val", "field_label", "field_type")->where("is_visible", 1)->get();*/

		$user->makeVisible(
			[
				'visible_option',
				'all_subscribtions',
				'all_room_subscribtions',
				'profile_display_preference',
				'show_typing_pm_preference',
				'isVipOwner',
				'auto_reply_message',
				'is_set_parental',
				'current_translation_language',
				'alerts_and_sounds',
				'user_badge'
			]
		);
		return $data;
	}

	public function roomUserStatus()
	{
		return $this->hasOne(RoomUser::class, 'user_id');
	}

	public function roomUserSettings()
	{
		return $this->hasOne(UserRoomSetting::class, 'user_id');
	}


	public function getDateOfBirthAttribute()
	{
		// return Helper::showdate($this->dob, false);
		return Helper::showdate(false);
	}

	public function customizeNickname()
	{
		return $this->hasOne(CustomizeNickname::class, 'for_user_id', 'id');
	}

	public function addContactList()
	{
		return $this->hasOne(ContactList::class, 'contact_user_id', 'id');
	}

	public function getGenderNameAttribute()
	{
		return Gender::select('title')->where('id', $this->gender)->first();
		// return Gender::select('title')->first();
	}

	public function getCountryNameAttribute()
	{
		return LocationCountry::select('country_name')->where('id', $this->country)->first();
		// return LocationCountry::select('country_name')->first();
	}

	public function gallery()
	{
		return $this->hasMany(UserGallery::class, 'user_id', 'id');
	}

	public function getIsSubscribedAttribute()
	{
		return UserSubscription::where(['user_id' => $this->id, 'room_id' => 0, 'is_closed' => 0, 'on_hold' => 0])
			->where(function ($query) {
				$query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
					->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
			})
			->with(['planInfo', 'priceInfo', 'feature'])->first();
	}

	public function subscription()
	{
		return UserSubscription::where(['user_id' => $this->id, 'room_id' => 0, 'is_closed' => 0, 'on_hold' => 0])
			->where(function ($query) {
				$query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
					->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
			})
			->with(['planInfo', 'priceInfo', 'feature'])->first();
	}

	public function getIsVipOwnerAttribute()
	{

		$vipRoomsCount = [];
		$vipRoomCategory = RoomCategory::where('category_title', 'VIP')->first();

		if ($vipRoomCategory) {
			$vipRoomsCount = DB::table('room_users')
				->join('rooms', function ($join) use ($vipRoomCategory) {
					$join->on("rooms.id", "room_users.room_id")
						->where("rooms.room_category_id", $vipRoomCategory->id)
						->where('rooms.deleted_at', null);
				})
				->where('user_id', $this->id)
				->where('is_admin', 3)
				->pluck("room_users.room_id");
		}

		return $vipRoomsCount;
	}


	public function getAllSubscribtionsAttribute()
	{
		return UserSubscription::where(['user_id' => $this->id, 'room_id' => 0, 'is_closed' => 0])
			->where(function ($query) {
				$query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
					->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
			})
			->with(['planInfo', 'priceInfo', 'feature'])->get();
	}

	public function getAllRoomSubscribtionsAttribute()
	{
		return UserSubscription::where(['user_id' => $this->id, 'is_closed' => 0])
			->where('room_id', '!=', 0)
			->where(function ($query) {
				$query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
					->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
			})
			->with(['planInfo', 'priceInfo', 'feature'])->get();
	}

	public function getProfileDisplayPreferenceAttribute()
	{
		$settings = new \App\Models\SiteSettingUserStructure();
		return $settings->getListing([
			'key' => 'not_display_profile_pic_pm',
			'user_id' => $this->id
		]);
	}


	public function getShowTypingPmPreferenceAttribute()
	{
		$settings = new \App\Models\SiteSettingUserStructure();
		return $settings->getListing([
			'key' => 'show_typing_pm',
			'user_id' => $this->id
		]);
	}

	public function getAutoReplyMessageAttribute()
	{
		$settings = new SiteSettingUserStructure();
		$settingsVal = $settings->getListing([
			'group_name' => 'auto_reply',
			'user_id' => $this->id
		]);

		$data = [];

		foreach ($settingsVal as $settingVal) {
			$data[$settingVal->key] = $settingVal->val;
			if ($settingVal->key == 'selected_message_id' && $settingVal->val) {
				$data['selected_message'] = \App\Models\UserAutoReplyMessage::select('message')->where('id', $settingVal->val)->first();
			}
		}

		return $data;
	}

	public function getIsSetParentalAttribute()
	{
		$settings = new \App\Models\SiteSettingUserStructure();
		$setting = $settings->getListing([
			'key' => 'parental_password',
			'user_id' => $this->id
		]);

		$isParental = false;

		if ($setting && $setting->user_setting_id) {
			$isParental = true;
		}

		return $isParental;
	}

	public function getCurrentTranslationLanguageAttribute()
	{
		$settings = new \App\Models\SiteSettingUserStructure();
		$setting = $settings->getListing([
			'key' => 'current_translation_language',
			'user_id' => $this->id
		]);

		return $setting->val;
	}

	public function getAlertsAndSoundsAttribute()
	{

		$settings = new \App\Models\SiteSettingUserStructure();
		$settingsVal = $settings->getListing([
			'group_name' => 'alert',
			'user_id' => $this->id
		]);

		$data = [];
		$soundIds = [];

		foreach ($settingsVal as $settingVal) {

			if (str_contains($settingVal->key, '_file_id')) {
				if (!in_array($settingVal->val, $soundIds)) {
					$soundIds[] = $settingVal->val;
				}

			}

			$data[$settingVal->key] = $settingVal->val;

		}
		//dd($soundIds);

		$soundObj = new \App\Models\UserCustomizeSound();
		$data['customized_sounds'] = $soundObj->getListing([
			'ids' => $soundIds
		]);
		//dd($data['customized_sounds']);
		if (count($data['customized_sounds'])) {
			foreach ($data['customized_sounds'] as $sound) {
				$sound->makeVisible(['customize_sound']);
			}
		}

		return $data;

	}

	public function getUserBadgeAttribute()
	{
		return UserBadge::with('currentBadge')->where(['user_id' => $this->id])->first();
	}



	public function userWithAppends($user)
	{
		$user->makeVisible([
			'avatar',
			'visible_option',
			'date_of_birth',
			'gender_name',
			'country_name',
			'is_subscribed',
			'all_subscribtions',
			'all_room_subscribtions',
			'profile_display_preference',
			'show_typing_pm_preference',
			'isVipOwner',
			'auto_reply_message',
			'is_set_parental',
			'current_translation_language',
			'alerts_and_sounds',
			'user_badge'
		]);
		return $user;
	}
}
