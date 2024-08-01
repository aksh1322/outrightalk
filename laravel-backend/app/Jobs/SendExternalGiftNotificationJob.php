<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendExternalGiftNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $users;
    protected $isSticker;
    protected $login_user;
    protected $giftInvite;

    protected $stickerName;


    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($users, $isSticker, $login_user, $giftInvite = null, $stickerName)
    {
        $this->users = $users;
        $this->isSticker = $isSticker;
        $this->login_user = $login_user;
        $this->giftInvite = $giftInvite;
        $this->stickerName = $stickerName;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {

        $chatdtls['msgs'] = $data = [];

        if ($this->giftInvite) {
            $data['for'] = 'sticker';
            $data['gift_invite_id'] = $this->giftInvite->id;
        }

        if (count($this->users)) {
            foreach ($this->users as $gu) {
                $to_user = (int) $gu;
                $from_customized_nickname = \App\Models\CustomizeNickname::select('for_user_id', 'nickname')
                    ->where(['for_user_id' => $this->login_user->id, 'user_id' => $gu])
                    ->first();
                $record = \App\Models\Notification::create([
                    'from_user_id' => $this->login_user->id,
                    'to_user_id' => $gu,
                    'entity_id' => $this->giftInvite->id,
                    'type' => 'gift',
                    'notification_for' => 'sticker',
                    'expire_at' => now()->addMinutes(5),
                    'message' => (($from_customized_nickname) ? $from_customized_nickname->nickname : $this->login_user->username) . ' has sent a gift ' . $this->stickerName . (!$this->isSticker ? " pack" : " sticker") . ' to you.',
                ]);
                $data['user'][] = $record;
            }
        }
        \App\Helpers\Helper::emit($data, 'Invite');
    }
}
