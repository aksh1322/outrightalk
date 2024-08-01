<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
//use App\Http\Requests\UpdatePassword;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Http\Requests\RoomRequest;
use Owenoj\LaravelGetId3\GetId3;
use App\Models\Room;
use App\Models\RoomChatSaveStatus;
use Auth;
use Illuminate\Http\Request;
use OpenTok\OpenTok;
use OpenTok\MediaMode;
use OpenTok\Role;
use Illuminate\Support\Facades\Storage;
use Svg\Tag\Rect;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserBadgePoints;
use App\Models\UserOptionVisible;
use App\Models\Gender;
use App\Models\LocationCountry;
use App\Models\RoomUser;
use DB;
use App\Services\SendBirdChannelService;

use App\Models\User;

class RoomController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_model = new Room();
        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });

    }

    public $successStatus = 200;

    public function getRoomTypes(Request $request)
    {
        try {
            $this->_model = new \App\Models\RoomType();
            $data['list'] = $this->_model->getListing();
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getRoomGroups(Request $request, $category_id = 0)
    {
        try {
            /*$this->_model = new \App\Models\Group();
            $srch_params = $request->all();
            $srch_params['group_type'] = 'public';
            $srch_params['category_type'] = ($category_id == 1) ? 1 : 0;
            $srch_params['status'] = 1;
            $list = $this->_model->getListing($srch_params);*/
            $list = \App\Models\Group::where('categories_id', $category_id)->get();
            foreach ($list as $key => $value) {
                $value->room_count = \App\Models\Room::where('group_id', $value->id)->count();
            }
            $data['list'] = $list;
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getRoomLanguages(Request $request)
    {
        try {
            $this->_model = new \App\Models\RoomLanguage();
            $data['list'] = $this->_model->getListing();
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getRoomCategories(Request $request)
    {
        try {
            $this->_model = new \App\Models\RoomCategory();
            $srch_params = $request->all();
            $data['list'] = $this->_model->getListing($srch_params);
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    // public function createSystemRoom(RoomRequest $request, SendBirdChannelService $sendBirdChannelService)
    // {
    //     DB::beginTransaction();
    //     $sendBirdChannel = null;
    //     $room = null;

    //     try {
    //         $user = Auth::user();

    //         if ($user) {
    //             $user_roles = $user->roles->pluck('slug')->toArray();

    //             if (in_array('staff', $user_roles)) {
    //                 $input = $request->all();
    //                 $input['text_enabled'] = 1;
    //                 $input['ip_addr'] = $request->ip();

    //                 if (isset($input['video_enabled']) && $input['video_enabled']) {
    //                     $input['voice_enabled'] = 1;
    //                 }

    //                 $room = $this->_model->create($input);

    //                 if ($room && isset($input['room_pic'])) {
    //                     $this->_model->uploadAvatar($room, $room->id, $request);
    //                 }

    //                 if ($room) {
    //                     \App\Models\RoomSetting::create([
    //                         'room_id' => $room->id, 
    //                         'give_mic_to_all' => 1, 
    //                         'simultaneous_mics' => 1
    //                     ]);

    //                     $room = $this->_model->getListing(['id' => $room->id]);

    //                     $roomOwner = [
    //                         'room_id' => $room->id,
    //                         'user_id' => $user->id, 
    //                         'is_admin' => 3,
    //                         'is_accepted' => 1,
    //                         'is_mic' => 0,
    //                         'is_camera' => 0,
    //                         'is_raise_hand' => 0,
    //                         'ip_addr' => $input['ip_addr'],
    //                         'timezone' => "UTC"
    //                     ];

    //                     $sendBirdChannelResponse = $sendBirdChannelService->createSuperPublicChannel(
    //                         [$roomOwner['user_id']], 
    //                         $room->name . ' ' . $room->id . ' Public', 
    //                         [$roomOwner['user_id']]
    //                     );

    //                     if ($sendBirdChannelResponse && !$sendBirdChannelResponse->ok()) {
    //                         throw new \Exception('Something went wrong! ' . $sendBirdChannelResponse->object()->message);
    //                     }

    //                     $sendBirdChannel = $sendBirdChannelResponse->object();

    //                     DB::table('rooms')->where('id', $room->id)->update([
    //                         'send_bird_channel_url' => $sendBirdChannel->channel_url,
    //                     ]);

    //                     DB::commit();

    //                     $room = $this->_model->getListing(['id' => $room->id]);
    //                     return Helper::rj('The room has been successfully created! Join Now', $this->successStatus, $room);
    //                 }
    //             } else {
    //                 return Helper::rj('Not a valid user.', 401);
    //             }
    //         }

    //     } catch (\Exception $e) {
    //         if (!empty($sendBirdChannel) && !empty($room)) {
    //             $sendBirdChannelService->deleteGroupChannel($sendBirdChannel->channel_url, $room);
    //         }
    //         DB::rollback();
    //         return Helper::rj($e->getMessage(), 500);
    //     }
    // }

    public function createVipRoom(RoomRequest $request, SendBirdChannelService $sendBirdChannelService)
    {
        DB::beginTransaction();
        $sendBirdChannel = null;
        $room = null;

        try {
            $user = Auth::user();
            if ($user) {
                $user_roles = $user->roles->pluck('slug')->toArray();

                if (in_array('staff', $user_roles)) {
                    $input = $request->all();

                    $nickname = $input['for_nickname'];
                    $user = User::where('username', $nickname)->first();
                    $room_count = $this->checkRoomCreated($user->id);

                    if ($room_count) {
                        return Helper::rj('The Public Room has been already exist for this nickname, can\'t proceed further, please try with another one', 409);
                    }

                    $input['text_enabled'] = 1;
                    $input['ip_addr'] = $request->ip();

                    if (isset($input['video_enabled']) && $input['video_enabled']) {
                        $input['voice_enabled'] = 1;
                    }

                    $room = $this->_model->create($input);

                    if ($room && isset($input['room_pic'])) {
                        $this->_model->uploadAvatar($room, $room->id, $request);
                    }

                    if ($room) {
                        \App\Models\RoomSetting::create([
                            'room_id' => $room->id,
                            'give_mic_to_all' => 1,
                            'simultaneous_mics' => 1
                        ]);

                        $room = $this->_model->getListing(['id' => $room->id]);

                        $roomOwnerId = null;
                        if (!$user) {
                            return Helper::rj('user not Found with this nickname' + $nickname, 404);
                        }
                        $roomOwnerId = $user->id;
                        $roomOwner = [
                            'room_id' => $room->id,
                            'user_id' => $roomOwnerId,
                            'is_admin' => 3,
                            'is_accepted' => 1,
                            'is_mic' => 0,
                            'is_cemera' => 0,
                            'is_raise_hand' => 0,
                            'ip_addr' => $input['ip_addr'],
                            'timezone' => "UTC"
                        ];
                        if ($room->room_type_id == 1) {
                            $roomOwner['deleted_at'] = (new \DateTime())->format("Y-m-d H:i:s");
                        }
                        $room_user = \App\Models\RoomUser::create($roomOwner);
                        $sendBirdChannelResponse = $sendBirdChannelService->createSuperPublicChannel(
                            [$roomOwnerId],
                            $room->name . ' ' . $room->id . ' Public',
                            [$roomOwnerId]
                        );

                        if ($sendBirdChannelResponse && !$sendBirdChannelResponse->ok()) {
                            throw new \Exception('Something went wrong! ' . $sendBirdChannelResponse->object()->message);
                        }

                        $sendBirdChannel = $sendBirdChannelResponse->object();

                        DB::table('rooms')->where('id', $room->id)->update([
                            'send_bird_channel_url' => $sendBirdChannel->channel_url,
                        ]);

                        DB::commit();

                        $room = $this->_model->getListing(['id' => $room->id]);
                        return Helper::rj('The room has been successfully created! Join Now', $this->successStatus, $room);
                    }
                } else {
                    return Helper::rj('Not a valid user.', 401);
                }
            }

        } catch (\Exception $e) {
            if (!empty($sendBirdChannel) && !empty($room)) {
                $sendBirdChannelService->deleteGroupChannel($sendBirdChannel->channel_url, $room);
            }
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }

    private function checkRoomCreated($user_id)
    {
        $room_users_table = 'room_users';
        $check_room_created = Room::join($room_users_table, function ($join) use ($room_users_table) {
            $join->on($room_users_table . ".room_id", "rooms.id");
        })
            ->where($room_users_table . ".user_id", $user_id)
            ->where($room_users_table . ".is_admin", 3)
            ->where(function ($q) use ($room_users_table) {
                $q->where($room_users_table . ".deleted_at", '=', null)
                    ->orWhere($room_users_table . ".deleted_at", '!=', null);
            })

            ->where('room_type_id', 1)
            ->count();
        //dd($check_room_created);
        return $check_room_created;
    }


    public function createRoom(RoomRequest $request, SendBirdChannelService $sendBirdChannelService)
    {
        DB::beginTransaction();
        $sendBirdChannel = null;
        $room = null;
        try {

            $room_count = $this->checkRoomCreated($this->_user->id);

            if ($room_count) {
                return Helper::rj('The Public Room has been already exist for this nickname, can\'t proceed further, please try with another nickname', 409);
            }

            $input = $request->all();
            $input['text_enabled'] = 1;
            $input['ip_addr'] = $request->ip();
            if ($input['video_enabled']) {
                $input['voice_enabled'] = 1;
            }
            $room = $this->_model->create($input);
            if ($room && isset($input['room_pic'])) {
                $response = $this->_model->uploadAvatar($room, $room->id, $request);
            }
            if ($room) {
                \App\Models\RoomSetting::create(['room_id' => $room->id, 'give_mic_to_all' => 1, 'simultaneous_mics' => 1]);
                // initialze api using api key/secret
                /*$opentalk = new OpenTok(\Config::get('settings.opentalk_api_key'), \Config::get('settings.opentalk_secret_key'));
                $session = $opentalk->createSession([
                            //'archiveMode' => ArchiveMode::ALWAYS,
                            'mediaMode' => MediaMode::ROUTED,
                            //'p2p.preference' => ' disabled',
                        ]);
                $sessionId  = $session->getSessionId();
                // now, that we have session token we generate opentok token
                $token = $opentalk->generateToken($sessionId, [
                    'role' =>  Role::PUBLISHER,
                    'expireTime' => time()+(30 * 24 * 60 * 60), // in 30 days
                    'data' => "name=" . $room->room_name,
                    'initialLayoutClassList' => array('focus')
                ]);
                \App\Models\RoomOpentalk::create([
                    'room_id' => $room->id,
                    'token' => $token,
                    'session' => $sessionId
                ]);*/

                $room = $this->_model->getListing(['id' => $room->id]);
                $roomOwner = [
                    'room_id' => $room->id,
                    'user_id' => $this->_user->id,
                    'is_admin' => 3,
                    'is_accepted' => 1,
                    'is_mic' => 0,
                    'is_cemera' => 0,
                    'is_raise_hand' => 0,
                    'ip_addr' => $input['ip_addr'],
                    //'timezone' => Helper::getTimezone($input['ip_addr'])
                    'timezone' => "UTC"
                ];
                if ($room->room_type_id == 1) {
                    $roomOwner['deleted_at'] = (new \DateTime())->format("Y-m-d H:i:s");
                }
                $room_user = \App\Models\RoomUser::create($roomOwner);

                if ($room->room_type_id == 2) {
                    if (count($input['members'])) {
                        foreach ($input['members'] as $member) {
                            $user = \App\Models\User::find($member);
                            \App\Models\RoomUser::create([
                                'room_id' => $room->id,
                                'user_id' => $member,
                                'is_admin' => 0,
                                'is_accepted' => 1,
                                'is_mic' => 0,
                                'is_cemera' => 0,
                                'is_raise_hand' => 0,
                                'ip_addr' => $user->ip_addr,
                                //'timezone' => ($user->ip_addr) ? Helper::getTimezone($user->ip_addr) : null
                                'timezone' => "UTC"
                            ]);
                        }
                    }
                }

                $channelType = $request->room_type_id == 1 ? ' Public' : ' Private';
                $isPrivate = $request->room_type_id == 1 ? false : true;
                $sendBirdChannelResponse = null;
                if ($isPrivate) {
                    $sendBirdChannelResponse = $sendBirdChannelService->createUserPrivateRoom([$this->_user->id], $room->room_name . ' ' . $room->id . $channelType, [$this->_user->id]);
                } else {
                    $sendBirdChannelResponse = $sendBirdChannelService->createSuperPublicChannel([$this->_user->id], $room->room_name . ' ' . $room->id . $channelType, [$this->_user->id]);
                }


                if ($sendBirdChannelResponse && !$sendBirdChannelResponse->ok()) {
                    throw new \Exception('Something went wrong! ' . $sendBirdChannelResponse->object()->message);
                }


                $sendBirdChannel = $sendBirdChannelResponse->object();


                // dispatch(function () use ($room, $sendBirdChannelService, $isPrivate) {
                $customKeys = [
                    'type' => 'room',
                    'room_id' => (string) $room->id
                ];


                // $audioRoom = $sendBirdChannelService->createAudioVideoRoom($isPrivate ? 'Private Group' : 'Super Public Group', 'audio', $customKeys);
                // $videoRoom = $sendBirdChannelService->createAudioVideoRoom($isPrivate ? 'Private Group' : 'Super Public Group', 'video', $customKeys);


                // $rooms = \App\Models\Room::find($room->id);
                // $rooms->update([
                //     'send_bird_video_call_room_id' => $videoRoom->room->room_id,
                //     'send_bird_audio_call_room_id' => $audioRoom->room->room_id
                // ]);

                DB::table('rooms')->where('id', $room->id)->update([
                    'send_bird_channel_url' => $sendBirdChannel->channel_url,
                    // 'send_bird_video_call_room_id' => $videoRoom->room->room_id,
                    // 'send_bird_audio_call_room_id' => $audioRoom->room->room_id
                ]);

                // })->afterResponse();

                DB::commit();

                $room = $this->_model->getListing(['id' => $room->id]);
                return Helper::rj('The room has been successfully created! Join Now', $this->successStatus, $room);


            }
        } catch (\Exception $e) {
            if (!empty($sendBirdChannel) && !empty($room)) {
                $sendBirdChannel = $sendBirdChannelService->deleteGroupChannel($sendBirdChannel->channel_url, $room);
            }
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function updateRoom(RoomRequest $request, $room_id)
    {
        try {
            $input = $request->all();
            $input['text_enabled'] = 1;
            /*if ($input['video_enabled']) {
                $input['voice_enabled'] = 1;
            }*/
            $room = $this->_model->getListing([
                'id' => $room_id
            ]);
            if (!$room) {
                return \App\Helpers\Helper::resp('Not a valid data', 400);
            }
            $check_normal_users = \App\Models\RoomUser::where([
                'room_id' => $room_id,
                'is_admin' => 0
            ])->count();
            if (!$room->locked_room && (int) $input['locked_room'] == 1 && $check_normal_users) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => "Sorry, you are not be able to enable lockword."
                ]);

            }
            if (is_null($input['room_password'])) {
                unset($input['room_password']);
            }
            $room->update($input);
            if (isset($input['room_pic'])) {
                $response = $this->_model->uploadAvatar($room, $room_id, $request);
            }
            $room = $this->_model->getListing([
                'id' => $room_id
            ]);
            return Helper::rj('Changes has been successfully saved.', $this->successStatus, $room);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getCategoryList(Request $request)
    {
        try {
            $this->_model = new \App\Models\Group();
            $srch_params = $request->all();
            $srch_params['status'] = 1;
            $list = $this->_model->getListing($srch_params);
            $data['list'] = $list->makeHidden(['status']);
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function roomListCategoryWise(Request $request)
    {
        try {
            $user = $this->_user;
            $validationRules = [
                'group_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $srch_params = $request->all();
                $srch_params['with'] = [
                    'roomCategory',
                    'joinStatus' => function ($q) use ($user) {
                        return $q->select('room_id', 'is_accepted', 'is_admin')->where('user_id', $user->id)->whereNull('deleted_at');
                    },
                    'subscriptionInfo' => function ($q) {
                        return $q->whereDate("renew_at", ">=", date("Y-m-d H:i"));
                    },
                ];
                $data['list'] = $this->_model->getListing($srch_params);
                $data['list'] = $data['list']->makeHidden(['lockword', 'admin_code', 'room_password']);
                $roomUserObj = new \App\Models\RoomUser();
                $data['allow_create_room'] = $roomUserObj->allowCreateRoom();
                $groupObj = new \App\Models\Group();
                $data['category_info'] = $groupObj->getListing(['id' => $request->group_id]);
                return Helper::rj('Record found', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function joinRoom(Request $request, SendBirdChannelService $sendBirdChannelService)
    {


        $joinUserId = null;
        $currentRoomDtls = Room::find($request->room_id ?? 0);

        try {
            $validationRules = [
                'room_id' => 'required'
            ];

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                DB::beginTransaction();

                if ($this->_user->visible_status == 4) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You can not join a room with invisible status'
                    ]);

                }

                $input = $request->all();
                // $input['ip_addr'] = $request->ip();
                $input['ip_addr'] = '45.64.221.241';
                $srch_param = [
                    'id' => $input['room_id'],
                    'with' => [
                        'subscriptionInfo' => function ($q) {
                            return $q->whereDate("renew_at", ">=", date("Y-m-d H:i"));
                        },
                    ],
                ];

                $vipRoomCategory = \App\Models\RoomCategory::where('category_title', 'VIP')->first();

                $roomInfo = $this->_model->getListing($srch_param);
                if (!$roomInfo) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'This room does not exist anymore! Please update the rooms list.'
                    ]);
                }
                if ($roomInfo->room_category_id == $vipRoomCategory->id) {

                    $adminUser = \App\Models\RoomUser::where(['user_id' => $this->_user->id, 'room_id' => $input['room_id'], 'is_admin' => 3])->withTrashed()->first();

                    if (!$adminUser) {
                        $vipInvitationObj = new \App\Models\VIPInvitation();
                        $record = $vipInvitationObj->getListing(['nickname' => \Auth::user()->username, 'room_id' => $request->room_id])->first();


                        if (!$record) {
                            return \App\Helpers\Helper::rj('Forbidden! You are not invited, can only join with invitation', 403);
                        } else {

                            if ($record->start_at && $record->close_at) {


                                $set_timezone = date_default_timezone_get();

                                if ($this->_user->timezone) {
                                    $set_timezone = $this->_user->timezone;
                                }

                                $nowInTz = \Carbon\Carbon::now(new \DateTimeZone($set_timezone));

                                $startDate = \Carbon\Carbon::createFromFormat('m/d/Y H:i A', $record->start_at, $set_timezone);

                                $endDate = \Carbon\Carbon::createFromFormat('m/d/Y H:i A', $record->close_at, $set_timezone);
                                //dd($endDate);
                                $res = $nowInTz->greaterThanOrEqualTo($startDate) && $nowInTz->lessThanOrEqualTo($endDate);
                                //dd($res);

                                if (!$res) {

                                    \App\Models\VIPInvitation::where('id', $record->id)->update(['expired_at' => (new \DateTime())->format("Y-m-d H:i:s")]);

                                    return \App\Helpers\Helper::rj('Forbidden! Invitation already expired, please contact with room admin again and ask for invite', 403);
                                }

                            }

                            if ($record->expired_at) {
                                return \App\Helpers\Helper::rj('Forbidden! Invitation already expired, please contact with room admin again and ask for invite', 403);
                            }

                            if (!isset($request->invitation_code)) {
                                return \App\Helpers\Helper::rj('Bad Request! Please provide inviation code', 402);
                            } else {
                                if ($record->invitation_code != $request->invitation_code) {
                                    return \App\Helpers\Helper::rj('Bad Request! Invalid inviation code', 402);
                                }
                            }

                        }

                    }

                }


                //check user either already joined or nor in the room
                $check_user_exist = \App\Models\RoomUser::where(['user_id' => $this->_user->id, 'room_id' => $input['room_id']])->first();
                if ($check_user_exist) {
                    return Helper::rj('You have already joined in the room.', 200, []);
                } else {
                    //check user either banned or nor
                    $check_user_banned = \App\Models\RoomBannedUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->first();
                    if (is_null($check_user_banned)) {
                        //check user either kicked or nor
                        $is_join_allow = true;
                        $current_time = (new \DateTime())->format("Y-m-d H:i:s");
                        $is_kick_user = \App\Models\RoomKickUser::where('room_id', $input['room_id'])
                            ->where('user_id', $this->_user->id)
                            ->where('expire_time', '>=', $current_time)
                            ->first();
                        if ($is_kick_user) {
                            $is_join_allow = false;
                        }
                        if ($is_join_allow) {
                            $current_no_of_user = \App\Models\RoomUser::where('room_id', $input['room_id'])->count();
                            $no_of_user = \App\Models\RoomType::select('no_of_users')
                                ->join("rooms", function ($join) {
                                    $join->on("rooms.room_type_id", "room_types.id");
                                })
                                ->where("rooms.id", $input['room_id'])
                                ->first();
                            $allow_no_of_user = $no_of_user->no_of_users;
                            if ($roomInfo->room_type_id == 1 && $roomInfo->locked_room) {
                                $allow_no_of_user = 10;
                            }
                            if ($roomInfo->subscriptionInfo) {
                                if (
                                    $roomInfo->subscriptionInfo->planInfo &&
                                    $roomInfo->subscriptionInfo->planInfo->room_capacity
                                )
                                    $allow_no_of_user = $roomInfo->subscriptionInfo->planInfo->room_capacity;
                                else
                                    $allow_no_of_user = 100000;
                            }
                            if ($current_no_of_user < $allow_no_of_user) {
                                $is_age_matched = true;
                                $roomSettingsObj = new \App\Models\RoomSetting();
                                $room_settings = $roomSettingsObj->getListing(['room_id' => $input['room_id']]);

                                if ($room_settings) {
                                    $current_date = (new \DateTime())->format("Y-m-d");
                                    $date_of_birth = $this->_user->dob;
                                    $diff = date_diff(date_create($date_of_birth), date_create($current_date));
                                    $age = $diff->format('%y');
                                    if ($room_settings->under_age_not_allowed && $age < $room_settings->under_age) {
                                        $is_age_matched = false;
                                    } elseif ($room_settings->under_age_range_allowed) {
                                        $ageRangeObj = new \App\Models\RoomAgeRange();
                                        $age_range = $ageRangeObj->getListing(['id' => $room_settings->under_age_range_id]);
                                        if ($age_range) {
                                            if ($age < $age_range->min_age || $age > $age_range->max_age) {
                                                $is_age_matched = false;
                                            }
                                        }
                                    }
                                }
                                if ($is_age_matched) {
                                    if (isset($input['exit_room']) && (int) $input['exit_room']) {
                                        //exit from all rooms
                                        Helper::exitFromAllRooms($this->_user);
                                    }
                                    /*$check_user_prev_status = \App\Models\RoomUser::where([
                                            'room_id' => $input['room_id'],
                                            'user_id' => $this->_user->id
                                        ])->onlyTrashed()->orderBy('deleted_at', 'DESC')->first();
                                    $user_prev_status = ($check_user_prev_status) ? (int)$check_user_prev_status->is_admin : 0;*/
                                    $roomuserdata = \App\Models\RoomUser::where('room_id', $input['room_id'])->withTrashed()->first();
                                    // if($roomuserdata->user_id == Auth::id()){
                                    //    $is_admin = 3;
                                    // }else{
                                    $is_admin = 0;
                                    //}


                                    $getSubscripton = \App\Models\UserSubscription::where(['user_id' => $this->_user->id])->first();

                                    if ($getSubscripton) {
                                        $joinUser = [
                                            'room_id' => $input['room_id'],
                                            'user_id' => $this->_user->id,
                                            'is_admin' => $is_admin,
                                            'is_accepted' => 1,
                                            'ip_addr' => $input['ip_addr'],
                                            'timezone' => Helper::getTimezone($input['ip_addr'])
                                        ];

                                        if ($room_settings->red_dot_newcomers || $room_settings->red_dot_all_users) {
                                            $joinUser['red_dot_text'] = 1;
                                            $joinUser['red_dot_mic'] = 1;
                                            $joinUser['red_dot_camera'] = 1;
                                        }
                                        $join_user = \App\Models\RoomUser::create($joinUser);

                                        // checking and updating join & exit room notification setting on master preference setting for Room

                                        // $siteSettingInst = new \App\Models\SiteSettingUserStructure();
                                        // $siteSetting = $siteSettingInst->getListing([
                                        //     'key' => 'notify_users_join_exit_room',
                                        // ]);

                                        // if ($siteSetting) {
                                        //     $setting = \App\Models\SiteSettingUser::where('site_setting_id', $siteSetting->structure_id)
                                        //         ->where('user_id', Auth::id())
                                        //         ->first();

                                        //     if ($setting) {
                                        //         $settings = \App\Models\UserRoomSetting::where([
                                        //             'user_id' => $joinUserId,
                                        //             'room_id' => $input['room_id']
                                        //         ])->first();

                                        //         if ($settings) {
                                        //             $settings->update(["notify_join_room" => 1, "notify_exit_room" => 1]);
                                        //         }
                                        //     }

                                        // }

                                    } else {
                                        \App\Models\RoomUser::where(['user_id' => $this->_user->id])->delete();
                                        $joinUser = [
                                            'room_id' => $input['room_id'],
                                            'user_id' => $this->_user->id,
                                            'is_admin' => $is_admin,
                                            'is_accepted' => 1,
                                            'ip_addr' => $input['ip_addr'],
                                            'timezone' => Helper::getTimezone($input['ip_addr'])
                                        ];

                                        if ($room_settings->red_dot_newcomers || $room_settings->red_dot_all_users) {
                                            $joinUser['red_dot_text'] = 1;
                                            $joinUser['red_dot_mic'] = 1;
                                            $joinUser['red_dot_camera'] = 1;
                                        }


                                        $join_user = \App\Models\RoomUser::create($joinUser);



                                    }

                                    $joinUserId = $this->_user->id;

                                    // Add User to SendBird Super Channel
                                    $sendBirdChannelService->addUserToChannel([$joinUserId], $currentRoomDtls->send_bird_channel_url);


                                    // *****This code is commented after chang by client so if a admin or anyone wants to join room he will be joined normally********
                                    // $check_owner = \App\Models\RoomUser::where("is_admin", 3)
                                    //         ->where("user_id", $this->_user->id)
                                    //         ->where("room_id", $input['room_id'])
                                    //         ->orderBy("created_at", "DESC")
                                    //         ->onlyTrashed()->first();
                                    // if ($check_owner) {
                                    //     $is_admin = $check_owner->is_admin;
                                    // }
                                    // print_r($input['ip_addr']);die;
// ******************************************************************************************************************


                                    \App\Models\RoomKickUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->delete();
                                    Helper::createUserRoomSetting($this->_user->id, $input['room_id']);
                                    $roomUserObj = new \App\Models\RoomUser();
                                    $param = $roomUserObj->getListing([
                                        'id' => $join_user->id,
                                        'with' => [
                                            'details' => function ($q) {
                                                return $q->select('id', 'username');
                                            }
                                        ]
                                    ])->toArray();
                                    $param['type'] = 'join';
                                    Helper::emit($param, 'RoomMemberOption');
                                    $roomDtls = Room::find($input['room_id']);
                                    $cdn = \App\Models\Cdn::where("status", 0)->first();
                                    $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                                    $file_name = "c_" . $input['room_id'] . "_" . $this->_user->id . ".json";
                                    if (file_exists($file_path . $file_name)) {
                                    } else {
                                        if ($roomDtls->welcome_message) {
                                            $chat_array = [
                                                'room_id' => $input['room_id'],
                                                'chat_body' => $roomDtls->welcome_message,
                                                'to_user_id' => 0,
                                                'type' => 'welcome',
                                                'user_id' => $this->_user->id,
                                            ];
                                            $fp = fopen($file_path . $file_name, 'w');
                                            $tempArray = [];
                                            array_push($tempArray, $chat_array);
                                            fwrite($fp, json_encode($tempArray));
                                            fclose($fp);

                                            // added new code 14jun2022
                                            //Storage::put($file_name, json_encode($tempArray));
                                        }
                                    }

                                    // $notificationJob = new \App\Jobs\SendJoinRoomNotificationJob((int) $input['room_id'], $this->_user);
                                    // dispatch($notificationJob);

                                    // send notification

                                    $room_id = $input['room_id'];

                                    $user = Auth::user();
                                    $siteSettingInst = new \App\Models\SiteSettingUserStructure();
                                    $siteSetting = $siteSettingInst->getListing([
                                        'key' => 'notify_users_join_exit_room',
                                    ]);

                                    $room_users = \App\Models\RoomUser::select('room_users.user_id')
                                        ->join('site_setting_users', function ($join) use ($siteSetting) {
                                            $join->on("site_setting_users.user_id", "room_users.user_id")
                                                ->where("site_setting_users.site_setting_id", $siteSetting->structure_id)
                                                ->where("site_setting_users.val", 1);
                                        })
                                        // ->leftJoin('user_room_settings', function ($join) use ($room_id) {
                                        //     $join->on("user_room_settings.user_id", "room_users.user_id")
                                        //         ->where('notify_join_room', 1)
                                        //         ->where('user_room_settings.room_id', $room_id);
                                        // })
                                        // ->where(function ($query) {
                                        //     $query->where("site_setting_users.val", 1)
                                        //         ->orWhere("user_room_settings.notify_join_room", 1);
                                        // })
                                        ->where('room_users.room_id', $room_id)->get();

                                    //dd($room_users);

                                    $chatdtls = [];
                                    if (count($room_users)) {
                                        $cdn = \App\Models\Cdn::where("status", 1)->first();
                                        $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                                        foreach ($room_users as $u) {
                                            $file_name = "c_" . $room_id . "_" . $u->user_id . ".json";
                                            $customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                                ->where(['for_user_id' => $user->id, 'user_id' => $u->user_id])
                                                ->first();
                                            $chat_array = [
                                                'room_id' => $room_id,
                                                'chat_body' => (($customized_nickname) ? $customized_nickname->nickname : $user->username) . ' has just joined the room.',
                                                'to_user_id' => 0,
                                                'type' => 'join',
                                                'user_id' => $user->id,
                                            ];
                                            if (file_exists(public_path($file_path) . $file_name)) {
                                                $inp = file_get_contents(public_path($file_path) . $file_name);
                                                $tempArray = json_decode($inp, true);
                                                array_push($tempArray, $chat_array);
                                                $jsonData = json_encode($tempArray);
                                                file_put_contents(public_path($file_path) . $file_name, $jsonData);
                                                $chat_array['view_user_id'] = $u->user_id;
                                                array_push($chatdtls, $chat_array);
                                            } else {
                                                $fp = fopen(public_path($file_path) . $file_name, 'w');
                                                $tempArray = [];
                                                array_push($tempArray, $chat_array);
                                                fwrite($fp, json_encode($tempArray));
                                                fclose($fp);
                                                $chat_array['view_user_id'] = $u->user_id;
                                                array_push($chatdtls, $chat_array);
                                            }
                                        }
                                    }

                                    DB::commit();
                                    if (count($chatdtls)) {
                                        \App\Helpers\Helper::emit($chatdtls, 'chatMessage');
                                    }


                                    //notification code end

                                    return Helper::rj('You have joined the room successfully.', 200, $param);
                                } else {
                                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                                        'errors' => 'You cannot join this room. Contact the room\'s admins for more details.'
                                    ]);

                                }
                            } else {
                                return \App\Helpers\Helper::rj('Bad Request', 400, [
                                    'errors' => 'This room has reached its maximum capacity of users.'
                                ]);

                            }
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'You cannot join this room. Contact the room\'s admins for more details.'
                            ]);

                        }
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'Sorry, you don\'t have the permission to join the room as you are banned by room admin.'
                        ]);

                    }
                }
            }

        } catch (\Exception $e) {
            DB::rollBack();
            // Remove User to SendBird Super Channel iF Exception occurs
            if ($currentRoomDtls && isset($currentRoomDtls->send_bird_channel_url)) {
                $sendBirdChannelService->removeUsersFromChannel([$joinUserId], $currentRoomDtls->send_bird_channel_url);
            }

            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function verifyLockword(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'lockword' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $record = $this->_model->getListing(['id' => $request->room_id, 'lockword' => $request->lockword]);
                if ($record) {
                    return Helper::rj('Lockword matched.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You must enter the valid Lockword to join this room!'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function verifyAdmincode(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'admincode' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $record = $this->_model->getListing(['id' => $request->room_id, 'admin_code' => $request->admincode]);
                if ($record) {
                    return Helper::rj('Admin code matched.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You have entered invalid admin code.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function verifyInvitationCode(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'invitation_code' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $vipInvitationObj = new \App\Models\VIPInvitation();
                $record = $vipInvitationObj->getListing(['user_id' => $this->_user->id, 'room_id' => $request->room_id, 'invitation_code' => $request->invitation_code]);
                if ($record) {
                    return Helper::rj('Invitation Code matched.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You are not Invited!'
                    ]);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function verifyRoomPassword(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'room_password' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $record = $this->_model->getListing(['id' => $request->room_id, 'room_password' => $request->room_password]);
                if ($record) {
                    $data['room'] = $this->_model->getListing([
                        'id' => $request->room_id,
                        'with' => [
                            'roomOwner' => function ($q) {
                                return $q->select('room_id', 'user_id')->where('is_admin', 3);
                            }
                        ]
                    ])
                        ->makeVisible(['admin_code', 'lockword', 'room_password']);
                    return Helper::rj('Password matched.', 200, $data);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'The room\'s password is incorrect. You must enter a password to access your room´s settings. Please try again!'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getRoomDetails(Request $request, $room_id, SendBirdChannelService $sendBirdChannelService)
    {
        try {
            $user = $this->_user;
            $srch_params = $request->all();
            $srch_params['id'] = $room_id;
            $srch_params['with'] = [
                'joinStatus' => function ($q) use ($user) {
                    return $q->select('room_id', 'is_admin')->where('user_id', $user->id)->whereNull('deleted_at');
                },
                'opentalkInfo',
                'subscriptionInfo' => function ($q) use ($user) {
                    return $q
                        // ->where(['user_id' => $user->id, 'is_closed' => 0, 'on_hold' => 0])
                        // ->where('room_id', '!=', 0)
                        ->where(function ($query) {
                            $query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
                                ->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
                        });
                    // ->with(['planInfo', 'priceInfo', 'feature'])->first();
    
                    //->whereDate("renew_at", ">=", date("Y-m-d H:i"));
                },
            ];
            $srch_params['withCount'] = [
                'isFavourite' => function ($q) use ($user) {
                    return $q->where('user_id', $user->id);
                },
                'isLike' => function ($q) use ($user) {
                    return $q->where('user_id', $user->id);
                }
            ];
            $data['room'] = $this->_model->getListing($srch_params);
            $data['room'] = $data['room']->makeHidden(['lockword', 'admin_code', 'room_password']);

            // check if token is expired or not
            /*$token = $data['room']->opentalkInfo->token;
            $token = str_replace('T1', '', $token);
            $token_arr = explode("&", base64_decode($token));
            $expire_time = explode("=", $token_arr[5]);
            $expire_time = $expire_time[1];
            if (strtotime(now()) > $expire_time) {
                // create a new token
                $opentalk = new OpenTok(\Config::get('settings.opentalk_api_key'), \Config::get('settings.opentalk_secret_key'));
                $new_token = $opentalk->generateToken($data['room']->opentalkInfo->session, [
                    'role' =>  Role::PUBLISHER,
                    'expireTime' => time()+(30 * 24 * 60 * 60), // in 30 days
                    'data' => "name=" . $data['room']->room_name,
                    'initialLayoutClassList' => array('focus')
                ]);
                $data['room']->opentalkInfo->update(['token' => $new_token]);
            }*/

            if (is_null($data['room']->joinStatus)) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => 'Sorry! you are not the member of this room.'
                ]);

            }

            // $input['ip_addr'] = $request->ip(); //'45.64.221.241';
            $input['ip_addr'] = '45.64.221.241';
            $input['timezone'] = Helper::getTimezone($input['ip_addr']);
            \App\Models\RoomUser::where(['user_id' => $this->_user->id, 'room_id' => $room_id])->update($input);
            $current_time = (new \DateTime())->format("Y-m-d H:i:s");
            $roomUserModel = new \App\Models\RoomUser();
            $search_params = [
                'room_id' => $room_id,
                //'user_id_not' => $this->_user->id,
                'with' => [
                    'details' => function ($q) {
                        return $q->select('id', 'username', 'first_name', 'last_name');
                    },
                    'customizeNickname' => function ($q) use ($user) {
                        return $q->select('for_user_id', 'nickname')
                            ->where(['user_id' => $user->id]);

                    },
                    'addContactList' => function ($q) use ($user) {
                        return $q->where('user_id', $user->id);
                    },
                    'isBlock' => function ($q) use ($user) {
                        return $q->select('user_id', 'block_user_id')->where('user_id', $user->id);
                    },
                    'isUploadvideo' => function ($q) use ($room_id, $current_time) {
                        return $q->select('id', 'user_id', 'video_duration', 'upload_time', 'video_end_time')
                            ->where("video_end_time", ">=", $current_time)
                            ->where('room_id', $room_id);
                    },
                    'isIgnore' => function ($q) use ($room_id, $user) {
                        return $q->where('room_id', $room_id)->where('user_id', $user->id);
                    },
                    'whisperChannel' => function ($q) use ($user) {
                        return $q->where('user_id', $user->id);
                    }
                ],
                'block_user' => $this->_user->id,
                //'get_sql' => 1
            ];
            $data['members'] = $roomUserModel->getListing($search_params);
            foreach ($data['members'] as $key => $value) {
                $user_id = $value['user_id'];

                // $value->details['member_country_name'] = 'india';
                // return $value->details;
                $member_details = RoomUser::with('details')->where('user_id', $value->user_id)->first();
                // return $member_details->details->country_name;
                // return $member_details->details->dob;

                $visibility = UserOptionVisible::where('user_id', $value->user_id)->where('key', 'gender_visible')->where('value', '1')->first();
                if ($visibility) {
                    $value->details['member_gender_name'] = $member_details->details->gender_name->title;
                } else {
                    $value->details['member_gender_name'] = null;
                }

                $visibilitya = UserOptionVisible::where('user_id', $value->user_id)->where('key', 'dob_visible')->where('value', '1')->first();
                if ($visibilitya) {
                    $value->details['member_dob'] = $member_details->details->dob;
                } else {
                    $value->details['member_dob'] = null;
                }

                $visibilityb = UserOptionVisible::where('user_id', $value->user_id)->where('key', 'country_visible')->where('value', '1')->first();
                if ($visibilityb) {
                    $value->details['member_country_name'] = $member_details->details->country_name;
                } else {
                    $value->details['member_country_name'] = null;
                }



                // if(in_array('gender_visible', $visibilty[0]) && $visibilty->value==1)
                // {
                //     $gender = Gender::select('title')->where('id',$value->user_id)->first();
                //     $value->details['member_gender_name'] = $gender->title;
                // }else{
                //     $value->details['member_gender_name'] = null;
                // }

                // if($visibilty->key=='dob_visible' && $visibilty->value==1)
                // {
                //     $dob = User::select('dob')->where('id',$value->user_id)->first();
                //     $value->details['member_dob'] = $dob->title;
                // }else{
                //     $value->details['member_dob'] = null;
                // }
                // if($visibilty->key=='country_visible' && $visibilty->value==1)
                // {
                //     $country = LocationCountry::select('country_name')->where('id',$value->user_id)->first();
                //     $value->details['member_country_name'] = $country->title;
                // }else{
                //     $value->details['member_country_name'] = null;
                // }

                // return $value->details;


                //for bages add sanjay

                $bagde = UserBadge::firstOrCreate(
                    ['user_id' => $user_id]
                );

                if ($bagde->next_badge_id == null && $bagde->current_badge_id == null) {
                    $bagde->next_badge_id = Badge::first()->id;
                    $bagde->save();
                }

                $badegPoints = UserBadgePoints::firstOrCreate(
                    ['user_id' => $user_id]
                );


                $badgePoints = UserBadgePoints::where('user_id', $user_id)->first();
                if ($badgePoints) {
                    $bagde = UserBadge::where('user_id', $user_id)->first();
                    $badgePoints->current_balance;
                    $badgeID = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
                    if ($badgeID) {
                        $bagde->current_badge_id = $badgeID->id;
                        $bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id : $badgeID->id;
                        $bagde->save();
                    }
                }

                $badgeData = UserBadge::with('currentBadge', 'nextBadge')->where(['user_id' => $user_id])->first();
                $data['members'][$key]['details']['badge_data'] = $badgeData;
                $data['members'][$key]['details']['badge_points'] = $badegPoints;
                // code...
            }

            $data['cur_server_time'] = (new \DateTime())->format("Y-m-d H:i:s");
            $userModel = new \App\Models\User();
            $user_search_params = [
                'id' => $this->_user->id,
                'with' => [
                    'roomUserStatus' => function ($q) use ($room_id) {
                        return $q->where('room_id', $room_id)->whereNull('deleted_at');
                    },
                    'roomUserSettings' => function ($q) use ($room_id) {
                        return $q->where('room_id', $room_id)->whereNull('deleted_at');
                    }
                ]
            ];
            $data['user'] = $userModel->getListing($user_search_params);
            $roomSettingObj = new \App\Models\RoomSetting();
            $data['room_setting'] = $roomSettingObj->getListing(['room_id' => $room_id]);
            $data['room_owner'] = $roomUserModel->getListing([
                'room_id' => $room_id,
                'room_owner' => 1,
                'with' => [
                    'details' => function ($q) {
                        return $q->select('id', 'username', 'first_name', 'last_name');
                    },
                    'customizeNickname' => function ($q) use ($user) {
                        return $q->select('for_user_id', 'nickname')
                            ->where(['user_id' => $user->id]);
                    },
                ]
            ]);
            $data['allow_mic'] = 1;
            if ($data['room_setting'] && $data['room_setting']->simultaneous_mics) {
                $count_mic = \App\Models\RoomUser::where(['room_id' => $room_id, 'is_mic' => 1])->count();
                if ($data['room_setting']->simultaneous_mics <= $count_mic) {
                    $data['allow_mic'] = 0;
                }
            }
            $playVideoObj = new \App\Models\PlayVideo();
            $data['play_video'] = $playVideoObj->getListing([
                'room_id' => $room_id,
                'is_accepted' => [0, 1],
                'orderBy' => '-accepted_at',
                'with' => ['users']
            ]);

            $roomSendbirdChannel = $data['room']->send_bird_channel_url;
            if (empty($roomSendbirdChannel)) {
                try {

                    $roomName = $data['room']->room_name;
                    $roomId = $data['room']->id;
                    $roomOwnerId = $data['room_owner']->user_id;
                    $roomMembers = collect($data['members'])->pluck('user_id')->toArray();
                    $superChannel = $sendBirdChannelService->createSuperPublicChannel($roomMembers, $roomName . ' ' . $roomId . ' Public', [$roomOwnerId]);

                    if ($superChannel) {

                        DB::table('rooms')->where('id', $roomId)->update([
                            'send_bird_channel_url' => $superChannel->channel_url
                        ]);

                        // dispatch(function () use ($room, $sendBirdChannelService) {

                        //     $customKeys = [
                        //         'type' => 'room',
                        //         'room_id' => (string) $room->id
                        //     ];

                        //     // $videoRoom = $sendBirdChannelService->createAudioVideoRoom('Super Public Group', 'video', $customKeys);

                        //     $rooms = \App\Models\Room::find($room->id);
                        //     // $rooms->update([
                        //     //     'send_bird_video_call_room_id' => $videoRoom->room->room_id
                        //     // ]);

                        // })->afterResponse();
                    }

                    $data['room']->send_bird_channel_url = $superChannel->channel_url;

                } catch (\Exception $e) {
                    info("getRoomDetails Create SendBird Super Channel", [$e->getMessage()]);
                }

            }

            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function addFavourite(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'folder_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $room = $this->_model->getListing(['id' => $input['room_id']]);
                if ($room) {
                    $tot_room = \App\Models\RoomFavourite::where(['user_id' => $this->_user->id, 'folder_id' => $input['folder_id']])->count();
                    if ($tot_room < 30) {
                        $isNotExist = \App\Models\RoomFavourite::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->doesntExist();
                        if ($isNotExist) {
                            \App\Models\RoomFavourite::create([
                                'room_id' => $input['room_id'],
                                'user_id' => $this->_user->id,
                                'folder_id' => $input['folder_id'],
                            ]);
                            return Helper::rj('Room added as a favourite.', 200, []);
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'This room already exists in your Favorites.'
                            ]);

                        }
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'You cannot add rooms as a favorite anymore inside this folder. Please delete a room from your favorite list first to add a new one!'
                        ]);

                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry, you cannot add this room to your favorites. This room does not exist, please refresh the rooms list.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function addLike(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $isNotExist = \App\Models\RoomLike::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->doesntExist();
                if ($isNotExist) {
                    \App\Models\RoomLike::create([
                        'room_id' => $input['room_id'],
                        'user_id' => $this->_user->id
                    ]);
                }
                return Helper::rj('You have liked the room successfully.', 200, []);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function removeLike(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $isExist = \App\Models\RoomLike::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->exists();
                if ($isExist) {
                    \App\Models\RoomLike::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->delete();
                }
                return Helper::rj('You have unlike the room successfully..', 200, []);
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }


    public function removeFavourite(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $isExist = \App\Models\RoomFavourite::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->exists();
                if ($isExist) {
                    \App\Models\RoomFavourite::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->delete();
                }
                return Helper::rj('Room removed from favourites.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function manageTopic(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'topic' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = $this->_user;
                $srch_params = $request->all();
                $srch_params['id'] = $input['room_id'];
                $srch_params['with'] = [
                    'joinStatus' => function ($q) use ($user) {
                        return $q->select('room_id', 'is_admin')->where('user_id', $user->id)->whereNull('deleted_at');
                    }
                ];
                $room = $this->_model->getListing($srch_params);
                if (!$room->joinStatus->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to manage the topic.'
                    ]);

                } else {
                    $update = $room->update($input);
                    if ($update) {
                        Helper::emit($input, 'TopicUpdate');
                        return Helper::rj('Topic updated successfully.', 200, []);
                    }
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function myActiveRooms(Request $request)
    {
        try {
            //$roomUserModel = new \App\Models\RoomUser();
            $search_params = [
                'active_room' => $this->_user->id,
                'with' => [
                    'subscriptionInfo' => function ($q) {
                        return $q->whereDate("renew_at", ">=", date("Y-m-d H:i"));
                    },
                ]
                //'get_sql' => 1
            ];
            /*$search_params['with'] = [
                'roomDetails'
            ];*/
            $data['active_rooms'] = $this->_model->getListing($search_params);
            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function exitFromRoom(Request $request, $room_id = 0)
    {
        try {
            Helper::removeRoomUserInformation($room_id, $this->_user->id);

            $param[] = [
                'room_id' => $room_id,
                'user_id' => $this->_user->id
            ];
            $currentRoomDtls = Room::find($request->room_id ?? 0);

            $param['type'] = 'exit';
            Helper::emit($param, 'RoomMemberOption');

            // $notificationJob = new \App\Jobs\SendExitRoomNotificationJob((int) $room_id, $this->_user);
            // dispatch($notificationJob);

            $room_id = $request->room_id;
            $user = Auth::user();

            $siteSettingInst = new \App\Models\SiteSettingUserStructure();
            $siteSetting = $siteSettingInst->getListing([
                'key' => 'notify_users_join_exit_room',
            ]);

            $room_users = \App\Models\RoomUser::select('room_users.user_id')
                ->join('site_setting_users', function ($join) use ($siteSetting) {
                    $join->on("site_setting_users.user_id", "room_users.user_id")
                        ->where("site_setting_users.site_setting_id", $siteSetting->structure_id)
                        ->where("site_setting_users.val", 1);
                })
                // ->leftJoin('user_room_settings', function ($join) use ($room_id) {
                //     $join->on("user_room_settings.user_id", "room_users.user_id")
                //         ->where('notify_exit_room', 1)
                //         ->where('user_room_settings.room_id', $room_id);
                // })
                // ->where(function ($query) {
                //     $query->where("site_setting_users.val", 1);
                //     //->orWhere("user_room_settings.notify_exit_room", 1);
                // })
                ->where('room_users.room_id', $room_id)->get();

            //dd($room_users);


            $chatdtls = [];
            if (count($room_users)) {
                $cdn = \App\Models\Cdn::where("status", 1)->first();
                $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                foreach ($room_users as $u) {
                    $file_name = "c_" . $room_id . "_" . $u->user_id . ".json";
                    $customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                        ->where(['for_user_id' => $user->id, 'user_id' => $u->user_id])
                        ->first();
                    $chat_array = [
                        'room_id' => $room_id,
                        'chat_body' => (($customized_nickname) ? $customized_nickname->nickname : $user->username) . ' has just left the room.',
                        'to_user_id' => 0,
                        'type' => 'exit',
                        'user_id' => $user->id,
                    ];
                    if (file_exists(public_path($file_path) . $file_name)) {
                        $inp = file_get_contents(public_path($file_path) . $file_name);
                        $tempArray = json_decode($inp, true);
                        array_push($tempArray, $chat_array);
                        $jsonData = json_encode($tempArray);
                        file_put_contents(public_path($file_path) . $file_name, $jsonData);
                        $chat_array['view_user_id'] = $u->user_id;
                        array_push($chatdtls, $chat_array);
                    } else {
                        $fp = fopen(public_path($file_path) . $file_name, 'w');
                        $tempArray = [];
                        array_push($tempArray, $chat_array);
                        fwrite($fp, json_encode($tempArray));
                        fclose($fp);
                        $chat_array['view_user_id'] = $u->user_id;
                        array_push($chatdtls, $chat_array);
                    }
                }
            }
            \App\Helpers\Helper::emit($chatdtls, 'chatMessage');

            $srch_params = $request->all();
            $srch_params['id'] = $room_id;
            $room = $this->_model->getListing($srch_params);
            if (!$room) {
                return Helper::rj('Invalid Room Id, Room not found.', 404);
            }
            if ($room->room_type_id == 1 && $room->locked_room) {
                $is_any_admin_exist = \App\Models\RoomUser::where('is_admin', '<>', 0)
                    ->where('room_id', $room_id)->count();
                /*if ($is_any_admin_exist) {
                    $notificationJob = new \App\Jobs\SendExitRoomNotificationJob((int)$room_id, $this->_user);
                    dispatch($notificationJob);
                } else {*/
                if (!$is_any_admin_exist) {
                    $roomUserObj = new \App\Models\RoomUser();
                    $userList = $roomUserObj->getListing(['room_id' => $room_id]);
                    $param = [];
                    if (count($userList)) {
                        foreach ($userList as $room_user) {
                            Helper::removeRoomUserInformation($room_id, $room_user->user_id);
                            $param['user'][] = $room_user->toArray();
                        }
                    }
                    \App\Models\RoomUser::where(['room_id' => $room_id])->delete();
                    //\App\Models\RoomOpentalk::where(['room_id' => $room_id])->delete();
                    $room->update(['is_closed' => 1]);
                    $param['room_id'] = $room_id;
                    $param['type'] = 'room_close';
                    Helper::emit($param, 'RoomMemberOption');
                }
            }
            $total_user = \App\Models\RoomUser::where('room_id', $room_id)->count();
            if ($room->room_type_id == 2) {
                if (!$total_user) {
                    \App\Models\RoomOpentalk::where(['room_id' => $room_id])->delete();
                    $room->delete();
                }
            } elseif ($room->room_type_id == 1) {
                if (!$total_user) {
                    $room->update(['is_closed' => 1]);
                }
            }

            //remove chats on logout
            $cdn = \App\Models\Cdn::where("status", 1)->first();
            $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
            $file_name = "c_" . $room_id . "_" . Auth::id() . ".json";
            if (file_exists($file_path . $file_name)) {
                unlink($file_path . $file_name);
            }

            return Helper::rj('You have successfully exit from the room.', 200, []);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function deleteRoom(Request $request, $room_id = 0, SendBirdChannelService $sendBirdChannelService)
    {
        try {
            $room = $this->_model->getListing(['id' => $room_id]);
            if (!$room) {
                return \App\Helpers\Helper::resp('Not a valid data', 400);
            }
            $roomUserObj = new \App\Models\RoomUser();
            $userList = $roomUserObj->getListing(['room_id' => $room_id]);
            $param = [];
            if (count($userList)) {
                foreach ($userList as $room_user) {
                    Helper::removeRoomUserInformation($room_id, $room_user->user_id);
                    $param['user'][] = $room_user->toArray();
                }
            }
            \App\Models\RoomUser::where(['room_id' => $room_id])->delete();
            \App\Models\RoomOpentalk::where(['room_id' => $room_id])->delete();
            $roomDtl = $room->clone();
            $room->delete();
            $param['room_id'] = $room_id;
            $param['type'] = 'room_delete';
            Helper::emit($param, 'RoomMemberOption');

            dispatch(function () use ($roomDtl, $sendBirdChannelService) {
                $sendBirdChannelService->deleteGroupChannel($roomDtl->send_bird_channel_url, $roomDtl);
            })->afterResponse();


            return Helper::rj('Room deleted successfully.', 200, []);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getAdminList(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $roomUserObj = new \App\Models\RoomUser();
                $data['head_admin'] = $roomUserObj->getListing([
                    'is_admin' => 1,
                    'room_id' => $request->room_id,
                    'with' => [
                        'details' => function ($q) {
                            return $q->select('id', 'username');
                        },
                        'customizeNickname' => function ($q) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $this->_user->id);
                        }
                    ],
                    //'get_sql' => 1
                ]);

                $data['admin'] = $roomUserObj->getListing([
                    'is_admin' => 2,
                    'room_id' => $request->room_id,
                    'with' => [
                        'details' => function ($q) {
                            return $q->select('id', 'username');
                        },
                        'customizeNickname' => function ($q) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $this->_user->id);
                        }
                    ],
                    //'get_sql' => 1
                ]);
                return Helper::rj('Record found.', $this->successStatus, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function deleteAdmin(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                \App\Models\RoomUser::where('room_id', $input['room_id'])
                    ->whereIn('user_id', $input['user_id'])
                    ->withTrashed()
                    ->update(['is_admin' => 0]);
                $input['type'] = 'delete_admin';
                Helper::emit($input, 'RoomMemberOption');
                return Helper::rj('User deleted successfully from their role.', $this->successStatus, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function addAdmin(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'user_id' => 'required',
                'is_admin' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $checkExist = \App\Models\RoomUser::where([
                    'room_id' => $input['room_id'],
                    'user_id' => $input['user_id'],
                    'is_admin' => $input['is_admin']
                ])->exists();
                if ($checkExist) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'User is already added into the specified role.'
                    ]);

                }
                $current_user = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->first();
                //die($input['is_admin']);
                $updateroomUser = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $input['user_id']])->first();
                $roomUserData = \App\Models\RoomUser::where(['room_id' => $input['room_id']])->first();
                if ($updateroomUser) {
                    $updateroomUser->is_admin = $input['is_admin'];
                    $updateroomUser->added_by = Auth::user()->id;
                    $updateroomUser->save();
                } else {
                    $createdata = new \App\Models\RoomUser();
                    $createdata->room_id = $input['room_id'];
                    $createdata->user_id = $input['user_id'];
                    $createdata->is_admin = $input['is_admin'];
                    $createdata->added_by = Auth::user()->id;
                    $createdata->is_accepted = 1;
                    $createdata->ip_addr = $roomUserData->ip_addr;
                    $createdata->timezone = $roomUserData->timezone;
                    $createdata->save();
                    /* return \App\Helpers\Helper::rj('Bad Request', 400, [
                         'errors' => 'Room not exists.'
                     ]);
                     */
                }

                $roomUserObj = new \App\Models\RoomUser();
                $data = $roomUserObj->getListing([
                    'room_id' => $input['room_id'],
                    'user_id' => $input['user_id'],
                    'with' => [
                        'details' => function ($q) {
                            return $q->select('id', 'username');
                        },
                        'addedBy' => function ($q) {
                            return $q->select('id', 'username');
                        },
                        'customizeNickname' => function ($q) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $this->_user->id);
                        }
                    ]
                ]);
                $param = $data->toArray();
                $param = $param[0];
                $param['type'] = 'add_admin';
                Helper::emit($param, 'RoomMemberOption');
                return Helper::rj('User added successfully into the specified role.', $this->successStatus, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getAdminCPInfo(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $check_user = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'user_id' => $this->_user->id])->first();
                if (($check_user && !$check_user->is_admin) || (is_null($check_user))) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to view this page.'
                    ]);

                } else {
                    $data['welcome_message'] = Room::select('welcome_message')->find($input['room_id'])
                        ->makeHidden(['room_picture', 'total_user', 'type', 'total_camera_on', 'total_favourite']);

                    $kickUserObj = new \App\Models\RoomKickUser();
                    $data['kicked_users'] = $kickUserObj->getListing([
                        'room_id' => $input['room_id'],
                        'with' => [
                            'details' => function ($q) {
                                return $q->select('id', 'username');
                            },
                            'customizeNickname' => function ($q) {
                                return $q->select('for_user_id', 'nickname')->where('user_id', $this->_user->id);
                            }
                        ]
                    ]);

                    $bannedUserObj = new \App\Models\RoomBannedUser();
                    $data['banned_users'] = $bannedUserObj->getListing([
                        'room_id' => $input['room_id'],
                        'with' => [
                            'details' => function ($q) {
                                return $q->select('id', 'username');
                            },
                            'customizeNickname' => function ($q) {
                                return $q->select('for_user_id', 'nickname')->where('user_id', $this->_user->id);
                            }
                        ]
                    ]);

                    $roomUserObj = new \App\Models\RoomUser();
                    $data['just_left_users'] = $roomUserObj->getListing([
                        'room_id' => $input['room_id'],
                        'left_user' => 1,
                        'orderBy' => 'deleted_at',
                        'with' => [
                            'details' => function ($q) {
                                return $q->select('id', 'username');
                            },
                            'customizeNickname' => function ($q) {
                                return $q->select('for_user_id', 'nickname')->where('user_id', $this->_user->id);
                            }
                        ]
                    ]);

                    $age_list = [];
                    for ($i = 5; $i <= 30; $i++) {
                        $age_list[] = $i;
                    }
                    $data['age_list'] = $age_list;

                    $ageRangeObj = new \App\Models\RoomAgeRange();
                    $data['age_range'] = $ageRangeObj->getListing();

                    $roomSettingObj = new \App\Models\RoomSetting();
                    $data['room_settings'] = $roomSettingObj->getListing(['room_id' => $input['room_id']]);

                    return Helper::rj('Record found.', $this->successStatus, $data);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removedUserFrmKick(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $check_user = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to perform this operation.'
                    ]);

                } else {
                    $del = \App\Models\RoomKickUser::where('room_id', $input['room_id'])
                        ->whereIn('user_id', $input['user_id'])->delete();
                    if ($del) {
                        return Helper::rj('Users deleted successfully from kick list.', $this->successStatus, []);
                    }
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removedUserFrmBan(Request $request, SendBirdChannelService $sendBirdChannelService)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $check_user = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to perform this operation.'
                    ]);

                } else {
                    $del = \App\Models\RoomBannedUser::where('room_id', $input['room_id'])->whereIn('user_id', $input['user_id'])->delete();
                    if ($del) {
                        $roomDtl = \App\Models\Room::find($input['room_id']);
                        $user_id = $input['user_id'];
                        dispatch(function () use ($user_id, $roomDtl, $sendBirdChannelService) {
                            $sendBirdChannelService->removeUserFromBanListChannel($user_id, $roomDtl->send_bird_channel_url);
                        });
                        return Helper::rj('Users deleted successfully from banned list.', $this->successStatus, []);
                    }
                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function banUsers(Request $request, SendBirdChannelService $sendBirdChannelService)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
                'is_unlimited_banned' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $check_user = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to perform this operation.'
                    ]);

                } else {
                    $srch_param = [
                        'id' => $input['room_id'],
                        'with' => [
                            'subscriptionInfo' => function ($q) {
                                return $q->whereDate("renew_at", ">=", date("Y-m-d H:i"));
                            },
                        ],
                    ];
                    $roomInfo = $this->_model->getListing($srch_param);
                    $no_of_ban_users = 10;
                    if ($roomInfo->subscriptionInfo) {
                        if ($roomInfo->subscriptionInfo->planInfo && $roomInfo->subscriptionInfo->planInfo->ban_limit) {
                            $no_of_ban_users = $roomInfo->subscriptionInfo->planInfo->ban_limit;
                        }
                    }
                    $current_tot_ban_users = \App\Models\RoomBannedUser::where([
                        'room_id' => $input['room_id'],
                    ])->count();
                    $tot_ban_users = $current_tot_ban_users + count($input['user_id']);
                    if ($no_of_ban_users >= $tot_ban_users) {
                        if (!$input['is_unlimited_banned']) {
                            $ban_dt = date('Y-m-d', strtotime($input['ban_date']));
                            $ban_time = date('H:i', strtotime($input['ban_time']));
                            $input['banned_date'] = $ban_dt . ' ' . $ban_time;
                        } else {
                            $input['banned_date'] = null;
                        }

                        if (count($input['user_id'])) {
                            $roomDtl = \App\Models\Room::find($input['room_id']);
                            $startTime = Carbon::now();
                            foreach ($input['user_id'] as $user_id) {
                                \App\Models\RoomBannedUser::updateOrCreate(['room_id' => $input['room_id'], 'user_id' => $user_id], [
                                    'room_id' => $input['room_id'],
                                    'user_id' => $user_id,
                                    'banned_date' => $input['banned_date'],
                                    'is_unlimited_banned' => $input['is_unlimited_banned'],
                                    'added_by' => $this->_user->id
                                ]);

                                if ($input['is_unlimited_banned']) {
                                    $seconds = -1;
                                } else {
                                    $endTime = Carbon::parse($input['banned_date']);
                                    $seconds = $startTime->diffInSeconds($endTime);
                                }

                                dispatch(function () use ($user_id, $roomDtl, $seconds, $sendBirdChannelService) {
                                    $sendBirdChannelService->addUserToBanListChannel($user_id, $seconds, $roomDtl->send_bird_channel_url);
                                });

                            }
                        }



                        return Helper::rj('Selected user has been successfully banned.', $this->successStatus, []);
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'Sorry, you can not ban more than ' . $no_of_ban_users . ' users.'
                        ]);

                    }
                }
            }
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function saveAdminCPInfo(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'welcome_message' => 'nullable|max:300',
                'under_age_not_allowed' => 'required',
                'under_age_range_allowed' => 'required',
                'disable_hyperlinks' => 'required',
                'anti_flood' => 'required',
                'red_dot_newcomers' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                Room::where(['id' => $input['room_id']])->update(['welcome_message' => $input['welcome_message']]);
                if (is_null($input['under_age'])) {
                    $input['under_age'] = 0;
                }
                if (is_null($input['under_age_range_id'])) {
                    $input['under_age_range_id'] = 0;
                }
                $meeting_dt = ($input['admin_meeting_date']) ? date('Y-m-d', strtotime($input['admin_meeting_date'])) : null;
                $meeting_time = ($input['admin_meeting_time']) ? date('H:i', strtotime($input['admin_meeting_time'])) : null;
                $admin_meeting_date = ($meeting_dt) ? $meeting_dt : null;
                if ($meeting_dt && $meeting_time) {
                    $admin_meeting_date .= ' ' . $meeting_time;
                }

                $input['admin_meeting_date'] = $admin_meeting_date;

                $roomSettingObj = new \App\Models\RoomSetting();
                $settings_value = $roomSettingObj->getListing(['room_id' => $input['room_id']]);

                if ($settings_value) {
                    $settings_value->update($input);
                } else {
                    $roomSettingObj->create($input);
                }
                $data = $roomSettingObj->getListing(['room_id' => $input['room_id']]);
                return Helper::rj('Information updated successfully.', $this->successStatus, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function myRooms(Request $request)
    {
        try {
            $data['list'] = $this->_model->getListing([
                'my_room' => $this->_user->id,
                //'get_sql' => 1
            ]);
            return Helper::rj('Record found.', $this->successStatus, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function favouriteRooms(Request $request)
    {
        try {
            $srch_params = [
                'favourite_room' => $this->_user->id,
                'folder_id' => 1,
                //'get_sql' => 1
            ];
            if (isset($request->folder_id)) {
                $srch_params['folder_id'] = $request->folder_id;
            }
            $data['list'] = $this->_model->getListing($srch_params);
            return Helper::rj('Record found.', $this->successStatus, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function customizeRoomname(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'customize_name' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $input['user_id'] = $this->_user->id;
                $check_record = \App\Models\CustomizeRoomName::where([
                    'user_id' => $input['user_id'],
                    'room_id' => $input['room_id']
                ])->first();
                if ($check_record) {
                    $check_record->update($input);
                } else {
                    \App\Models\CustomizeRoomName::create($input);
                }
                $record = \App\Models\CustomizeRoomName::where([
                    'user_id' => $input['user_id'],
                    'room_id' => $input['room_id']
                ])->first();
                return Helper::rj('Room name has been changed successfully.', $this->successStatus, $record);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function createFolder(Request $request)
    {
        try {
            $validationRules = [
                'pid' => 'required',
                'folder_name' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $user = $this->_user;
                $is_added = false;
                $msg = "Somethig went wrong. Please try again later.";
                if ($input['pid'] == 0) {
                    $total_root_folder = \App\Models\FavouriteFolder::where('pid', 0)
                        ->whereIn('user_id', [0, $this->_user->id])->count();
                    if ($total_root_folder < 10) {
                        $is_added = true;
                    } else {
                        $msg = "Sorry, you cannot add any folders to this level!";
                    }
                } else {
                    $folder_info = \App\Models\FavouriteFolder::with([
                        'children' => function ($q) use ($user) {
                            return $q->where('user_id', $user->id);
                        }
                    ])
                        ->where('id', $input['pid'])
                        ->whereIn('user_id', [0, $this->_user->id])
                        ->first();
                    if ($folder_info) {
                        //dd(count($folder_info->children));
                        if (count($folder_info->children) < 3) {
                            $is_added = true;
                        } else {
                            $msg = "Sorry, you cannot add any Sub-folders to this level!";
                        }
                    }
                }
                if ($is_added) {
                    $check_folder_name = \App\Models\FavouriteFolder::where('folder_name', $input['folder_name'])
                        ->whereIn('user_id', [0, $this->_user->id])->first();
                    if (is_null($check_folder_name)) {
                        $input['user_id'] = $this->_user->id;
                        \App\Models\FavouriteFolder::create($input);
                        $data['list'] = \App\Models\FavouriteFolder::with([
                            'children' => function ($q) use ($user) {
                                return $q->where('user_id', $user->id);
                            }
                        ])
                            ->where('pid', 0)
                            ->whereIn('user_id', [0, $this->_user->id])
                            ->get();
                        return Helper::rj('Folder created successfully.', $this->successStatus, $data);
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'This folder already exists.'
                        ]);

                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => $msg
                    ]);

                }

            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function deleteFolder(Request $request)
    {
        try {
            $validationRules = [
                'folder_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = $this->_user;
                $folder_list = \App\Models\FavouriteFolder::with([
                    'children' => function ($q) use ($user) {
                        return $q->where('user_id', $user->id);
                    }
                ])
                    ->where('id', $request->folder_id)
                    ->whereIn('user_id', [$this->_user->id])
                    ->first();
                if ($folder_list) {
                    \App\Models\RoomFavourite::where(['user_id' => $this->_user->id, 'folder_id' => $folder_list->id])->delete();
                    \App\Models\FavouriteFolder::where(['user_id' => $this->_user->id, 'id' => $folder_list->id])->delete();
                    if (count($folder_list->children)) {
                        $this->__deleteChildFolder($folder_list->children);
                    }
                }
                $data['list'] = \App\Models\FavouriteFolder::with([
                    'children' => function ($q) use ($user) {
                        return $q->where('user_id', $user->id);
                    }
                ])
                    ->where('pid', 0)
                    ->whereIn('user_id', [0, $user->id])
                    ->get();
                return Helper::rj('Folder deleted successfully.', $this->successStatus, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    private function __deleteChildFolder($children = null)
    {
        if (count($children)) {
            foreach ($children as $child) {
                \App\Models\RoomFavourite::where(['user_id' => $this->_user->id, 'folder_id' => $child->id])->delete();
                \App\Models\FavouriteFolder::where(['user_id' => $this->_user->id, 'id' => $child->id])->delete();
                if (count($child->children)) {
                    $this->__deleteChildFolder($child->children);
                }
            }
        }
    }

    public function favouriteFolderList(Request $request)
    {
        try {
            $user = $this->_user;
            $data['list'] = \App\Models\FavouriteFolder::with([
                'children' => function ($q) use ($user) {
                    return $q->where('user_id', $user->id);
                }
            ])
                ->where('pid', 0)
                ->whereIn('user_id', [0, $this->_user->id])
                ->get();
            return Helper::rj('Record found.', $this->successStatus, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function assignToFolder(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'folder_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $room = $this->_model->getListing(['id' => $request->room_id]);
                if ($room) {
                    $tot_room = \App\Models\RoomFavourite::where(['user_id' => $this->_user->id, 'folder_id' => $request->folder_id])->count();
                    if ($tot_room < 30) {
                        $update = \App\Models\RoomFavourite::where(['room_id' => $request->room_id, 'user_id' => $this->_user->id])
                            ->update(['folder_id' => $request->folder_id]);
                        if ($update) {
                            return Helper::rj('Room assigned to folder successfully.', $this->successStatus, []);
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'Somethig went wrong. Please try again later.'
                            ]);

                        }
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'You cannot add rooms as a favorite anymore inside this folder. Please delete a room from your favorite list first to add a new one!'
                        ]);

                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry, you cannot add this room to your favorites. This room does not exist, please refresh the rooms list.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function uploadVideo(Request $request)
    {
        try {
            $fileValidations = \App\Models\File::$fileValidations['video'];
            $validationRules = [
                'room_id' => 'required',
                'video' => 'required|mimetypes:' . implode(",", $fileValidations['file_mimes']) . '|max:' . $fileValidations['max']
            ];
            $msg = [
                'video.max' => 'The video may not be greater than 10 MB.'
            ];
            $validator = \Validator::make($request->all(), $validationRules, $msg);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $input['user_id'] = $this->_user->id;
                //instantiate class with file
                $track = new GetId3(request()->file('video'));
                //get video duration in miliseconds
                $input['video_duration'] = (int) $track->getPlaytimeSeconds();
                $record = \App\Models\UploadVideo::create($input);
                if ($request->hasFile('video')) {
                    $file = $request->file('video');
                    $fileExt = $file->getClientOriginalExtension();
                    $fileNameOriginal = $file->getClientOriginalName();
                    $fileSize = $file->getSize();
                    $fileMime = $file->getMimeType();

                    // Generating file name
                    $fileName = time() . rand();
                    $target_file = public_path('temp/');
                    $file->move($target_file, $fileName . '.' . $fileExt);

                    event(
                        new \App\Events\UploadVideoEvent(
                            $fileName,
                            $fileNameOriginal,
                            $fileExt,
                            $fileMime,
                            $fileSize,
                            $record,
                            $input['video_duration']
                        )
                    );
                }
                return Helper::rj('Video uploaded successfully.', $this->successStatus, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function findAndJoin(Request $request)
    {
        try {
            $user = $this->_user;
            $srch_params = $request->all();
            $srch_params['with'] = [
                'roomCategory',
                'roomGroup' => function ($q) {
                    return $q->select('id', 'group_name');
                },
                'joinStatus' => function ($q) use ($user) {
                    return $q->select('room_id', 'is_accepted', 'is_admin')->where('user_id', $user->id)->whereNull('deleted_at');
                },
                'isFavorites' => function ($q) use ($user) {
                    return $q->where('user_id', $user->id);
                },
                'subscriptionInfo' => function ($q) {
                    return $q->whereDate("renew_at", ">=", date("Y-m-d H:i"));
                },
            ];
            $data['list'] = $this->_model->getListing($srch_params);
            $data['list'] = $data['list']->makeHidden(['lockword', 'admin_code', 'room_password']);
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function invite(Request $request)
    {
        try {

            $validationRules = [
                'room_link' => 'required',
                'room_id' => 'required',
                'isVIP' => 'required|boolean'
            ];

            if ($request->isVIP) {
                $validationRules['emails'] = 'required';

            } else {
                $validationRules['emails'] = ['required', new \App\Rules\MultipleEmailValidate()];
            }

            return Helper::validateAndSendEmail($request, $validationRules, $request->isVIP ? 'vip_invite' : 'room_invite');

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function instantInvite(Request $request, SendBirdChannelService $sendBirdChannelService)
    {
        try {
            $validationRules = [
                'users' => 'array|min:1|required',
                'users.*' => 'required',
                'room_id' => 'required',
                'isVIP' => 'required|boolean'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $room_info = Room::select(['group_id', 'send_bird_channel_url', 'lockword'])->find($input['room_id']);
                if (count($input['users'])) {
                    foreach ($input['users'] as $user) {
                        $room = Room::select(\DB::raw("IF(crn.customize_name IS NULL, rooms.room_name, crn.customize_name) AS room_name"))
                            ->leftJoin("customized_room_names as crn", function ($join) use ($user) {
                                $join->on("crn.room_id", "rooms.id")
                                    ->where("crn.user_id", $user);
                            })
                            ->find($input['room_id']);

                        $username = \App\Models\User::select(\DB::raw("IF(cn.nickname IS NULL, users.username, cn.nickname) AS nickname"))
                            ->leftJoin("customize_nicknames as cn", function ($join) use ($user) {
                                $join->on("cn.for_user_id", "users.id")
                                    ->where("cn.user_id", $user);
                            })
                            ->where("users.id", $this->_user->id)
                            ->first();


                        $msg = $username->nickname . ' has invited you to join the room ' . $room->room_name;

                        $notData = null;

                        if ($request->isVIP) {
                            $iniviteeUser = \App\Models\User::where('id', $user)->first();

                            $invitation_code = mt_rand(1, 999999) . now()->getTimestampMs();



                            \App\Models\VIPInvitation::create([
                                'email' => $iniviteeUser->email,
                                'user_id' => $iniviteeUser ? $iniviteeUser->id : null,
                                'room_id' => $request->room_id,
                                'invitation_code' => $invitation_code,
                                'invited_by' => Auth::id()
                            ]);

                            $notData = json_encode(["invitation_code" => $invitation_code]);
                        }




                        $record = \App\Models\Notification::create([
                            'from_user_id' => $this->_user->id,
                            'to_user_id' => $user,
                            'type' => 'invite',
                            'message' => $msg,
                            'entity_id' => $input['room_id'],
                            'group_id' => $room_info->group_id,
                            'data' => $notData
                        ]);
                        //dd($record);
                        $notificationObj = new \App\Models\Notification();
                        $rcrd = $notificationObj->getListing([
                            'id' => $record->id,
                            'with' => [
                                'fromUserInfo' => function ($q) use ($user) {
                                    $q->select('id', 'username')->with([
                                        'customizeNickname' => function ($q) use ($user) {
                                            $q->where('user_id', $user);
                                        }
                                    ]);
                                },
                            ]
                        ]);
                        $data['user'][] = $rcrd;
                    }
                    // if ($room_info->send_bird_channel_url) {
                    //     $sendBirdChannelService->addUserToChannel($input['users'], $room_info->send_bird_channel_url);
                    // }
                    Helper::emit($data, 'Invite');
                    return Helper::rj('Invitation send successfully.', 200, $data);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function cameraOnOff(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'is_cemera' => 'required',
                'video_stream_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $sendNotification = true;
                $data = \App\Models\RoomUser::where([
                    'room_id' => $input['room_id'],
                    'user_id' => $this->_user->id
                ])->first();
                $prev_data = $data;
                $data->update(['is_cemera' => $input['is_cemera'], 'video_stream_id' => $input['is_cemera'] == 1 ? $input['video_stream_id'] : null]);

                $members = \App\Models\RoomUser::where([
                    'room_id' => $input['room_id'],
                ])->get()->toArray();
                if ($members) {
                    Helper::emit($members, 'roomMembers');
                }

                //                if ($prev_data->is_cemera == $input['is_cemera']) {
//                    $sendNotification = false;
//                }

                if ($sendNotification) {
                    $notificationJob = new \App\Jobs\SendStartCloseWebCamNotificationJob((int) $input['room_id'], $this->_user, (int) $input['is_cemera'], $input['video_stream_id']);
                    dispatch($notificationJob);
                }
                if (isset($request->is_device_close) && $request->is_device_close) {
                    $data->update(['is_mic' => 0]);
                    $param = $data->toArray();
                    $param['type'] = 'camera_off';
                    Helper::emit($param, 'VideoAudioChnl');
                }



                return Helper::rj('Record updated', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function startViewVideo(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'view_user_id' => 'required',
                'is_view' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $input['user_id'] = $this->_user->id;
                // $members = \App\Models\RoomUser::where([
                //     'room_id' => $input['room_id'],
                // ])->get()->toArray();
                // foreach ($members as $key => $value) {
                //     if($value['user_id'] == $input['view_user_id']){
                //         $value['is_viewed'] = $input['is_view'];
                //     }else{
                //          $value['is_viewed'] = $input['is_view'];
                //     }
                // }

                // if($members){
                //     Helper::emit($members, 'roomMembers');
                // }
                if ($input['is_view']) {
                    $isNotExist = \App\Models\ViewingMe::where([
                        'user_id' => $input['user_id'],
                        'room_id' => $input['room_id'],
                        'view_user_id' => $input['view_user_id']
                    ])->doesntExist();
                    if ($isNotExist) {
                        \App\Models\ViewingMe::create($input);
                    }
                } else {
                    \App\Models\ViewingMe::where([
                        'user_id' => $input['user_id'],
                        'room_id' => $input['room_id'],
                        'view_user_id' => $input['view_user_id']
                    ])->delete();
                }
                return Helper::rj('Information save successfully.', $this->successStatus, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function favouriteRoomlists()
    {
        try {
            $user = $this->_user;
            $data['list'] = \App\Models\RoomFavourite::where('user_id', $user->id)
                ->with(['roomInfo'])
                ->get();

            return Helper::rj('Record found.', $this->successStatus, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function favouriteFolders()
    {
        try {
            $user = $this->_user;

            $data['folders'] = \App\Models\FavouriteFolder::where('user_id', $user->id)
                ->orWhere('user_id', '0')
                ->with([
                    'rooms' => function ($q) use ($user) {
                        $q->where('user_id', $user->id)->with('roomInfo');
                    }
                ])
                ->get();
            return Helper::rj('Record found.', $this->successStatus, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function simultaneousCheck(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $room = Room::where(['id' => $input['room_id']])->first();

                if ($room) {
                    $video_enabled = $room->video_enabled;
                    $voice_enabled = $room->voice_enabled;
                    $text_enabled = $room->text_enabled;
                    $return = true;
                    if ($voice_enabled) {

                        //check current user already joined any voice enabled room
                        $check = \App\Models\RoomUser::join("rooms", function ($join) {
                            $join->on("rooms.id", "room_users.room_id")
                                ->where("rooms.voice_enabled", 1);
                        })->where("room_users.user_id", $this->_user->id)->count();

                        /* if ($check) {
                             $return = false;
                             $message = "You have a basic nickname, you cannot be in more than one voice room simultaneously, you will exit the current room automatically.";
                         }*/
                        $return = true;
                    } elseif ($text_enabled) {
                        //check current user already joined only any text enabled room
                        $check = \App\Models\RoomUser::join("rooms", function ($join) {
                            $join->on("rooms.id", "room_users.room_id")
                                ->where(function ($q) {
                                    $q->where(["rooms.text_enabled" => 1, "rooms.voice_enabled" => 0]);
                                });
                        })
                            ->where("room_users.user_id", $this->_user->id)
                            ->count();
                        /*  if ($check) {
                              $return = false;
                              $message = "You have a basic nickname, you cannot be in more than one text only room simultaneously, you will exit the current room automatically.";
                          }*/
                        $return = true;
                    }
                    if (!$return) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ''
                        ]);

                    } else {
                        return Helper::rj('Proceed to join.', $this->successStatus);
                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'This room does not exist anymore! Please update the rooms list.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function saveUnsaveChat(Request $request)
    {

        $validationRules = [
            'room_id' => 'required|exists:rooms,id',
        ];
        $validator = \Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }


        $status = false;
        $data = RoomChatSaveStatus::where(['user_id' => Auth::id(), 'room_id' => $request->room_id])->first();

        if ($data) {
            $data->status == 0 ? false : true;
            $data->status = 1;
            $data->status = 0;
            $data->save();
        } else {
            $data = RoomChatSaveStatus::create(['user_id' => Auth::id(), 'room_id' => $request->room_id]);
        }

        $status = $data->status == 0 ? false : true;

        $message = $status ? 'Chat history will be saved now' : 'Chat history will be cleared form now';

        return Helper::rj('Status Updated', 200, ['message' => $message, 'status' => $status]);

    }

    public function getAutosaveStatus(Request $request)
    {

        $validationRules = [
            'room_id' => 'required|exists:rooms,id',
        ];
        $validator = \Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }


        $data = RoomChatSaveStatus::where(['user_id' => Auth::id(), 'room_id' => $request->room_id])->first();
        if (!$data) {
            $data = RoomChatSaveStatus::create(['user_id' => Auth::id(), 'room_id' => $request->room_id]);
        }

        $status = $data->status == 0 ? false : true;

        return Helper::rj('Status Updated', 200, ['status' => $status]);
    }

    public function getActiveRoomInitDetails(Request $request)
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

            $data['user']['badge_data'] = $badgeData;
            $data['user']['badge_points'] = $badegPoints;


            $search_params = [
                'active_room' => $this->_user->id,
                'with' => [
                    'subscriptionInfo' => function ($q) {
                        return $q->whereDate("renew_at", ">=", date("Y-m-d H:i"));
                    },
                ]
            ];

            $data['active_rooms'] = $this->_model->getListing($search_params);
            // return Helper::rj('Record found.', 200, $data);

            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            Helper::Log('InitController-initialDetails', $e->getMessage());
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function roomcategory(RoomRequest $request, $room_id)
    {
        try {
            $input = $request->all();
            $input['text_enabled'] = 1;
            /*if ($input['video_enabled']) {
                $input['voice_enabled'] = 1;
            }*/
            $room = $this->_model->getListing([
                'id' => $room_id
            ]);
            if (!$room) {
                return \App\Helpers\Helper::resp('Not a valid data', 400);
            }
            $check_normal_users = \App\Models\RoomUser::where([
                'room_id' => $room_id,
                'is_admin' => 0
            ])->count();
            $badgeData = UserBadge::with('currentBadge', 'nextBadge')->where(['user_id' => Auth::id()])->first();

            $data['user']['badge_data'] = $badgeData;
            //$data['user']['badge_points'] = $badegPoints;
            if (is_null($input['room_password'])) {
                unset($input['room_password']);
            }

            $room->update($input);
            if (isset($input['room_pic'])) {
                $response = $this->_model->uploadAvatar($room, $room_id, $request);
            }

            $data['active_rooms'] = $this->_model->getListing();
            // return Helper::rj('Record found.', 200, $data);

            return Helper::rj('Changes has been successfully saved.', $this->successStatus, $room);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


}
