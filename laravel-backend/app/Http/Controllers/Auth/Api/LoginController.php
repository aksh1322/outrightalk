<?php

namespace App\Http\Controllers\Auth\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
//use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Validator;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserBadgePoints;
use App\Services\SendBirdUserService;
use App\Services\SendBirdChannelService;

class LoginController extends Controller
{

    //use AuthenticatesUsers;
    public $successStatus = 200;
    protected $_model = null;

    //protected $decayMinutes=5;

    public function __construct()
    {
        $this->_model = new User;
        // $this->middleware('throttle:6,1')->only('login');

        //	return Helper::rj('Your account has been locked due to 3 consecutive login failure. Please reset your password to access this platform', 429);
    }

    /**
     * login api
     *
     * @return \Illuminate\Http\Response
     */
    public function login(LoginRequest $request, SendBirdUserService $sendBirdUserService)
    {


        if (Auth::attempt(['username' => request('nickname'), 'password' => request('password')])) {
            $user = Auth::user();
            // echo "<prE>";
            // print_r($user);
            // print_r($request->all());
            // die;
            $user_roles = $user->roles->pluck('slug')->toArray();
            if (
                in_array('admin', $user_roles) ||
                in_array('sub-admin', $user_roles) ||
                in_array('super-admin', $user_roles)
            ) {
                return Helper::rj('Not a valid user.', 401);
            }

            if ($user->status && $user->status == 2) {
                return Helper::rj('Sorry, you may not login using this nickname. It has been deactivated by the OutrighTalk administration. For more details please, contact our staff.', 401);
            }

            if (!$user->verified) {
                return Helper::rj('Sorry! Your account is not verified yet.', 401);
            }
            $check_already_loggedin = \App\Models\OauthAccessToken::where(['user_id' => Auth::user()->id])->first();
            if ($check_already_loggedin) {
                $param = [
                    'user_id' => Auth::user()->id,
                    'message' => "This nickname has logged in from another location."
                ];
                Helper::emit($param, 'loggedInOthrLoc');
                \App\Models\OauthAccessToken::where(['user_id' => Auth::user()->id])->delete();
            }
            //dd('here');
            $success = $this->_model->userInit($user, true, $request);


            // $success = true;
//                $isNotExist = \App\Models\ContactList::where([
//                        'user_id' => $user->id,
//                        'contact_user_id' => $user->id
//                    ])->doesntExist();
//                if ($isNotExist) {
//                    \App\Models\ContactList::create([
//                        'user_id' => $user->id,
//                        'contact_user_id' => $user->id
//                    ]);
//                }
            \App\Models\UserDeviceToken::subscribe($user, $request->device_type, $request->device_token);
            $jobInstance = new \App\Jobs\CountOnlineUserJob();
            dispatch($jobInstance);

            //update VIP invitations

            \App\Models\VIPInvitation::where('email', $user->email)->where('user_id', null)->update(['user_id' => $user->id]);

            //exit from all rooms
            Helper::exitFromAllRooms($user);


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

            try {

                if (optional($user->sendBirdUser)?->sb_user_id == null) {
                    $sendBirdUser = $sendBirdUserService->createUser($user);
                    $user->refresh();
                }
            } catch (\Exception $e) {
                info("Login Controller Create SendBird User Error", [$e->getMessage()]);
            }

            $success['user']['badge_data'] = $badgeData;
            $success['user']['badge_points'] = $badegPoints;

            return Helper::rj('Login Successful', $this->successStatus, $success);

        } else {
            return Helper::rj('Incorrect nickname or password.', 401);
        }
    }

