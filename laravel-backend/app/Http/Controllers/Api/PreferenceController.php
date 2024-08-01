<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use App\Helpers\Helper;
use Auth;
use PDF;
use App\Models\SiteSettingUserStructure;
use App\Models\User;
use Dompdf\Dompdf;
use Illuminate\Support\Facades\File;

class PreferenceController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);
        $this->_model = new SiteSettingUserStructure();
        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });
    }

    public function getAllPreference(Request $request, $group_name = null)
    {

        try {
            $data['list'] = $this->_model->getListing([
                'group_name' => $group_name,
                'user_id' => $this->_user->id
            ]);
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function getParentalPreference(Request $request)
    {
        try {
            $validationRules['user_id'] = 'required';
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $data['list'] = $this->_model->getListing([
                    'group_name' => 'parental',
                    'user_id' => $request->user_id
                ]);
                return Helper::rj('Record found', 200, $data);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function saveParentalPreference(Request $request)
    {
        try {
            $passwordValidators = \App\Models\User::$passwordValidator;
            $validationRules = [
                'user_id' => 'required',
                'parental_password' => $passwordValidators
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                \App\Models\SiteSettingUser::store('join_only_g_rated_rooms', 1, $request->user_id);
                \App\Models\SiteSettingUser::store('activity_only_contact_list', 1, $request->user_id);
                \App\Models\SiteSettingUser::store('parental_password', $request->parental_password, $request->user_id);
                return Helper::rj('Preferences updated successfully', 200, []);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function saveTranslationPreference(Request $request)
    {
        try {
            $passwordValidators = \App\Models\User::$passwordValidator;
            $validationRules = [
                'lang_code' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                \App\Models\SiteSettingUser::store('current_translation_language', $request->lang_code);
                return Helper::rj('Translation language has been updated successfully', 200, []);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }



    public function deleteParentalPreference(Request $request)
    {
        try {
            $validationRules = [
                'user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $del = \App\Models\SiteSettingUser::join('site_setting_user_structures', function ($join) {
                    $join->on('site_setting_users.site_setting_id', 'site_setting_user_structures.id')
                        ->where('site_setting_user_structures.group_name', 'parental');
                })
                    ->where('user_id', $request->user_id)
                    ->delete();
                if ($del) {
                    return Helper::rj('Parental control deleted successfully.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Something went wrong. Please try again later.'
                    ]);

                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function sendOtp(Request $request)
    {
        try {
            $validationRules = [
                'user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = \App\Models\User::find($request->user_id);
                if ($user) {
                    $otp = Helper::randomNumber();
                    \App\Models\ParentalResetPassword::create([
                        'user_id' => $request->user_id,
                        'otp' => $otp
                    ]);
                    $fullName = $user->username;
                    $mailData = [
                        'nick_name' => $fullName,
                        'otp' => $otp,
                    ];
                    \App\Models\SiteTemplate::sendMail($user->email, $fullName, $mailData, 'forgot_password');
                    return Helper::rj('An email has been sent to your registered email id with otp to resetting your password.', 200);
                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function forgotPasswordOtp(Request $request)
    {
        try {
            $validationRules = [
                'user_id' => 'required',
                'otp' => 'required|numeric|min:8'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            }
            $input = $request->all();
            $user = \App\Models\ParentalResetPassword::where('user_id', $input['user_id'])
                ->where('otp', $input['otp'])->latest()->first();
            if ($user) {
                return Helper::rj('Otp varified successfully.', 200, []);
            } else {
                return Helper::rj('Bad Request', 400, [
                    'errors' => "Sorry! Invalid otp for resetting password.",
                ]);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function setPassword(Request $request)
    {
        try {
            $passwordValidators = \App\Models\User::$passwordValidator;
            $validationRules = [
                'user_id' => 'required',
                'password' => $passwordValidators,
                'c_password' => 'required|same:password',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors(),
                ]);
            }
            $input = $request->all();
            $data = $this->_model->getListing([
                'group_name' => 'parental',
                'user_id' => $input['user_id'],
                'key' => 'parental_password'
            ]);
            if ($data) {
                $dd = \App\Models\SiteSettingUser::join('site_setting_user_structures', function ($join) {
                    $join->on('site_setting_users.site_setting_id', 'site_setting_user_structures.id')
                        ->where('site_setting_user_structures.group_name', 'parental')
                        ->where('key', 'parental_password');
                })
                    ->where('user_id', $input['user_id'])
                    ->update(['val' => $input['password']]);
                \App\Models\ParentalResetPassword::where('user_id', $input['user_id'])->delete();
                return Helper::rj('Password reset has been successfully completed.', 200, []);
            } else {
                return Helper::rj('Failed!', 400);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function savePreference(Request $request)
    {
        \App\Helpers\Helper::resetAllSettingsRoomAndPm();

        try {
            $input = $request->all();
            $validationRules = [];
            if (
                (isset($input['enable_voicemail_password']) && $input['enable_voicemail_password'])
                && !isset($input['voicemail_password'])
            ) {
                $validationRules['voicemail_password'] = 'required|min:6|max:16';
            } elseif (
                isset($input['voicemail_password']) &&
                (isset($input['enable_voicemail_password']) && !$input['enable_voicemail_password'])
            ) {
                $validationRules['enable_voicemail_password'] = 'accepted';
                $validationRules['voicemail_password'] = 'required|min:6|max:16';
            }
            if (isset($input['voicemail_password']) && $input['voicemail_password']) {
                $validationRules['voicemail_password'] = 'min:6|max:16';
            }

            if (
                (isset($input['enable_video_message_password']) && $input['enable_video_message_password'])
                && !isset($input['video_message_password'])
            ) {
                $validationRules['video_message_password'] = 'required|min:6|max:16';
            } elseif (
                isset($input['video_message_password']) &&
                (isset($input['enable_video_message_password']) && !$input['enable_video_message_password'])
            ) {
                $validationRules['enable_video_message_password'] = 'accepted';
                $validationRules['video_message_password'] = 'required|min:6|max:16';
            }
            if (isset($input['video_message_password']) && $input['video_message_password']) {
                $validationRules['video_message_password'] = 'min:6|max:16';
            }
            /*$fileValidations = \App\Models\File::$fileValidations['audio'];
            $validationRules['incoming_pm_sound_file'] = 'nullable|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'];
            $validationRules['incoming_call_sound_file'] = 'nullable|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'];
            $validationRules['contact_online_sound_file'] = 'nullable|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'];
            $validationRules['contact_offline_sound_file'] = 'nullable|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'];
            $validationRules['receive_invitations_sound_file'] = 'nullable|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'];*/

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $reset = false;
                if (isset($input['reset_to_default_settings']) && $input['reset_to_default_settings'] == 1) {
                    $reset = true;
                }

                foreach ($input as $key => $val) {
                    \App\Models\SiteSettingUser::store($key, $val, '', null, $reset);
                }

                if ($reset) {
                    \App\Helpers\Helper::resetAllSettingsRoomAndPm();
                }
            }
            return Helper::rj('Preferences updated successfully', 200, []);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }



    public function getAutoReplyMessage(Request $request)
    {
        try {
            $autoReplyObj = new \App\Models\UserAutoReplyMessage();
            $data['list'] = $autoReplyObj->getListing(['user_id' => 0]);
            return Helper::rj('Information available', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function saveAutoReplyMessage(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'message' => 'required|max:255'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input['user_id'] = $this->_user->id;
                \App\Models\UserAutoReplyMessage::create($input);
                $autoReplyObj = new \App\Models\UserAutoReplyMessage();
                $data['list'] = $autoReplyObj->getListing(['user_id' => $this->_user->id]);
                return Helper::rj('Auto reply message saved successfully', 200, $data);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function getAllUserList(Request $request)
    {
        try {
            $user = $this->_user;
            $userObj = new \App\Models\User();
            $data['list'] = $userObj->getListing([
                'select' => ['users.id', 'username'],
                'role' => 'messenger',
                'not_user' => $this->_user->id,
                'with' => [
                    'customizeNickname' => function ($q) use ($user) {
                        return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                    }
                ]
            ]);
            return Helper::rj('Information available', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function getContactList(Request $request)
    {
        try {
            if (isset($request->nickname)) {
                $user = \App\Models\User::where([
                    'username' => $request->nickname,
                    'email' => $this->_user->email,
                    'status' => 1
                ])->first();
            } else {
                $user = $this->_user;
            }
            $contactListObj = new \App\Models\ContactList();
            if ($user) {
                $data['current_user'] = $user;
                $data['list'] = $contactListObj->getListing([
                    'user_id' => $user->id,
                    'with' => [
                        'customizeNickname' => function ($q) use ($user) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                        }
                    ]
                ]);
                /*$data['list'] = $data['list']->toArray();
                if (count($data['list'])) {
                    foreach ($data['list'] as $key => $list) {
                        if ($list['user_id'] == $user->id && $list['contact_user_id'] == $user->id) {
                            unset($data['list'][$key]);
                        }
                    }
                    $data['list'] = array_values($data['list']);
                }*/
                return Helper::rj('Information available', 200, $data);
            } else {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => 'You have entered an invalid nickname.'
                ]);

            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function getBlockList(Request $request)
    {
        try {
            if (isset($request->nickname)) {
                $user = \App\Models\User::where([
                    'username' => $request->nickname,
                    'email' => $this->_user->email,
                    'status' => 1
                ])->first();
            } else {
                $user = $this->_user;
            }
            $blocktListObj = new \App\Models\BlockList();
            if ($user) {
                $data['current_user'] = $user;
                $data['list'] = $blocktListObj->getListing([
                    'user_id' => $user->id,
                    'with' => [
                        'customizeNickname' => function ($q) use ($user) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                        }
                    ]
                ]);
                if (count($data['list'])) {
                    foreach ($data['list'] as $list) {
                        $list->makeVisible(['block_user']);
                    }
                }
                return Helper::rj('Information available', 200, $data);
            } else {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => 'You have entered an invalid nickname.'
                ]);

            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function removeAllContact(Request $request)
    {
        try {
            $validationRules = [
                'record_id' => 'array|min:1|required',
                'record_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                \App\Models\ContactList::whereIn('id', $request->record_id)->delete();
                return Helper::rj('Users successfully removed from your contact list.', 200, []);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function removeAllBlockUser(Request $request)
    {
        try {
            $validationRules = [
                'record_id' => 'array|min:1|required',
                'record_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                \App\Models\BlockList::whereIn('id', $request->record_id)->delete();
                return Helper::rj('Users successfully removed from your block list.', 200, []);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function uploadGalleryImage(Request $request)
    {
        try {
            $fileValidations = \App\Models\File::$fileValidations['image'];
            $validationRules = [
                'gallery' => 'required|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'],
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $galleryObj = new \App\Models\UserGallery();
                $records = $galleryObj->getListing(['user_id' => $this->_user->id]);
                if (count($records) >= 30) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Maximum 30 images are allowed to upload.'
                    ]);

                } else {
                    $input['user_id'] = $this->_user->id;
                    $data = \App\Models\UserGallery::create($input);
                    $file = \App\Models\File::upload($request, 'gallery', 'user_gallery', $data->id);
                    $gallery = $galleryObj->getListing(['id' => $data->id]);
                    return \App\Helpers\Helper::resp('Gallery image uploaded successfully.', 200, $gallery);
                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function getAllGalleryImages()
    {
        try {
            $galleryObj = new \App\Models\UserGallery();
            $data['list'] = $galleryObj->getListing(['user_id' => $this->_user->id]);
            return \App\Helpers\Helper::resp('Record found.', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function deleteGalleryImage(Request $request)
    {
        try {
            $validationRules = [
                'record_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $galleryObj = new \App\Models\UserGallery();
                $data = $galleryObj->getListing(['id' => $request->record_id, 'user_id' => $this->_user->id]);
                if ($data) {
                    $g_image = $data->gallery_pic;
                    \App\Models\File::deleteFile($g_image, true);
                    \App\Models\UserGallery::find($request->record_id)->delete();
                }
                return \App\Helpers\Helper::resp('Image deleted successfully.', 200, []);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function deleteAllGalleryImage(Request $request)
    {
        try {
            $galleryObj = new \App\Models\UserGallery();
            $records = $galleryObj->getListing(['user_id' => $this->_user->id]);
            if (count($records)) {
                foreach ($records as $gallery) {
                    $g_image = $gallery->gallery_pic;
                    \App\Models\File::deleteFile($g_image, true);
                    \App\Models\UserGallery::find($gallery->id)->delete();
                }
                $data['list'] = $galleryObj->getListing(['user_id' => $this->_user->id]);
                return \App\Helpers\Helper::resp('Images deleted successfully.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function getAllAcounts(Request $request)
    {
        try {
            $userObj = new \App\Models\User();
            $data['list'] = $userObj->getListing([
                'select' => ['users.id', 'username', 'deleted_at'],
                'account_email' => $this->_user->email
            ]);
            if (count($data['list'])) {
                foreach ($data['list'] as $list) {
                    $list->makeVisible(['deleted_at']);
                }
            }
            return \App\Helpers\Helper::resp('Record found.', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function deleteAcount(Request $request)
    {
        try {
            $validationRules = [
                'record_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                if ($input['record_id'] == $this->_user->id) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! You can not delete currently logged in account.'
                    ]);

                } else {
                    \App\Models\BlockList::where('user_id', $input['record_id'])->orWhere('block_user_id', $input['record_id'])->delete();
                    \App\Models\ContactList::where('user_id', $input['record_id'])->orWhere('contact_user_id', $input['record_id'])->delete();
                    \App\Models\CustomizeNickname::where('user_id', $input['record_id'])->orWhere('for_user_id', $input['record_id'])->delete();
                    \App\Models\OauthAccessToken::where('user_id', $input['record_id'])->delete();
                    \App\Models\RoomBannedUser::where('user_id', $input['record_id'])->delete();
                    \App\Models\RoomChat::where('user_id', $input['record_id'])->delete();
                    \App\Models\RoomFavourite::where('user_id', $input['record_id'])->delete();
                    \App\Models\RoomKickUser::where('user_id', $input['record_id'])->delete();
                    \App\Models\RoomUser::where('user_id', $input['record_id'])->forceDelete();
                    \App\Models\VoiceVideoMessage::where('from_user_id', $input['record_id'])->delete();
                    \App\Models\User::find($input['record_id'])->delete();
                    return \App\Helpers\Helper::resp('Account deleted successfully.', 200, []);
                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function undoAcount(Request $request)
    {
        try {
            $validationRules = [
                'record_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $data = \App\Models\User::where('id', $input['record_id'])
                    ->onlyTrashed()->update(['deleted_at' => null]);
                if ($data)
                    return \App\Helpers\Helper::resp('Your account has been restored successfully.', 200, []);
                else
                    return \App\Helpers\Helper::resp('Something went wrong. Please try again later.', 401, []);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function uploadCustomizeSound(Request $request)
    {
        try {
            $fileValidations = \App\Models\File::$fileValidations['audio'];
            $validationRules = [
                'sound' => 'required|mimes:' . $fileValidations['mime'] . '|max:' . $fileValidations['max'],
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input['user_id'] = $this->_user->id;
                $data = \App\Models\UserCustomizeSound::create($input);
                $file = \App\Models\File::upload($request, 'sound', 'customize_sound', $data->id);
                $soundObj = new \App\Models\UserCustomizeSound();
                $sound = $soundObj->getListing(['id' => $data->id]);
                $sound->makeVisible(['customize_sound']);
                return \App\Helpers\Helper::resp('Customize sound uploaded successfully.', 200, $sound);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function getAllCustomizeSound(Request $request)
    {
        try {
            $soundObj = new \App\Models\UserCustomizeSound();
            $data['list'] = $soundObj->getListing([
                'user_id' => $this->_user->id,
                'is_default' => 1
            ]);
            if (count($data['list'])) {
                foreach ($data['list'] as $list) {
                    $list->makeVisible(['customize_sound']);
                }
            }
            return \App\Helpers\Helper::resp('Record found.', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function deleteCustomizeSound(Request $request)
    {
        try {
            $validationRules = [
                'record_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $soundObj = new \App\Models\UserCustomizeSound();
                $data = $soundObj->getListing(['id' => $request->record_id, 'user_id' => $this->_user->id]);

                if ($data) {
                    $c_sound = $data->customize_sound;
                    \App\Models\File::deleteFile($c_sound, true);
                    \App\Models\UserCustomizeSound::find($request->record_id)->delete();
                    return \App\Helpers\Helper::resp('Sound deleted successfully.', 200, []);
                } else {
                    return \App\Helpers\Helper::resp('Something went wrong. Please try again later.', 401, []);
                }

            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }


}
