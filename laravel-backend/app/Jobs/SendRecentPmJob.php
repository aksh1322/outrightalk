<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\PmRecent;

class SendRecentPmJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $users;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($users)
    {
        $this->users = $users;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if (count($this->users)) {
            $recentPmObj = new \App\Models\PmRecent();
            foreach ($this->users as $user => $timezone) {
                $recentPm = $recentPmObj->getListing([
                    'for_user_id' => $user,
                    'with' => [
                        // 'userInfo' => function ($q) { return $q->select("id", "username"); },
                        // 'forUserInfo' => function ($q) { return $q->select("id", "username"); },
                        // 'pmInfo',
                    ],
                    //'get_sql' => 1,
                    'groupBy' => 'pm_id',
                ]);
                if (count($recentPm)) {
                    foreach ($recentPm as $pm) {
                        $pm->pm_info = \DB::table('pms')->where('id', $pm->pm_id)->first();
                        // $pm->user_info = \DB::table('users')->select('id', 'username')->where('id', $pm->user_id)->first();
                        // $pm->for_user_info = \DB::table('users')->select('id', 'username')->where('id', $pm->for_user_id)->first();

                        // $customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                        //     ->where(['for_user_id' => $pm->user_id, 'user_id' => $user])
                        //     ->first();
                        // $for_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                        //     ->where(['for_user_id' => $pm->for_user_id, 'user_id' => $user])
                        //     ->first();

                        // $pm->user_info->customize_nickname = $customized_nickname;
                        // $pm->for_user_info->customize_nickname = $for_customized_nickname;

                    }
                }
                $data[$user] = $recentPm;
            }

            // dd($data);
            \App\Helpers\Helper::emit($data, 'recentPm');
        }
    }
}
