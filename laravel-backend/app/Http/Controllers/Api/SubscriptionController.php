<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\UserSubscription;
use App\Helpers\StripeHelper;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserBadgePoints;
use App\Models\UserBadgePointTransaction;
use Auth;
use DB;
use Symfony\Component\Cache\Adapter\NullAdapter;

class SubscriptionController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_model = new UserSubscription();
        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });

    }

    public $successStatus = 200;

    public $interval = [
        'weekly' => 1 / 4,
        'monthly' => 1,
        'quaterly' => 3,
        'halfyearly' => 6,
        'yearly' => 12,
    ];


    public function buyPlan(Request $request)
    {
        try {
            $validationRules = [
                'subscription_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $input['user_id'] = $this->_user->id;
                $isNotExist = UserSubscription::where(
                    [
                        'subscription_id' => $input['subscription_id'],
                        'user_id' => $this->_user->id
                    ]
                )->doesntExist();
                if ($isNotExist) {
                    $data = UserSubscription::create($input);
                    if ($data) {
                        return Helper::rj('You have successfully purchased the plan.', 200, []);
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'Something went wrong. Please try again later.'
                        ]);
                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You have already purchased the plan.'
                    ]);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getList(Request $request, $room_id = null)
    {
        try {
            if (is_null($room_id)) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => 'Send a valid room id.'
                ]);
            }
            $subscriptionObj = new \App\Models\SubscriptionPlan();
            $data['plans'] = $subscriptionObj->getListing([
                'type' => 'room',
                'with' => [
                    'plans' => function ($q) use ($request) {
                        // return $q->when(isset ($request->plan), function ($q) use ($request) {
                        //     $q->where('type', $request->plan);
                        // });
        
                        return $q->when(isset($request->plan), function ($q) use ($request) {
                            $q->where('type', $request->plan)->where('is_gift', isset($request->is_gift) ? $request->is_gift : 0);
                        })->when(!isset($request->plan), function ($q) {
                            $q->where('is_gift', 0);
                        });
                    }
                ],
                'plan' => isset($request->plan) ? $request->plan : null
            ]);
            $userSubscriptionObj = new UserSubscription();
            $data['subscriptionInfo'] = UserSubscription::where('room_id', $room_id)
                ->with(['planInfo', 'priceInfo'])
                ->first();
            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function processRoomSubscription(Request $request)
    {

        try {
            $validationRules = [
                'plan_id' => 'required',
                'time_period_id' => 'required',
                'room_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $input['user_id'] = $this->_user->id;
                $subscriptionObj = new \App\Models\SubscriptionPlan();
                $product = $subscriptionObj->getListing([
                    'id' => $input['plan_id'],
                    'with' => [
                        'plans' => function ($q) use ($input) {
                            $q->where("id", $input['time_period_id']);
                        },
                    ]
                ]);
                $plan = [];
                if ($product) {
                    $plan['name'] = $product->title;
                    if (count($product->plans)) {
                        $plan['name'] .= " " . $product->plans[0]->type . " subscription";
                        $plan['unit_amount'] = ($product->plans[0]->price * $this->interval[$product->plans[0]->type]) * 100;
                        $plan['interval_count'] = $this->interval[$product->plans[0]->type];
                    }
                }
                $response = StripeHelper::checkoutSession($input, $plan);
                return $response;
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getCheckoutSession(Request $request)
    {

        try {
            $validationRules = [
                'session_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $result = StripeHelper::retrieveSession($request->session_id);
                //dd($result->original['data']);
                if (isset($result->original) && $result->original['status'] == 200) {
                    if (
                        $result->original['data']->payment_status == "paid" &&
                        $result->original['data']->status == "complete"
                    ) {
                        $info = explode("_", $result->original['data']->client_reference_id);
                        if (!$info || (!isset($info[0]) || !isset($info[1]) || !isset($info[2]) || !isset($info[3]))) {
                            return Helper::rj('Internal Server Error, Something went wrong while purchasing subscription', 500);
                        }
                        $record = UserSubscription::where([
                            'user_id' => (int) $info[0],
                            'room_id' => (int) $info[1],
                            'is_gift' => 0,

                        ])->first();
                        if ($record) {
                            if ($record->subscription_id && !$record->is_closed) {
                                StripeHelper::cancelSubscription($record->subscription_id);
                            }
                            $record->delete();
                        }

                        // $isActiveGiftSub = UserSubscription::where(['user_id' => (int) $info[0], 'room_id' => (int) $info[1], 'is_closed' => 0, 'on_hold' => 0, 'is_gift' => 1])
                        //     ->where(function ($query) {
                        //         $query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
                        //             ->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
                        //     })
                        //     ->first();

                        // if ($isActiveGiftSub) {
                        //     $isActiveGiftSub->update(['is_closed' => 0, 'on_hold' => 1]);
                        // }

                        //dd($isActiveGiftSub);


                        $data = [
                            'custom_subscription_id' => $result->original['data']->id,
                            'subscription_id' => $result->original['data']->subscription,
                            'user_id' => (int) $info[0],
                            'room_id' => (int) $info[1],
                            'subscription_plan_id' => (int) $info[2],
                            'subscription_price_id' => (int) $info[3],
                            'type' => (int) $info[1] ? 'room' : 'nickname',
                            'customer' => $result->original['data']->customer,
                        ];

                        $subscription_info = StripeHelper::retrieveSubscription($result->original['data']->subscription);


                        if (isset($subscription_info->original) && $subscription_info->original['status'] == 200) {
                            if (isset($subscription_info->original['data']->current_period_end)) {
                                $data['renew_at'] = date("Y-m-d H:i", $subscription_info->original['data']->current_period_end);
                            }
                        }
                        $result = UserSubscription::create($data);

                        $subscriptionPriceInfo = \App\Models\SubscriptionPrice::find($result->subscription_price_id);
                        if ($subscriptionPriceInfo) {
                            if ($subscriptionPriceInfo->free_credits) {
                                \App\Models\UserCredit::create([
                                    'user_id' => $result->user_id,
                                    'points' => $subscriptionPriceInfo->free_credits,
                                    'credit_type' => 'free',
                                ]);
                            }
                        }

                        return Helper::rj('Subscription completed successfully.', 200, $result);
                    }
                }
                return \App\Helpers\Helper::rj('Invalid Session Id, Stripe Session not found', 400);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeRoomSubscription(Request $request)
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
                $record = UserSubscription::where([
                    'user_id' => $this->_user->id,
                    'room_id' => $request->room_id
                ])->first();
                if ($record) {
                    StripeHelper::cancelSubscription($record->subscription_id);
                    $record->update(['is_closed' => 1]);
                    return Helper::rj('Your room subscription cancelled successfully.', 200, []);
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Record not found.'
                    ]);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getNicknameList(Request $request)
    {
        try {

            $subscriptionObj = new \App\Models\SubscriptionPlan();
            $data['plans'] = $subscriptionObj->getListing([
                'type' => 'nickname',
                'with' => [
                    'plans' => function ($q) use ($request) {
                        return $q->when(isset($request->plan), function ($q) use ($request) {
                            $q->where('type', $request->plan)->where('is_gift', isset($request->is_gift) ? $request->is_gift : 0);
                        })->when(!isset($request->plan), function ($q) {
                            $q->where('is_gift', 0);
                        });
                    }
                ],
                'plan' => isset($request->plan) ? $request->plan : null
            ]);
            $data['subscriptionInfo'] = UserSubscription::where(['user_id' => $this->_user->id, 'room_id' => 0, 'is_closed' => 0, 'on_hold' => 0])
                ->where(function ($query) {
                    $query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
                        ->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
                })
                ->with(['planInfo', 'priceInfo'])->first();

            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function processNicknameSubscription(Request $request)
    {

        try {
            $validationRules = [
                'plan_id' => 'required',
                'time_period_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $input['user_id'] = $this->_user->id;
                $input['room_id'] = 0;
                $subscriptionObj = new \App\Models\SubscriptionPlan();
                $product = $subscriptionObj->getListing([
                    'id' => $input['plan_id'],
                    'with' => [
                        'plans' => function ($q) use ($input) {
                            $q->where("id", $input['time_period_id']);
                        },
                    ]
                ]);
                $plan = [];
                if ($product) {
                    $plan['name'] = $product->title;
                    if (count($product->plans)) {
                        $plan['name'] .= " " . $product->plans[0]->type . " subscription";
                        $plan['unit_amount'] = ($product->plans[0]->price * $this->interval[$product->plans[0]->type]) * 100;
                        $plan['interval_count'] = $this->interval[$product->plans[0]->type];
                    }
                }
                $response = StripeHelper::checkoutSession($input, $plan);
                return $response;
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function removeNicknameSubscription(Request $request)
    {
        try {
            $record = UserSubscription::where([
                'user_id' => $this->_user->id,
                'room_id' => 0,
            ])->first();
            if ($record) {
                StripeHelper::cancelSubscription($record->subscription_id);
                $record->update(['is_closed' => 1]);
                return Helper::rj('Your nickname subscription cancelled successfully.', 200, []);
            } else {
                return \App\Helpers\Helper::rj('Bad Request', 404, [
                    'errors' => 'Record not found.'
                ]);
            }

        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getVirtualGiftCreditList(Request $request)
    {
        try {
            $data = \App\Models\VirtualGiftCredit::get();
            return Helper::rj('Record found.', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function processVirtualGiftCredit(Request $request)
    {
        try {
            $validationRules = [
                'plan_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $input['user_id'] = $this->_user->id;

                $product = \App\Models\VirtualGiftCredit::find($input['plan_id']);
                $plan = [];
                if ($product) {
                    $plan['name'] = $product->credit_type . ' virtual gift credits';
                    $plan['unit_amount'] = $product->price * 100;
                }
                $response = StripeHelper::checkoutVirtualGiftSession($input, $plan);
                return $response;
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getVirtualGiftCheckoutSession(Request $request)
    {
        try {
            $validationRules = [
                'session_id' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $result = StripeHelper::retrieveSession($request->session_id);
                if (isset($result->original) && $result->original['status'] == 200) {
                    if (
                        $result->original['data']->payment_status == "paid" &&
                        $result->original['data']->status == "complete"
                    ) {
                        $info = explode("_", $result->original['data']->client_reference_id);
                        $virtualGiftInfo = \App\Models\VirtualGiftCredit::find($info[1]);
                        if ($virtualGiftInfo) {
                            \App\Models\UserCredit::create([
                                'user_id' => (int) $info[0],
                                'points' => $virtualGiftInfo->paid_credit,
                                'credit_type' => 'paid',
                            ]);
                            if ($virtualGiftInfo->free_credit) {
                                \App\Models\UserCredit::create([
                                    'user_id' => (int) $info[0],
                                    'points' => $virtualGiftInfo->free_credit,
                                    'credit_type' => 'free',
                                    'expire_at' => date('Y-m-d', strtotime('+' . $virtualGiftInfo->expire_in_months . ' months')),
                                ]);
                            }

                            // $badgePoints = UserBadgePoints::where('user_id',(int)$info[0])->first();
                            // if($badgePoints){

                            //     $badgePoints->total_balance = $badgePoints->total_balance + ($virtualGiftInfo->paid_credit+$virtualGiftInfo->free_credit);
                            //     $badgePoints->current_balance = $badgePoints->current_balance + ($virtualGiftInfo->paid_credit+$virtualGiftInfo->free_credit);
                            //     $badgePoints->save();

                            //     $bagde = UserBadge::where('user_id',(int)$info[0])->first();

                            //     UserBadgePointTransaction::create([
                            //         'user_badge_point_table_id' => $badgePoints->id,
                            //         'user_badge_table_id' => $bagde->id,
                            //         'points' => $virtualGiftInfo->paid_credit+$virtualGiftInfo->free_credit,
                            //         'type' => 1
                            //     ]);

                            //     $badgeID = Badge::where('points','<',$badgePoints->current_balance)->latest()->first();
                            //     if($badgeID){
                            //         $bagde->current_badge_id = $badgeID->id;
                            //         $bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id :$badgeID->id  ;
                            //         $bagde->save();
                            //     }

                            // }

                        }
                        return Helper::rj('Subscription completed successfully.', 200, $result);
                    }
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


    public function updateSubsColor(Request $request)
    {
        try {
            $validationRules = [
                'subscription_plan_id' => 'required',
                'colour_name' => 'required',
                'colour_code' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                $subscription_color_change = DB::table('subscription_color_change')->where('subcription_id', $request->subscription_plan_id)->where('user_id', $this->_user->id)->first();
                if ($subscription_color_change) {
                    DB::table('subscription_color_change')->where('id', $subscription_color_change->id)->limit(1)->update(['color_name' => $request->colour_name, 'color_code' => $request->colour_code]);
                    $additional_color_Id = $subscription_color_change->id;
                } else {
                    $additional_color_Id = DB::table('subscription_color_change')->insertGetId(
                        [
                            'subcription_id' => $request->subscription_plan_id,
                            'user_id' => $this->_user->id,
                            'color_name' => $request->colour_name,
                            'color_code' => $request->colour_code,
                        ]
                    );
                }

                $userSubscription = UserSubscription::where('user_id', $this->_user->id)->where('subscription_plan_id', $request->subscription_plan_id)->first();
                $userSubscription->additional_color_Id = $additional_color_Id;
                $userSubscription->save();
                return Helper::rj('Subscription color updated successfully.', 200, $userSubscription);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }

    }



    public function sendGift(Request $request)
    {
        try {
            DB::beginTransaction();

            $validationRules = [
                'user_id' => 'required|exists:users,id',
                'plan_id' => 'required',
                'time_period_id' => 'required',
                // 'type' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);

            } else {

                $input = $request->all();
                $input['by_user_id'] = $this->_user->id;
                $input['room_id'] = 0;
                $subscriptionObj = new \App\Models\SubscriptionPlan();
                $product = $subscriptionObj->getListing([
                    'id' => $input['plan_id'],
                    'with' => [
                        'plans' => function ($q) use ($input) {
                            $q->where("id", $input['time_period_id'])->where("is_gift", 1);
                        },
                    ]
                ]);

                //dd($product);


                if (!$product) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Subscription Plan not found.'
                    ]);
                    return $response;
                }

                if (!count($product->plans)) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Subscription Plan Time Period not found.'
                    ]);
                    return $response;
                }


                $plan = [];
                if (count($product->plans)) {

                    if (!$product->plans[0]->points) {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'Credit Points not found for Subscription Plan. Please add points for plan.'
                        ]);
                        return $response;
                    }


                    $plan['name'] = $product->type . "_" . strtolower($product->title) . "_" . $product->plans[0]->type . "_subscription";
                    $plan['credit_points'] = $product->plans[0]->points;
                }



                if ($plan) {

                    $credits = \App\Helpers\Helper::calculateAvailableCredit();

                    if ($credits->credit && $plan['credit_points']) {
                        if ($credits->credit >= $plan['credit_points']) {

                            if (
                                \App\Models\GiftInvite::where([
                                    'from_user' => Auth::id(),
                                    'subscription_price_id' => $input['time_period_id'],
                                ])->whereDate("expired_at", ">=", date("Y-m-d H:i"))->exists()
                            ) {
                                return Helper::rj('A transaction is still pending with the user , please wait for the user to accept or reject', 400);
                            }

                            $giftInvite = \App\Models\GiftInvite::create([
                                'from_user' => $this->_user->id,
                                'subscription_price_id' => $input['time_period_id'],
                                'invited_at' => now(),
                                'expired_at' => now()->addMinutes(5),
                            ]);

                            \App\Models\GiftInviteUser::create([
                                'receiver_id' => $input['user_id'],
                                'gift_invite_id' => $giftInvite->id
                            ]);

                            $notificationData = [];

                            $notificationData['gift_invite_id'] = $giftInvite->id;
                            $notificationData['for'] = 'subscription';

                            $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                                ->where(['for_user_id' => Auth::id(), 'user_id' => $input['user_id']])
                                ->first();

                            $notification = \App\Models\Notification::create([
                                'from_user_id' => Auth::id(),
                                'to_user_id' => $input['user_id'],
                                'entity_id' => $notificationData['gift_invite_id'],
                                'type' => 'gift',
                                'notification_for' => 'subscription',
                                'expire_at' => now()->addMinutes(5),
                                'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : Auth::user()->username) . ' has sent a gift ' . $product->type . ' ' . $product->title . ' ' . $product->plans[0]->type . ' subscription to you.',
                            ]);

                            $notificationData['user'][] = $notification;

                            \App\Helpers\Helper::emit($notificationData, 'Invite');

                            DB::commit();
                            return Helper::rj('Subscription gift invitation has been sent successfully.', 200, []);
                        } else {
                            return \App\Helpers\Helper::rj('Sorry, you don\'t have enough credit balance, please add some.', 402);
                        }
                    } else {
                        return \App\Helpers\Helper::rj('Sorry, you don\'t have enough credit balance, please add some.', 402);
                    }

                }
            }
        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function acceptGift(Request $request)
    {
        DB::beginTransaction();

        try {
            $validationRules = [
                'invitation_id' => 'required|exists:gift_invites,id',
                'accepted' => 'required|boolean'
            ];

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {


                $giftInvite = \App\Models\GiftInvite::whereDate("expired_at", "<", date("Y-m-d H:i"))->with('users')->find($request->invitation_id);

                //dd($giftInvite);

                if (!$giftInvite) {
                    return Helper::rj("Gift Invitation already expired.", 410);
                }


                $request->merge([
                    'user_id' => $giftInvite->users->pluck('receiver_id')->toArray(),
                    'subscription_price_id' => $giftInvite->subscription_price_id
                ]);

                $fromUser = \App\Models\User::find($giftInvite->from_user);

                $input = $request->all();

                //dd($input);

                if (is_array($input['user_id']) && !in_array($this->_user->id, $input['user_id'])) {
                    $response = \App\Helpers\Helper::resp('Forbidden', 403, [
                        'errors' => 'This action is forbidden.'
                    ]);
                    return $response;
                }


                $record = \App\Models\SubscriptionPrice::where('id', $input['subscription_price_id'])->with('plan')->first();
                //dd($record);
                if ($record) {

                    if (!$request->accepted) {

                        $inviteUser = $giftInvite->users->where('receiver_id', $this->_user->id)->first();
                        if ($inviteUser) {
                            // Delete the shareFiles record
                            $inviteUser->delete();
                        }

                        $giftInvite->refresh();

                        if ($giftInvite->users->count() == 0) {
                            $giftInvite->delete();
                        }

                        $message = 'has rejected a gift of subscription ' . $record->plan->type . ' ' . $record->plan->title . ' ' . $record->type . ' sent by you.';

                        \App\Helpers\Helper::sendNotificationGiftSender($this->_user, $fromUser, $request->invitation_id, $message, 'gift_rejected');

                        \App\Models\Notification::where('entity_id', $request->invitation_id)->where('type', 'gift')->delete();

                        DB::commit();
                        return Helper::rj('Invitation has been rejected successfully and sender notified.', 200, []);

                    }

                    if ($input['user_id']) {

                        $credits = \App\Helpers\Helper::calculateAvailableCredit($fromUser);
                        if ($credits->credit) {
                            $redeemed_credit = $record->points;
                            if ($credits->credit >= $redeemed_credit) {

                                $user = $this->_user->id;
                                $room_id = $record->plan && $record->plan->type == 'room' ? 1 : 0;


                                $isSub = UserSubscription::where(['user_id' => $user, 'room_id' => $room_id, 'is_closed' => 0, 'on_hold' => 0])
                                    ->where(function ($query) {
                                        $query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
                                            ->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
                                    })
                                    ->first();

                                if ($isSub) {
                                    $isSub->update(['is_closed' => 0, 'on_hold' => 1, 'reactivate_at' => $record->type == 'weekly' ? Carbon::now()->addWeek() : Carbon::now()->addMonth()]);
                                }

                                $data = [
                                    'custom_subscription_id' => null,
                                    'subscription_id' => null,
                                    'user_id' => $user,
                                    'room_id' => $room_id,
                                    'subscription_plan_id' => $record->plan->id,
                                    'subscription_price_id' => $record->id,
                                    'type' => $record->plan->type,
                                    'is_gift' => 1,
                                    'customer' => null,
                                ];

                                if ($record->type == 'weekly') {
                                    $data['expire_at'] = Carbon::now()->addWeek();
                                }

                                if ($record->type == 'monthly') {
                                    $data['expire_at'] = Carbon::now()->addMonth();
                                }

                                $result = UserSubscription::create($data);



                                //badges add for send gift
                                if ($fromUser->id != $user) {

                                    $badgePoints = UserBadgePoints::where('user_id', $fromUser->id)->first();
                                    if ($badgePoints) {
                                        $badgePoints->total_balance = $badgePoints->total_balance + ($record->points * (30 / 100));
                                        $badgePoints->current_balance = $badgePoints->current_balance + ($record->points * (30 / 100));
                                        $badgePoints->save();

                                        $updatePoint = UserBadgePoints::where('user_id', $input['user_id'][0])->first();
                                        $updatePoint->total_balance = $updatePoint->total_balance + $record->points;
                                        $updatePoint->current_balance = $updatePoint->current_balance + $record->points;
                                        $updatePoint->save();

                                        $bagde = UserBadge::where('user_id', $fromUser->id)->first();

                                        UserBadgePointTransaction::create([
                                            'user_badge_point_table_id' => $badgePoints->id,
                                            'user_badge_table_id' => $bagde->id,
                                            'points' => $badgePoints->current_balance,
                                            'type' => 1
                                        ]);

                                        $badgeID = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
                                        if ($badgeID) {
                                            $bagde->current_badge_id = $badgeID->id;
                                            $bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id : $badgeID->id;
                                            $bagde->save();
                                        }
                                    }
                                } else {

                                    $badgePoints = UserBadgePoints::where('user_id', $fromUser->id)->first();

                                    if ($badgePoints) {
                                        $badgePoints->total_balance = $badgePoints->total_balance + ($record->points);
                                        $badgePoints->current_balance = $badgePoints->current_balance + ($record->points);
                                        $badgePoints->save();

                                        // $updatePoint = UserBadgePoints::where('user_id', $this->_user->id)->first();
                                        // $updatePoint->total_balance = $updatePoint->total_balance + $record->points;
                                        // $updatePoint->current_balance = $updatePoint->current_balance + $record->points;
                                        // $updatePoint->save();

                                        $bagde = UserBadge::where('user_id', $fromUser->id)->first();

                                        UserBadgePointTransaction::create([
                                            'user_badge_point_table_id' => $badgePoints->id,
                                            'user_badge_table_id' => $bagde->id,
                                            'points' => $badgePoints->current_balance,
                                            'type' => 1
                                        ]);

                                        $badgeID = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
                                        if ($badgeID) {
                                            $bagde->current_badge_id = $badgeID->id;
                                            $bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id : $badgeID->id;
                                            $bagde->save();
                                        }
                                    }
                                }

                                $inviteUser = $giftInvite->users->where('receiver_id', $user)->first();
                                if ($inviteUser) {
                                    // Delete the shareFiles record
                                    $inviteUser->delete();
                                }

                                /*\App\Models\UserCredit::create([
                                'user_id' => $user,
                                'points' => $record->credit_points,
                                'process' => 'add',
                            ]);*/

                                $giftInvite->refresh();

                                if ($giftInvite->users->count() == 0) {
                                    $giftInvite->delete();
                                }

                                \App\Models\Notification::where('entity_id', $request->invitation_id)->where('type', 'gift')->update(["is_accepted" => 1]);

                                \App\Helpers\Helper::calculateCreditExpenses($redeemed_credit, $fromUser);

                                $message = 'has accepted a gift of subscription ' . $record->plan->type . ' ' . $record->plan->title . ' ' . $record->type . ' sent by you.';

                                \App\Helpers\Helper::sendNotificationGiftSender($this->_user, $fromUser, $request->invitation_id, $message);

                                DB::commit();

                                return Helper::rj('Gift has been recieved successfully.', 200, []);
                            }
                        }
                    }
                }

                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => 'Something went wrong.'
                ]);

            }


        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function switchCurrentSubscription(Request $request)
    {
        // $sub =

        //     //     //     UserSubscription::where(['user_id' => Auth::id(), 'room_id' => 0, 'is_closed' => 0])
        //     //     //         ->where(function ($query) {
        //     //     //             $query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
        //     //     //                 ->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
        //     //     //         })
        //     //     //         // ->with(['planInfo', 'priceInfo', 'feature'])
        //     //     //         ->get();

        //     UserSubscription::where(['user_id' => $this->_user->id, 'room_id' => 0, 'is_closed' => 0, 'on_hold' => 0])
        //         ->where(function ($query) {
        //             $query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
        //                 ->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
        //         })
        //         ->with(['planInfo', 'priceInfo', 'feature'])->first();

        // dd($sub);

        DB::beginTransaction();

        try {
            $validationRules = [
                'subscription_id' => 'required|exists:user_subscriptions,id',
                'room_id' => 'required',
                'type' => 'required'
            ];

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {


                if ($request->type != 'room' && $request->type != 'nickname') {

                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => ['Invalid type field, valid values are room & nickname']
                    ]);
                    return $response;

                }

                if ($request->room_id == 0 && $request->type == 'room') {

                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => ['Invalid room field value, for room type room_id can not be 0']
                    ]);
                    return $response;

                }

                if ($request->room_id != 0 && $request->type == 'nickname') {

                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => ['Invalid room field value, for nickname type room_id should be 0']
                    ]);
                    return $response;

                }

                $user = $this->_user->id;

                $switchSub = UserSubscription::where(['id' => $request->subscription_id])->where(function ($query) {
                    $query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
                        ->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
                })->first();



                //dd($switchSub);


                if (!$switchSub) {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Subscription has been already expired'
                    ]);
                    return $response;
                }

                if ($switchSub->room_id == 0 && $switchSub->type == 'nickname' && $request->room_id != 0) {

                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => ['Invalid subscription id, cannot switch to nickname subscription']
                    ]);
                    return $response;

                }

                if ($switchSub->room_id != 0 && $switchSub->type == 'room' && $request->room_id == 0) {

                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => ['Invalid subscription id, cannot switch to room subscription']
                    ]);
                    return $response;

                }


                $room_id = $request->room_id ? $request->room_id : 0;


                $activeSub = UserSubscription::where([
                    'user_id' => $user,
                    'room_id' => $room_id,
                    'is_closed' => 0,
                    'on_hold' => 0
                ])
                    ->where(function ($query) {
                        $query->whereDate("renew_at", ">=", date("Y-m-d H:i"))
                            ->orWhereDate("expire_at", ">=", date("Y-m-d H:i"));
                    })
                    ->first();

                //dd($activeSub);



                if ($activeSub) {

                    $activeUpdateVar = ['is_closed' => 0, 'on_hold' => 1];

                    if ($request->room_id) {
                        $activeUpdateVar['room_id'] = 1;
                    }
                    if ($switchSub->is_gift && (!$activeSub->is_gift)) {
                        $activeUpdateVar['reactivate_at'] = $switchSub->expire_at;
                    }

                    $activeSub->update($activeUpdateVar);
                }


                $swicthUpdateVar = ['is_closed' => 0, 'on_hold' => 0];

                if ($request->room_id) {
                    $swicthUpdateVar['room_id'] = $request->room_id;
                }

                if (!$switchSub->is_gift) {
                    $swicthUpdateVar['reactivate_at'] = null;
                }

                $switchSub->update($swicthUpdateVar);

                DB::commit();

                //dd($switchSub);


                return Helper::rj('Subscription has been switched successfully.', 200, []);

            }

        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function sendVirtualGiftCredit(Request $request)
    {

        try {
            DB::beginTransaction();

            $validationRules = [
                'plan_id' => 'required',
                'user_id' => 'required|exists:users,id'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();
                $product = \App\Models\VirtualGiftCredit::find($input['plan_id']);


                if (!$product) {
                    return \App\Helpers\Helper::rj('Virtual credit plan not found', 404);
                }


                $credits = \App\Helpers\Helper::calculateAvailableCredit();

                if ($credits->credit && $product->paid_credit) {
                    if ($credits->credit >= $product->paid_credit) {

                        if (
                            \App\Models\GiftInvite::where([
                                'from_user' => Auth::id(),
                                'subscription_price_id' => $input['plan_id'],
                            ])->whereDate("expired_at", ">=", date("Y-m-d H:i"))->exists()
                        ) {
                            return Helper::rj('A transaction is still pending with the user , please wait for the user to accept or reject', 400);
                        }

                        $giftInvite = \App\Models\GiftInvite::create([
                            'from_user' => $this->_user->id,
                            'virtual_gift_credit_id' => $input['plan_id'],
                            'invited_at' => now(),
                            'expired_at' => now()->addMinutes(5),
                        ]);

                        \App\Models\GiftInviteUser::create([
                            'receiver_id' => $input['user_id'],
                            'gift_invite_id' => $giftInvite->id
                        ]);

                        $notificationData = [];

                        $notificationData['gift_invite_id'] = $giftInvite->id;
                        $notificationData['for'] = 'virtual_credit_gift';

                        $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                            ->where(['for_user_id' => Auth::id(), 'user_id' => $input['user_id']])
                            ->first();

                        $notification = \App\Models\Notification::create([
                            'from_user_id' => Auth::id(),
                            'to_user_id' => $input['user_id'],
                            'entity_id' => $notificationData['gift_invite_id'],
                            'type' => 'gift',
                            'notification_for' => 'virtual_credit_gift',
                            'expire_at' => now()->addMinutes(5),
                            'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : Auth::user()->username) . ' has sent a gift of ' . $product->paid_credit . ' ' . ' virtual credits to you.',
                        ]);

                        $notificationData['user'][] = $notification;

                        \App\Helpers\Helper::emit($notificationData, 'Invite');

                        DB::commit();
                        return Helper::rj('Virtual credit gift invitation has been sent successfully.', 200, []);
                    } else {
                        return \App\Helpers\Helper::rj('Sorry, you don\'t have enough credit balance, please add some.', 402);

                    }
                } else {
                    return \App\Helpers\Helper::rj('Sorry, you don\'t have enough credit balance, please add some.', 402);
                }


            }
        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function acceptVirtualGiftCredit(Request $request)
    {


        DB::beginTransaction();

        try {
            $validationRules = [
                'invitation_id' => 'required|exists:gift_invites,id',
                'accepted' => 'required|boolean'
            ];

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                $giftInvite = \App\Models\GiftInvite::whereDate("expired_at", "<", date("Y-m-d H:i"))->with('users')->find($request->invitation_id);

                if (!$giftInvite) {
                    return Helper::rj("Gift Invitation expired already", 410);
                }

                $request->merge([
                    'user_id' => $giftInvite->users->pluck('receiver_id')->toArray(),
                    'virtual_gift_credit_id' => $giftInvite->virtual_gift_credit_id
                ]);



                $fromUser = \App\Models\User::find($giftInvite->from_user);

                $input = $request->all();

                //dd($input);

                if (is_array($input['user_id']) && !in_array($this->_user->id, $input['user_id'])) {
                    return \App\Helpers\Helper::resp('Forbidden', 403);
                }

                $virtualGiftInfo = \App\Models\VirtualGiftCredit::find($input['virtual_gift_credit_id']);


                if ($virtualGiftInfo) {

                    if (!$request->accepted) {

                        $inviteUser = $giftInvite->users->where('receiver_id', $this->_user->id)->first();
                        if ($inviteUser) {
                            // Delete the shareFiles record
                            $inviteUser->delete();
                        }

                        $giftInvite->refresh();

                        if ($giftInvite->users->count() == 0) {
                            $giftInvite->delete();
                        }

                        $message = 'has rejected a gift of ' . $virtualGiftInfo->paid_credit . ' ' . ' virtual credits sent by you.';

                        \App\Helpers\Helper::sendNotificationGiftSender($this->_user, $fromUser, $request->invitation_id, $message, 'gift_rejected');

                        \App\Models\Notification::where('entity_id', $request->invitation_id)->where('type', 'gift')->delete();


                        DB::commit();
                        return Helper::rj('Invitation has been rejected successfully and sender notified.', 200, []);

                    }

                    if ($input['user_id']) {

                        $credits = \App\Helpers\Helper::calculateAvailableCredit($fromUser);
                        if ($credits->credit) {
                            $redeemed_credit = $virtualGiftInfo->paid_credit;
                            if ($credits->credit >= $redeemed_credit) {

                                $user = $this->_user->id;

                                \App\Models\UserCredit::create([
                                    'user_id' => $input['user_id'][0],
                                    'points' => $virtualGiftInfo->paid_credit,
                                    'credit_type' => 'paid',
                                ]);
                                if ($virtualGiftInfo->free_credit && ($fromUser->id != $user)) {
                                    \App\Models\UserCredit::create([
                                        'user_id' => $input['user_id'][0],
                                        'points' => $virtualGiftInfo->free_credit,
                                        'credit_type' => 'free',
                                        'expire_at' => date('Y-m-d', strtotime('+' . $virtualGiftInfo->expire_in_months . ' months')),
                                    ]);
                                }


                                //badges add for send gift
                                if ($fromUser->id != $user) {

                                    $badgePoints = UserBadgePoints::where('user_id', $fromUser->id)->first();
                                    if ($badgePoints) {
                                        $badgePoints->total_balance = $badgePoints->total_balance + ($virtualGiftInfo->paid_credit * (30 / 100));
                                        $badgePoints->current_balance = $badgePoints->current_balance + ($virtualGiftInfo->paid_credit * (30 / 100));
                                        $badgePoints->save();

                                        $updatePoint = UserBadgePoints::where('user_id', $input['user_id'][0])->first();
                                        $updatePoint->total_balance = $updatePoint->total_balance + $virtualGiftInfo->paid_credit;
                                        $updatePoint->current_balance = $updatePoint->current_balance + $virtualGiftInfo->paid_credit;
                                        $updatePoint->save();

                                        $bagde = UserBadge::where('user_id', $fromUser->id)->first();

                                        UserBadgePointTransaction::create([
                                            'user_badge_point_table_id' => $badgePoints->id,
                                            'user_badge_table_id' => $bagde->id,
                                            'points' => $badgePoints->current_balance,
                                            'type' => 1
                                        ]);

                                        $badgeID = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
                                        if ($badgeID) {
                                            $bagde->current_badge_id = $badgeID->id;
                                            $bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id : $badgeID->id;
                                            $bagde->save();
                                        }
                                    }
                                } else {

                                    $badgePoints = UserBadgePoints::where('user_id', $fromUser->id)->first();

                                    if ($badgePoints) {
                                        $badgePoints->total_balance = $badgePoints->total_balance + ($virtualGiftInfo->paid_credit);
                                        $badgePoints->current_balance = $badgePoints->current_balance + ($virtualGiftInfo->paid_credit);
                                        $badgePoints->save();

                                        // $updatePoint = UserBadgePoints::where('user_id',$this->_user->id)->first();
                                        // $updatePoint->total_balance = $updatePoint->total_balance +$virtualGiftInfo->paid_credit;
                                        // $updatePoint->current_balance = $updatePoint->current_balance + $virtualGiftInfo->paid_credit;
                                        // $updatePoint->save();

                                        $bagde = UserBadge::where('user_id', $fromUser->id)->first();

                                        UserBadgePointTransaction::create([
                                            'user_badge_point_table_id' => $badgePoints->id,
                                            'user_badge_table_id' => $bagde->id,
                                            'points' => $badgePoints->current_balance,
                                            'type' => 1
                                        ]);

                                        $badgeID = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
                                        if ($badgeID) {
                                            $bagde->current_badge_id = $badgeID->id;
                                            $bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id : $badgeID->id;
                                            $bagde->save();
                                        }
                                    }
                                }

                                $inviteUser = $giftInvite->users->where('receiver_id', $user)->first();
                                if ($inviteUser) {
                                    // Delete the shareFiles record
                                    $inviteUser->delete();
                                }


                                $giftInvite->refresh();

                                if ($giftInvite->users->count() == 0) {
                                    $giftInvite->delete();
                                }

                                \App\Models\Notification::where('entity_id', $request->invitation_id)->where('type', 'gift')->update(["is_accepted" => 1]);

                                \App\Helpers\Helper::calculateCreditExpenses($redeemed_credit, $fromUser);

                                $message = 'has accepted a gift of ' . $virtualGiftInfo->paid_credit . ' ' . ' virtual credits sent by you.';

                                \App\Helpers\Helper::sendNotificationGiftSender($this->_user, $fromUser, $request->invitation_id, $message);

                                DB::commit();

                                return Helper::rj('Virtual Credit Gift has been recieved successfully.', 200, []);
                            }
                        }
                    }
                }

                return \App\Helpers\Helper::rj('Something went wrong.', 500);

            }


        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }

    }
}
