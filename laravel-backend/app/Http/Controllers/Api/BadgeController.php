<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\UserBadgePoints;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Helpers\Helper;
use App\Models\SharePointsLogs;
use App\Models\UserBadgePointTransaction;
use Carbon\Carbon;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Exception, Validator;


class BadgeController extends Controller
{
    public function myBadgeDetails()
    {

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

        return Helper::rj('Data Found', 200, ['badge_data' => $badgeData, 'badge_points' => $badegPoints]);

    }

    public function awardedBadges()
    {

        $userBadge = UserBadge::where('user_id', Auth::id())->first();
        $badges = [];
        // dd($userBadge);
        if ($userBadge && $userBadge->current_badge_id) {
            $badges = Badge::with('level')->where('id', '<=', $userBadge->current_badge_id)->latest()->get();
        }
        return Helper::rj('Data Found', 200, ['awardedBadges' => $badges]);


    }

    public function sharePointsNotify(Request $request)
    {

        $validationRules = [
            'points_percentage' => 'required|in:25,50,75,100',
            'user_id' => 'required|exists:user_badge_points,user_id'
        ];
        $validator = Validator::make($request->all(), $validationRules, [
            'points_percentage.in' => 'Points percentage value should be in 25,50,75,100',
            'user_id.exists' => 'Other user Badge wallet is not activated yet'
        ]);
        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }

        if (
            SharePointsLogs::where([
                'from_user' => Auth::id(),
                'to_user' => $request->user_id,
                'status' => 0,
            ])->whereDate("expired_at", ">=", date("Y-m-d H:i"))->exists()
        ) {
            return Helper::rj('A transaction is still pending with the user , please wait for the user to accept or reject', 400);
        }

        $badgePoints = UserBadgePoints::where('user_id', Auth::id())->first();
        if ($badgePoints->current_balance < 1000) {
            return Helper::rj('To share , accumulated points must be atleast 1000', 400);
        }

        $sharePointsLogs = SharePointsLogs::create([
            'from_user' => Auth::id(),
            'to_user' => $request->user_id,
            'percentage' => $request->points_percentage,
            'status' => 0,
            'expired_at' => Carbon::now()->addWeek()
        ]);

        $data['user'] = [];
        $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
            ->where(['for_user_id' => Auth::id(), 'user_id' => $request->user_id])
            ->first();

        $record = \App\Models\Notification::create([
            'from_user_id' => Auth::id(),
            'to_user_id' => $request->user_id,
            'type' => 'share_points_notification',
            'entity_id' => $sharePointsLogs->id,
            'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : Auth::user()->username) . ' has sent you ' . $request->points_percentage . '% of his accumulated points.',
        ]);

        $data['user'][] = $record;
        Helper::emit($data, 'Invite');

