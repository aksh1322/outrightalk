<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePassword;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;
use App\Services\SendBirdChannelService;

class UserController extends Controller
{
    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_module = 'User';
        $this->_routePrefix = 'users';
        $this->_model = new User();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $srch_params = $request->all();
        $srch_params['role_gte'] = $this->_model->myRoleMinLevel(\Auth::user()->id);
        $data['list'] = $this->_model->getListing($srch_params, $this->_offset);

        return Helper::rj('Record found', 200, $data);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $data['details'] = $this->_model->getListing(['id' => $id]);

        return Helper::rj('Record found', 200, $data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(UserRequest $request)
    {
        return $this->__formPost($request);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id = 0)
    {
        $validationRules = [
            'first_name' => 'max:100',
            'last_name' => 'max:100',
            'dob' => 'required',
            'dob_visible' => 'required',
            //'gender' => 'required',
            'gender_visible' => 'required',
            'country' => 'required',
            'country_visible' => 'required',
            'state' => 'required',
            'state_visible' => 'required',
            //'email' => 'required|email|max:255',
            'email_visible' => 'required',
            'about_visible' => 'required',
            // 'question' => 'required',
            // 'answer' => 'required'
        ];
        $msg = [
            'dob.required' => 'The date of birth field is required.'
        ];
        $validator = \Validator::make($request->all(), $validationRules, $msg);
        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        } else {
            $id = (Auth::user()) ? Auth::user()->id : 0;
            $input = $request->all();
            //return $this->__formPost($request, $id);
            $data = $this->_model->getListing([
                'id' => $id
            ]);
            if (!$data) {
                return \App\Helpers\Helper::resp('Not a valid data', 400);
            }

            if ($data->update($input)) {
                $user_option_visible = ['dob_visible', 'gender_visible', 'country_visible', 'state_visible', 'email_visible', 'about_visible'];
                foreach ($user_option_visible as $option) {
                    \App\Models\UserOptionVisible::where(['user_id' => $id, 'key' => $option])->update(['value' => $input[$option]]);
                }

                $data = $this->_model->getListing([
                    'id' => $id,
                ]);
                return \App\Helpers\Helper::resp('Changes has been successfully saved.', 200, $data);
            }
        }
    }

    public function uploadAvatar(Request $request, SendBirdChannelService $sendBirdChannelService)
    {
        $fileValidations = \App\Models\File::$fileValidations['image'];
        $validationRules = [
            'user_id' => 'nullable|exists:users,id',
            'avatar' => 'required|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'],
        ];

        $validationMessages = [
            'user_id.required' => 'The user is required',
            'user_id.exists' => 'The selected user is invalid.',
        ];

        $validator = \Validator::make($request->all(), $validationRules, $validationMessages);
        if ($validator->fails()) {
            return Helper::rj('Error.', 400, [
                'errors' => $validator->errors(),
            ]);
        }

        $userId = $request->get('user_id');
        $userId = $userId ? $userId : \Auth::user()->id;
        $data = $this->_model->getListing([
            'id' => $userId,
        ]);
        $response = $this->_model->uploadAvatar($data, $userId, $request);
        $status = $response->original['status'];

