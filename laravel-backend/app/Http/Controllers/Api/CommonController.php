<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\Helper;
use Auth;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserBadgePoints;
use App\Models\User;
use App\Models\RoomCategory;
use App\Models\RoomSubCategory;
use App\Services\SendBirdChannelService;
use App\Repositories\SendBirdChannelRepository;

class CommonController extends Controller
{
    //

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });

    }
    public function versionDetails(Request $request)
    {
        $srch_params = $request->all();
        //$details = \App\Models\SiteSetting::whereIn('key',['ios_version','android_version'])->get();
        $details = [
            'ios_version' => \Config::get('settings.ios_version'),
            'android_version' => \Config::get('settings.android_version')
        ];
        $data['list'] = $details;
        return Helper::rj('Record found', 200, $data);
    }
    public function cmsListDetails(Request $request)
    {
        $srch_params = $request->all();
        $this->_model = new \App\Models\SiteContent();
        $data['list'] = $this->_model->getListing($srch_params);
        return Helper::rj('Record found', 200, $data);
    }
    public function getGenderList(Request $request)
    {
        $srch_params = $request->all();
        $srch_params['status'] = 1;
        $this->_model = new \App\Models\Gender();
        $data['list'] = $this->_model->getListing($srch_params);
        return Helper::rj('Record found', 200, $data);
    }

    public function getSecretQuestionList(Request $request)
    {
        $srch_params = $request->all();
        $srch_params['status'] = 1;
        $this->_model = new \App\Models\SecretQuestion();
        $data['list'] = $this->_model->getListing($srch_params);
        return Helper::rj('Record found', 200, $data);
    }

    public function getCountryList(Request $request)
    {
        $srch_params = $request->all();
        $srch_params['status'] = 1;
        $this->_model = new \App\Models\LocationCountry();
        $data['list'] = $this->_model->getListing($srch_params);
        return Helper::rj('Record found', 200, $data);
    }

    public function leftMenuItems(Request $request)
    {
        try {
            $user = $this->_user;
            $contactListObj = new \App\Models\ContactList();
            $data['favourite_contact'] = $contactListObj->getListing([
                'user_id' => $this->_user->id,
                'is_favourite' => 1,
                'with' => [
                    'customizeNickname' => function ($q) use ($user) {
                        return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                    },
                    'isBlock' => function ($q) use ($user) {
                        return $q->select('user_id', 'block_user_id')->where('user_id', $user->id);
                    },
                    'firstRoom' => function ($q) {
                        return $q->select("id", "user_id", "room_id");
                    },
                    'isInContact' => function ($q) use ($user) {
                        return $q->where("contact_user_id", $user->id);
                    },
                ]
            ]);
            $data['online_users'] = $contactListObj->getListing([
                'user_id' => $this->_user->id,
                'visible_status' => [1, 2, 3],
                'is_loggedout' => 0,
                'offline' => 0,
                'with' => [
                    'isBlokedByThem' => function ($q) use ($user) {
                        return $q->select('user_id', 'block_user_id')->where('block_user_id', $user->id);
                    },
                    'customizeNickname' => function ($q) use ($user) {
                        return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                    },
                    'isBlock' => function ($q) use ($user) {
                        return $q->select('user_id', 'block_user_id')->where('user_id', $user->id);
                    },
                    'firstRoom' => function ($q) {
                        return $q->select("id", "user_id", "room_id");
                    },
                    'isInContact' => function ($q) use ($user) {
                        return $q->where("contact_user_id", $user->id);
                    },
                ],
                //'get_sql' => 1
            ]);

            // echo "<pre>";print_r($data['online_users']);die;

            foreach ($data['online_users'] as $key => $value) {

                $user_id = $value?->contact_user?->id;
                /*echo "<pre>";
                print_r($value->contact_user->id); die;*/
                //for bages add sanjay onlineuser
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

                $data['online_users'][$key]['badge_data'] = $badgeData;
                $data['online_users'][$key]['badge_points'] = $badegPoints;
                // code...
            }


            $data['offline_users'] = $contactListObj->getListing([
                'user_id' => $this->_user->id,
                'visible_status' => 4,
                'is_loggedout' => 1,
                'offline' => 1,
                'with' => [
                    'isBlokedByThem' => function ($q) use ($user) {
                        return $q->select('user_id', 'block_user_id')->where('block_user_id', $user->id);
                    },
                    'customizeNickname' => function ($q) use ($user) {
                        return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                    },
                    'isBlock' => function ($q) use ($user) {
                        return $q->select('user_id', 'block_user_id')->where('user_id', $user->id);
                    },
                    'firstRoom' => function ($q) {
                        return $q->select("id", "user_id", "room_id");
                    },
                    'isInContact' => function ($q) use ($user) {
                        return $q->where("contact_user_id", $user->id);
                    }
                ],
                //'get_sql' => 1
            ]);

            foreach ($data['offline_users'] as $key => $value) {
                $user_id = $value->contact_user->id;
                ;
                //for bages add sanjay onlineuser
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
                $data['offline_users'][$key]['badge_data'] = $badgeData;
                $data['offline_users'][$key]['badge_points'] = $badegPoints;
                // code...
            }

            $vvObj = new \App\Models\VoiceVideoMessage();
            $data['voice_unread_message_cnt'] = $vvObj->getListing([
                'user_id' => $this->_user->id,
                'is_view' => 0,
                'type' => 'voice',
                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                'count' => 1
            ]);
            $data['video_unread_message_cnt'] = $vvObj->getListing([
                'user_id' => $this->_user->id,
                'is_view' => 0,
                'type' => 'video',
                'current_time' => (new \DateTime())->format("Y-m-d H:i"),
                'count' => 1
            ]);
            $data['notebook_unread_count'] = \App\Models\NoteBookShare::where(['share_user_id' => $this->_user->id, 'is_viewed' => 0])->count();

            $data['show_room_i_am_in_options'] = \App\Models\User::where('id', $this->_user->id)->first();
            // comment for same online user get
            // $data['total_online_user'] = \App\Models\User::whereIn('visible_status', [1,2,3])
            //     ->where('is_loggedout', 0)->count();

            $data['total_online_user'] = count($data['online_users']);
            $recentPmObj = new \App\Models\PmRecent();
            $data['recent_pms'] = $recentPmObj->getListing([
                'for_user_id' => $this->_user->id,
                'with' => [
                    // 'userInfo' => function ($q) {
                    //     return $q->select("id", "username");
                    // },
                    // 'forUserInfo' => function ($q) {
                    //     return $q->select("id", "username");
                    // },
                    'pmInfo',
                ],
                //'get_sql' => 1,
                'groupBy' => 'pm_id',
            ]);
            //dd($data['recent_pms']);
            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function findAndAddUser(Request $request)
    {
        try {
            if (isset($request->user_id)) {
                $user = \App\Models\User::find($request->user_id);
            } else {
                $user = $this->_user;
            }
            $srch_params = $request->all();
            $srch_params['not_user'] = $user->id;
            $srch_params['role'] = 'messenger';
            $srch_params['select'] = ['users.id', 'username', 'email', 'gender', 'country'];
            $srch_params['block_user'] = $user->id;
            $srch_params['with'] = [
                'customizeNickname' => function ($q) use ($user) {
                    return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                },
                'addContactList' => function ($q) use ($user) {
                    return $q->where('user_id', $user->id);
                },
            ];
            //$srch_params['get_sql'] = 1;
            $userObj = new \App\Models\User();
            $data['list'] = $userObj->getFindUserListing($srch_params);
            $data['list'] = ($data['list']) ? $data['list']->makeVisible(['visible_option']) : $data['list'];
            return \App\Helpers\Helper::resp('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function contactList(Request $request)
    {
        try {
            $validationRules = [
                'type' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                if ($request->type == 'all') {
                    $visible_status = [1, 2, 3, 4];
                    $is_loggedout = [0, 1];
                } else if ($request->type == 'online') {
                    $visible_status = [1, 2, 3];
                    $is_loggedout = 0;
                } else {
                    $visible_status = 4;
                    $is_loggedout = 1;
                }
                $contactListObj = new \App\Models\ContactList();
                $user = $this->_user;

                $data['users'] = $contactListObj->getListing([
                    'user_id' => $this->_user->id,
                    'visible_status' => $visible_status,
                    'is_loggedout' => $is_loggedout,
                    'with' => [
                        'customizeNickname' => function ($q) use ($user) {
                            return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                        },
                        'isBlock' => function ($q) use ($user) {
                            return $q->select('user_id', 'block_user_id')->where('user_id', $user->id);
                        }
                    ],
                    //'get_sql' => 1
                ]);





                foreach ($data['users'] as $key => $value) {

                    $user_id = $value->contact_user->id;
                    //for bages add sanjay onlineuser
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

                    $data['users'][$key]['badge_data'] = $badgeData;
                    $data['users'][$key]['badge_points'] = $badegPoints;
                    // code...
                }

                // $data['users'] = $contactListObj->getListing([
                //     'user_id' => $this->_user->id,
                //     'visible_status' => $visible_status,
                //     'is_loggedout' => $is_loggedout,
                //     'with' => [
                //         'customizeNickname' => function ($q) use($user) { return $q->select('for_user_id', 'nickname')->where('user_id', $user->id); },
                //         'isBlock'  => function ($q) use($user) { return $q->select('user_id', 'block_user_id')->where('user_id', $user->id); }
                //     ],
                //     //'get_sql' => 1
                // ]);


                return Helper::rj('Record found.', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function notification(Request $request)
    {
        try {
            $user = $this->_user;
            $notificationObj = new \App\Models\Notification();
            $data = $notificationObj->getListing([
                'to_user_id' => $user->id,
                'is_accepted' => 0,
                // 'expire_at' => date("Y-m-d H:i"),
                // 'expire_at_operator' => ">=",
                'with' => [
                    'fromUserInfo' => function ($q) use ($user) {
                        $q->select('id', 'username')
                            ->with([
                                'customizeNickname' => function ($q) use ($user) {
                                    $q->where('user_id', $user->id);
                                }
                            ]);
                    },
                ]
            ]);

            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function notificationClose(Request $request)
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
                $notificationObj = new \App\Models\Notification();
                $record = $notificationObj->getListing([
                    'id' => $request->record_id,
                    'to_user_id' => $this->_user->id
                ]);
                //dd($record);
                if ($record) {
                    $record->delete();
                }

                return Helper::rj('Notification deleted successfully.', 200, []);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function roomCategoryWithSubcategory(Request $request)
    {
        try {
            // $data = $this->_model->getListing();
            $data = RoomCategory::with('subcategories')->get();
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function categoryListing(Request $request)
    {
        try {
            if (isset($request->user_id)) {
                $user = \App\Models\User::find($request->user_id);
            } else {
                $user = $this->_user;
            }
            $srch_params = $request->all();
            $srch_params['not_user'] = $user->id;
            $srch_params['role'] = 'messenger';
            $srch_params['select'] = ['users.id', 'username', 'email', 'gender', 'country'];
            $srch_params['block_user'] = $user->id;

            $data = $notificationObj->getListing([
                'to_user_id' => $user->id,
                'with' => [
                    'fromUserInfo' => function ($q) use ($user) {
                        $q->select('id', 'username')
                            ->with([
                                'customizeNickname' => function ($q) use ($user) {
                                    $q->where('user_id', $user->id);
                                }
                            ]);
                    },
                ]
            ]);

            $srch_params['with'] = [
                'customizeNickname' => function ($q) use ($user) {
                    return $q->select('for_user_id', 'nickname')->where('user_id', $user->id);
                },
                'addContactList' => function ($q) use ($user) {
                    return $q->where('user_id', $user->id);
                },
            ];
            //$srch_params['get_sql'] = 1;
            $notificationObj = new \App\Models\Notification();
            $record = $notificationObj->getListing([
                'id' => $request->record_id,
                'to_user_id' => $this->_user->id
            ]);
            return \App\Helpers\Helper::resp('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function emailInvite(Request $request)
    {
        try {
            $validationRules = [
                'emails' => ['required', new \App\Rules\MultipleEmailValidate()],
                'message' => 'required'
            ];
            return Helper::validateAndSendEmail($request, $validationRules, 'general_invite');
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function handleSendbirdWebhookEvent(Request $request)
    {
        $signature = $_SERVER['x-sendbird-signature'];

        $payload = file_get_contents("php://input");

        $token = config('services.sendBird.token');

        $hashedVal = base64_encode(hash_hmac('sha256', $payload, $token));

        $data = json_encode($payload);

        info('sendbird webhook event', $data->object());

        if ($signature === $hashedVal) {
            return \App\Helpers\Helper::resp('', 200, );
        }

    }

    public function getUserCredits(Request $request)
    {
        try {
            $credits = \App\Helpers\Helper::calculateAvailableCredit();
            $data = ['user_credits' => $credits->credit ? $credits->credit : 0];
            return Helper::rj('Credits has been fecthed successfully.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }



    public function redeemUserCredits(Request $request)
    {
        try {

            DB::beginTransaction();

            $validationRules = [
                'redeem_chars' => 'required|numeric|gt:0',
            ];

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                \App\Helpers\Helper::calculateCreditExpenses($request->redeem_credits);

                DB::commit();

                return Helper::rj('Translation Chars balance been updated successfully.', 200, []);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getUserTranslationChars(Request $request)
    {
        try {
            $user_translation_chars = \App\Models\UserTranslationChar::selectRaw("SUM(chars - redeemed_chars) as chars")
                ->where('user_id', Auth::id())
                ->where('process', 'add')
                ->first();
            $data = ['user_translation_chars' => $user_translation_chars->chars ? $user_translation_chars->chars : 0];
            return Helper::rj('Translation Characters has been fetched successfully.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function purchaseTranslationChars(Request $request)
    {
        try {

            DB::beginTransaction();

            // $validationRules = [
            //     'redeem_credits' => 'required|numeric|gt:0',
            // ];

            // $validator = \Validator::make($request->all(), $validationRules);
            // if ($validator->fails()) {
            //     return \App\Helpers\Helper::rj('Bad Request', 400, [
            //         'errors' => $validator->errors()
            //     ]);
            //     return $response;
            // } else {

            $redeem_credits = 1500;
            $per_credit_char_factor = 1000000 / 1500;
            $credit_chars = $redeem_credits * $per_credit_char_factor;

            // dd($credit_chars);

            $credits = \App\Helpers\Helper::calculateAvailableCredit();

            $current_credit_balance = $credits && isset($credits->credit) ? $credits->credit : 0;

            if (!$current_credit_balance) {
                throw new \Exception('You do not have credits, please buy some to purchase translation characters');
            }

            if ($current_credit_balance < $redeem_credits) {
                throw new \Exception('Low Credits balance, minimum required credit balance is 1500, please buy some more to purchase translation characters');
            }

            \App\Models\UserTranslationChar::create([
                'user_id' => Auth::id(),
                'chars' => $credit_chars,
                'process' => 'add'
            ]);

            \App\Helpers\Helper::calculateCreditExpenses($redeem_credits);

            DB::commit();

            $user_translation_chars = \App\Models\UserTranslationChar::selectRaw("SUM(chars - redeemed_chars) as chars")
                ->where('user_id', Auth::id())
                ->where('process', 'add')
                ->first();

            $credits = \App\Helpers\Helper::calculateAvailableCredit();
            $data = ['user_translation_chars' => $user_translation_chars->chars ? $user_translation_chars->chars : 0, 'user_credits' => $credits->credit ? $credits->credit : 0];


            return Helper::rj('Characters has been purchased successfully.', 200, $data);
            //}
        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }



    public function reedemTranslationChars(Request $request)
    {
        try {

            DB::beginTransaction();

            $validationRules = [
                'redeem_chars' => 'required|numeric|gt:0',
            ];

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                $user_translation_chars = \App\Models\UserTranslationChar::selectRaw("SUM(chars - redeemed_chars) as chars")
                    ->where('user_id', Auth::id())
                    ->where('process', 'add')
                    ->first();

                $current_chars_balance = $user_translation_chars && isset($user_translation_chars->chars) ? $user_translation_chars->chars : 0;

                if (!$current_chars_balance) {
                    throw new \Exception('You do not have translation characters, please buy some characters');
                }

                if ($current_chars_balance < $request->redeem_chars) {
                    throw new \Exception('Low Character balance, please buy some more characters');
                }

                \App\Helpers\Helper::calculateTranslationCharsExpenses($request->redeem_chars);

                DB::commit();

                return Helper::rj('', 200, []);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getTranslationLanguages(Request $request)
    {
        try {
            $data = [];
            $setting = \App\Models\SiteSettingUserStructure::select('field_options')->where('key', 'current_translation_language')->first();
            if ($setting) {
                $data['languages'] = $setting->field_options;
            }

            return Helper::rj('Translation language has been updated successfully', 200, $data);
        } catch (\Exception $ex) {
            return Helper::rj($ex->getMessage(), 500);
        }
    }

    public function createGroupChannel(Request $request)
    {
        $entity = null;
        try {

            DB::beginTransaction();

            $validationRules = [
                'entity_id' => 'required|numeric|gt:0',
                'room_type_id' => 'required|numeric',
            ];

            if (isset($request->room_type_id) && ($request->room_type_id != 0)) {
                $validationRules['channel_url'] = 'required';
            }

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                //dd($request->all());

                $sendBirdChannelService = new SendBirdChannelService(new SendBirdChannelRepository());

                $isPm = $request->room_type_id == 0 ? true : false;

                //dd($isPm);
                if ($isPm) {
                    $entity = \App\Models\Pm::where('id', $request->entity_id)->first();
                    if (!$entity) {
                        return \App\Helpers\Helper::rj('Entity not found', 404);
                    }
                    $pmUserObj = new \App\Models\PmUser();
                    $pm_users = $pmUserObj->getListing([
                        'pm_id' => $request->entity_id,
                        'is_added' => 0,
                    ]);
                    $pm_users = count($pm_users) ? $pm_users->pluck('user_id')->toArray() : [];
                    $sendBirdChannelResponse = $sendBirdChannelService->createUserPMChannel($pm_users, 'single');

                } else {
                    $isPrivate = $request->room_type_id == 1 ? false : true;
                    $sendBirdChannelResponse = null;
                    $entity = \App\Models\Room::where('id', $request->entity_id)->first();
                    //dd($entity);
                    if (!$entity) {
                        return \App\Helpers\Helper::rj('Entity not found', 404);
                    }

                    if ($isPrivate) {
                        $sendBirdChannelResponse = $sendBirdChannelService->createUserPrivateRoom([$this->_user->id], $request->channel_url, [$this->_user->id]);
                    } else {
                        $sendBirdChannelResponse = $sendBirdChannelService->createSuperPublicChannel([$this->_user->id], $request->channel_url, [$this->_user->id]);
                    }
                }



                if ($sendBirdChannelResponse && !$sendBirdChannelResponse->ok()) {
                    throw new \Exception('Something went wrong! ' . $sendBirdChannelResponse->object()->message);
                }


                $sendBirdChannel = $sendBirdChannelResponse->object();

                if ($isPm) {
                    $customKeys = [
                        'type' => 'pm',
                        'pm_id' => (string) $request->entity_id
                    ];

                    $audioRoom = $sendBirdChannelService->createAudioVideoRoom('PMS', 'audio', $customKeys);
                    $videoRoom = $sendBirdChannelService->createAudioVideoRoom('PMS', 'video', $customKeys);

                    $entity = \App\Models\Pm::find($request->entity_id);
                    $entity->update([
                        'send_bird_channel_url' => $sendBirdChannel->channel_url,
                        'send_bird_channel_name' => $sendBirdChannel->name,
                        'send_bird_video_call_room_id' => $videoRoom->room->room_id,
                        'send_bird_audio_call_room_id' => $audioRoom->room->room_id
                    ]);

                } else {
                    \App\Models\Room::where('id', $request->entity_id)->update([
                        'send_bird_channel_url' => $sendBirdChannel->channel_url,
                    ]);
                }

                DB::commit();

                return Helper::rj('', 200, []);
            }
        } catch (\Exception $e) {

            if (!empty($sendBirdChannel) && !empty($entity)) {
                if ($request->room_type_id == 0) {
                    $sendBirdChannelService->deleteUserPMChannel($sendBirdChannel->channel_url->channel_url, $entity);
                } else {
                    $sendBirdChannel = $sendBirdChannelService->deleteGroupChannel($sendBirdChannel->channel_url, $entity);
                }
            }


            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }

    }
}
