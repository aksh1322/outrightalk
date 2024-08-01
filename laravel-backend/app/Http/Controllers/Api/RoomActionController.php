<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\ContactList;
use Illuminate\Http\Exceptions\HttpResponseException;
use Auth;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Services\SendBirdChannelService;

class RoomActionController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });

    }

    public $successStatus = 200;

    public function customizeNickname(Request $request)
    {
        try {
            $validationRules = [
                'for_user_id' => 'required',
                'nickname' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $input['user_id'] = $this->_user->id;
                $check_record = \App\Models\CustomizeNickname::where([
                    'user_id' => $input['user_id'],
                    'for_user_id' => $input['for_user_id']
                ])->first();
                if ($check_record) {
                    $check_record->update($input);
                } else {
                    \App\Models\CustomizeNickname::create($input);
                }
                $record = \App\Models\CustomizeNickname::where([
                    'user_id' => $input['user_id'],
                    'for_user_id' => $input['for_user_id']
                ])->first();
                $param = $record->toArray();
                $param['type'] = 'customize_nickname';
                Helper::emit($param, 'userStatus');
                return Helper::rj('Nickname has been changed successfully.', 200, $record);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function addToContactList(Request $request)
    {

        try {
            $validationRules = [
                'contact_user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if (isset($request->user_id)) {
                    $user = \App\Models\User::find($request->user_id);
                } else {
                    $user = $this->_user;
                }
                $isNotExist = \App\Models\ContactList::where(['user_id' => $user->id, 'contact_user_id' => $request->contact_user_id])->doesntExist();
                if ($isNotExist) {
                    //check block user
                    // $block_user = \App\Models\BlockList::where([
                    //             'block_user_id' => $user->id,
                    //             'user_id' => $request->contact_user_id
                    //         ])->first();
                    // if (is_null($block_user)) {
                    $record = \App\Models\ContactList::create([
                        'user_id' => $user->id,
                        'contact_user_id' => $request->contact_user_id,
                        'is_favourite' => 0
                    ]);
                    $contactListObj = new \App\Models\ContactList();
                    $data['contact_user'] = $contactListObj->getListing([
                        'id' => $record->id,
                        'with' => [
                            'customizeNickname' => function ($q) use ($user) {
                                return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                            },
                            'firstRoom' => function ($q) {
                                return $q->select("id", "user_id", "room_id");
                            },
                            'isInContact' => function ($q) use ($user) {
                                return $q->where("contact_user_id", $user->id);
                            },
                        ]
                    ]);
                    $data['type'] = 'add_contactlist';
                    Helper::emit($data, 'userStatus');
                    return Helper::rj('This user has been added to your contact list successfully.', 200, $data);
                    // } else {
                    //     return \App\Helpers\Helper::rj('Bad Request', 400, [
                    //         'errors' => 'Sorry! you are blocked by this user.'
                    //     ]);
                    //     
                    // }
                } else {
                    return Helper::rj('This user has been already added to your contact list.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function importContacts(Request $request)
    {

        $validationRules = [
            'data' => 'array|required',
            'data.*.user_id' => 'required|exists:users,id',
            // 'data.*.email' => 'required|email|exists:users,email',
            'data.*.nickname' => 'required|exists:users,username',
        ];
        $validator = \Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }

        try {
            foreach ($request->data as $val) {

                $user = $this->_user;
                $isNotExist = \App\Models\ContactList::where(['user_id' => $user->id, 'contact_user_id' => $val['user_id']])->doesntExist();
                if ($isNotExist) {
                    //check block user
                    $block_user = \App\Models\BlockList::where([
                        'block_user_id' => $user->id,
                        'user_id' => $val['user_id']
                    ])->first();
                    if (is_null($block_user)) {
                        $record = \App\Models\ContactList::create([
                            'user_id' => $user->id,
                            'contact_user_id' => $val['user_id'],
                            'is_favourite' => 0
                        ]);

                        $contactListObj = new \App\Models\ContactList();
                        $data['contact_user'] = $contactListObj->getListing([
                            'id' => $record->id,
                            'with' => [
                                'customizeNickname' => function ($q) use ($user) {
                                    return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                                },
                                'firstRoom' => function ($q) {
                                    return $q->select("id", "user_id", "room_id");
                                },
                                'isInContact' => function ($q) use ($user) {
                                    return $q->where("contact_user_id", $user->id);
                                },
                            ]
                        ]);
                        $data['type'] = 'add_contactlist';
                        Helper::emit($data, 'userStatus');

                    } else {
                        // return \App\Helpers\Helper::rj('Bad Request', 400, [
                        //     'errors' => 'Sorry! you are blocked by '. $val['id'].' user, please correct the data in sheet and try again'
                        // ]);
                        // 
                    }
                } else {
                    // return Helper::rj('This user on' $val['id']' is already in your contact list., please correct the data and upload again', 200, []);
                }

            }

            return Helper::rj('This users has been added to your contact list successfully.', 200);

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }

    }

    public function removeFromContactList(Request $request)
    {
        try {
            $validationRules = [
                'contact_user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if (isset($request->user_id)) {
                    $user = \App\Models\User::find($request->user_id);
                } else {
                    $user = $this->_user;
                }
                $record = \App\Models\ContactList::where(['user_id' => $user->id, 'contact_user_id' => $request->contact_user_id])->first();
                $data = [
                    'contact_user' => $record,
                    'type' => 'remove_contactlist'
                ];
                Helper::emit($data, 'userStatus');
                \App\Models\ContactList::where(['user_id' => $user->id, 'contact_user_id' => $request->contact_user_id])->delete();
                return Helper::rj('User successfully removed from your contact list.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function addAsFavouriteContactList(Request $request)
    {
        try {
            $validationRules = [
                'contact_user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = $this->_user;
                $isNotExist = \App\Models\ContactList::where(['user_id' => $this->_user->id, 'contact_user_id' => $request->contact_user_id])->doesntExist();
                if ($isNotExist) {
                    $record = \App\Models\ContactList::create([
                        'user_id' => $this->_user->id,
                        'contact_user_id' => $request->contact_user_id,
                        'is_favourite' => 1
                    ]);
                    $contactListObj = new \App\Models\ContactList();
                    $data['contact_user'] = $contactListObj->getListing([
                        'id' => $record->id,
                        'with' => [
                            'customizeNickname' => function ($q) use ($user) {
                                return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                            },
                            'firstRoom' => function ($q) {
                                return $q->select("id", "user_id", "room_id");
                            },
                            'isInContact' => function ($q) use ($user) {
                                return $q->where("contact_user_id", $user->id);
                            },
                        ]
                    ]);
                    $data['type'] = 'add_contactlist';
                    Helper::emit($data, 'userStatus');
                    return Helper::rj('This user has been added to your contact list successfully.', 200, $data);
                } else {
                    return Helper::rj('This user has been already added to your contact list.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeFromFavouriteList(Request $request)
    {
        try {
            $validationRules = [
                'contact_user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $data = \App\Models\ContactList::where(['user_id' => $this->_user->id, 'contact_user_id' => $request->contact_user_id])->first();
                if ($data) {
                    $data->update(['is_favourite' => 0]);
                    return Helper::rj('User successfully removed from your favourite list.', 200, $data);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'User does not exist.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function addFavourite(Request $request)
    {
        try {
            $validationRules = [
                'contact_user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = $this->_user;
                $record = \App\Models\ContactList::where([
                    'contact_user_id' => $request->contact_user_id,
                    'user_id' => $user->id
                ])->first();
                if ($record) {
                    $record->update(['is_favourite' => 1]);
                    $contactListObj = new \App\Models\ContactList();
                    $data['contact_user'] = $contactListObj->getListing([
                        'id' => $record->id,
                        'with' => [
                            'customizeNickname' => function ($q) use ($user) {
                                return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                            }
                        ]
                    ]);
                    $data['type'] = 'add_favourite';
                    Helper::emit($data, 'userStatus');
                    return Helper::rj('The user has been added to your favorite lists successfully.', 200, $data);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Something went wrong. Please try again later.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function kickUser(Request $request, SendBirdChannelService $sendBirdChannelService)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'user_id' => 'required'
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
                        'errors' => 'Sorry! you don\'t have the permission to kick the user.'
                    ]);

                } else {
                    Helper::removeRoomUserInformation($request->room_id, $request->user_id);
                    $user = \App\Models\User::find($request->user_id);
                    $notificationJob = new \App\Jobs\SendExitRoomNotificationJob((int) $request->room_id, $user);
                    dispatch($notificationJob);

                    $expire_date = Carbon::now()->addHours(24)->format('Y-m-d H:i:s');
                    \App\Models\RoomKickUser::create([
                        'room_id' => $request->room_id,
                        'user_id' => $request->user_id,
                        'expire_time' => $expire_date
                    ]);
                    $room = \App\Models\Room::find($request->room_id);
                    $customized_room_name = \App\Models\CustomizeRoomName::where([
                        'user_id' => $request->user_id,
                        'room_id' => $request->room_id
                    ])->first();
                    $param = [
                        'room_id' => $request->room_id,
                        'user_id' => $request->user_id,
                        'type' => 'kick',
                        'msg' => 'You were kicked from "' . (($customized_room_name) ? $customized_room_name->customize_name : $room->room_name) . '"',
                    ];
                    // if($room->send_bird_channel_url){
                    //     $sendBirdChannelService->removeUsersFromChannel([$request->user_id],$room->send_bird_channel_url);
                    // }
                    Helper::emit($param, 'RoomMemberOption');
                    return Helper::rj('User has been successfully kicked off from the room.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeHand(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'user_id' => 'required'
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
                        'errors' => 'Sorry! you don\'t have the permission to execute this operation.'
                    ]);

                } else {
                    $data = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'user_id' => $request->user_id])->first();
                    $data->update(['is_raise_hand' => 0]);
                    $param = $data->toArray();
                    $param['type'] = 'remove_hand';
                    Helper::emit($param, 'RoomMemberOption');
                    return Helper::rj('Hand removed successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function raiseHand(Request $request)
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
                $data = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'user_id' => $this->_user->id])->first();
                $data->update(['is_raise_hand' => 1]);
                $param = $data->toArray();
                $param['type'] = 'raise_hand';
                Helper::emit($param, 'RoomMemberOption');
                return Helper::rj('Hand raised successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeRaiseHand(Request $request)
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
                $data = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'user_id' => $this->_user->id])->first();
                $data->update(['is_raise_hand' => 0]);
                $param = $data->toArray();
                $param['type'] = 'remove_hand';
                Helper::emit($param, 'RoomMemberOption');
                return Helper::rj('Hand removed successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeAllHand(Request $request)
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
                $check_user = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to execute this operation.'
                    ]);

                } else {
                    $list = \App\Models\RoomUser::where(['room_id' => $request->room_id, 'is_raise_hand' => 1])->get();
                    if (count($list)) {
                        $param = [];
                        foreach ($list as $data) {
                            $data->update(['is_raise_hand' => 0]);
                            $param[] = $data->toArray();
                        }
                        $param['type'] = 'remove_all_hand';
                        Helper::emit($param, 'RoomMemberOption');
                    }
                    return Helper::rj('Hand removed successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function disableInvitation(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'disable_invitation' => 'required'
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
                        'errors' => 'Sorry! you don\'t have the permission to execute this operation.'
                    ]);

                } else {
                    $input = $request->all();
                    $roomSettingObj = new \App\Models\RoomSetting();
                    $settings_value = $roomSettingObj->getListing(['room_id' => $input['room_id']]);
                    if ($settings_value) {
                        $settings_value->update($input);
                    } else {
                        $roomSettingObj->create($input);
                    }
                    $roomUserObj = new \App\Models\RoomUser();
                    $userList = $roomUserObj->getListing(['room_id' => $input['room_id']]);
                    $param = [];
                    if (count($userList)) {
                        foreach ($userList as $room_user) {
                            $param['invitation'][] = $room_user->toArray();
                        }
                    }
                    $param['disable_invitation'] = $input['disable_invitation'];
                    $param['room_id'] = $input['room_id'];
                    Helper::emit($param, 'DisableEnableInvitation');
                    return Helper::rj('Invitation status changed successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function addToBlockList(Request $request)
    {
        try {
            $validationRules = [
                'block_user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if (isset($request->user_id)) {
                    $user = \App\Models\User::find($request->user_id);
                } else {
                    $user = $this->_user;
                }
                $isNotExist = \App\Models\BlockList::where(['user_id' => $user->id, 'block_user_id' => $request->block_user_id])->doesntExist();
                if ($isNotExist) {
                    //check blocked user either added into the contact list or not
                    $isNotContctExist = \App\Models\ContactList::where([
                        'user_id' => $user->id,
                        'contact_user_id' => $request->block_user_id
                    ])->doesntExist();
                    if ($isNotContctExist) {
                        $rcrd = \App\Models\ContactList::create([
                            'user_id' => $user->id,
                            'contact_user_id' => $request->block_user_id,
                            'is_favourite' => 0
                        ]);
                        $contactListObj = new \App\Models\ContactList();
                        $param['contact_user'] = $contactListObj->getListing([
                            'id' => $rcrd->id,
                            'with' => [
                                'customizeNickname' => function ($q) use ($user) {
                                    return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                                }
                            ]
                        ]);
                        $param['type'] = 'add_contactlist';
                        Helper::emit($param, 'userStatus');
                    }

                    $record = \App\Models\BlockList::create([
                        'user_id' => $user->id,
                        'block_user_id' => $request->block_user_id
                    ]);
                    $blockListObj = new \App\Models\BlockList();
                    $data['block_user'] = $blockListObj->getListing([
                        'id' => $record->id,
                        'with' => [
                            'customizeNickname' => function ($q) use ($user) {
                                return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                            }
                        ]
                    ]);
                    $data['type'] = 'add_blocklist';
                    Helper::emit($data, 'userStatus');

                    //remove blocked user
                    //from contact list
                    //if bolcked user added me.
                    // $rcrd_delete = \App\Models\ContactList::where([
                    //             'user_id' => $request->block_user_id,
                    //             'contact_user_id' => $user->id
                    //         ])->first();
                    // if ($rcrd_delete) {
                    //     $param = [
                    //         'contact_user' => $rcrd_delete,
                    //         'type' => 'remove_contactlist'
                    //     ];
                    //     Helper::emit($param, 'userStatus');
                    //     $rcrd_delete->delete();
                    // }

                    return Helper::rj('This user has been added to your block list successfully.', 200, $data);
                } else {
                    return Helper::rj('This user has been already added to your block list.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function importBlocked(Request $request)
    {

        $validationRules = [
            'data' => 'array|required',
            'data.*.user_id' => 'required|exists:users,id',
            'data.*.nickname' => 'required|exists:users,username'
        ];
        $validator = \Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }

        try {
            foreach ($request->data as $val) {

                $user = $this->_user;

                $isNotExist = \App\Models\BlockList::where(['user_id' => $user->id, 'block_user_id' => $val['user_id']])->doesntExist();
                if ($isNotExist) {
                    //check blocked user either added into the contact list or not
                    $isNotContctExist = \App\Models\ContactList::where([
                        'user_id' => $user->id,
                        'contact_user_id' => $val['user_id']
                    ])->doesntExist();
                    if ($isNotContctExist) {
                        $rcrd = \App\Models\ContactList::create([
                            'user_id' => $user->id,
                            'contact_user_id' => $val['user_id'],
                            'is_favourite' => 0
                        ]);
                        $contactListObj = new \App\Models\ContactList();
                        $param['contact_user'] = $contactListObj->getListing([
                            'id' => $rcrd->id,
                            'with' => [
                                'customizeNickname' => function ($q) use ($user) {
                                    return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                                }
                            ]
                        ]);
                        $param['type'] = 'add_contactlist';
                        Helper::emit($param, 'userStatus');
                    }

                    $record = \App\Models\BlockList::create([
                        'user_id' => $user->id,
                        'block_user_id' => $val['user_id']
                    ]);
                    $blockListObj = new \App\Models\BlockList();
                    $data['block_user'] = $blockListObj->getListing([
                        'id' => $record->id,
                        'with' => [
                            'customizeNickname' => function ($q) use ($user) {
                                return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                            }
                        ]
                    ]);
                    $data['type'] = 'add_blocklist';
                    Helper::emit($data, 'userStatus');

                    //remove blocked user
                    //from contact list
                    //if bolcked user added me.
                    $rcrd_delete = \App\Models\ContactList::where([
                        'user_id' => $val['user_id'],
                        'contact_user_id' => $user->id
                    ])->first();
                    if ($rcrd_delete) {
                        $param = [
                            'contact_user' => $rcrd_delete,
                            'type' => 'remove_contactlist'
                        ];
                        Helper::emit($param, 'userStatus');
                        $rcrd_delete->delete();
                    }

                } else {
                    // return Helper::rj('This user has been already added to your block list.', 200, []);
                }

            }
            return Helper::rj('This user has been added to your block list successfully.', 200);

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }


    }

    public function removeFromBlockList(Request $request)
    {
        try {
            $validationRules = [
                'block_user_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if (isset($request->user_id)) {
                    $user = \App\Models\User::find($request->user_id);
                } else {
                    $user = $this->_user;
                }
                $blockObj = new \App\Models\BlockList();
                $record = $blockObj->getListing([
                    'user_id' => $user->id,
                    'block_user_id' => $request->block_user_id,
                    'with' => [
                        'customizeNickname' => function ($q) use ($user) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                        }
                    ]
                ]);

                $data = [
                    'block_user' => $record,
                    'type' => 'remove_blocklist'
                ];
                Helper::emit($data, 'userStatus');
                \App\Models\BlockList::where(['user_id' => $user->id, 'block_user_id' => $request->block_user_id])->delete();
                return Helper::rj('User successfully removed from your block list.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function addToIgnore(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'ignore_user_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = $this->_user;
                $input = $request->all();
                $input['user_id'] = $user->id;
                $isNotExist = \App\Models\RoomIgnore::where([
                    'user_id' => $user->id,
                    'ignore_user_id' => $input['ignore_user_id']
                ])->doesntExist();
                if ($isNotExist) {
                    $data = \App\Models\RoomIgnore::create($input);
                    return Helper::rj('This user ignore successfully.', 200, $data);
                } else {
                    return Helper::rj('This user has been already ignored.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeIgnore(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
                'ignore_user_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $user = $this->_user;
                $del = \App\Models\RoomIgnore::where([
                    'room_id' => $request->room_id,
                    'user_id' => $user->id,
                    'ignore_user_id' => $request->ignore_user_id
                ])->delete();
                if ($del) {
                    return Helper::rj('User successfully removed from ignore.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Something went wrong. Please try again later.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function giveMicToAll(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $check_user = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to execute this operation.'
                    ]);

                } else {
                    $roomSettingObj = new \App\Models\RoomSetting();
                    $settings_value = $roomSettingObj->getListing(['room_id' => $input['room_id']]);
                    if ($settings_value) {
                        $settings_value->update([
                            'give_mic_to_all' => 1,
                            'remove_all_mics' => 0,
                            'simultaneous_mics' => 0
                        ]);
                    } else {
                        $settings_value = $roomSettingObj->create([
                            'room_id' => $input['room_id'],
                            'give_mic_to_all' => 1,
                            'remove_all_mics' => 0,
                            'simultaneous_mics' => 0
                        ]);
                    }
                    $roomUserObj = new \App\Models\RoomUser();
                    $userList = $roomUserObj->getListing(['room_id' => $input['room_id']]);
                    $param = [];
                    if (count($userList)) {
                        foreach ($userList as $room_user) {
                            $param['mic'][] = $room_user->toArray();
                        }
                    }
                    $param['room_id'] = $input['room_id'];
                    $param['room_setting'] = $settings_value;
                    $param['type'] = 'give_mic_all';
                    $param['allow_mic'] = 1;
                    Helper::emit($param, 'VideoAudioChnl');
                    return Helper::rj('Mic status changed successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function redDotToAll(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'is_red_dot' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $check_user = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to execute this operation.'
                    ]);

                } else {
                    $roomSettingObj = new \App\Models\RoomSetting();
                    $settings_value = $roomSettingObj->getListing(['room_id' => $input['room_id']]);
                    if ($settings_value) {
                        $settings_value->update([
                            'red_dot_all_users' => (int) $input['is_red_dot'],
                        ]);
                    } else {
                        $settings_value = $roomSettingObj->create([
                            'room_id' => $input['room_id'],
                            'red_dot_all_users' => (int) $input['is_red_dot'],
                        ]);
                    }
                    $roomUserObj = new \App\Models\RoomUser();
                    $userList = $roomUserObj->getListing(['room_id' => $input['room_id'], 'is_admin' => 0]);
                    $param = [];
                    if (count($userList)) {
                        foreach ($userList as $room_user) {
                            $room_user->update([
                                'red_dot_text' => (int) $input['is_red_dot'],
                                'red_dot_mic' => (int) $input['is_red_dot'],
                                'red_dot_camera' => (int) $input['is_red_dot']
                            ]);
                            $param['red_dot'][] = $room_user->toArray();
                        }
                    }
                    $param['room_id'] = $input['room_id'];
                    $param['room_setting'] = $settings_value;
                    $param['type'] = ($input['is_red_dot']) ? 'red_dot_to_all' : 'remove_red_dot_from_all';
                    Helper::emit($param, 'redDotChnl');
                    return Helper::rj('Red Dot status changed successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function redDotToUser(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'user_id' => 'required',
                'red_dot_type' => 'required',
                'is_red_dot' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {


                $check_user = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to execute this operation.'
                    ]);

                } else {
                    $roomUserObj = new \App\Models\RoomUser();
                    $userInfo = \App\Models\RoomUser::where([
                        'room_id' => $input['room_id'],
                        // 'is_admin' => 0,
                        'user_id' => $input['user_id'],
                    ])->first();


                    if ($userInfo) {
                        if ($input['red_dot_type'] == 'all') {
                            $userInfo->update([
                                'red_dot_text' => (int) $input['is_red_dot'],
                                'red_dot_mic' => (int) $input['is_red_dot'],
                                'red_dot_camera' => (int) $input['is_red_dot']
                            ]);
                        } else {
                            $userInfo->update([
                                $input['red_dot_type'] => (int) $input['is_red_dot']
                            ]);
                        }
                        $param = [
                            'red_dot_user' => $userInfo->toArray(),
                            'room_id' => $input['room_id'],
                            'type' => 'red_dot_user',
                        ];
                        Helper::emit($param, 'redDotChnl');
                        return Helper::rj('Red Dot status changed successfully.', 200, []);
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'Something went wrong. Please try again later.'
                        ]);

                    }
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeAllMic(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $check_user = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to execute this operation.'
                    ]);

                } else {
                    $roomSettingObj = new \App\Models\RoomSetting();
                    $settings_value = $roomSettingObj->getListing(['room_id' => $input['room_id']]);
                    if ($settings_value) {
                        $settings_value->update([
                            'give_mic_to_all' => 0,
                            'remove_all_mics' => 1,
                            'simultaneous_mics' => 0
                        ]);
                    } else {
                        $settings_value = $roomSettingObj->create([
                            'room_id' => $input['room_id'],
                            'give_mic_to_all' => 0,
                            'remove_all_mics' => 1,
                            'simultaneous_mics' => 0
                        ]);
                    }
                    $roomUserObj = new \App\Models\RoomUser();
                    $userList = $roomUserObj->getListing(['room_id' => $input['room_id']]);
                    $param = [];
                    if (count($userList)) {
                        foreach ($userList as $room_user) {
                            $room_user->update(['is_mic' => 0]);
                            $param['mic'][] = $room_user->toArray();
                        }
                    }
                    $param['room_id'] = $input['room_id'];
                    $param['room_setting'] = $settings_value;
                    $param['type'] = 'remove_all_mic';
                    $param['allow_mic'] = 0;
                    Helper::emit($param, 'VideoAudioChnl');
                    return Helper::rj('Mic status changed successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function simultaneousMic(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'simultaneous_value' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $check_user = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->first();
                if ($check_user && !$check_user->is_admin) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Sorry! you don\'t have the permission to execute this operation.'
                    ]);

                } else {
                    $roomSettingObj = new \App\Models\RoomSetting();
                    $settings_value = $roomSettingObj->getListing(['room_id' => $input['room_id']]);
                    if ($settings_value) {
                        $settings_value->update([
                            'give_mic_to_all' => 0,
                            'remove_all_mics' => 0,
                            'simultaneous_mics' => $input['simultaneous_value']
                        ]);
                    } else {
                        $settings_value = $roomSettingObj->create([
                            'room_id' => $input['room_id'],
                            'give_mic_to_all' => 0,
                            'remove_all_mics' => 0,
                            'simultaneous_mics' => $input['simultaneous_value']
                        ]);
                    }
                    $roomUserObj = new \App\Models\RoomUser();
                    $userList = $roomUserObj->getListing(['room_id' => $input['room_id']]);
                    $param = [];
                    if (count($userList)) {
                        foreach ($userList as $room_user) {
                            $param['mic'][] = $room_user->toArray();
                        }
                    }
                    $room_settings = \App\Models\RoomSetting::where([
                        'room_id' => $input['room_id'],
                    ])->get()->toArray();
                    $members = \App\Models\RoomUser::where([
                        'room_id' => $input['room_id'],
                    ])->get()->toArray();
                    $parameter = [
                        'allow_mic' => 0,
                        'room_id' => $input['room_id'],
                        'members' => $members,
                        'room_setting' => $room_settings,
                    ];
                    $param['room_id'] = $input['room_id'];
                    $param['room_setting'] = $settings_value;
                    $param['type'] = 'simultaneous_mic';
                    $count_mic = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'is_mic' => 1])->count();
                    if ($count_mic < $input['simultaneous_value']) {
                        $parameter['allow_mic'] = 1;
                    }
                    Helper::emit($parameter, 'grabMic');
                    Helper::emit($param, 'VideoAudioChnl');
                    return Helper::rj('Mic status changed successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function grabMic(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'is_grab' => 'required',
                //'video_stream_id' => 'required',
            ];
            $input['video_stream_id'] = null;
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if ($input['is_grab']) {
                    $roomSettingObj = new \App\Models\RoomSetting();
                    $settings_value = $roomSettingObj->getListing(['room_id' => $input['room_id']]);
                    if ($settings_value && $settings_value->simultaneous_mics) {
                        $count_mic = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'is_mic' => 1])->count();
                        if ($count_mic < $settings_value->simultaneous_mics) {
                            \App\Models\RoomUser::where([
                                'room_id' => $input['room_id'],
                                'user_id' => $this->_user->id
                            ])->update(['is_mic' => 1, 'video_stream_id' => $input['video_stream_id']]);
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'Sorry, the maximum grab mic limit has been reached.'
                            ]);

                        }
                    } else {
                        \App\Models\RoomUser::where([
                            'room_id' => $input['room_id'],
                            'user_id' => $this->_user->id
                        ])->update(['is_mic' => 1, 'video_stream_id' => $input['video_stream_id']]);
                    }
                    $micJob = new \App\Jobs\SendGrabMicCountJob($input['room_id']);
                    dispatch($micJob);
                    $room_settings = \App\Models\RoomSetting::where([
                        'room_id' => $input['room_id'],
                    ])->get()->toArray();
                    $members = \App\Models\RoomUser::where([
                        'room_id' => $input['room_id'],
                    ])->get()->toArray();
                    if ($members) {
                        $parameter = [
                            'allow_mic' => 1,
                            'room_id' => $input['room_id'],
                            'members' => $members,
                            'room_settings' => $room_settings,
                        ];
                        Helper::emit($parameter, 'grabMic');
                    }
                    return Helper::rj('You have been grab the mic successfully.', 200, []);
                } else {
                    //this for un grab mic
                    \App\Models\RoomUser::where([
                        'room_id' => $input['room_id'],
                        'user_id' => $this->_user->id
                    ])->update(['is_mic' => 0, 'video_stream_id' => null]);
                    $micJob = new \App\Jobs\SendGrabMicCountJob($input['room_id']);
                    dispatch($micJob);
                    $room_settings = \App\Models\RoomSetting::where([
                        'room_id' => $input['room_id'],
                    ])->get()->toArray();
                    $members = \App\Models\RoomUser::where([
                        'room_id' => $input['room_id'],
                    ])->get()->toArray();

                    if ($members) {
                        $parameter = [
                            'allow_mic' => 0,
                            'room_id' => $input['room_id'],
                            'members' => $members,
                            'room_settings' => $room_settings,
                        ];
                        Helper::emit($parameter, 'grabMic');
                    }
                    return Helper::rj('You have released the mic successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    // public function changeSettings(Request $request) {
    //     try {
    //         $input = $request->all();
    //         $validationRules = [
    //             'room_id' => 'required',
    //             'key_name' => 'required',
    //             'key_value' => 'required'
    //         ];
    //         $validator = \Validator::make($request->all(), $validationRules);
    //         if ($validator->fails()) {
    //             return \App\Helpers\Helper::rj('Bad Request', 400, [
    //                 'errors' => $validator->errors()
    //             ]);
    //             return $response;
    //         } else {
    //             $settings = \App\Models\UserRoomSetting::where([
    //                     'user_id' => $this->_user->id,
    //                     'room_id' => $input['room_id']
    //                 ])->first();




    //             if ($settings) {
    //                 $update_arr = [
    //                     $input['key_name'] => $input['key_value']
    //                 ];
    //                 if ($input['key_name'] == 'lock_mic') {
    //                     $update_arr['push_to_talk'] = 0;
    //                 }
    //                 if ($input['key_name'] == 'push_to_talk') {
    //                     $update_arr['lock_mic'] = 0;
    //                 }

    //                 $settings->update($update_arr);
    //             }
    //             return Helper::rj('Settings updated successfully.', 200, $settings);
    //         }
    //     } catch (\Exception $e) {
    //         return Helper::rj($e->getMessage(), 500);
    //     }
    // }

    public function changeSettings(Request $request)
    {
        try {
            $input = $request->all();
            $validationRules = [
                'room_id' => 'required',
                'key_name' => 'required',
                'key_value' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                // dd($this->_user->id);
                $settings = \App\Models\UserRoomSetting::where([
                    'user_id' => $this->_user->id,
                    'room_id' => $input['room_id']
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

                    if ($input['key_name'] == 'font_color') {
                        $update_arr['font_color'] = $input['key_value'];
                    }

                    if ($input['key_name'] == 'font_family') {
                        $update_arr['font_family'] = $input['key_value'];
                    }

                    if ($input['key_name'] == 'font_size') {
                        $update_arr['font_size'] = $input['key_value'];
                    }

                    if ($input['key_name'] == 'text_decoration') {
                        $update_arr['text_decoration'] = $input['key_value'];
                    }

                    if ($input['key_name'] == 'font_weight') {
                        $update_arr['font_weight'] = $input['key_value'];
                    }

                    if ($input['key_name'] == 'font_style') {
                        $update_arr['font_style'] = $input['key_value'];
                    }

                    if ($input['key_name'] == 'save_default_room_settings') {
                        $update_arr['save_default_room_settings'] = $input['key_value'];
                    }

                    $settings->update($update_arr);
                }
                return Helper::rj('Settings updated successfully.', 200, $settings);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function clearTextChat(Request $request)
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
                $roomDtls = \App\Models\Room::find($input['room_id']);
                $cdn = \App\Models\Cdn::where("status", 1)->first();


                $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                $file_name = "c_" . $input['room_id'] . "_" . $this->_user->id . ".json";


                if (file_exists($file_path . $file_name)) {
                    $inp = file_get_contents($file_path . $file_name);
                    // return $inp;
                }

                if (file_exists($file_path . $file_name)) {
                    //File::delete($image_path);
                    unlink($file_path . $file_name);
                }

                // \Storage::disk('public')->delete('assets/chats/' . $file_name);


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
                    }
                }
                return Helper::rj('Text chat deleted successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function playAVideo(Request $request)
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
                $users = \App\Models\RoomUser::where('room_id', $request->room_id)
                    ->where(function ($q) {
                        $q->whereIn('is_admin', [1, 2, 3])
                            ->orWhere('user_id', $this->_user->id);
                    })
                    ->get()
                    ->pluck('user_id');
                $user_id = $this->_user->id;

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
                    //\Pawlox\VideoThumbnail\Facade\VideoThumbnail::createThumbnail(public_path('temp/' . $fileName . '.' . $fileExt), public_path('temp/thumbs/'), $fileName . '.jpg', 3, 300, 200);
                    event(
                        new \App\Events\UploadPlayVideoEvent(
                            $fileName,
                            $fileNameOriginal,
                            $fileExt,
                            $fileMime,
                            $fileSize,
                            $request->room_id,
                            $users,
                            $user_id
                        )
                    );
                    return Helper::rj('Video uploaded successfully.', 200, []);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function acceptPlayVideo(Request $request)
    {
        try {
            $validationRules = [
                'record_id' => 'required',
                'room_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                \App\Models\PlayVideo::where('id', $request->record_id)
                    ->update([
                        'is_accepted' => 1,
                        'accepted_at' => (new \DateTime())->format("Y-m-d H:i")
                    ]);
                $room_users = \App\Models\RoomUser::where('room_id', $request->room_id)
                    ->get()
                    ->pluck('user_id');
                if (count($room_users)) {
                    foreach ($room_users as $user) {
                        $isNotExist = \App\Models\PlayVideoShare::where([
                            'user_id' => $user,
                            'play_video_id' => $request->record_id
                        ])->doesntExist();
                        if ($isNotExist) {
                            \App\Models\PlayVideoShare::create([
                                'play_video_id' => $request->record_id,
                                'user_id' => $user
                            ]);
                        }
                    }
                }
                $playVideoObj = new \App\Models\PlayVideo();
                $data['video_info'] = $playVideoObj->getListing([
                    'id' => $request->record_id,
                    'with' => ['users']
                ]);
                $data['type'] = 'accepted';
                \App\Helpers\Helper::emit($data, 'playVideoChnl');
                return Helper::rj('Video accepted successfully.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function rejectPlayVideo(Request $request)
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
                \App\Models\PlayVideo::where('id', $request->record_id)
                    ->update([
                        'is_accepted' => 2,
                    ]);
                $playVideoObj = new \App\Models\PlayVideo();
                $data['video_info'] = $playVideoObj->getListing([
                    'id' => $request->record_id,
                    'with' => ['users']
                ]);
                $data['type'] = 'rejected';
                \App\Models\PlayVideoShare::where('play_video_id', $request->record_id)->delete();
                \App\Helpers\Helper::emit($data, 'playVideoChnl');
                return Helper::rj('Video rejected successfully.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removePlayVideo(Request $request)
    {
        try {
            $validationRules = [
                'record_id' => 'required',
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $record = \App\Models\PlayVideoShare::where([
                    'id' => $request->record_id,
                    'user_id' => $this->_user->id
                ])->first();
                if ($record) {
                    $record->delete();
                    $playVideoObj = new \App\Models\PlayVideo();
                    $data['play_video'] = $playVideoObj->getListing([
                        'room_id' => $request->room_id,
                        'is_accepted' => [0, 1],
                        'orderBy' => '-accepted_at',
                        'with' => ['users']
                    ]);
                    return Helper::rj('Video removed successfully.', 200, $data);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Something went wrong. Please try again later.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function saveDefaultRoomSettings(Request $request)
    {

        try {
            $inputSettings = $request->all();
            $validationRules = [];

            if (count($inputSettings)) {
                foreach ($inputSettings as $key => $val) {
                    if (str_contains($key, "_pm") || str_contains($key, "pm_")) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Key, can not update pm setting from Room']
                        ]);
                    }
                    if (str_contains($key, "_room") || str_contains($key, "room_")) {
                        $validationRules[$key] = 'required|integer|between:0,1';
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Key, not a Room setting']
                        ]);
                    }
                }
            } else {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => ['Missing Room Setting, list can\'t be empty']
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

                return Helper::rj('Room settings has been saved as default successfully.', 200, []);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function resetDefaultRoomSettings(Request $request)
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
                    if (str_contains($setting, "_pm") || str_contains($setting, "pm_")) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Key, can not reset pm setting from Room']
                        ]);
                    }
                    if (!(str_contains($setting, "_room") || str_contains($setting, "room_"))) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => ['Invalid Key, not a Room setting']
                        ]);
                    }

                    \App\Models\SiteSettingUser::store($setting, '', $this->_user->id, null, true);

                }

                return Helper::rj('Room settings has been reset to default successfully.', 200, []);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function whoIsViewingMe(Request $request)
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
                $user = $this->_user;
                $input = $request->all();
                $input['view_user_id'] = $this->_user->id;
                $input['with'] = [
                    'userInfo' => function ($q) use ($user) {
                        $q->select('id', 'username')
                            ->with([
                                'customizeNickname' => function ($qu) use ($user) {
                                    $qu->where('user_id', $user->id);
                                }
                            ]);
                    },
                ];
                $viewObj = new \App\Models\ViewingMe();
                $data = $viewObj->getListing($input);
                return Helper::rj('Record found.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function closeRoom(Request $request)
    {
        try {
            $validationRules = [
                'room_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $roomObj = new \App\Models\Room();
                $room = $roomObj->getListing(['id' => $input['room_id']]);
                if (!$room) {
                    return \App\Helpers\Helper::resp('Not a valid data', 400);
                }
                $roomUserObj = new \App\Models\RoomUser();
                $userList = $roomUserObj->getListing(['room_id' => $input['room_id']]);
                $param = [];
                if (count($userList)) {
                    foreach ($userList as $room_user) {
                        Helper::removeRoomUserInformation($input['room_id'], $room_user->user_id);
                        $param['user'][] = $room_user->toArray();
                    }
                }
                \App\Models\RoomUser::where(['room_id' => $input['room_id']])->delete();
                //\App\Models\RoomOpentalk::where(['room_id' => $input['room_id']])->delete();
                $room->update(['is_closed' => 1]);
                $param['room_id'] = $input['room_id'];
                $param['type'] = 'room_close';
                Helper::emit($param, 'RoomMemberOption');

                //remove chats on close room
                $cdn = \App\Models\Cdn::where("status", 1)->first();
                $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                $file_name = "c_" . $input['room_id'] . "_" . Auth::id() . ".json";
                if (file_exists($file_path . $file_name)) {
                    unlink($file_path . $file_name);
                }


                return Helper::rj('Room closed successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function joinAdminList(Request $request)
    {
        try {

            $myContacts = ContactList::where('user_id', Auth::id())->get()->pluck('contact_user_id')->toArray();
            //$myContacts = [];
            array_push($myContacts, Auth::id());

            // echo "<pre>";
            // print_r($myContacts);die;
            $data['list'] = \App\Models\Room::select("rooms.*")
                ->with([
                    'roomOwner',
                    'roomOwnerWithTrashed'
                    // 'roomOwner' => function ($q) { return $q->select('room_id','user_id')
                    // ->orderBy("id", "DESC")
                    // ->withTrashed(); }
                ])
                ->whereHas('roomOwnerWithTrashed', function ($q) use ($myContacts) {
                    $q->whereIn('user_id', $myContacts);
                })
                // ->with([
                //     'roomOwnerWithTrashed' => function ($q) { return $q->select('room_id','user_id')
                //             ->where('is_admin', 3)
                //             ->orderBy("id", "DESC")
                //             ->withTrashed(); }
                // ])
                // ->whereHas('roomOwnerWithTrashed.detailsWithTrashed',function($q) use ($myContacts) {
                //     $q->whereIn('id',$myContacts);
                // })
                /*->join("room_users", function ($join) {
                    $join->on("room_users.room_id", "rooms.id");
                        ->where(function ($q) {
                            $q->where("room_users.is_admin", 1)
                                ->orWhere("room_users.is_admin", 2)
                                ->orWhere("room_users.is_admin", 3);
                        })
                        ->where("room_users.user_id", $this->_user->id);
                })*/
                ->where('room_type_id', 1)
                ->get()
                ->toArray();

            /*  echo "<pre>";
     print_r($data['list']); die; */


            // return $data['list'];

            if (!empty($data['list'])) {
                // foreach ($data['list'] as $key => $val) {
                //     $user_exist = \App\Models\RoomUser::where(['room_id' => $val['id'], 'user_id' => $this->_user->id])->count();
                //     if ($user_exist) {
                //         unset($data['list'][$key]);
                //     }
                // }
                $data['list'] = array_values($data['list']);
            }
            $contactList = new \App\Models\ContactList();
            $data['contact_list'] = $contactList->getListing([
                'user_id' => auth()->user()->id
            ]);
            return Helper::rj('Room admin list.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function verifyAdmincode(Request $request)
    {
        try {
            $validationRules = [
                'admincode' => 'required',
                'room_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                if ($this->_user->visible_status == 4) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You can not join a room with invisible status'
                    ]);

                }

                $input = $request->all();
                $roomObj = new \App\Models\Room();
                $roomInfo = \App\Models\Room::find($input['room_id']);
                if ($roomInfo) {
                    $record = \App\Models\Room::where([
                        'admin_code' => $input['admincode'],
                        'id' => $input['room_id'],
                    ])->first();
                    if ($record) {
                        \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->delete();
                        $user_in_room = \App\Models\RoomUser::where(['room_id' => $input['room_id'], 'user_id' => $this->_user->id])->first();
                        if (is_null($user_in_room)) {
                            //check user has any administrative role within the room
                            $check_user = \App\Models\RoomUser::where("room_id", $input['room_id'])
                                ->where(function ($q) {
                                    $q->where("room_users.is_admin", 1)
                                        ->orWhere("room_users.is_admin", 2)
                                        ->orWhere("room_users.is_admin", 3);
                                })
                                ->where("room_users.user_id", $this->_user->id)
                                ->onlyTrashed()
                                ->orderBy("created_at", "DESC")
                                ->limit(1)->first();
                            if ($check_user) {

                                if (isset($input['exit_room']) && (int) $input['exit_room']) {
                                    //exit from all rooms
                                    Helper::exitFromAllRooms($this->_user);
                                }

                                $record->update(['is_closed' => 0]);
                                $check_user->update(['deleted_at' => null]);

                                Helper::createUserRoomSetting($this->_user->id, $input['room_id']);

                                $cdn = \App\Models\Cdn::where("status", 1)->first();
                                $file_path = "storage/" . $cdn->cdn_path . "chats" . "/";
                                $file_name = "c_" . $input['room_id'] . "_" . $this->_user->id . ".json";

                                if (!file_exists($file_path)) {
                                    mkdir($file_path, 0777, true);
                                }

                                if (file_exists($file_path . $file_name)) {
                                } else {
                                    if ($record->welcome_message) {
                                        $chat_array = [
                                            'room_id' => $input['room_id'],
                                            'chat_body' => $record->welcome_message,
                                            'to_user_id' => 0,
                                            'type' => 'welcome',
                                            'user_id' => $this->_user->id,
                                        ];
                                        $fp = fopen($file_path . $file_name, 'w');
                                        $tempArray = [];
                                        array_push($tempArray, $chat_array);
                                        fwrite($fp, json_encode($tempArray));
                                        fclose($fp);
                                    }
                                }

                                $roomUserObj = new \App\Models\RoomUser();
                                $param = $roomUserObj->getListing([
                                    'id' => $check_user->id,
                                    'with' => [
                                        'details' => function ($q) {
                                            return $q->select('id', 'username');
                                        }
                                    ]
                                ])->toArray();
                                $param['type'] = 'join';
                                Helper::emit($param, 'RoomMemberOption');
                                return Helper::rj('Admin code matched.', 200, $record);
                            } else {
                                $this->__sendPM($request, $this->_user, $input['room_id']);
                                return \App\Helpers\Helper::rj('Bad Request', 400, [
                                    'errors' => 'Incorrect trial to join this owner\'s room as admin! The owner will be notified about this attempt.'
                                ]);

                            }
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'You have already joined the room, please exit the room and try again to join as admin'
                            ]);

                        }
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'The admin code is not valid. Check your privileges with the room\'s owner before you try again.'
                        ]);

                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'The Owner´s Nickname selected has no associated room. Please choose another One.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    private function __sendPM($request, $user, $room_id)
    {
        $outrighTalkId = env("OUTRIGHTTALK_ID");
        $room_owner = \App\Models\RoomUser::where([
            'room_id' => $room_id,
            'is_admin' => 3
        ])->withTrashed()->latest()->first();
        if ($room_owner) {
            $owner_id = $room_owner->user_id;
            $pmIds = \App\Models\Pm::leftJoin('pm_users', 'pms.id', '=', 'pm_users.pm_id')
                ->where(function ($query) use ($outrighTalkId, $owner_id) {
                    $query->where('pm_users.user_id', $outrighTalkId)
                        ->where('pm_users.joined_by_id', $owner_id);
                })
                ->orWhere(function ($query) use ($outrighTalkId, $owner_id) {
                    $query->where('pm_users.user_id', $owner_id)
                        ->where('pm_users.joined_by_id', $outrighTalkId);
                })
                ->pluck('pms.id')->first();
            // $pm = Helper::checkPmExist($owner_id, $outrighTalkId);
            $new_pm = TRUE;
            if ($pmIds) {
                $pm_id = $pmIds;
                $new_pm = FALSE;
            } else {
                $pm = \App\Models\Pm::create([
                    'is_initialize' => 0,
                    'tot_user' => 2
                ]);
                $pm_id = $pm->id;
                Helper::createPmUsers($request, $pm, $outrighTalkId, $owner_id);
                $owner = \App\Models\User::find($outrighTalkId);
                Helper::sendPmNotification($pm, $owner);
                $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                    ->where(['for_user_id' => $this->_user->id, 'user_id' => $owner_id])
                    ->first();
                $chatArry = [
                    'pm_id' => $pm_id,
                    'chat_body' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $user->username) . " user tried to join the room as an admin but failed.",
                    'type' => 'normal',
                    'user_id' => $outrighTalkId,
                ];
                Helper::processSendChat($pm_id, $owner, $chatArry);
            }
        }
    }
}