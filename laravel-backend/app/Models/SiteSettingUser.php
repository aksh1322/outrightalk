<?php

namespace App\Models;

use App\Scopes\UserScope;
use Illuminate\Database\Eloquent\Model;
use Auth;

class SiteSettingUser extends Model
{

	protected $table = 'site_setting_users';

	//	public static function boot() {
//            parent::boot();
//            static::addGlobalScope(new UserScope());
//	}

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [
		'user_id',
		'site_setting_id',
		'val',
	];

	protected $hidden = [
		'created_at',
		'updated_at',
	];

	public function structure()
	{
		return $this->hasOne(SiteSettingUser::class, 'id', 'site_setting_id');
	}

	public static function store($key = '', $val = '', $user_id = '', $siteSetting = null, $reset = false)
	{
		if (!$siteSetting) {
			$siteSettingInst = new SiteSettingUserStructure();
			$siteSetting = $siteSettingInst->getListing([
				'key' => $key,
			]);
		}

		if ($siteSetting) {
			$user_id = $user_id ? $user_id : Auth::user()->id;
			$setting = self::where('site_setting_id', $siteSetting->structure_id)
				->where('user_id', $user_id)
				->first();
			if (!$setting) {
				return self::create([
					'user_id' => $user_id,
					'site_setting_id' => $siteSetting->structure_id,
					'val' => $reset ? $siteSetting->val : $val,
				]);
			}

			//dd($siteSetting);
			$setting->val = $reset ? $siteSetting->val : $val;
			$setting->save();

			return $setting->save();
		}
	}

}