    public function logout(Request $request, SendBirdChannelService $sendBirdChatService)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $result = $request->user()->token()->delete();
            if ($result) {
                $user->update(['is_loggedout' => 1, 'visible_status' => 4]);
                $param = [
                    'id' => $user->id,
                    'visible_status' => (int) $user->visible_status,
                    'is_loggedout' => $user->is_loggedout,
                    'type' => 'change_status'
                ];
                Helper::emit($param, 'userStatus');
                //exit from all rooms
                Helper::exitFromAllRooms($user);
                //exit from all pms
                $pmUserObj = new \App\Models\PmUser();
                $list = $pmUserObj->getListing(['user_id' => $user->id])->pluck('pm_id', 'id');

                // if ($list) {
                foreach ($list as $key => $pm_id) {
                    Helper::removePmUserInformation($pm_id, $user->id, $sendBirdChatService, true);
                    //   }
                }
                //dd('here');
                \App\Models\VIPInvitation::where('email', $user->email)->update(['expired_at' => (new \DateTime())->format("Y-m-d H:i:s")]);
                $jobInstance = new \App\Jobs\CountOnlineUserJob();
                dispatch($jobInstance);
                return Helper::rj('Logout Successful', $this->successStatus);
            } else {
                return Helper::rj('Something went wrong.', 400);
            }
            // return $response;
            // Auth::user()->AauthAcessToken()->delete();

        }

        return Helper::rj('Not a valid credential.', 401);
    }

    /**
     * Forgot Password api
     *
     * @return \Illuminate\Http\Response
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nickname' => 'required',
            ]);
            if ($validator->fails()) {
                return Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors(),
                ]);
            }
            $input = $request->all();
            $user = User::where('username', $input['nickname'])->first();
            if ($user) {
                $user_roles = $user->roles->pluck('slug')->toArray();
                if (
                    in_array('admin', $user_roles) ||
                    in_array('sub-admin', $user_roles) ||
                    in_array('super-admin', $user_roles)
                ) {
                    return Helper::rj('Bad Request', 400, [
                        'errors' => "Not a valid user.",
                    ]);
                }

                $user->remember_token = Helper::randomString(25);
                $list = $user->secretQuestion;
                $list->token = $user->remember_token;
                if ($user->save()) {
                    return Helper::rj('Valid nickname', $this->successStatus, $list);
                }/* else {
return Helper::rj('An email has been sent to your registered email id to recover your password.', 200, [
'errors' => 'Sorry! This email is not registered with us.',
]);
}*/
            } else {
                return Helper::rj('Bad Request', 400, [
                    'errors' => "Sorry! This nickname is not registered with us.",
                ]);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function forgotPasswordQuestion(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required',
                'answer' => 'required'
            ]);
            if ($validator->fails()) {
                return Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors(),
                ]);
            }
            $input = $request->all();
            $user = User::where('remember_token', $input['token'])
                ->where('answer', $input['answer'])->first();
            if ($user) {
                $user->otp = Helper::randomNumber();
                if ($user->save()) {
                    $mailData = [
                        'nick_name' => $user->username,
                        'otp' => $user->otp,
                    ];
                    $fullName = $user->username;
                    \App\Models\SiteTemplate::sendMail($user->email, $fullName, $mailData, 'forgot_password');
                    return Helper::rj('An email has been sent to your registered email id with otp to resetting your password.', 200);
                }
            } else {
                return Helper::rj('Bad Request', 400, [
                    'errors' => "Sorry! Invalid security response for resetting password.",
                ]);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function forgotPasswordOtp(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required',
                'otp' => 'required|numeric|min:8'
            ]);
            if ($validator->fails()) {
                return Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors(),
                ]);
            }
            $input = $request->all();
            $user = User::where('remember_token', $input['token'])
                ->where('otp', $input['otp'])->first();
            if ($user) {
                return Helper::rj('Otp varified successfully.', $this->successStatus, []);
            } else {
                return Helper::rj('Bad Request', 400, [
                    'errors' => "Sorry! Invalid otp for resetting password.",
                ]);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    /**
     * Set Password api
     *
     * @return \Illuminate\Http\Response
     */
    public function setPassword(Request $request)
    {
        try {
            $passwordValidators = \App\Models\User::$passwordValidator;
            $validator = Validator::make($request->all(), [
                'token' => 'required',
                'password' => $passwordValidators,
                'c_password' => 'required|same:password',
            ]);
            if ($validator->fails()) {
                return Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors(),
                ]);
            }
            $input = $request->all();
            $user = User::where('remember_token', $input['token'])->first();
            $return = \App\Helpers\Helper::notValidData($user);
            if ($return) {
                return $return;
            }

            $user->status = 1;
            $user->password = \Hash::make($input['password']);
            $user->remember_token = null;
            $user->otp = null;

            if ($user->save()) {
                // $success['token'] = $user->createToken('MyApp')->accessToken;
                $success = [];
                if (isset($input['verify']) && $input['verify']) {
                    $success = $this->_model->userInit($user, true);
                }

                return Helper::rj('Password reset has been successfully completed.', $this->successStatus, $success);
            } else {
                return Helper::rj('Failed!', 400);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    /**
     * Email Verification
     *
     * @return \Illuminate\Http\Response
     */
    public function verifyEmail(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required',
            ]);
            if ($validator->fails()) {
                return Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors(),
                ]);
            }
            $input = $request->all();
            $data['verified'] = 1;
            $data['remember_token'] = null;
            $data['status'] = 2;
            $data['email_verified_at'] = now();
            $user = User::where('remember_token', $input['token'])->update($data);
            if (!empty($user)) {
                return Helper::rj('Email verified successfully.', 200);
            } else {
                return Helper::rj('Failed!', 400);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function resendVerificationMail()
    {
        try {

            $user = Auth::user();

            $mailData = [
                'name' => $user->first_name,
                'activation_link' => \Config::get('settings.frontend_url') . 'email/verify/' . $user->username,
            ];

            $fullName = $user->first_name . ' ' . $user->last_name;
            \App\Models\SiteTemplate::sendMail($user->email, $fullName, $mailData, 'resend_verify_email');

            return Helper::rj('Verification email sent.', 200);

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function isEmailUnique(Request $request)
    {
        try {
            $validator = Validator::make(
                $request->all(),
                [
                    'email' => 'required|email:rfc,dns|max:255|unique:users,email,0,id,deleted_at,NULL',
                ],
                [
                    'email.unique' => 'This email has already been taken. Try another',
                ]
            );
            if ($validator->fails()) {
                return Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors(),
                ]);
            }

            return Helper::rj('Email is unique.', 200);

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getLoginMode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nickname' => 'required',
            ]);
            if ($validator->fails()) {
                return Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors(),
                ]);
            }
            $input = $request->all();
            $record = \App\Models\SiteSettingUser::select("site_setting_users.val")
                ->join('site_setting_user_structures', function ($join) {
                    $join->on("site_setting_user_structures.id", "site_setting_users.site_setting_id")
                        ->where("site_setting_user_structures.key", 'sign_in_mode')
                        ->where("site_setting_user_structures.group_name", 'general');
                })
                ->join('users', function ($join) use ($input) {
                    $join->on("users.id", "site_setting_users.user_id")
                        ->where("users.username", $input['nickname']);
                })
                ->first();
            $mode = ($record) ? $record->val : 1;
            return Helper::rj('', 200, $mode);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }
}
