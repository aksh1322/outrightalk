<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CountOnlineUserJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $totalOnlineUser = \App\Models\User::whereIn('visible_status', [1,2,3])
                ->where('is_loggedout', 0)->count();
        $param = [
            'total' => $totalOnlineUser,
            'type' => 'total_online_user'
        ];
        \App\Helpers\Helper::emit($param, 'userStatus');
    }
}
