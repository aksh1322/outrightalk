<?php

namespace App\Helpers;

use Cartalyst\Stripe\Stripe;
use App\Helpers\Helper;

class StripeHelper
{

    private $_secret;
    private $_key;
    private $_stripe;

    public function __construct()
    {
        $this->_secret = \Config::get('settings.STRIPE_SECRET');
        $this->_key = \Config::get('settings.STRIPE_API_KEY');
        $this->_stripe = Stripe::make($this->_secret);
    }

    public static function createPrice($plan = null)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
        try {
            $product = self::createProduct($plan);
            if ($product->original && $product->original['status'] == 200) {
                $priceResponse = $stripe->prices->create([
                    'unit_amount' => $plan['unit_amount'],
                    'currency' => 'usd',
                    'recurring' => [
                        'interval' => 'month',
                        'interval_count' => $plan['interval_count'],
                    ],
                    'product' => $product->original['data'],
                ]);
                return Helper::rj('Price created successfully.', 200, $priceResponse->id);
            } else {
                return $product;
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public static function createProduct($plan = null)
    {
        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
            $productResponse = $stripe->products->create([
                'name' => $plan['name'],
            ]);
            return Helper::rj('Product created successfully.', 200, $productResponse->id);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public static function checkoutSession($input, $plan = null)
    {

        $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
        try {
            $price = self::createPrice($plan);
            if ($price->original && $price->original['status'] == 200) {

                //$origin = request()->headers->get('origin') ? request()->headers->get('origin') : env('FRONTEND_BASE_URL');
                $origin = env('FRONTEND_BASE_URL', "https://sendbird.dxx1s7zkaz795.amplifyapp.com");



                $response = $stripe->checkout->sessions->create([
                    'success_url' => $origin . '/room/subscription/success?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => $origin . '/room/subscription/failure',
                    'client_reference_id' => $input['user_id'] . '_' . $input['room_id'] . '_' . $input['plan_id'] . '_' . $input['time_period_id'],
                    'line_items' => [
                        [
                            'price' => $price->original['data'],
                            'quantity' => 1,
                        ],
                    ],
                    'mode' => 'subscription',
                ]);
                return Helper::rj('Checkout session generated successfully.', 200, $response);
            } else {
                return $price;
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }

    }

    public static function retrieveSession($session_id)
    {

        $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
        try {
            $response = $stripe->checkout->sessions->retrieve(
                $session_id,
                []
            );
            return Helper::rj('Session retrived.', 200, $response);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public static function retrieveSubscription($subscription_id)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
        try {
            $response = $stripe->subscriptions->retrieve(
                $subscription_id,
                []
            );
            return Helper::rj('Subscription retrived.', 200, $response);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public static function cancelSubscription($subscription_id)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
        try {
            $response = $stripe->subscriptions->cancel(
                $subscription_id,
                []
            );
            return Helper::rj('Subscription canceled.', 200, $response);
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public static function checkoutVirtualGiftSession($input, $plan = null)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
        try {
            $price = self::createVirtualGiftPrice($plan);

            if ($price->original && $price->original['status'] == 200) {


                //$origin = request()->headers->get('origin') ? request()->headers->get('origin') : env('FRONTEND_BASE_URL');
                $origin = env('FRONTEND_BASE_URL', "https://sendbird.dxx1s7zkaz795.amplifyapp.com");


                $response = $stripe->checkout->sessions->create([
                    'success_url' => $origin . '/virtual/credit/success?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => $origin . '/virtual/credit/failure',
                    'client_reference_id' => $input['user_id'] . '_' . $input['plan_id'],
                    'line_items' => [
                        [
                            'price' => $price->original['data'],
                            'quantity' => 1,
                        ],
                    ],
                    'mode' => 'payment',
                ]);
                return Helper::rj('Checkout session generated successfully.', 200, $response);
            } else {
                return $price;
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }

    public static function createVirtualGiftPrice($plan = null)
    {
        $stripe = new \Stripe\StripeClient(config('services.stripe.secret_key'));
        try {
            $product = self::createProduct($plan);
            if ($product->original && $product->original['status'] == 200) {
                $priceResponse = $stripe->prices->create([
                    'unit_amount' => $plan['unit_amount'],
                    'currency' => 'usd',
                    'product' => $product->original['data'],
                ]);
                return Helper::rj('Price created successfully.', 200, $priceResponse->id);
            } else {
                return $product;
            }
        } catch (\Exception $e) {
            return Helper::rj($e->getMessage(), 500);
        }
    }
}

