<?php

namespace App\Http\Controllers\Api;

use App\Models\Badge;
use App\Models\Wallet;
use App\Helpers\Helper;
use Exception, Validator;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use App\Models\UserBadgePoints;
use App\Models\WithdrawHistory;
use App\Models\WalletTransactions;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Models\UserBadgePointTransaction;
use Illuminate\Http\Exceptions\HttpResponseException;


class WalletController extends Controller
{
    public function getDetailsWallet()
    {

        try {

            $points = UserBadgePoints::where('user_id', Auth::id())->first();
            $wallet = Wallet::firstOrCreate([
                'user_id' => Auth::id()
            ]);

            $walletDetails = Wallet::find($wallet->id);
            return Helper::rj('Data Found', 200, ['points' => $points, 'wallet_details' => $walletDetails]);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function withdrawMoney(Request $request)
    {

        $validationRules = ([
            'amount' => 'required|numeric|in:20,30,40,50,60,70,80,90,100'
        ]);

        $validator = \Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }

        $wallet = Wallet::where('user_id', Auth::id())->first();

        if (!$wallet) {
            return Helper::rj('Wallet not created yet!.', 404);
        }

        if ($request->amount > $wallet->current_balance) {
            return Helper::rj('Not Enough Balance!.', 402);
        }

        DB::beginTransaction();

        try {

            //dd($request->all());
            $tokenRequest = Http::asForm()
                ->withBasicAuth(config('services.paypal.client_id'), config('services.paypal.client_secret'))
                ->post(config('services.paypal.url') . '/oauth2/token', [
                    'grant_type' => 'client_credentials',
                ]);

            if ($tokenRequest->ok()) {
                $accessToken = $tokenRequest->json()['access_token'];
                $email = Auth::user()->email;
                $amount = $request->amount;
                $time = now()->timestamp;
                $payout = $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'PayPal-Request-Id' => md5($email),
                ])
                    ->withToken($accessToken)
                    ->post(config('services.paypal.url') . '/payments/payouts', [
                        'sender_batch_header' => [
                            'sender_batch_id' => 'Payouts_' . $time,
                            'email_subject' => 'You have a payout!',
                            'email_message' => 'You have received a payout! Thanks for using our service!',
                        ],
                        'items' => [
                            [
                                'recipient_type' => 'EMAIL',
                                'amount' => [
                                    'currency' => 'USD',
                                    'value' => $amount,
                                ],
                                'receiver' => $email,
                                'note' => "Your $amount$ payout",
                                'sender_item_id' => $time,
                                'notification_language' => 'en-US',
                            ],
                        ],
                    ]);


                if ($payout->status() == 201) {
                    $response = $payout->json();
                    WithdrawHistory::create([
                        'payout_batch_id' => $response['batch_header']['payout_batch_id'],
                        'sender_batch_id' => $response['batch_header']['sender_batch_header']['sender_batch_id'],
                        'amount' => $amount,
                        'user_id' => Auth::id(),
                    ]);

                    $wallet->update([
                        'current_balance' => $wallet->current_balance - $amount,
                        'overall_withdrawal' => $wallet->overall_withdrawal + $amount,
                    ]);

                    DB::commit();

                    $points = UserBadgePoints::where('user_id', Auth::id())->first();

                    return Helper::rj('Withdraw request sent successfully!', 200, ['points' => $points, 'wallet_details' => $wallet->fresh()]);
                } else {

                    \Log::error('Error while paypal payout for withdraw money API: ' . $payout->reason() . ' ' . $payout->object()->message);
                    throw new \Exception('Internal Server Error', );
                }
            } else {
                \Log::error('Error while getting authenticated for paypal: ' . $tokenRequest->reason() . ' ' . $tokenRequest->object()->message);
                throw new \Exception('Internal Server Error');
            }


        } catch (\Exception $e) {
            //dd($e->getMessage());
            DB::rollBack();
            // Log the exception for debugging purposes
            \Log::info("error", [$e]);
            return Helper::rj($e->getMessage(), 500);
        }
    }


    public function addCashInPointsExchange(Request $request)
    {


        $validationRules = [
            'points' => 'required|min:1000|numeric',
            'cash' => 'required|numeric'
        ];
        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return \App\Helpers\Helper::rj('Bad Request', 400, [
                'errors' => $validator->errors()
            ]);
        }

        try {

            DB::beginTransaction();

            $badgePoints = UserBadgePoints::where('user_id', Auth::id())->first();
            $bagde = UserBadge::where('user_id', Auth::id())->first();

            if ($badgePoints->current_balance < $request->points) {
                return Helper::rj('Not enough points available in your balance', 400);
            }

            UserBadgePointTransaction::create([
                'user_badge_point_table_id' => $badgePoints->id,
                'user_badge_table_id' => $bagde->id,
                'points' => $request->points,
                'type' => 2
            ]);

            $badgePoints->total_balance = $badgePoints->total_balance - $request->points;
            $badgePoints->current_balance = $badgePoints->current_balance - $request->points;
            $badgePoints->save();


            $cash = round(($request->points / 1000), 2);

            $wallet = Wallet::where('user_id', Auth::id())->first();
            $wallet->overall_added = $wallet->overall_added + $cash;
            $wallet->current_balance = $wallet->current_balance + $cash;
            $wallet->save();

            WalletTransactions::create([
                'wallet_id' => $wallet->id,
                'user_id' => Auth::id(),
                'amount' => $cash,
                'type' => 1
            ]);

            if ($badgePoints) {
                $badgeID = Badge::where('points', '<', $badgePoints->current_balance)->latest()->first();
                if ($badgeID) {
                    $bagde->current_badge_id = $badgeID->id;
                    $bagde->next_badge_id = $badgeID->next() ? $badgeID->next()->id : $badgeID->id;
                    $bagde->save();
                }
            }

            DB::commit();

            return Helper::rj('Points Redeemed Successfully', 200, ['message' => 'Points Redeemed Successfully']);
        } catch (\Exception $e) {

            DB::rollBack();
            return Helper::rj($e->getMessage(), 500);
        }
    }
}
