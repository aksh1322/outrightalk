<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Events\UploadAudioVideoEvent;
use Owenoj\LaravelGetId3\GetId3;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\Helper;
use Auth;

use App\Models\SiteSettingUserStructure;

class MessageController extends Controller
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

    public function checkPasswordEnable(Request $request, $type = 'voice')
    {
        try {
            if ($type == 'voice') {
                $key = 'enable_voicemail_password';
            } else {
                $key = 'enable_video_message_password';
            }
            $data = $this->_model->getListing([
                'select' => ['field_type'],
                'key' => $key,
                'user_id' => $this->_user->id
            ]);
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function checkPassword(Request $request)
    {
        try {
            $validationRules = [
                'type' => 'required',
                'password' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                if ($input['type'] == 'voice') {
                    $key = 'voicemail_password';
                } else {
                    $key = 'video_message_password';
                }
                $data = $this->_model->getListing([
                    'val' => $input['password'],
                    'key' => $key,
                    'user_id' => $this->_user->id
                ]);
                if ($data) {
                    return Helper::rj('Password matched.', 200, $data);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You have entered invalid password.'
                    ]);

                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function getContactList(Request $request, $type = 'voice')
    {
        try {
            if ($type == 'voice') {
                $setting_key = 'receive_voicemail_contact_list';
            } else {
                $setting_key = 'receive_video_message_contact_list';
            }

            $user = $this->_user;
            $contactListObj = new \App\Models\ContactList();
            $data['list'] = $contactListObj->getListing([
                'user_id' => $this->_user->id,
                //'settings' => $setting_key,
                'visible_status' => [1, 2, 3, 4],
                'orderBy' => 'field',
                'with' => [
                    'customizeNickname' => function ($q) use ($user) {
                        return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                    }
                ],
                //'get_sql' => 1
            ]);
            return Helper::rj('Information available', 200, $data);

        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function checkUserAvailability(Request $request)
    {
        try {
            $validationRules = [
                'type' => 'required',
                'to_user' => 'array|min:1|required',
                'to_user.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                if (count($input['to_user'])) {
                    $userObj = new \App\Models\User();
                    if ($input['type'] == 'voice') {
                        $setting_key = 'receive_voicemail_contact_list';
                    } else {
                        $setting_key = 'receive_video_message_contact_list';
                    }
                    $data['is_popup_open'] = 0;
                    $data['is_forward_to_next_step'] = 1;
                    $data['msg'] = 'User';
                    $users = $data['remove_users'] = [];
                    foreach ($input['to_user'] as $key => $to_user) {
                        //check user set the preference 
                        //to receive voicemail or video messages from their contact list only.
                        $setting = \App\Models\SiteSettingUser::join('site_setting_user_structures', function ($join) use ($setting_key) {
                            $join->on("site_setting_user_structures.id", "site_setting_users.site_setting_id")
                                ->where("site_setting_user_structures.key", $setting_key);
                        })
                            ->where("site_setting_users.user_id", $to_user)
                            ->where("site_setting_users.val", 1)
                            ->first();
                        if ($setting) {
                            //check sending user exist in contact user's contact list
                            $isNotExist = \App\Models\ContactList::where([
                                'user_id' => $to_user,
                                'contact_user_id' => $this->_user->id
                            ])->doesntExist();
                            if ($isNotExist) {
                                $data['is_popup_open'] = 1;
                                $info = \App\Models\User::select(\DB::raw("IF(cn.nickname IS NULL, users.username, cn.nickname) AS nickname"))
                                    ->leftJoin("customize_nicknames as cn", function ($join) {
                                        $join->on("cn.for_user_id", "users.id")
                                            ->where("cn.user_id", $this->_user->id);
                                    })
                                    ->where('users.id', $to_user)
                                    ->first();
                                if ($info) {
                                    $data['remove_users'][] = $to_user;
                                    $users[] = $info->nickname;
                                }
                                unset($input['to_user'][$key]);
                            }
                        }
                    }
                    if (count($users)) {
                        $data['msg'] .= ' ' . implode(",", $users);
                    }
                    $data['msg'] .= ' has set his/her preference to receive ' . $input['type'] . ' mails from his/her contact only';
                    if (!count($input['to_user'])) {
                        $data['is_forward_to_next_step'] = 0;
                    }
                }
                return Helper::rj('Users check successfully.', 200, $data);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function sendMessage(Request $request)
    {

        try {
            $fileValidations = \App\Models\File::$fileValidations['audio_video'];

            // // |mimetypes:' . implode(",", $fileValidations['file_mimes'])

            $validationRules = [
                'type' => 'required',
                'to_user' => 'array|min:1|required',
                'to_user.*' => 'required',
                'title' => 'required|max:255',
                // 'send_file' => 'required'
            ];

            if (isset($request->posted_date) && !isset($request->posted_time)) {
                $validationRules['posted_time'] = 'required';
            }
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                // return \App\Helpers\Helper::rj('Bad Request', 400, [
                //     'errors' => $validator->errors()
                // ]);
                // return $response;
                return Helper::rj($validator->errors(), 400);
            } else {

                DB::beginTransaction();


                // $fileMimeType = request()->file('send_file')->getClientMimeType();

                // if ((str_contains($fileMimeType, 'video') && $request->type == 'voice') || (str_contains($fileMimeType, 'audio') && $request->type == 'video')) {
                //     return \App\Helpers\Helper::rj('Bad Request', 400, [
                //         'error' => 'File type should match message type file'
                //     ]);
                //     
                // }

                $input = $request->all();
                $input['from_user_id'] = $this->_user->id;
                $file_length = 90;
                if ($this->_user->is_subscribed) {
                    if (count($this->_user->is_subscribed->feature)) {
                        foreach ($this->_user->is_subscribed->feature as $feature) {
                            if ($request->type == 'video' && $feature->type == 'video_msg_length') {
                                $file_length = $feature->value;
                            } elseif ($request->type == 'voice' && $feature->type == 'voice_mail_length') {
                                $file_length = $feature->value;
                            }
                        }
                    }
                }

                //calculate length of incoming file
                //instantiate class with file

                $track = new GetId3(request()->file('send_file'));

                $upload_file_length = ((int) $track->getPlaytimeSeconds());

                //return Helper::rj('Message send successfully.', 200, [$upload_file_length]);
                if ($upload_file_length > $file_length) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'uploaded file length has existed the maximum limit.'
                    ]);

                }

                if (
                    (isset($input['posted_date']) && $input['posted_date']) &&
                    (isset($input['posted_time']) && isset($input['posted_time']))
                ) {
                    $posted_date = date('Y-m-d', strtotime($input['posted_date'])) . ' ' . date('H:i', strtotime($input['posted_time']));
                    $posted_date = Helper::convertLocalTimezoneToSystemTimezone($posted_date, true, $this->_user->timezone);
                    $input['posted_time'] = $posted_date;
                } else {
                    $input['posted_time'] = (new \DateTime())->format("Y-m-d H:i");
                }
                if (count($input['to_user'])) {
                    $entity_ids = [];
                    $vvObj = new \App\Models\VoiceVideoMessage();
                    foreach ($input['to_user'] as $to_user) {
                        $input['to_user_id'] = $to_user;
                        $message = \App\Models\VoiceVideoMessage::create($input);
                        $entity_ids[] = $message->id;
                        $msginfo = $vvObj->getListing([
                            'id' => $message->id,
                            'user_id' => $to_user,
                            'is_view' => 0,
                            'type' => $input['type'],
                            'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                            'with' => [
                                'fromUser' => function ($q) use ($to_user) {
                                    return $q->select('id', 'visible_status', 'is_loggedout', 'username')
                                        ->whereNull('deleted_at')
                                        ->with([
                                            'customizeNickname' => function ($q) use ($to_user) {
                                                return $q->select('for_user_id', 'nickname')
                                                    ->where(['user_id' => $to_user]);
                                            }
                                        ]);

                                }
                            ],
                            //'get_sql' => 1
                        ]);
                        $param['user'][] = [
                            'id' => $to_user,
                            'info' => ($msginfo) ? $msginfo->makeHidden(['message_file'])->toArray() : null,
                        ];
                        $parmeter['user'][] = [
                            'id' => $to_user,
                            'unread_notbook_cnt' => \App\Models\NoteBookShare::where(['share_user_id' => $to_user, 'is_viewed' => 0])->count(),
                            'unread_voicemail_cnt' => $vvObj->getListing([
                                'user_id' => $to_user,
                                'is_view' => 0,
                                'type' => 'voice',
                                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                                'count' => 1
                            ]),
                            'unread_videomsg_cnt' => $vvObj->getListing([
                                'user_id' => $to_user,
                                'is_view' => 0,
                                'type' => 'video',
                                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                                'count' => 1
                            ])
                        ];
                    }
                    if (count($entity_ids)) {
                        $user = $this->_user;
                        //$file = \App\Models\File::upload($request, 'send_file', 'audio_video_message', $entity_ids[0]);
                        event(new UploadAudioVideoEvent($request, 'send_file', $entity_ids));
                        /*if ($file) {                            
                            unset($entity_ids[0]);
                            if (count($entity_ids)) {
                                foreach ($entity_ids as $entity_id) {
                                    $newFile = $file->replicate();
                                    $newFile->entity_id = $entity_id;
                                    $newFile->save();
                                }
                            }
                        }*/
                    }
                    if (isset($param['user'][0]['info'])) {
                        $param['type'] = $input['type'];
                        Helper::emit($param, 'VoiceVideoNoteChnl');
                    }
                    Helper::emit($parmeter, 'VVNCntChnl');
                }
                DB::commit();
                return Helper::rj('Message send successfully.', 200, []);
            }
        } catch (\Exception $ex) {
            DB::rollBack();
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function messageList(Request $request, $type = 'voice')
    {
        try {
            $user = $this->_user;
            $vvObj = new \App\Models\VoiceVideoMessage();
            $data['unread_message'] = $vvObj->getListing([
                'user_id' => $this->_user->id,
                'is_view' => 0,
                'type' => $type,
                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                'with' => [
                    'fromUser' => function ($q) use ($user) {
                        return $q->select('id', 'visible_status', 'is_loggedout', 'username')
                            ->whereNull('deleted_at')
                            ->with([
                                'customizeNickname' => function ($q) use ($user) {
                                    return $q->select('for_user_id', 'nickname')
                                        ->where(['user_id' => $user->id]);
                                }
                            ]);

                    }
                ],
                //'get_sql' => 1
            ])->makeHidden(['message_file']);
            $data['old_message'] = $vvObj->getListing([
                'user_id' => $this->_user->id,
                'is_view' => 1,
                'type' => $type,
                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                'with' => [
                    'fromUser' => function ($q) use ($user) {
                        return $q->select('id', 'visible_status', 'is_loggedout', 'username')
                            ->whereNull('deleted_at')
                            ->with([
                                'customizeNickname' => function ($q) use ($user) {
                                    return $q->select('for_user_id', 'nickname')
                                        ->where(['user_id' => $user->id]);
                                }
                            ]);

                    }
                ],
                //'get_sql' => 1
            ])->makeHidden(['message_file']);
            $data['deleted_message'] = $vvObj->getListing([
                'user_id' => $this->_user->id,
                'type' => $type,
                'is_deleted' => 1,
                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                'with' => [
                    'fromUser' => function ($q) use ($user) {
                        return $q->select('id', 'visible_status', 'is_loggedout', 'username')
                            ->whereNull('deleted_at')
                            ->with([
                                'customizeNickname' => function ($q) use ($user) {
                                    return $q->select('for_user_id', 'nickname')
                                        ->where(['user_id' => $user->id]);
                                }
                            ]);

                    }
                ],
                //'get_sql' => 1
            ])->makeHidden(['message_file']);
            return Helper::rj('Information available', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function deleteMessage(Request $request)
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
                $input = $request->all();
                if (count($input['record_id'])) {
                    \App\Models\VoiceVideoMessage::whereIn('id', $input['record_id'])->delete();
                    if (count($input['record_id']) == 1)
                        $msg = 'Message';
                    else
                        $msg = 'Messages';
                    return Helper::rj($msg . ' deleted successfully.', 200, []);
                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function restoreMessage(Request $request)
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
                $update = \App\Models\VoiceVideoMessage::where('id', $request->record_id)
                    ->withTrashed()->update(['deleted_at' => null]);
                if ($update) {
                    return Helper::rj('Message restored successfully.', 200, []);
                } else {
                    return Helper::rj('Something went wrong. Please try again later.', 400, []);
                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function viewMessage(Request $request)
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
                $vvObj = new \App\Models\VoiceVideoMessage();
                $data = $vvObj->getListing([
                    'id' => $request->record_id
                ]);
                if (!$data) {
                    throw new \Exception('Record not found');
                }
                $data->update(['is_view' => 1]);
                $vvObj = new \App\Models\VoiceVideoMessage();
                $parmeter['user'][] = [
                    'id' => $this->_user->id,
                    'unread_notbook_cnt' => \App\Models\NoteBookShare::where(['share_user_id' => $this->_user->id, 'is_viewed' => 0])->count(),
                    'unread_voicemail_cnt' => $vvObj->getListing([
                        'user_id' => $this->_user->id,
                        'is_view' => 0,
                        'type' => 'voice',
                        'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                        'count' => 1
                    ]),
                    'unread_videomsg_cnt' => $vvObj->getListing([
                        'user_id' => $this->_user->id,
                        'is_view' => 0,
                        'type' => 'video',
                        'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                        'count' => 1
                    ])
                ];
                Helper::emit($parmeter, 'VVNCntChnl');
                return Helper::rj('Information available', 200, $data);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }
}