        return Helper::rj('Share notification sent successfully, wait for them to accept or reject', 200, ['message' => 'Share notification sent successfully to user, wait for them to accept or reject']);

    }

    public function rejectPoints(Request $request)
    {

        $validationRules = [
            'share_point_id' => 'required|exists:share_points_logs,id,to_user,' . Auth::id(),
        ];
        $validator = Validator::make($request->all(), $validationRules);
        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }

        $sharePointsLogs = SharePointsLogs::where('to_user', Auth::id())->find($request->share_point_id);
        if ($sharePointsLogs->status == 2) {
            return Helper::rj('Already Rejected', 400);
        } else {
            $sharePointsLogs->update([
                'status' => 2
            ]);
        }

        $data['user'] = [];
        $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
            ->where(['for_user_id' => Auth::id(), 'user_id' => $sharePointsLogs->from_user])
            ->first();

        $record = \App\Models\Notification::create([
            'from_user_id' => Auth::id(),
            'to_user_id' => $sharePointsLogs->from_user,
            'type' => 'share_points_reject',
            'entity_id' => $sharePointsLogs->id,
            'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : Auth::user()->username) . ' has rejected the shared points.',
        ]);

        $data['user'][] = $record;
        Helper::emit($data, 'Invite');

        return Helper::rj('Rejected Successfully', 200, ['message' => 'Rejected Successfully']);

    }

    public function acceptPoints(Request $request)
    {

        $validationRules = [
            'share_point_id' => 'required|exists:share_points_logs,id,to_user,' . Auth::id()
        ];
        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }

        try {

            $sharePointsLogs = SharePointsLogs::where('to_user', Auth::id())->whereDate('expired_at', '>', Carbon::now()->toDateString())->find($request->share_point_id);

            if (!$sharePointsLogs) {
                return Helper::rj("Invitation already expired.", 410);
            }

            $fromUser = $sharePointsLogs->from_user;
            $percentage = $sharePointsLogs->percentage;


            DB::beginTransaction();

            //OTHER user
            $badgePoints = UserBadgePoints::where('user_id', $fromUser)->first();
            // if($badgePoints->current_balance < 1000){
            //     return Helper::rj('To share , accumulated points must be atleast 1000', 400);
            // }
            $bagde = UserBadge::where('user_id', $fromUser)->first();

            $pointsToShare = round(($percentage / 100) * $badgePoints->current_balance);

            UserBadgePointTransaction::create([
                'user_badge_point_table_id' => $badgePoints->id,
                'user_badge_table_id' => $bagde->id,
                'points' => $pointsToShare,
                'type' => 2
            ]);

            $badgePoints->total_balance = $badgePoints->total_balance - $pointsToShare;
            $badgePoints->current_balance = $badgePoints->current_balance - $pointsToShare;
            $badgePoints->shared_balance = $badgePoints->shared_balance + $pointsToShare;
            $badgePoints->save();

            if ($badgePoints) {
                $badgeID = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
                if ($badgeID) {
                    $bagde->current_badge_id = $badgeID->id;
                    $bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id : $badgeID->id;
                    $bagde->save();
                }
            }


            //Auth User
            $otherUserbadgePoints = UserBadgePoints::where('user_id', Auth::id())->first();
            $otherUserbagde = UserBadge::where('user_id', Auth::id())->first();

            UserBadgePointTransaction::create([
                'user_badge_point_table_id' => $otherUserbadgePoints->id,
                'user_badge_table_id' => $otherUserbagde->id,
                'points' => $pointsToShare,
                'type' => 1
            ]);

            $otherUserbadgePoints->total_balance = $otherUserbadgePoints->total_balance + $pointsToShare;
            $otherUserbadgePoints->current_balance = $otherUserbadgePoints->current_balance + $pointsToShare;
            $otherUserbadgePoints->save();

            if ($otherUserbagde) {
                $badgeIDTwo = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
                if ($badgeIDTwo) {
                    $otherUserbagde->current_badge_id = $badgeIDTwo->id;
                    $otherUserbagde->next_badge_id = $badgeIDTwo->next() ? $badgeIDTwo->next()->id : $badgeIDTwo->id;
                    $otherUserbagde->save();
                }
            }

            $sharePointsLogs->update([
                'status' => 2
            ]);


            $data['user'] = [];
            $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                ->where(['for_user_id' => Auth::id(), 'user_id' => $fromUser])
                ->first();

            $record = \App\Models\Notification::create([
                'from_user_id' => Auth::id(),
                'to_user_id' => $fromUser,
                'type' => 'share_points_reject',
                'entity_id' => $sharePointsLogs->id,
                'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : Auth::user()->username) . ' has accepted the shared points.',
            ]);

            $data['user'][] = $record;
            Helper::emit($data, 'Invite');


            DB::commit();
            return Helper::rj('Points successfully added to your wallet', 200, ['message' => 'Points successfully added to your wallet']);


        } catch (\Exception $e) {

            DB::rollBack();
            return Helper::rj($e->getMessage(), 500);
        }


    }



}
