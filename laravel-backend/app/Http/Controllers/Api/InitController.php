<?php
namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;
use Validator;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserBadgePoints;

class InitController extends Controller
{
	public function initialDetails(Request $request)
	{
		try {
			$user = \Auth::user();
			$userModel = new User;
			$data = $userModel->userInit($user, false);


			//for bages add sanjay

			$bagde = UserBadge::firstOrCreate(
				['user_id' => Auth::id()]
			);

			if ($bagde->next_badge_id == null && $bagde->current_badge_id == null) {
				$bagde->next_badge_id = Badge::first()->id;
				$bagde->save();
			}

			$badegPoints = UserBadgePoints::firstOrCreate(
				['user_id' => Auth::id()]
			);


			$badgePoints = UserBadgePoints::where('user_id', Auth::id())->first();
			if ($badgePoints) {
				$bagde = UserBadge::where('user_id', Auth::id())->first();
				$badgePoints->current_balance;
				$badgeID = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
				if ($badgeID) {
					$bagde->current_badge_id = $badgeID->id;
					$bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id : $badgeID->id;
					$bagde->save();
				}
			}


			$badgeData = UserBadge::with('currentBadge', 'nextBadge')->where(['user_id' => Auth::id()])->first();

			$user->loadMissing('sendBirdUser:sb_user_id,sb_access_token,expires_at,system_user_id');
			$data['user']['badge_data'] = $badgeData;
			$data['user']['badge_points'] = $badegPoints;




			return Helper::rj('Record found', 200, $data);
		} catch (\Exception $e) {
			Helper::Log('InitController-initialDetails', $e->getMessage());
			return Helper::rj($e->getMessage(), 500);
		}
	}

	public function customerInit(Request $request)
	{
		$validator = Validator::make($request->all(), [
			'entity_type' => 'required',
			'entity' => 'required',
		]);
		$input = $request->all();
		$user_id = \Auth::user()->id;
		$userModel = new User();
		$success = $userModel->userInit(\Auth::user(), false);

		if ($input['entity_type'] == 'digital-form') {
			$userCustomerFormModel = new \App\UserCustomerForm();
			$srch_params['slug'] = $input['entity'];

			$data = $userCustomerFormModel->getListing($srch_params);
			$return = \App\Helpers\Helper::notValidData($data);
			if ($return) {
				return $return;
			}

			$userCustomerFormConsentMapModel = new \App\UserCustomerFormConsentMap;
			$success['consents'] = $userCustomerFormConsentMapModel->getListing([
				'user_customer_form_id' => $data->id,
				'customer_id' => $user_id,
				'status' => 0,
				'first' => true,
			]);
		}

		// if($input['entity_type']=='task'){
		// 	$userContentShareModel= new \App\UserContentShare();
		// 	$srch_params['slug']= $input['entity'];
		// 	$data    = $userContentShareModel->getListing($srch_params);
		// 	$return = \App\Helpers\Helper::notValidData($data);
		// 	if ($return) {
		// 	return $return;
		// 	}
		// }
		//dd(\Auth::user());
		//dd($success);
		return Helper::rj('Record found', 200, $success);

	}
	public function siteInitialDetails(Request $request)
	{
		try {

			$data['site'] = \App\SiteSetting::select("key", "val", "field_label", "field_type")
				->where("is_visible", 1)
				->get();

			return Helper::rj('Record found', 200, $data);
		} catch (\Exception $e) {
			Helper::Log('InitController-siteInitialDetails', $e->getMessage());
			return Helper::rj($e->getMessage(), 500);
		}
	}

	public function updateSiteSetting(Request $request, $key = '')
	{
		try {
			$validationRules = [
				'val' => 'required',
			];

			$validator = Validator::make($request->all(), $validationRules);
			if ($validator->fails()) {
				return Helper::rj('Error.', 400, [
					'errors' => $validator->errors(),
				]);
			}

			$input = $request->all();
			$data = \App\Models\SiteSetting::where('key', $key)->first();
			$return = \App\Helpers\Helper::notValidData($data);
			if ($return) {
				return $return;
			}

			$data->update($input);

			\App\Models\SiteSetting::makeCacheSetting();

			return Helper::rj('Record has been successfully updated.', 200);
		} catch (\Exception $e) {
			return Helper::rj($e->getMessage(), 500);
		}
	}

	public function captcha(Request $request)
	{
		$captcha = new \App\Helpers\Captcha;
		$captcha = $captcha->create();

		$captchaResponse = \App\CaptchaToken::create([
			'token' => Helper::randomString(200),
			'captcha_text' => md5($captcha['word-org']),
			'ip' => $request->ip(),
		]);

		return Helper::rj('captcha created', 200, [
			'captcha' => $captcha['image'],
			'token' => $captchaResponse->token,
		]);
	}
}
