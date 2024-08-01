<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],
    'sendBird' => [
        'key' => env('SEND_BIRD_API_KEY'),
        'token' => env('SEND_BIRD_API_TOKEN'),
    ],
    'stripe' => [
        'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),
        'secret_key' => env('STRIPE_SECRET_KEY'),
    ],
    'paypal' => [
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'client_secret' => env('PAYPAL_SECRET'),
        'url' => env('PAYPAL_URL'),
    ],
    'frontendSocket' => env('FRONT_END_SOCKET', 'https://sendbird-node.outrightalk.com/emit'),
    'langFont' => [
        'zh-CN' => 'Noto Sans SC',
        'zh-TW' => 'Noto Sans TC',
        'ar' => 'Noto Sans Arabic',
        'ur' => 'Noto Sans Arabic',
        'th' => 'Noto Sans Thai',
        'ko' => 'Noto Sans KR',
        'ja' => 'Noto Sans JP',
        'he' => 'Noto Sans Hebrew',
        'fa' => 'Noto Sans Arabic'
    ]

];
