<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Models\StickerCategory;
use App\Models\Sticker;
use Auth;
use Illuminate\Http\Request;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserBadgePoints;
use App\Models\StickerPack;
use App\Models\StickerBuyUser;
use App\Models\UserBadgePointTransaction;
use DB;
use App\Models\GiftInvite;
use App\Models\User;

class StickerController extends Controller
{

    public function __construct($parameters = array())
    {
        parent::__construct($parameters);

        $this->_model = new StickerCategory();
        $this->middleware(function ($request, $next) {
            $this->_user = Auth::user();
            return $next($request);
        });
    }

    public $successStatus = 200;

    public function getCategories(Request $request)
    {
        try {
            $validationRules = [
                'type' => 'array|min:1|required',
                'type.*' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $srch_params = $request->all();
                $srch_params['pid'] = 0;
                $srch_params['with'] = [
                    'children'
                ];
                $data = $this->_model->getListing($srch_params);
                $data = count($data) ? $data->toArray() : [];

                //check user purchase any sticker or not
                $stickerBuyObj = new \App\Models\StickerBuyUser();
                $record = $stickerBuyObj->getListing(['user_id' => $this->_user->id]);
                $packDetails = StickerBuyUser::select('sticker_pack_id')->where('user_id', $this->_user->id)->whereNotNull('sticker_pack_id')->groupBy('sticker_pack_id')->get();


                foreach ($packDetails as $key => $value) {
                    $value->packs = StickerPack::where('id', $value->sticker_pack_id)->first();
                }

                if (count($record) && $request->type[0] == 'free') {
                    $own_data[] = [
                        'title' => 'Own Sticker',
                        'type' => 'Own',
                        'deleted_at' => null,
                        'children' => []
                    ];
                    $data = array_merge($data, $own_data);
                }
                $rcrd['categories'] = $data;
                $rcrd['packDetails'] = $packDetails;
                $rcrd['credit'] = \App\Helpers\Helper::calculateAvailableCredit();
                return Helper::rj('Record found', 200, $rcrd);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getCategoriesWithSticker(Request $request)
    {
        try {
            // $data = $this->_model->getListing();
            $data = [];
            $data['stickerWithCategories'] = StickerCategory::with('subcategories')->get();
            $packDetails = StickerBuyUser::select('sticker_pack_id')->where('user_id', $this->_user->id)->whereNotNull('sticker_pack_id')->groupBy('sticker_pack_id')->get();


            foreach ($packDetails as $key => $value) {
                $pack = StickerPack::where('id', $value->sticker_pack_id)->first();
                if ($pack) {
                    foreach ($data['stickerWithCategories'] as $stickerCat) {
                        if ($stickerCat && $stickerCat->id == $pack->category_id) {
                            $stickerCat->subcategories[] = [
                                "id" => $pack->id,
                                "category_id" => $pack->category_id,
                                "sub_category_id" => null,
                                "title" => $pack->title,
                                "credit_points" => $pack->credit_points,
                                "width" => 127,
                                "height" => 109,
                                "deleted_at" => null,
                                "sticker_type" => 2,
                                "sticker_pack_id" => $pack->sticker_pack_id,
                                "icon" => $pack->icon,
                                "sticker_type_name" => "",
                                "sticker_pack_name" => ""
                            ];
                        }
                    }
                }
            }

            $data['credit'] = \App\Helpers\Helper::calculateAvailableCredit();

            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function getStickers(Request $request)
    {
        try {
            $validationRules = [
                'category_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $stickerObj = new Sticker();
                $srch_params = $request->all();
                $srch_params['with'] = [
                    'is_buy' => function ($q) {
                        $q->where('user_id', $this->_user->id);
                    }
                ];
                $data['sticker'] = $stickerObj->getListing($srch_params);
                $data['sticker_packs'] = StickerPack::where('category_id', $request->category_id)->get();
                return Helper::rj('Record found', 200, $data);
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function buySticker(Request $request)
    {
        try {
            $validationRules = [
                'sticker_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $stickerObj = new Sticker();
                $record = $stickerObj->getListing([
                    'id' => $request->sticker_id,
                    'type' => 'credit'
                ]);
                if ($record) {
                    $isNotExist = \App\Models\StickerBuyUser::where([
                        'user_id' => $this->_user->id,
                        'sticker_id' => $request->sticker_id,
                    ])->doesntExist();
                    if ($isNotExist) {
                        //check available credit
                        $credits = \App\Helpers\Helper::calculateAvailableCredit();
                        if ($credits->credit) {
                            if ($credits->credit >= $record->credit_points) {
                                $input = [
                                    'sticker_id' => $request->sticker_id,
                                    'title' => $record->title,
                                    'credit_points' => $record->credit_points,
                                    'user_id' => $this->_user->id
                                ];
                                $data = \App\Models\StickerBuyUser::create($input);
                                \App\Helpers\Helper::calculateCreditExpenses($record->credit_points);
                                return Helper::rj('You have successfully bought the sticker.', 200);
                            } else {
                                return Helper::rj('Sorry, you don\'t have enough credit balance for purchase this item.', 402);
                            }
                        } else {
                            return Helper::rj('Sorry, you don\'t have enough credit balance for purchase this item.', 402);
                        }
                    } else {
                        return Helper::rj('You have already bought the sticker.', 400);
                    }
                } else {
                    return Helper::rj('Stickers are currently not available.', 404);
                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public function buyPackage(Request $request)
    {
        try {
            $validationRules = [
                'pack_id' => 'required'
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {

                $package = StickerPack::where('id', $request->pack_id)->first();
                $stickers = Sticker::where('category_id', $package->category_id)->get();
                $isNotExist = \App\Models\StickerBuyUser::where([
                    'user_id' => $this->_user->id,
                    'sticker_pack_id' => $request->pack_id,
                ])->doesntExist();
                if ($isNotExist) {
                    $credits = \App\Helpers\Helper::calculateAvailableCredit();
                    if ($credits->credit) {
                        if ($credits->credit >= $package->credit_points) {
                            foreach ($stickers as $key => $record) {
                                $input = [
                                    'sticker_id' => $record->id,
                                    'sticker_pack_id' => $request->pack_id,
                                    'title' => $record->title,
                                    'credit_points' => $record->credit_points,
                                    'user_id' => $this->_user->id
                                ];
                                $data = \App\Models\StickerBuyUser::create($input);
                            }
                            \App\Helpers\Helper::calculateCreditExpenses($package->credit_points);
                            return Helper::rj('You have successfully bought the sticker.', 200);
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'Sorry, you don\'t have enough credit balance for purchase this item.'
                            ]);

                        }
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'Sorry, you don\'t have enough credit balance for purchase this item.'
                        ]);

                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'You have already bought the Pack.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }




    public function ownSticker()
    {
        try {
            $stickerBuyObj = new \App\Models\StickerBuyUser();
            $data = $stickerBuyObj->getListing(['user_id' => $this->_user->id, 'with' => 'stickerInfo', 'with' => 'packInfo']);
            return Helper::rj('Record found', 200, $data);
        } catch (\Exception $e) {
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

                if (!$giftInvite) {
                    return Helper::rj("Gift Invitation already expired.", 410);
                }

                $request->merge([
                    'user_id' => $giftInvite->users->pluck('receiver_id')->toArray(),
                    'sticker_id' => $giftInvite->sticker_id
                ]);

                $fromUser = User::find($giftInvite->from_user);

                $input = $request->all();

                if (is_array($input['user_id']) && !in_array($this->_user->id, $input['user_id'])) {
                    return \App\Helpers\Helper::resp('Forbidden', 403, [
                        'errors' => 'This action is forbidden.'
                    ]);

                }

                \App\Models\Notification::where('entity_id', $request->invitation_id)->where('type', 'gift')->update(["is_accepted" => 1]);


                if ($giftInvite->pack_id) {
                    return $this->acceptGiftPack($request, $giftInvite, $fromUser);
                }


                $stickerObj = new Sticker();
                $record = $stickerObj->getListing([
                    'id' => $input['sticker_id'],
                    'type' => 'credit'
                ]);


                if (!$record) {
                    return \App\Helpers\Helper::rj('Gift Sticker not found', 400);
                }

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

                    $stickerName = $record->title . ' -> ' . $record->cat_title;

                    $message = 'has rejected a gift of ' . $stickerName . ' sticker sent by you.';

                    \App\Helpers\Helper::sendNotificationGiftSender($this->_user, $fromUser, $request->invitation_id, $message, 'gift_rejected');

                    \App\Models\Notification::where('entity_id', $request->invitation_id)->where('type', 'gift')->delete();


                    DB::commit();
                    return Helper::rj('Invitation has been rejected successfully and sender notified.', 200, []);

                }

                if (count($input['user_id'])) {

                    $total_user = count($input['user_id']);
                    $credits = \App\Helpers\Helper::calculateAvailableCredit($fromUser);
                    if ($credits->credit) {
                        $redeemed_credit = $record->credit_points * $total_user;
                        if ($credits->credit >= $redeemed_credit) {

                            $user = $this->_user->id;

                            $isNotExist = \App\Models\StickerBuyUser::where(['user_id' => $user, 'sticker_id' => $input['sticker_id']])->doesntExist();
                            if ($isNotExist) {
                                \App\Models\StickerBuyUser::create([
                                    'user_id' => $user,
                                    'sticker_id' => $input['sticker_id'],
                                    'title' => $record->title,
                                    'credit_points' => $record->credit_points,
                                    'is_gifted' => 1
                                ]);
                            }



                            //badges add for send gift
                            if ($fromUser->id != $user) {

                                $badgePoints = UserBadgePoints::where('user_id', $fromUser->id)->first();
                                if ($badgePoints) {
                                    $badgePoints->total_balance = $badgePoints->total_balance + ($record->credit_points * (30 / 100));
                                    $badgePoints->current_balance = $badgePoints->current_balance + ($record->credit_points * (30 / 100));
                                    $badgePoints->save();

                                    $updatePoint = UserBadgePoints::where('user_id', $input['user_id'][0])->first();
                                    $updatePoint->total_balance = $updatePoint->total_balance + $record->credit_points;
                                    $updatePoint->current_balance = $updatePoint->current_balance + $record->credit_points;
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
                                    $badgePoints->total_balance = $badgePoints->total_balance + ($record->credit_points);
                                    $badgePoints->current_balance = $badgePoints->current_balance + ($record->credit_points);
                                    $badgePoints->save();

                                    // $updatePoint = UserBadgePoints::where('user_id',$this->_user->id)->first();
                                    // $updatePoint->total_balance = $updatePoint->total_balance +$record->credit_points;
                                    // $updatePoint->current_balance = $updatePoint->current_balance + $record->credit_points;
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

                            \App\Helpers\Helper::calculateCreditExpenses($redeemed_credit, $fromUser);

                            $stickerName = $record->title . '->' . $record->cat_title;

                            $message = 'has accepted a gift of ' . $stickerName . 'sticker sent by you.';

                            \App\Helpers\Helper::sendNotificationGiftSender($this->_user, $fromUser, $request->invitation_id, $message);

                            DB::commit();

                            return Helper::rj('Gift has been recieve successfully.', 200, []);
                        }
                    }
                }



            }


        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function sendGift(Request $request)
    {
        try {
            $validationRules = [
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
                //'entity_id' => 'required',
                'sticker_id' => 'required',
                //'type' => 'required',
            ];
            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);
            } else {
                $input = $request->all();

                $stickerObj = new Sticker();
                $record = $stickerObj->getListing([
                    'id' => $input['sticker_id'],
                    'type' => 'credit'
                ]);
                //dd($record);
                if ($record) {
                    if (count($input['user_id'])) {
                        $total_user = count($input['user_id']);
                        $credits = \App\Helpers\Helper::calculateAvailableCredit();
                        if ($credits->credit) {
                            $redeemed_credit = $record->credit_points * $total_user;
                            if ($credits->credit >= $redeemed_credit) {

                                if (
                                    GiftInvite::where([
                                        'from_user' => Auth::id(),
                                        'sticker_id' => $input['sticker_id'],
                                    ])->whereDate("expired_at", ">=", date("Y-m-d H:i"))->exists()
                                ) {
                                    return Helper::rj('A transaction is still pending with the user , please wait for the user to accept or reject', 400);
                                }

                                $giftInvite = GiftInvite::create([
                                    'from_user' => $this->_user->id,
                                    'sticker_id' => $input['sticker_id'],
                                    'entity_id' => array_key_exists('entity_id', $input) ? (int) $input['entity_id'] : null,
                                    'invited_at' => now(),
                                    'expired_at' => now()->addMinutes(5),
                                ]);

                                foreach ($input['user_id'] as $user) {

                                    \App\Models\GiftInviteUser::create([
                                        'receiver_id' => $user,
                                        'gift_invite_id' => $giftInvite->id
                                    ]);
                                }

                                $stickerName = $record->title . ' -> ' . $record->cat_title;

                                if (isset($input['type']) && $input['type'] == 'room') {
                                    $giftRoomNotificationJob = new \App\Jobs\SendRoomGiftNotificationJob((int) $input['entity_id'], $input['user_id'], true, $this->_user, $giftInvite, $stickerName);
                                    dispatch($giftRoomNotificationJob);
                                } elseif (isset($input['type']) && $input['type'] == 'pm') {

                                    $giftPmNotificationJob = new \App\Jobs\SendPmGiftNotificationJob((int) $input['entity_id'], $input['user_id'], true, $this->_user, $giftInvite, $stickerName);

                                    dispatch($giftPmNotificationJob);
                                } else {
                                    $giftPmNotificationJob = new \App\Jobs\SendExternalGiftNotificationJob($input['user_id'], true, $this->_user, $giftInvite, $stickerName);
                                    dispatch($giftPmNotificationJob);
                                }

                                return Helper::rj('Gift has been sent successfully.', 200, []);
                            } else {
                                return \App\Helpers\Helper::rj('Bad Request', 400, [
                                    'errors' => 'Sorry, you don\'t have enough credit balance.'
                                ]);

                            }
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'Sorry, you don\'t have enough credit balance.'
                            ]);

                        }
                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Stickers are currently not available.'
                    ]);

                }
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    private function acceptGiftPack(Request $request, $giftInvite, $fromUser)
    {
        $input = $request->all();

        $package = StickerPack::where('id', $giftInvite->pack_id)->first();
        $stickers = Sticker::where('category_id', $package->category_id)->get();

        /*echo "<pre>";
        print_r($stickers); die;*/
        if (count($stickers) > 0) {

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

                $stickerName = $package->title;

                if ($package->category_id) {
                    $category = \App\Models\StickerCategory::where('id', $package->category_id)->first();
                    if ($category) {
                        $stickerName .= '->' . $category->title;
                    }
                }

                $message = 'has rejected a gift of ' . $stickerName . 'pack sent by you.';

                \App\Helpers\Helper::sendNotificationGiftSender($this->_user, $fromUser, $request->invitation_id, $message, 'gift_rejected');

                \App\Models\Notification::where('entity_id', $request->invitation_id)->where('type', 'gift')->delete();


                DB::commit();
                return Helper::rj('Invitation has been rejected successfully and sender notified.', 200, []);

            }

            if (count($input['user_id'])) {
                $total_user = count($input['user_id']);
                $credits = \App\Helpers\Helper::calculateAvailableCredit($fromUser);
                if ($credits->credit) {

                    $user = $this->_user->id;

                    $isNotExist = \App\Models\StickerBuyUser::where(['user_id' => $user, 'sticker_pack_id' => $giftInvite->pack_id])->doesntExist();

                    if ($isNotExist) {
                        $redeemed_credit = $package->credit_points * $total_user;
                        if ($credits->credit >= $redeemed_credit) {

                            foreach ($stickers as $key => $record) {

                                \App\Models\StickerBuyUser::create([
                                    'user_id' => $user,
                                    'sticker_id' => $record->id,
                                    'sticker_pack_id' => $giftInvite->pack_id,
                                    'title' => $record->title,
                                    'credit_points' => $record->credit_points,
                                    'is_gifted' => 1
                                ]);


                                if ($this->_user->id != $user) {

                                    $badgePoints = UserBadgePoints::where('user_id', $this->_user->id)->first();
                                    if ($badgePoints) {
                                        $badgePoints->total_balance = $badgePoints->total_balance + ($record->credit_points * (30 / 100));
                                        $badgePoints->current_balance = $badgePoints->current_balance + ($record->credit_points * (30 / 100));
                                        $badgePoints->save();

                                        $updatePoint = UserBadgePoints::where('user_id', $user)->first();
                                        $updatePoint->total_balance = $updatePoint->total_balance + $record->credit_points;
                                        $updatePoint->current_balance = $updatePoint->current_balance + $record->credit_points;
                                        $updatePoint->save();

                                        $bagde = UserBadge::where('user_id', $this->_user->id)->first();

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

                                    $badgePoints = UserBadgePoints::where('user_id', $this->_user->id)->first();

                                    if ($badgePoints) {
                                        $badgePoints->total_balance = $badgePoints->total_balance + ($record->credit_points);
                                        $badgePoints->current_balance = $badgePoints->current_balance + ($record->credit_points);
                                        $badgePoints->save();
                                        $bagde = UserBadge::where('user_id', $this->_user->id)->first();

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

                            \App\Helpers\Helper::calculateCreditExpenses($redeemed_credit, $fromUser);

                            $stickerName = $package->title;

                            if ($package->category_id) {
                                $category = \App\Models\StickerCategory::where('id', $package->category_id)->first();
                                if ($category) {
                                    $stickerName .= '->' . $category->title;
                                }
                            }

                            $message = 'has accepted a gift of ' . $stickerName . 'pack sent by you.';

                            \App\Helpers\Helper::sendNotificationGiftSender($this->_user, $fromUser, $request->invitation_id, $message);

                        }

                        DB::commit();
                        return Helper::rj('Gift has been received successfully.', 200, []);
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'Pack already purchased.'
                        ]);
                        DB::rollback();

                    }
                }
            }
        } else {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => 'Stickers are currently not available.'
            ]);
            DB::rollback();

        }
        return \App\Helpers\Helper::rj('Bad Request', 400, [
            'errors' => 'Something went wrong.'
        ]);

        DB::rollback();

    }

    public function sendPack(Request $request)
    {
        DB::beginTransaction();
        try {

            $validationRules = [
                'user_id' => 'array|min:1|required',
                'user_id.*' => 'required',
                //'entity_id' => 'required',
                'pack_id' => 'required',
                //'type' => 'required',
            ];

            $validator = \Validator::make($request->all(), $validationRules);
            if ($validator->fails()) {
                return \App\Helpers\Helper::rj('Bad Request', 400, [
                    'errors' => $validator->errors()
                ]);

                return $response;
            } else {
                $input = $request->all();

                $package = StickerPack::where('id', $request->pack_id)->first();
                $stickers = Sticker::where('category_id', $package->category_id)->get();
                /*echo "<pre>";
                print_r($stickers); die;*/
                if (count($stickers) > 0) {
                    if (count($input['user_id'])) {
                        $total_user = count($input['user_id']);
                        $credits = \App\Helpers\Helper::calculateAvailableCredit();
                        if ($credits->credit) {
                            $isNotExist = \App\Models\StickerBuyUser::where(['user_id' => $input['user_id'][0], 'sticker_pack_id' => $request->pack_id])->doesntExist();
                            if ($isNotExist) {
                                $redeemed_credit = $package->credit_points * $total_user;

                                if ($credits->credit >= $redeemed_credit) {

                                    $giftInvite = GiftInvite::create([
                                        'from_user' => $this->_user->id,
                                        'pack_id' => $input['pack_id'],
                                        'entity_id' => array_key_exists('entity_id', $input) ? (int) $input['entity_id'] : null,
                                        'invited_at' => now(),
                                        'expired_at' => now()->addMinutes(5),
                                    ]);

                                    foreach ($input['user_id'] as $user) {

                                        \App\Models\GiftInviteUser::create([
                                            'receiver_id' => $user,
                                            'gift_invite_id' => $giftInvite->id
                                        ]);
                                    }

                                    $packName = $package->title;

                                    if (isset($input['type']) && $input['type'] == 'room') {
                                        $giftRoomNotificationJob = new \App\Jobs\SendRoomGiftNotificationJob((int) $input['entity_id'], $input['user_id'], false, $this->_user, $giftInvite, $packName);
                                        dispatch($giftRoomNotificationJob);
                                    } elseif (isset($input['type']) && $input['type'] == 'pm') {
                                        $giftPmNotificationJob = new \App\Jobs\SendPmGiftNotificationJob((int) $input['entity_id'], $input['user_id'], false, $this->_user, $giftInvite, $packName);
                                        dispatch($giftPmNotificationJob);
                                    } else {
                                        $giftPmNotificationJob = new \App\Jobs\SendExternalGiftNotificationJob($input['user_id'], false, $this->_user, $giftInvite, $packName);
                                        dispatch($giftPmNotificationJob);
                                    }

                                    DB::commit();
                                    return Helper::rj('Gift has been sent successfully.', 200, []);
                                } else {
                                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                                        'errors' => 'Sorry, you don\'t have enough credit balance.'
                                    ]);
                                    DB::rollback();
                                }


                            } else {
                                return \App\Helpers\Helper::rj('Bad Request', 400, [
                                    'errors' => 'Pack already purchased.'
                                ]);
                                DB::rollback();

                            }
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'Sorry, you don\'t have enough credit balance.'
                            ]);
                            DB::rollback();

                        }
                    } else {
                        return \App\Helpers\Helper::rj('Bad Request', 400, [
                            'errors' => 'Sorry, you don\'t have enough credit balance.'
                        ]);
                        DB::rollback();

                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Stickers are currently not available.'
                    ]);
                    DB::rollback();

                }
            }
            // $stickerObj = new Sticker();
            /*$record = $stickerObj->getListing([
                    'id' => $record->id,
                    'type' => 'credit'
                ]);*/
            /*if ($stickers) {
                    if (count($input['user_id'])) {
                        $total_user = count($input['user_id']);
                        $credits = \App\Helpers\Helper::calculateAvailableCredit();
                        if ($credits->credit) {
                            foreach ($stickers as $key => $record) {
                                $redeemed_credit = $record->credit_points * $total_user;
                                   if ($credits->credit >= $redeemed_credit) {

                                foreach ($input['user_id'] as $user) {
                                    $isNotExist = \App\Models\StickerBuyUser::where(['user_id' => $user, 'sticker_id' => $record->id])->doesntExist();
                                    if ($isNotExist) {
                                        \App\Models\StickerBuyUser::create([
                                            'user_id' => $user,
                                            'sticker_id' => $input['sticker_id'],
                                            'title' => $record->title,
                                            'credit_points' => $record->credit_points,
                                            'is_gifted' => 1
                                        ]);
                                    }
                            }

                        }*/

            //badges add for send gift
            /*if ($this->_user->id != $user) {

                                        $badgePoints = UserBadgePoints::where('user_id', $this->_user->id)->first();
                                        if ($badgePoints) {
                                            $badgePoints->total_balance = $badgePoints->total_balance + ($record->credit_points * (30 / 100));
                                            $badgePoints->current_balance = $badgePoints->current_balance + ($record->credit_points * (30 / 100));
                                            $badgePoints->save();

                                            $updatePoint = UserBadgePoints::where('user_id', $input['user_id'][0])->first();
                                            $updatePoint->total_balance = $updatePoint->total_balance + $record->credit_points;
                                            $updatePoint->current_balance = $updatePoint->current_balance + $record->credit_points;
                                            $updatePoint->save();

                                            $bagde = UserBadge::where('user_id', $this->_user->id)->first();

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

                                        $badgePoints = UserBadgePoints::where('user_id', $this->_user->id)->first();

                                        if ($badgePoints) {
                                            $badgePoints->total_balance = $badgePoints->total_balance + ($record->credit_points);
                                            $badgePoints->current_balance = $badgePoints->current_balance + ($record->credit_points);
                                            $badgePoints->save();

                                            // $updatePoint = UserBadgePoints::where('user_id',$this->_user->id)->first();
                                            // $updatePoint->total_balance = $updatePoint->total_balance +$record->credit_points;
                                            // $updatePoint->current_balance = $updatePoint->current_balance + $record->credit_points;
                                            // $updatePoint->save();

                                            $bagde = UserBadge::where('user_id', $this->_user->id)->first();

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
                                    }*/
            //    }

            /*\App\Helpers\Helper::calculateCreditExpenses($redeemed_credit);
                    if (isset($input['type']) && $input['type'] == 'room') {
                        $giftRoomNotificationJob = new \App\Jobs\SendRoomGiftNotificationJob((int)$input['entity_id'], $input['user_id'], (int)$input['sticker_id'], $this->_user);
                        dispatch($giftRoomNotificationJob);
                    } elseif (isset($input['type']) && $input['type'] == 'pm') {


                        $giftPmNotificationJob = new \App\Jobs\SendPmGiftNotificationJob((int)$input['entity_id'], $input['user_id'], (int)$input['sticker_id'], $this->_user);


                        dispatch($giftPmNotificationJob);
                    }

                    return Helper::rj('Gift has been sent successfully.', 200, []);*/

            //     }






            /*\App\Models\UserCredit::create([
                                    'user_id' => $user,
                                    'points' => $record->credit_points,
                                    'process' => 'add',
                                ]);*/
            //                         }




            /*else {
                                return \App\Helpers\Helper::rj('Bad Request', 400, [
                                    'errors' => 'Sorry, you don\'t have enough credit balance.'
                                ]);
                                
                            }
                        } else {
                            return \App\Helpers\Helper::rj('Bad Request', 400, [
                                'errors' => 'Sorry, you don\'t have enough credit balance.'
                            ]);
                            
                        }
                    }
                } else {
                    return \App\Helpers\Helper::rj('Bad Request', 400, [
                        'errors' => 'Stickers are currently not available.'
                    ]);
                    
                }*/
            //  }

        } catch (\Exception $e) {
            DB::rollback();
            return Helper::rj($e->getMessage(), 500);
        }
    }

}
