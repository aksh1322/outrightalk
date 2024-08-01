<?php

namespace App\Repositories;

use Carbon\Carbon;
use App\Models\User;
use App\Models\SendBirdUser;

class SendBirdUserRepository{

    protected $_HTTP;
    protected $_USER;

    public function __construct() {
        $this->_HTTP=app('SendBirdHttp');
    }

    public function createUser($user){

        $user=User::find($user->id);
        $response=$this->_HTTP->post('users',[
            'user_id' => $user->id,
            'nickname' => $user->username,
            'profile_url' => ''
        ]);

        info("response",[$response]);
        if($response->ok()){
            $response=$response->object();
            $cerateToken = $this->_HTTP->post('users/'.$user->id.'/token', [
                "user_id" => $user->id,
                "expires_at" => Carbon::now()->addYears(50)->timestamp * 1000,
            ]);
            info("access token",[$cerateToken]);
            if($cerateToken->ok()){
                $res=$cerateToken->object();
                info("access token",[$res]);
                SendBirdUser::updateOrCreate(
                    [
                        'system_user_id' => $user->id,
                    ],
                    [
                        'sb_user_id' => $user->id,
                        'sb_access_token' => $res->token,
                        'expires_at' => $res->expires_at
                    ]
                );
            }
          return $response;
        }
    }
}
