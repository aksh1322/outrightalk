<?php

namespace App\Http\Controllers\Auth\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Exceptions\HttpResponseException;
use Validator;

class RegisterController extends Controller
{
    public $successStatus = 200;

    /**
     * Register api
     *
     * @return \Illuminate\Http\Response
     */
    public function registerStepCreate(RegisterRequest $request, $step = 1)
    {
        /*
        return \App\Helpers\Helper::rj('Bad Request', 400, [
            'errors' => "User registration stopped."
        ]);
        */
        // return Helper::rj('User registration stopped.');
        $input = $request->all();
        $input['dob'] = date('Y-m-d', strtotime($input['dob']));
        $input['uid'] = Helper::randomString(18);

        $tempUserExisting = \App\Models\UserTemp::where("nickname", $input['nickname'])->delete();
        $date = date('Y-m-d');
        $age = \Carbon\Carbon::parse($date)->diff(\Carbon\Carbon::parse($input['dob']))->format('%y');
        if ($age >= 12) {
            $user = \App\Models\UserTemp::create($input);
            /*$mailData = [
                    'full_name'       => $user->full_name,
                    'activation_link' => \Config::get('settings.frontend_url', config('app.url')) . 'user/verify/' . $usr->remember_token,
                    'extra_text'      => '',
            ];
            $fullName = $user->full_name;
            \App\SiteTemplate::sendMail($user->email, $fullName, $mailData, 'register_provider'); //register_provider from db site_template table template_name field*/

            return Helper::rj('Account information has been saved successfully.', $this->successStatus, $user);
        } else {
            //throw new HttpResponseException(response()->json('You can use OutrighTalk only if you are accompanied by an adult.', 400));
            return \App\Helpers\Helper::rj('Bad Request', 403, [
                'errors' => "You can use OutrighTalk only if you are accompanied by an adult."
            ]);
        }
    }

    public function registerStepUpdate(Request $request, $step = 2, $uid = '')
    {
        /* 
        return \App\Helpers\Helper::rj('Bad Request', 400, [
         'errors' => "User registration stopped."
         ]);
         
        */
        //return Helper::rj('User registration stopped.');
        $user = \App\Models\UserTemp::where('uid', $uid)->first();
        if ($user) {
            if ($step == 2) {
                $rules = array(
                    'question' => 'required',
                    'answer' => [
                        'required',
                        'min:3',
                        'max:30',
                        new \App\Rules\CheckScreteAnswerSpecialCharacterValidate()
                    ]
                );
                $msg = [
                    'answer.min' => 'Your secret answer must be between 3 and 30 characters.',
                    'answer.max' => 'Your secret answer must be between 3 and 30 characters.'
                ];
            }
            $validator = \Validator::make($request->all(), $rules, $msg);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $userTemp = $user->toArray();
                $password = $userTemp['password'];
                $userTemp['password'] = Hash::make($password);
                $userTemp['username'] = $userTemp['nickname'];
                $userTemp['status'] = 0;
                $userTemp['verified'] = 0;
                $userTemp['remember_token'] = Helper::randomString(37);
                $userTemp['question'] = $request->question;
                $userTemp['answer'] = $request->answer;
                $userTemp['ip_addr'] = $request->ip();
                //$userTemp['timezone'] = "UTC";
                $userTemp['timezone'] = Helper::getTimezone($userTemp['ip_addr']);

                $usr = \App\Models\User::create($userTemp);

                $records = \App\Models\UserTemp::select('dob_visible', 'gender_visible', 'country_visible', 'state_visible', 'email_visible', 'about_visible')
                    ->where('uid', $uid)->first()->toArray();
                $records['avatar_visible'] = 1;

                if (count($records)) {
                    foreach ($records as $key => $record) {
                        \App\Models\UserOptionVisible::create([
                            'user_id' => $usr->id,
                            'key' => $key,
                            'value' => $record
                        ]);
                    }
                }
                $user->delete();

                $role = \App\Models\Role::where('slug', 'messenger')->first();
                $input['user_id'] = $usr->id;
                $input['role_id'] = $role->id;
                $role = \App\Models\UserRole::create($input);

                $mailData = [
                    'name' => $usr->username,
                    'activation_link' => \Config::get('settings.frontend_url', config('app.url')) . 'user/verify/' . $usr->remember_token,
                    'extra_text' => '',
                ];
                $fullName = $usr->username;
                \App\Models\SiteTemplate::sendMail($usr->email, $fullName, $mailData, 'register');

                return Helper::rj('Registration has been successfully completed. To verify your account please check your email.', $this->successStatus, $usr);
            }
        } else {
            return \App\Helpers\Helper::rj('Bad Request', 404, [
                'errors' => "User not found."
            ]);
        }
    }

    public function checkNickname(Request $request)
    {
        $rules = array(
            'nickname' => [
                'required',
                'min:6',
                'max:26',
                'unique:users,username,0,id,deleted_at,NULL',
                'string',
                new \App\Rules\CheckStringNumberSpaceDashUnderScoreValidate(),
                new \App\Rules\CheckUnicodeCharacterValidate(),
                new \App\Rules\CheckBeforeSpaceDashUnderScoreValidate('Nicknames cannot start with space, dash or underscore.'),
                new \App\Rules\CheckConsecutiveDashSpaceValidate(),
                new \App\Rules\CheckReserveWordValidate('nickname', 'Sorry, you cannot create this nickname because it contains reserved word(s). Try another nickname please.', ' ')
            ]
        );
        $messages = [
            'nickname.unique' => 'This nickname is already taken. Please try another one!',
            'nickname.min' => 'Your nickname must be more than 5 characters and must not exceed 26 characters.',
            'nickname.max' => 'Your nickname must be more than 5 characters and must not exceed 26 characters.',
        ];
        $validator = \Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        } else {
            return Helper::rj('Nickname available.', $this->successStatus, []);
        }
    }
}
