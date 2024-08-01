<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use App\Helpers\Helper;
use App\Models\Pm;
use App\Models\PmUser;
use App\Models\Stream;

use Auth;
use DB;
use stdClass;
use App\Services\SendBirdChannelService;

class PmController extends Controller
{
    public $successStatus = 200;

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });

    }

    public function sendPm(Request $request, SendBirdChannelService $sendBirdChatService)
    {
        dd($request->all());
        DB::beginTransaction();
        $sendBirdChannel = null;
        $pms = null;
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
                //check pm already exist or
                //not between these two users
                $user = $this->_user;
                $pmObj = new Pm();
                $userid = $request->user_id;
                $ownid = $user->id;


                if ($userid == $ownid) {
                    $pmIds = Pm::leftJoin('pm_users', 'pms.id', '=', 'pm_users.pm_id')
                        ->where(function ($query) use ($ownid) {
                            $query->where('pm_users.user_id', $ownid)
                                ->where('pm_users.joined_by_id', $ownid)
                                ->where('pm_users.is_self', 1);
                        })
                        ->pluck('pms.id')->first();

                    // throw new HttpResponseException(response()->json(['error'=>'test1'], 400));

                    if ($pmIds) {

                        $data = $pmObj->getListing([
                            'id' => $pmIds
                        ]);
                        \App\Models\PmUser::where('pm_id', $pmIds)->where('user_id', \Auth::id())->update(['is_close' => 0]);

                        DB::commit();
                        return Helper::rj('Record found', 200, $data);
                    } else {

                        // Create Pm Single Channel
                        $sendBirdChannelResponse = $sendBirdChatService->createUserPMChannel([$user->id, $request->user_id], 'single');

                        if (!$sendBirdChannelResponse->ok()) {
                            throw new \Exception('Something went wrong' . $sendBirdChannelResponse->object()->message);
                        }


                        $sendBirdChannel = $sendBirdChannelResponse->object();

                        $pm = Pm::create([
                            'is_initialize' => 0,
                            'tot_user' => 2,
                            'send_bird_channel_url' => $sendBirdChannel->channel_url,
                            'send_bird_channel_name' => $sendBirdChannel->name
                        ]);

                        dispatch(function () use ($pm, $sendBirdChatService) {

                            $customKeys = [
                                'type' => 'pm',
                                'pm_id' => (string) $pm->id
                            ];

                            $audioRoom = $sendBirdChatService->createAudioVideoRoom('PMS', 'audio', $customKeys);
                            $videoRoom = $sendBirdChatService->createAudioVideoRoom('PMS', 'video', $customKeys);

                            $pms = Pm::find($pm->id);
                            $pms->update([
                                'send_bird_video_call_room_id' => $videoRoom->room->room_id,
                                'send_bird_audio_call_room_id' => $audioRoom->room->room_id
                            ]);

                        })->afterResponse();


                        $ewnqaeq = Helper::createPmUsers($request, $pm, $user->id, $request->user_id);
                        $data = $pmObj->getListing([
                            'id' => $pm->id
                        ]);

                        DB::commit();
                        return Helper::rj('PM created successfully.', 200, $data);
                    }
                } else {


                    $pmIds = Pm::leftJoin('pm_users', 'pms.id', '=', 'pm_users.pm_id')
                        ->where(function ($query) use ($userid, $ownid) {
                            $query->where('pm_users.user_id', $userid)
                                ->where('pm_users.joined_by_id', $ownid)
                                ->where('pm_users.is_self', 0)
                                ->where('pm_users.is_added', 0);
                        })
                        ->orWhere(function ($query) use ($userid, $ownid) {
                            $query->where('pm_users.user_id', $ownid)
                                ->where('pm_users.joined_by_id', $userid)
                                ->where('pm_users.is_self', 0)
                                ->where('pm_users.is_added', 0);
                        })
                        ->pluck('pms.id')->first();

                    // throw new HttpResponseException(response()->json(['error'=>'test3','data'=>[$pmIds]], 400));

                    if ($pmIds) {
                        $data = $pmObj->getListing([
                            'id' => $pmIds
                        ]);
                        $admin = \App\Models\PmUser::where('pm_id', $pmIds)->where('is_admin', 1)->first();
                        //dd($admin);
                        if ($admin) {
                            if ($admin->is_close == 1) {
                                \App\Models\PmUser::where('pm_id', $pmIds)->where('user_id', \Auth::id())->where('is_added', 0)->update(['is_admin' => 1, 'is_close' => 0]);
                                $admin->update(['is_admin' => 0]);
                            } else {
                                \App\Models\PmUser::where('pm_id', $pmIds)->where('user_id', \Auth::id())->update(['is_close' => 0]);
                            }
                        } else {
                            \App\Models\PmUser::where('pm_id', $pmIds)->where('user_id', \Auth::id())->where('is_added', 0)->update(['is_admin' => 1, 'is_close' => 0]);
                        }


                        DB::commit();
                        return Helper::rj('Record found', 200, $data);
                    } else {

                        info("pm Creation ", [$user->id, $request->user_id]);
                        // Create Pm Single Channel
                        $sendBirdChannelResponse = $sendBirdChatService->createUserPMChannel([$user->id, $request->user_id], 'single');

                        if (!$sendBirdChannelResponse->ok()) {
                            throw new \Exception('Something went wrong! ' . $sendBirdChannelResponse->object()->message);
                        }


                        $sendBirdChannel = $sendBirdChannelResponse->object();

                        $pm = Pm::create([
                            'is_initialize' => 0,
                            'tot_user' => 2,
                            'send_bird_channel_url' => $sendBirdChannel->channel_url,
                            'send_bird_channel_name' => $sendBirdChannel->name
                        ]);


                        dispatch(function () use ($pm, $sendBirdChatService) {

                            $customKeys = [
                                'type' => 'pm',
                                'pm_id' => (string) $pm->id
                            ];

                            info("creating audio video room for PM");

                            $audioRoom = $sendBirdChatService->createAudioVideoRoom('PMS', 'audio', $customKeys);
                            $videoRoom = $sendBirdChatService->createAudioVideoRoom('PMS', 'video', $customKeys);

                            $pms = Pm::find($pm->id);
                            $pms->update([
                                'send_bird_video_call_room_id' => $videoRoom->room->room_id,
                                'send_bird_audio_call_room_id' => $audioRoom->room->room_id
                            ]);

                        })->afterResponse();

                        $ewnqaeq = Helper::createPmUsers($request, $pm, $user->id, $request->user_id);
                        $data = $pmObj->getListing([
                            'id' => $pm->id
                        ]);

                        DB::commit();
                        return Helper::rj('PM created successfully.', 200, $data);
                    }
                }

            }
        } catch (\Exception $e) {
            DB::rollback();
            if (!empty($sendBirdChannel)) {
                $sendBirdChannel = $sendBirdChatService->deleteUserPMChannel($sendBirdChannel->channel_url, $pms);
            }
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function pmDetails(Request $request, SendBirdChannelService $sendBirdChatService)
    {

        try {
            $validationRules = [
                'pm_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);

            } else {

                $user = $this->_user;

                $pmObj = new Pm();
                $data = $pmObj->getListing([
                    'id' => $request->pm_id
                ]);

                if (empty($data->send_bird_channel_url)) {
                    try {
                        // Create Pm Single Channel
                        $channelUsers = array_unique(array_merge([$user->id], $data->users->pluck('user_id')->toArray()));
                        $sendBirdChannelResponse = $sendBirdChatService->createUserPMChannel($channelUsers, 'single');

                        if (!$sendBirdChannelResponse->ok()) {
                            throw new \Exception('Something went wrong! ' . $sendBirdChannelResponse->object()->message);
                        }


                        $channel = $sendBirdChannelResponse->object();

                        $pm = Pm::where('id', $data->id)->update([
                            'send_bird_channel_url' => $channel->channel_url,
                            'send_bird_channel_name' => $channel->name
                        ]);

                        $pm_id = $data->id;

                        dispatch(function () use ($pm, $sendBirdChatService, $pm_id) {

                            $customKeys = [
                                'type' => 'pm',
                                'pm_id' => $pm_id ?? (string) $pm->id
                            ];

                            $audioRoom = $sendBirdChatService->createAudioVideoRoom('PMS', 'audio', $customKeys);
                            $videoRoom = $sendBirdChatService->createAudioVideoRoom('PMS', 'video', $customKeys);

                            $pms = Pm::find($pm->id);
                            $pms->update([
                                'send_bird_video_call_room_id' => $videoRoom->room->room_id,
                                'send_bird_audio_call_room_id' => $audioRoom->room->room_id
                            ]);

                        })->afterResponse();

                        $data->send_bird_channel_url = $channel->channel_url;
                        $data->send_bird_channel_name = $channel->name;

                    } catch (\Exception $e) {
                        info("PM Controller pmDetails data", [$data]);
                        info("PM Controller pmDetails Exception", [$e]);
                    }
                }

                // Helper::emit($data, 'pmDetails');
                return Helper::rj('Record found', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function pmAddNew(Request $request, SendBirdChannelService $sendBirdChatService)
    {

        DB::beginTransaction();
        $isUserAddToSendBird = null;
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required|exists:pms,id',
                'accepted' => 'required|boolean'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $notificationRecord = null;
                $notification['user'][] = [];

                $pmObj = new Pm();
                $data = $pmObj->getListing([
                    'id' => $request->pm_id
                ]);

                $admin = $data->users->where('is_admin', 1)->first();

                $other_user = $data->users->where('is_admin', 0)->where('is_added', 0)->first();



                $sentNotification = \App\Models\Notification::where(['to_user_id' => $this->_user->id, 'entity_id' => $request->pm_id, 'type' => 'pm_invite', 'is_accepted' => 0])->withTrashed()->first();

                //dd($sentNotification);

                if (!$sentNotification) {
                    return Helper::rj('Invitation not found', 404);
                }

                $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                    ->where(['for_user_id' => $admin->user_id, 'user_id' => $this->_user->id])
                    ->first();



                $admin_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                    ->where(['for_user_id' => $admin->user_id, 'user_id' => $other_user->user_id])
                    ->first();



                $invited_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                    ->where(['for_user_id' => $this->_user->id, 'user_id' => $other_user->user_id])
                    ->first();

                if (!$request->accepted) {

                    $notificationRecord = \App\Models\Notification::create([
                        'from_user_id' => $this->_user->id,
                        'to_user_id' => $admin->user_id,
                        'type' => 'pm_notification',
                        'entity_id' => $request->pm_id,
                        'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $this->_user->username) . ' has rejected your invitation for PM.',
                    ]);

                    $notification['user'][] = $notificationRecord;



                    Helper::emit($notification, 'Invite');

                    // send notification to other user that new user has been rejected invitation to PM


                    $record = \App\Models\Notification::create([
                        'from_user_id' => $admin->user_id,
                        'to_user_id' => $other_user->user_id,
                        'type' => 'pm_notification',
                        'entity_id' => $request->pm_id,
                        'message' => $admin_customized_nickname ? $admin_customized_nickname->nickname : $admin->userInfo->username . ' PM invitation has been rejected by ' . ($invited_customized_nickname ? $invited_customized_nickname->nickname : $this->_user->username) . '',
                    ]);
                    $notData['user'][] = $record;
                    //$notData['type'] = 'pm_notification';


                    Helper::emit($notData);

                    $sentNotification->delete();
                    DB::commit();
                    return Helper::rj('Invitation has been rejected successfully and sender notified.', 200, []);

                } else {
                    $user = $this->_user->id;

                    $total_users = $data->total_pm_users + 1;
                    if ($total_users > 3) {
                        $sentNotification->delete();
                        DB::commit();
                        return Helper::rj('Maximum 3 users are allowed within a PM.', 403);
                    } else {
                        $data->update(['tot_user' => $total_users, 'pm_type' => 'group']);



                        $notification['user'] = [];
                        $otherData['user'] = [];
                        $param = [];
                        $existing_users = $data->users;
                        $roomExt = $data->fresh();

                        $userInfo = \App\Models\User::select('ip_addr', 'timezone')->where('id', $user)->first();
                        $pmUser = \App\Models\PmUser::where('pm_id', $roomExt->id)->where('user_id', $user)->where('joined_by_id', $this->_user->id)->first();

                        // DB::rollback();
                        // throw new HttpResponseException(response()->json(['pmAdd test1' => ['user_info' => $userInfo ,'pmUser' => $pmUser]], 400));

                        $newUser = null;

                        if ($pmUser) {
                            $pmUser->is_admin = 0;
                            $pmUser->is_added = 1;
                            $pmUser->is_close = 0;
                            $pmUser->save();
                        } else {

                            // DB::rollback();
                            // throw new HttpResponseException(response()->json(['pmAdd test2' => ['user_info' => $userInfo ,'pmUser' => $pmUser]], 400));



                            $isUserAddToSendBird = new stdClass();
                            $isUserAddToSendBird->send_bird_channel_url = $roomExt->send_bird_channel_url;
                            // Add User To SendBirdPM Channel
                            $sendBirdChatService->addUserToChannel([$user], $roomExt->send_bird_channel_url);


                            $newUser = PmUser::create([
                                'pm_id' => $data->id,
                                'user_id' => $user,
                                'joined_by_id' => $admin->user_id,
                                'ip_addr' => $userInfo->ip_addr,
                                'timezone' => $userInfo->timezone,
                                'is_admin' => 0,
                                'is_added' => 1
                            ]);

                            if ($newUser) {
                                $recentPm = \App\Models\PmRecent::where('pm_id', $data->id)->first();
                                //dd($recentPm);
                                $closedData = $recentPm && $recentPm->is_closed ? json_decode($recentPm->is_closed) : null;

                                if ($closedData) {
                                    $encodeData = collect($closedData);
                                    $encodeData[$user] = false;
                                    $recentPm->update(['third_user_id' => $user, 'is_closed' => json_encode($encodeData)]);
                                }
                            }
                        }

                        // $isNotExist = \App\Models\UserPmSetting::where(['user_id' => $user, 'pm_id' => $data->id])->doesntExist();
                        // if ($isNotExist) {
                        //     $isDefaultPmSettings = \App\Models\UserPmDefaultSetting::where([
                        //         'user_id' => $user,
                        //         'pm_id' => $data->id
                        //     ])->first();
                        //     if ($isDefaultPmSettings) {
                        //         \App\Models\UserPmDefaultSetting::query()
                        //             ->where(['user_id' => $user, 'pm_id' => $data->id])
                        //             ->each(function ($isDefaultPmSettings) {
                        //                 $newPmSettings = $isDefaultPmSettings->replicate();
                        //                 $newPmSettings->setTable('user_pm_settings');
                        //                 $newPmSettings->save();
                        //             });
                        //     } else {
                        //         \App\Models\UserPmSetting::updateOrCreate(
                        //             [
                        //                 'user_id' => $user,
                        //                 'pm_id' => $data->id
                        //             ],
                        //             [
                        //                 'user_id' => $user,
                        //                 'pm_id' => $data->id
                        //             ]
                        //         );
                        //         \App\Models\UserPmDefaultSetting::updateOrCreate(
                        //             [
                        //                 'user_id' => $user,
                        //                 'pm_id' => $data->id
                        //             ],
                        //             [
                        //                 'user_id' => $user,
                        //                 'pm_id' => $data->id
                        //             ]
                        //         );
                        //     }
                        // }
                        if ($data->is_initialize) {

                            $notificationRecord = \App\Models\Notification::create([
                                'from_user_id' => $this->_user->id,
                                'to_user_id' => $admin->user_id,
                                'type' => 'pm_notification',
                                'entity_id' => $request->pm_id,
                                'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $this->_user->username) . ' has accepted your invitation, added to PM successfully.',
                            ]);

                            $notification['user'][] = $notificationRecord;

                            $record = \App\Models\Notification::create([
                                'from_user_id' => $admin->user_id,
                                'to_user_id' => $other_user->user_id,
                                'type' => 'pm_notification',
                                'entity_id' => $request->pm_id,
                                'message' => (($admin_customized_nickname) ? $admin_customized_nickname->nickname : $admin->userInfo->username) . ' PM invitation has been accepted by ' . ($invited_customized_nickname ? $invited_customized_nickname->nickname : $this->_user->username) . ', added to PM successfully.',
                            ]);

                            $otherData['user'][] = $record;
                            // $otherData['type'] = 'pm_notification';

                            if (count($existing_users)) {
                                foreach ($existing_users as $room_user) {
                                    $frm_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                        ->where(['for_user_id' => $user, 'user_id' => $room_user->user_id])
                                        ->first();

                                    // If New User than add it to resposne otherwise not
                                    if ($newUser) {

                                        $newUser->user_info = \App\Models\User::select('id', 'username', 'visible_status', 'is_loggedout')->where('id', $newUser->user_id)->first();
                                        $newUser->user_info->customize_nickname = $frm_customized_nickname;
                                        $param['user'][(int) $room_user->user_id][] = [
                                            'new_user' => $newUser
                                        ];
                                    }
                                }
                            }
                        }


                        $param['pm_id'] = (int) $request->pm_id;
                        $param['type'] = 'add';

                        Helper::emit($param, 'pmAddRemove');

                        sleep(1);

                        Helper::emit($notification, 'Invite');

                        sleep(1);

                        Helper::emit($otherData, 'Invite');

                        $sentNotification->update(["is_accepted" => 1]);

                        DB::commit();
                        return Helper::rj('Invitation has been accepted, added to PM and notified sender successfully.', 200, []);


                    }

                }

            }
        } catch (\Exception $e) {
            DB::rollback();

            // Remove User if added and any exception occur
            if (!empty($isUserAddToSendBird)) {
                $sendBirdChatService->removeUsersFromChannel($this->_user->id, $isUserAddToSendBird->send_bird_channel_url);
            }
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function pmAdd(Request $request, SendBirdChannelService $sendBirdChatService)
    {

        DB::beginTransaction();
        $isUserAddToSendBird = null;
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required',
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $pmObj = new Pm();
                $data = $pmObj->getListing([
                    'id' => $request->pm_id
                ]);
                $total_users = $data->total_pm_users + count($input['user_id']);
                if ($total_users > 3) {
                    throw new \Exception('Maximum 3 users are allowed within a PM.');
                } else {
                    $data->update(['tot_user' => $total_users, 'pm_type' => 'group']);


                    if (count($input['user_id'])) {
                        $notification['user'] = [];
                        $param = [];
                        $existing_users = $data->users;
                        $roomExt = $data->fresh();
                        foreach ($input['user_id'] as $user) {
                            $userInfo = \App\Models\User::select('ip_addr', 'timezone')->where('id', $user)->first();
                            $pmUser = \App\Models\PmUser::where('pm_id', $roomExt->id)->where('user_id', $user)->where('joined_by_id', $this->_user->id)->first();

                            // DB::rollback();
                            // throw new HttpResponseException(response()->json(['pmAdd test1' => ['user_info' => $userInfo ,'pmUser' => $pmUser]], 400));

                            $newUser = null;

                            if ($pmUser) {

                                $pmUser->is_close = 0;
                                $pmUser->save();
                            } else {

                                // DB::rollback();
                                // throw new HttpResponseException(response()->json(['pmAdd test2' => ['user_info' => $userInfo ,'pmUser' => $pmUser]], 400));



                                $isUserAddToSendBird = new stdClass();
                                $isUserAddToSendBird->send_bird_channel_url = $roomExt->send_bird_channel_url;
                                // Add User To SendBirdPM Channel
                                $sendBirdChatService->addUserToChannel([$user], $roomExt->send_bird_channel_url);


                                $newUser = PmUser::create([
                                    'pm_id' => $data->id,
                                    'user_id' => $user,
                                    'joined_by_id' => $this->_user->id,
                                    'ip_addr' => $userInfo->ip_addr,
                                    'timezone' => $userInfo->timezone,
                                    'is_added' => 1
                                ]);
                            }

                            // $isNotExist = \App\Models\UserPmSetting::where(['user_id' => $user, 'pm_id' => $data->id])->doesntExist();
                            // if ($isNotExist) {
                            //     $isDefaultPmSettings = \App\Models\UserPmDefaultSetting::where([
                            //         'user_id' => $user,
                            //         'pm_id' => $data->id
                            //     ])->first();
                            //     if ($isDefaultPmSettings) {
                            //         \App\Models\UserPmDefaultSetting::query()
                            //             ->where(['user_id' => $user, 'pm_id' => $data->id])
                            //             ->each(function ($isDefaultPmSettings) {
                            //                 $newPmSettings = $isDefaultPmSettings->replicate();
                            //                 $newPmSettings->setTable('user_pm_settings');
                            //                 $newPmSettings->save();
                            //             });
                            //     } else {
                            //         \App\Models\UserPmSetting::updateOrCreate(
                            //             [
                            //                 'user_id' => $user,
                            //                 'pm_id' => $data->id
                            //             ],
                            //             [
                            //                 'user_id' => $user,
                            //                 'pm_id' => $data->id
                            //             ]
                            //         );
                            //         \App\Models\UserPmDefaultSetting::updateOrCreate(
                            //             [
                            //                 'user_id' => $user,
                            //                 'pm_id' => $data->id
                            //             ],
                            //             [
                            //                 'user_id' => $user,
                            //                 'pm_id' => $data->id
                            //             ]
                            //         );
                            //     }
                            // }
                            if ($data->is_initialize) {
                                $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                    ->where(['for_user_id' => $this->_user->id, 'user_id' => $user])
                                    ->first();
                                $record = \App\Models\Notification::create([
                                    'from_user_id' => $this->_user->id,
                                    'to_user_id' => $user,
                                    'type' => 'pm_notification',
                                    'entity_id' => $data->id,
                                    'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $this->_user->username) . ' has added you in a PM.',
                                ]);
                                $notification['user'][] = $record;

                                if (count($existing_users)) {
                                    foreach ($existing_users as $room_user) {
                                        $frm_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                            ->where(['for_user_id' => $user, 'user_id' => $room_user->user_id])
                                            ->first();

                                        // If New User than add it to resposne otherwise not
                                        if ($newUser) {

                                            $newUser->user_info = \App\Models\User::select('id', 'username', 'visible_status', 'is_loggedout')->where('id', $newUser->user_id)->first();
                                            $newUser->user_info->customize_nickname = $frm_customized_nickname;
                                            $param['user'][(int) $room_user->user_id][] = [
                                                'new_user' => $newUser
                                            ];
                                        }
                                    }
                                }
                            }
                        }

                        $param['pm_id'] = (int) $input['pm_id'];
                        $param['type'] = 'add';

                        Helper::emit($param, 'pmAddRemove');

                        Helper::emit($notification, 'Invite');



                        DB::commit();
                        return Helper::rj('User has been added successfully into the pm.', 200, $data);
                    }


                }
            }
        } catch (\Exception $e) {
            DB::rollback();

            // Remove User if added and any exception occur
            if (!empty($isUserAddToSendBird)) {
                $sendBirdChatService->removeUsersFromChannel($input['user_id'], $isUserAddToSendBird->send_bird_channel_url);
            }
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function sendInvite(Request $request, SendBirdChannelService $sendBirdChatService)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required',
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $pmObj = new Pm();
                $data = $pmObj->getListing([
                    'id' => $request->pm_id
                ]);
                $pm_admin = $data->users->where('is_admin', 1)->where('is_added', 0)->first();
                //dd($pm_admin);
                if (!$pm_admin || $this->_user->id != $pm_admin->user_id) {
                    return Helper::rj('Action Forbidden! Only PM Admin can send invitation', 403);
                }

                $total_users = $data->total_pm_users + count($input['user_id']);
                if ($total_users > 3) {
                    return Helper::rj('Maximum 3 users are allowed within a PM.', 406);
                } else {
                    $other_user = $data->users->where('is_admin', 0)->where('is_added', 0)->first();

                    if ($other_user->user_id == $input['user_id'][0]) {
                        return Helper::rj('Already exist in PM.', 406);
                    }

                    $sentNotification = \App\Models\Notification::where('entity_id', $request->pm_id)->where('type', 'pm_invite')->where('is_accepted', 0)->where('from_user_id', $pm_admin->user_id)->where('to_user_id', $input['user_id'][0])->first();

                    if ($sentNotification) {
                        return Helper::rj('Already Invited', 406);
                    }

                    Helper::sendPmInviteNotification($input['pm_id'], $this->_user, $input['user_id'][0], $sendBirdChatService, $other_user);
                    return Helper::rj('Invite has been sent successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function sendChat(Request $request, SendBirdChannelService $sendBirdChatService)
    {
        try {
            $validationRules = [
                'pm_id' => 'required',
                'chat_body' => 'required',
                'message_id' => 'required|numeric',
                'type' => 'required',
            ];
            //$request->chat_body = 'Send Bird';
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);

            } else {
                $input = $request->all();
                $pm = Pm::find($input['pm_id']);
                if (!$pm) {
                    throw new \Exception('Pm not found, Invalid PM ID');
                }


                Helper::sendPmNotification($input['pm_id'], $this->_user);


                $input['user_id'] = $this->_user->id;
                $chat = Helper::processSendChat($input['pm_id'], $this->_user, $input, $sendBirdChatService, $input['message_id']);
                return Helper::rj('Message has been successfully posted.', $this->successStatus, $chat);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getAllChats(Request $request, SendBirdChannelService $chatService)
    {
        // dd(Auth::user());
        // throw new HttpResponseException(response()->json($chatService->getPmChat('testing-channel','1697482469672'), 400));
        try {
            $validationRules = [
                'pm_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $srch_params = $request->all();
                $data['chatfile'] = null;
                $cdn = \App\Models\Cdn::where("status", 1)->first();
                // $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                // $file_name = "pmc_" . $srch_params['pm_id'] . "_" . $this->_user->id . ".json";
                // if (file_exists($file_path . $file_name)) {
                //     $inp = file_get_contents($file_path . $file_name);
                //     $data['chatfile'] = json_decode($inp, true);
                // }
                return Helper::rj('Record found', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function readPms(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $res = PmUser::where(['pm_id' => $input['pm_id'], 'user_id' => $this->_user->id])->update(['is_read' => 1, 'is_close' => 0]);


                \App\Models\Notification::where(['type' => 'pm_notification', 'entity_id' => $input['pm_id']])->delete();
                if ($res) {

                    $recentPm = \App\Models\PmRecent::where('pm_id', $input['pm_id'])->first();
                    //dd($recentPm);
                    $closedData = $recentPm && $recentPm->is_closed ? json_decode($recentPm->is_closed) : null;

                    if ($closedData) {
                        $encodeData = collect($closedData);
                        $encodeData[$this->_user->id] = false;
                        $recentPm->update(['is_closed' => json_encode($encodeData)]);
                    }

                    return Helper::rj('PM read successfully.', 200, []);
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

    public function myActivePms()
    {

        try {
            $search_params = [
                'active_pm' => $this->_user->id,
                //'is_initialize' => 1,
            ];
            $pmObj = new Pm();
            $data['active_pms'] = $pmObj->getListing($search_params);

            return Helper::rj('Record found.', 200, $data);

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeUsers(Request $request, SendBirdChannelService $chatService)
    {

        DB::beginTransaction();
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required|exists:pms,id',
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                // throw new HttpResponseException(response()->json([$input['user_id']], 400));

                if (count($input['user_id'])) {
                    $param = [];
                    $notification = [];
                    $otherData = [];

                    foreach ($input['user_id'] as $user) {

                        $param['user'][] = (int) $user;

                        $pm = Pm::where('id', $request->pm_id)->first();

                        $pm_admin = $pm->users->where('is_admin', 1)->where('is_added', 0)->first();

                        if ($this->_user->id != $pm_admin->user_id) {
                            return Helper::rj('Action Forbidden! Only PM Admin can remove user', 403);
                        }

                        $other_user = $pm->users->where('is_admin', 0)->where('is_added', 0)->first();
                        $invited_user = $pm->users->where('user_id', $user)->where('is_admin', 0)->first();



                        if (!$invited_user) {
                            return \App\Helpers\Helper::rj('User not found for PM.', 404);
                        }

                        if ($invited_user->is_added == 0 || str_contains(explode('-', $pm->send_bird_channel_url)[0], $user . '')) {
                            return \App\Helpers\Helper::rj('Unable to delete PM User, PM created with this user initially.', 409);
                        }



                        $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                            ->where(['for_user_id' => $user, 'user_id' => $this->_user->id])
                            ->first();



                        $admin_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                            ->where(['for_user_id' => $this->_user->id, 'user_id' => $other_user->user_id])
                            ->first();

                        $invited_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                            ->where(['for_user_id' => $user, 'user_id' => $other_user->user_id])
                            ->first();


                        $notificationRecord = \App\Models\Notification::create([
                            'from_user_id' => $this->_user->id,
                            'to_user_id' => (int) $user,
                            'type' => 'pm_notification_remove',
                            'entity_id' => $request->pm_id,
                            'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $this->_user->username) . ' has removed you from PM.',
                        ]);


                        //$notification['type'] = 'pm_notification_remove';
                        $notification['user'][] = $notificationRecord;


                        $record = \App\Models\Notification::create([
                            'from_user_id' => $this->_user->id,
                            'to_user_id' => (int) $other_user->user_id,
                            'type' => 'pm_notification',
                            'entity_id' => $request->pm_id,
                            'message' => (($admin_customized_nickname) ? $admin_customized_nickname->nickname : $this->_user->username) . ' has removed user ' . ($invited_customized_nickname ? $invited_customized_nickname->nickname : $invited_user->userInfo->username) . ' from PM.',
                        ]);



                        $otherData['user'][] = $record;
                        //$otherData['type'] = 'pm_notification';

                        $param['pm_id'] = (int) $input['pm_id'];
                        $param['type'] = 'remove';



                        $chatService->removeUsersFromChannel($input['user_id'], $pm->send_bird_channel_url);

                        $invited_user->delete();

                        \App\Models\UserPmSetting::where([
                            'pm_id' => $input['pm_id'],
                            'user_id' => $user
                        ])->delete();

                        $file_name = "pmc_" . $input['pm_id'] . "_" . $user . ".json";

                        \Storage::disk('public')->delete('assets\chats\\' . $file_name);

                    }

                    // dd($notification);

                    Helper::emit($param, 'pmAddRemove');
                    sleep(1);
                    Helper::emit($notification, 'Invite');
                    sleep(1);
                    Helper::emit($otherData, 'Invite');

                    DB::commit();

                    return Helper::rj('User removed successfully from the PM.', 200, []);
                }
            }
        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function videoAudioOnOff(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required',
                'field_name' => 'required',
                'field_value' => 'required',
                'user_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $pmObj = new Pm();
                $data = $pmObj->getListing([
                    'id' => $input['pm_id']
                ]);

                // die($input['user_id']);

                $data->update(['is_initiated_by' => 0, 'is_video_on' => 0, 'is_voice_on' => 0]);
                // $streamdata = Stream::where(['user_id' => $input['user_id']])->update(['stream_id' => null]);

                $stream = Stream::firstOrNew(['user_id' => $input['user_id']]);
                $stream->pm_id = $input['pm_id'];
                $stream->user_id = $input['user_id'];
                $stream->stream_id = $input['stream_id'];
                $stream->save();

                $data->update([$input['field_name'] => (int) $input['field_value'], 'is_initiated_by' => $this->_user->id]);
                // $data->update([$input['field_name'] => (int)$input['field_value'],'is_initiated_by' => 1]);
                if ($input['stream_id'] != NULL) {
                    PmUser::where(['pm_id' => $input['pm_id'], 'user_id' => $this->_user->id])->update(['is_accept_audio_video' => 1]);
                } else {
                    PmUser::where(['pm_id' => $input['pm_id'], 'user_id' => $this->_user->id])->update(['is_accept_audio_video' => 0]);
                }
                //$data->is_initiated_by = $this->_user->id;
                if ($input['stream_id'] == NULL) {
                    // $data->is_call_ended = 1;
                    $data->update(['is_initiated_by' => 0, 'is_video_on' => 0, 'is_voice_on' => 0]);
                }

                // if ($data[$input['field_name']]) {
                //    echo 'heloo'; die;
                // if($input['stream_id']==NULL)
                // {
                //   return $data->users;
                // }
                if (count($data->users)) {
                    //echo 'qwqqww'; die;
                    $notification['user'] = [];
                    $user_details['details'] = [];
                    foreach ($data->users as $key => $user) {

                        if ($input['stream_id'] == NULL) {
                            PmUser::where(['pm_id' => $input['pm_id'], 'user_id' => $user->user_id])->update(['is_accept_audio_video' => 0]);
                        }

                        if ($this->_user->id != $user->user_id) {
                            PmUser::where(['pm_id' => $input['pm_id'], 'user_id' => $user->user_id])->update(['is_accept_audio_video' => 0]);
                        }



                        if (!$user->is_accept_audio_video) {
                            // return 'fsgdfghello';
                            $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                ->where(['for_user_id' => $this->_user->id, 'user_id' => $user->user_id])
                                ->first();
                            $record = \App\Models\Notification::create([
                                'from_user_id' => $this->_user->id,
                                'to_user_id' => $user->user_id,
                                'type' => 'pm_audio_video_notification',
                                'entity_id' => (int) $input['pm_id'],
                                'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $this->_user->username) . ' wants a ' . (($input['field_name'] == 'is_video_on') ? 'video' : 'audio') . ' call with you.',
                            ]);
                            $notification['user'][] = $record;
                        }
                    }
                    // return $data->users;
                    Helper::emit($notification, 'Invite');

                }
                // }
                // else{
                //     echo 'bye'; die;
                // }

                //print_r($data->is_video_on); die;

                // if($data->is_initiated_by){
                // $data->is_initiated_by = 0;
                // }else{
                // $data->is_initiated_by = null;
                // }

                $user_details['details'][] = $data;
                Helper::emit($user_details, 'pmDetails');
                // return $data;
                return Helper::rj('Information updated successfully.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function acceptAudioVideo(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required',
                'type' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if ($input['type'] == 'accept') {

                    $stream = Stream::firstOrNew(['user_id' => $this->_user->id]);
                    $stream->pm_id = $input['pm_id'];
                    $stream->user_id = $this->_user->id;
                    $stream->stream_id = $input['stream_id'];
                    $stream->save();

                    PmUser::where(['user_id' => $this->_user->id, 'pm_id' => $input['pm_id']])
                        ->update(['is_accept_audio_video' => 1]);
                    Pm::where(['id' => $input['pm_id']])->update(['is_initialize' => 1]);
                }
                \App\Models\Notification::where([
                    'to_user_id' => $this->_user->id,
                    'type' => 'pm_audio_video_notification',
                    'entity_id' => $input['pm_id']
                ])->delete();

                $pmObj = new Pm();
                $data = $pmObj->getListing([
                    'id' => $input['pm_id']
                ]);

                $user_details['details'][] = $data;
                Helper::emit($user_details, 'pmDetails');

                return Helper::rj('Information updated successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function changeSettings(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required',
                'key_name' => 'required',
                'key_value' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $settings = \App\Models\UserPmSetting::where([
                    'user_id' => $this->_user->id,
                    'pm_id' => $input['pm_id']
                ])->first();
                if ($settings) {
                    $update_arr = [
                        $input['key_name'] => $input['key_value']
                    ];
                    if ($input['key_name'] == 'lock_mic') {
                        $update_arr['push_to_talk'] = 0;
                    }
                    if ($input['key_name'] == 'push_to_talk') {
                        $update_arr['lock_mic'] = 0;
                    }
                    $settings->update($update_arr);
                }
                return Helper::rj('Settings updated successfully.', 200, $settings);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function saveDefaultPmSettings(Request $request)
    {

        try {
            $inputSettings = $request->all();
            $validationRules = [];

            if (count($inputSettings)) {
                foreach ($inputSettings as $key => $val) {
                    if (str_contains($key, "_room") || str_contains($key, "room_")) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Key, can not update room setting from PM']
                        ]);
                    }
                    if (str_contains($key, "_pm") || str_contains($key, "pm_")) {
                        $validationRules[$key] = 'required|integer|between:0,1';
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Key, not a PM setting']
                        ]);
                    }
                }
            } else {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => ['Missing PM Setting, list can\'t be empty']
                ]);
            }


            $validator = \Validator::make($inputSettings, $validationRules);

            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                foreach ($inputSettings as $setting => $val) {
                    \App\Models\SiteSettingUser::store($setting, $val, $this->_user->id);
                }

                return Helper::rj('Pm settings has been saved as default successfully.', 200, []);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function resetDefaultPmSettings(Request $request)
    {
        try {


            $inputSettings = $request->all();


            $validationRules = [
                'settings' => 'array|min:1|required',
                'settings.*' => 'required|exists:site_setting_user_structures,key',
            ];

            $validator = \Validator::make($inputSettings, $validationRules);

            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                foreach ($inputSettings['settings'] as $setting) {
                    if (str_contains($setting, "_room") || str_contains($setting, "room_")) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Key, can not reset room setting from PM']
                        ]);
                    }
                    if (!(str_contains($setting, "_pm") || str_contains($setting, "pm_"))) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Key, not a PM setting']
                        ]);
                    }

                    \App\Models\SiteSettingUser::store($setting, '', $this->_user->id, null, true);

                }

                return Helper::rj('Pm settings has been reset to default successfully.', 200, []);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function showUserLocations(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $data = \App\Models\User::select('users.id', 'username', 'curr_loc_lat', 'curr_loc_lon')
                    ->addSelect(\DB::raw("IF(cn.nickname IS NULL, users.username, cn.nickname) AS nickname"))
                    ->leftJoin("customize_nicknames as cn", function ($join) {
                        $join->on("cn.for_user_id", "users.id")
                            ->where("cn.user_id", $this->_user->id);
                    })
                    ->join('pm_users', function ($join) use ($input) {
                        $join->on("pm_users.user_id", "users.id")
                            ->where("pm_users.pm_id", $input['pm_id']);
                    })
                    ->join('site_setting_users', function ($join) {
                        $join->on("site_setting_users.user_id", "users.id")
                            ->where("site_setting_users.val", 1);
                    })
                    ->join('site_setting_user_structures', function ($q) {
                        $q->on("site_setting_user_structures.id", "site_setting_users.site_setting_id")
                            ->where("site_setting_user_structures.key", 'share_location');
                    })
                    ->where("pm_users.user_id", "<>", $this->_user->id)
                    ->get();
                return Helper::rj('Records available.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function exitFromPm(Request $request, SendBirdChannelService $sendBirdChatService)
    {

        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                Helper::removePmUserInformation($input['pm_id'], $this->_user->id, $sendBirdChatService, false);
                return Helper::rj('You have successfully exit from the pm.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    // public function multiRecipientMessage(Request $request) {
    //     try {
    //         $input = $request->all();
    //         $validationRules = [
    //             'user_id' => 'array|min:1|required',
    //             'user_id.*' => 'required',
    //             'chat_body' => 'required',
    //         ];
    //         $validator = \Validator::make($request->all(), $validationRules);
    //         if ($validator->fails()) {
    //             return \App\Helpers\Helper::rj('Bad Request', 400, [
    //                 'errors' => $validator->errors()
    //             ]);
    //             
    //         } else {
    //             $user = $this->_user;
    //             $pmObj = new Pm();
    //             if (count($input['user_id'])) {
    //                 foreach ($input['user_id'] as $user_id) {
    //                     // Check if PM already exists between these two users
    //                     $pmId = Helper::checkPmExist($user->id, $user_id);
    //                     $new_pm = true;
    //                     if ($pmId) {
    //                         $new_pm = false;
    //                     } else {
    //                         // Create a new PM if it doesn't exist
    //                         $pm = Pm::create([
    //                             'is_initialize' => 0,
    //                             'tot_user' => 2
    //                         ]);
    //                         $pmId = $pm->id;
    //                         Helper::createPmUsers($request, $pm, $user->id, $user_id);
    //                     }

    //                     // Send PM notification
    //                     $pm = Pm::find($pmId); // Retrieve the PM object
    //                     Helper::sendPmNotification($pm, $user);

    //                     // Process sending chat if it doesn't exist
    //                     $chatExist = \App\Models\PmChat::where('pm_id', $pmId)->first();
    //                     if (is_null($chatExist)) {
    //                         $chatArry = [
    //                             'pm_id' => $pmId,
    //                             'chat_body' => $input['chat_body'],
    //                             'type' => 'normal',
    //                             'user_id' => $user->id,
    //                         ];
    //                         Helper::processSendChat($pmId, $user, $chatArry);
    //                     }
    //                 }
    //             }
    //             return Helper::rj('Multi-recipient message has been sent successfully.', $this->successStatus, []);
    //         }
    //     } catch (\Exception $e) {
    //         return Helper::rj($e->getMessage(), 500);
    //     }
    // }


    public function multiRecipientMessage(Request $request, SendBirdChannelService $sendBirdChatService)
    {


        $pms = null;

        try {

            $data = [];
            $sendBirdChannels = [];
            $newSendBirdChannels = [];
            $input = $request->all();
            $validationRules = [
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
                'chat_body' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                $user = $this->_user;
                $pmObj = new Pm();
                $ownid = $user->id;

                if (count($input['user_id'])) {
                    foreach ($input['user_id'] as $user_id) {


                        $userid = $user_id;

                        $pmIds = Pm::leftJoin('pm_users', 'pms.id', '=', 'pm_users.pm_id')
                            ->where(function ($query) use ($userid, $ownid) {
                                $query->where('pm_users.user_id', $userid)
                                    ->where('pm_users.joined_by_id', $ownid);
                            })
                            ->orWhere(function ($query) use ($userid, $ownid) {
                                $query->where('pm_users.user_id', $ownid)
                                    ->where('pm_users.joined_by_id', $userid);
                            })
                            ->pluck('pms.id')->first();


                        if ($pmIds) {
                            $existingPmData = $pmObj->getListing([
                                'id' => $pmIds
                            ]);
                            $sendBirdChannels[] = (object) ["send_bird_channel_url" => $existingPmData->send_bird_channel_url, "pm_id" => $existingPmData->id];

                        } else {


                            info("pm Creation ", [$user->id, $user_id]);


                            // Create Pm Single Channel
                            $sendBirdChannelResponse = $sendBirdChatService->createUserPMChannel([$user->id, $user_id], 'single');


                            if (!$sendBirdChannelResponse->ok()) {
                                throw new \Exception('Something went wrong! ' . $sendBirdChannelResponse->object()->message);
                            }


                            $sendBirdChannel = $sendBirdChannelResponse->object();
                            array_push($newSendBirdChannels, $sendBirdChannel);

                            $pm = Pm::create([
                                'is_initialize' => 0,
                                'tot_user' => 2,
                                'send_bird_channel_url' => $sendBirdChannel->channel_url,
                                'send_bird_channel_name' => $sendBirdChannel->name
                            ]);


                            dispatch(function () use ($pm, $sendBirdChatService) {

                                $customKeys = [
                                    'type' => 'pm',
                                    'pm_id' => (string) $pm->id
                                ];

                                info("creating audio video room for PM");

                                $audioRoom = $sendBirdChatService->createAudioVideoRoom('PMS', 'audio', $customKeys);
                                $videoRoom = $sendBirdChatService->createAudioVideoRoom('PMS', 'video', $customKeys);

                                $pms = Pm::find($pm->id);
                                $pms->update([
                                    'send_bird_video_call_room_id' => $videoRoom->room->room_id,
                                    'send_bird_audio_call_room_id' => $audioRoom->room->room_id
                                ]);

                            })->afterResponse();

                            Helper::createPmUsers($request, $pm, $user->id, $user_id);
                            $newPmData = $pmObj->getListing([
                                'id' => $pm->id
                            ]);

                            $sendBirdChannels[] = (object) ["send_bird_channel_url" => $newPmData->send_bird_channel_url, "pm_id" => $newPmData->id];



                        }  // end foreach

                        DB::commit();

                    }
                    return Helper::rj('Multi-recipient message has been sent successfully.', $this->successStatus, $sendBirdChannels);
                }
            }
        } catch (\Exception $e) {
            DB::rollback();
            if (!empty($newSendBirdChannels) && count($newSendBirdChannels)) {
                foreach ($newSendBirdChannels as $newChannel) {
                    $sendBirdChannel = $sendBirdChatService->deleteUserPMChannel($newChannel->channel_url, $pms);
                }

            }
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function digSoundList(Request $request)
    {
        try {
            $digSoundObj = new \App\Models\DigSound();
            $data['list'] = $digSoundObj->getListing();
            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function sendDigSound(Request $request)
    {
        try {
            $validationRules = [
                'pm_id' => 'required',
                'sound_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $pm_id = $request->pm_id;
                $srch_params = $request->all();
                $srch_params['user_id_not'] = $this->_user->id;
                $pmUserObj = new PmUser();
                $users = $pmUserObj->getListing($srch_params);
                $users = $users->toArray();
                $msg = null;
                if (count($users)) {
                    foreach ($users as $key => $user) {
                        if ($user['pm_settings']['disable_dig_sound']) {
                            unset($users[$key]);
                        } else {
                            $customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                ->where(['for_user_id' => $this->_user->id, 'user_id' => $user['user_id']])
                                ->first();
                            $msg = (($customized_nickname) ? $customized_nickname->nickname : $this->_user->username) . ' has sent you a Dig Sound.';
                            $users[$key]['message'] = $msg;
                        }
                    }
                    $users = array_values($users);
                }
                $digSoundObj = new \App\Models\DigSound();
                $param = [
                    'pm_id' => $request->pm_id,
                    'users' => $users,
                    'sound' => $digSoundObj->getListing(['id' => $request->sound_id]),
                ];
                Helper::emit($param, 'digSound');
                return Helper::rj('Dig sound sent successfully.', 200, $param);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function clearTextChat(Request $request, SendBirdChannelService $sendBirdChatService)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'pm_id' => 'required|exists:pms,id'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                $user_id = Auth::id();

                //remove chat from all pms

                $pmUserObj = new \App\Models\PmUser();
                $pmUsers = $pmUserObj->getListing(['user_id' => $user_id, "pm_id" => $input["pm_id"], "with" => ['pm']]);

                if ($pmUsers) {
                    $cdn = \App\Models\Cdn::where("status", 1)->first();
                    $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";


                    foreach ($pmUsers as $pmUser) {
                        $file_name = "pmc_" . (int) $pmUser->pm_id . "_" . $user_id . ".json";
                        if (file_exists($file_path . $file_name)) {
                            unlink($file_path . $file_name);

                            if ($pmUser->is_close == 0) {
                                $fp = fopen($file_path . $file_name, 'w');
                                $tempArray = [];
                                fwrite($fp, json_encode($tempArray));
                                fclose($fp);
                            }
                        }

                        $sendBirdChatService->resetMyChatHistory($user_id . '', $pmUser->pm->send_bird_channel_url);
                    }
                }

                return Helper::rj('Text chat has been removed for you successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }
}
