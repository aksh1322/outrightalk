<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Http;

class SendBirdHttpProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('SendBirdHttp', function ($app) {
            return Http::withHeaders([
                'Api-Token' => config('services.sendBird.token'),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->baseUrl('https://api-'.config('services.sendBird.key').'.sendbird.com/v3/');
        });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
