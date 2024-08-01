<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

use App\Events\UploadPlayVideoEvent;
use App\Events\UploadAudioVideoEvent;
use App\Events\UploadVideoEvent;
use App\Listeners\UploadPlayVideoListener;
use App\Listeners\UploadAudioVideoListener;
use App\Listeners\UploadVideoListener;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        UploadPlayVideoEvent::class => [
            UploadPlayVideoListener::class,
        ],
        UploadAudioVideoEvent::class => [
            UploadAudioVideoListener::class
        ],
        UploadVideoEvent::class => [
            UploadVideoListener::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
