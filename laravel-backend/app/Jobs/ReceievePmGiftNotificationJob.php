<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ReceievePmGiftNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $pm_id;
    protected $users;
    protected $sticker_id;
    protected $login_user;


    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($pm_id, $users, $sticker_id, $login_user)
    {

        $this->pm_id = $pm_id;
        $this->users = $users;
        $this->sticker_id = $sticker_id;
        $this->login_user = $login_user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
// echo "test";die;


        $pm_id = $this->pm_id;
        $pmUserObj = new \App\Models\PmUser();
        $pm_users = $pmUserObj->getListing([
            'pm_id' => $pm_id,
            'user_id_not' => $this->login_user->id
        ]);
        $pm_users = count($pm_users) ? $pm_users->pluck('user_id')->toArray() : [];
        $chatdtls['msgs'] = $data = [];
        if (count($this->users)) {
            foreach ($this->users as $gu) {
                $to_user = (int)$gu;
                    $to_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                            ->where(['for_user_id' => $gu, 'user_id' => $this->login_user->id])
                            ->first();
                    $record = \App\Models\Notification::create([
                        'from_user_id' => $gu,
                        'to_user_id' => $this->login_user->id,
                        'type' => 'gift',
                        'message' => (($to_customized_nickname) ? $to_customized_nickname->nickname : $this->login_user->username) . ' has accepted  gift.',
                    ]);
                    $data['user'][] = $record;
                
            }
        }
        $chatdtls['pm_admin_user'] = \App\Models\PmUser::where(['pm_id' => $pm_id, 'is_admin' => 1])->first();
        \App\Helpers\Helper::emit($chatdtls, 'pmChatMessage');
        \App\Helpers\Helper::emit($data, 'AcceptGift');
    }
}