        if ($status == 200) {
            $data = $this->_model->getListing([
                'id' => $userId,
            ]);


            $data = $this->_model->userInit($data, false);

            if (isset($request->updateSendbird) && $request->updateSendbird) {
                $updateData = [
                    "nickname" => $data['user']['username'],
                    "profile_url" => $data['user']['avatar']['thumb']
                ];
                info('updating user avatar at sendbird', $updateData);
                $resp = $sendBirdChannelService->updateSendbirdUserDetails($userId, $updateData);
            }

        }
        return Helper::rj($response->original['message'], $status, [
            'details' => $data,
        ]);
    }

    public function updatePassword(UpdatePassword $request)
    {
        try {
            if ($request->nickname != Auth::user()->username) {
                return Helper::rj('Nicname is incorrect', 400);
            }

            if ($request->security_question['value'] != Auth::user()->question) {
                return Helper::rj('Securty question is incorrect', 400);
            }
            if ($request->security_answer != Auth::user()->answer) {
                return Helper::rj('Securty answer is incorrect', 400);
            }

            $data = \Auth::user();
            //dd($data);
            $input = $request->all();
            $input['password'] = \Hash::make($input['password']);

            $data->update($input);

            return Helper::rj('Password has been successfully updated.', 200);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $response = $this->_model->delete($id);
        return Helper::rj($response['message'], $response['status'], [
            'details' => $response['data'],
        ]);
    }

    /**
     * Form post action
     *
     * @param  Request $request [description]
     * @param  string  $id      [description]
     * @return [type]           [description]
     */
    private function __formPost(UserRequest $request, $id = 0)
    {
        $isOwnAcc = true;
        //
        // if this is not own account, it will
        // require role.
        //
        if (Auth::user()->id != $id) {
            $isOwnAcc = false;
        }
        $input = $request->all();
        $response = $this->_model->store($input, $id, $request);
        return Helper::rj($response['message'], $response['status'], [
            'details' => $response['data'],
        ]);
    }

    public function changeVisibleStatus(Request $request)
    {
        try {
            $validationRules = [
                'visible_status' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $data = \Auth::user();
                //dd($data);
                $input = $request->all();
                $data->update($input);
                $data->makeVisible(['visible_option']);
                $param = [
                    'id' => $data->id,
                    'visible_status' => (int) $data->visible_status,
                    'is_loggedout' => $data->is_loggedout,
                    'type' => 'change_status'
                ];
                Helper::emit($param, 'userStatus');
                $jobInstance = new \App\Jobs\CountOnlineUserJob();
                dispatch($jobInstance);
                return Helper::rj('Status has been successfully updated.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function showProfilePicture(Request $request)
    {
        try {
            $validationRules = [
                'avatar_visible' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $data = \Auth::user();
                $record = \App\Models\UserOptionVisible::where(['user_id' => $data->id, 'key' => 'avatar_visible'])->first();
                if ($record)
                    $record->update(['value' => $request->avatar_visible]);
                else
                    \App\Models\UserOptionVisible::create(['user_id' => $data->id, 'key' => 'avatar_visible', 'value' => $request->avatar_visible]);

                $data = \Auth::user();
                $data->makeVisible(['visible_option']);
                $contactListObj = new \App\Models\ContactList();
                $param['contact_list'] = $contactListObj->getListing([
                    'user_id' => $data->id,
                    'with' => [
                        'customizeNickname' => function ($q) use ($data) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $data->id);
                        },
                        'isBlock' => function ($q) use ($data) {
                            return $q->select('user_id', 'block_user_id')->where('user_id', $data->id);
                        }
                    ]
                ]);
                $param['type'] = 'show_profile_picture';
                Helper::emit($param, 'userStatus');
                return Helper::rj('Information has been successfully updated.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function findNearByUsers(Request $request)
    {
        try {
            $validationRules = [
                'current_lat' => 'required',
                'current_lon' => 'required',
                'radius' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = Auth::user();
                $srch_params = $request->all();
                $srch_params['not_user'] = $user->id;
                $srch_params['role'] = 'messenger';
                $srch_params['select'] = ['users.id', 'username', 'curr_loc_lat', 'curr_loc_lon'];
                $srch_params['block_user'] = $user->id;
                $srch_params['with'] = [
                    'addContactList' => function ($q) use ($user) {
                        return $q->where('user_id', $user->id);
                    },
                ];
                $srch_params['settings'] = 'share_location';
                $srch_params['has_lat_lon'] = 1;
                //$srch_params['get_sql'] = 1;

                $userObj = new \App\Models\User();
                $data['list'] = $userObj->getFindUserListing($srch_params);
                return \App\Helpers\Helper::resp('Record found.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function updateCurrentLocation(Request $request)
    {
        try {
            $validationRules = [
                'curr_loc_lat' => 'required',
                'curr_loc_lon' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $user = User::find(Auth::user()->id);
                $user->update($input);
                return Helper::rj('Information has been successfully updated.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function userDetails(Request $request)
    {
        try {
            $validationRules = [
                'user_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $userObj = new \App\Models\User();
                $user_id = Auth::user()->id;
                $user = $userObj->getListing([
                    'id' => $request->user_id,
                    'with' => [
                        'gallery',
                        'customizeNickname' => function ($q) use ($user_id) {
                            return $q->select('for_user_id', 'nickname')
                                ->where(['user_id' => $user_id]);
                        },

                    ]
                ]);
                $data = $userObj->userInit($user, false);
                return Helper::rj('Record found', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function checkPassword(Request $request)
    {
        try {
            $validationRules = [
                'password' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = Auth::user();
                if (\Hash::check(request('password'), $user->password)) {
                    return Helper::rj('Password matched.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You have entered an invalid password.'
                    ]);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }
    public function updateAboutUs(Request $request)
    {
        try {
            $validationRules = [
                'about' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $user = User::find(Auth::user()->id);
                $res = $user->update(['about' => $input['about']]);
                if ($res) {
                    return Helper::rj('Information has been successfully updated.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Information not update.'
                    ]);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function clearAboutUs(Request $request)
    {
        try {
            $user = User::find(Auth::user()->id);
            $res = $user->update(['about' => null]);
            if ($res) {
                return Helper::rj('About message successfully cleared.', 200, []);
            } else {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => 'Information not update.'
                ]);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function uploaduserAvatarDetails(Request $request)
    {
        $fileValidations = \App\Models\File::$fileValidations['image'];
        $validationRules = [
            'user_id' => 'nullable|exists:users,id',
            'avatar' => 'required|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'],
        ];

        $validationMessages = [
            'user_id.required' => 'The user is required',
            'user_id.exists' => 'The selected user is invalid.',
        ];

        $validator = \Validator::make($request->all(), $validationRules, $validationMessages);
        if ($validator->fails()) {
            return Helper::rj('Error.', 400, [
                'errors' => $validator->errors(),
            ]);
        }

        $userId = $request->get('user_id');
        $userId = $userId ? $userId : \Auth::user()->id;
        $data = $this->_model->getListing([
            'id' => $userId,
        ]);
        $response = $this->_model->uploadAvatar($data, $userId, $request);
        $status = $response['status'];
        if ($status == 200) {
            $data = $this->_model->getListing([
                'id' => $userId,
            ]);
            $data = $this->_model->userInit($data, false);
        }
        return Helper::rj($response['message'], $status, [
            'details' => $data,
        ]);
    }
}
